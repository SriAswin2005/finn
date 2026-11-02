import test from 'node:test';
import assert from 'node:assert/strict';
import { initialPushState } from '../src/push/store.js';
import { mergeFilings } from '../src/push/collection.js';
import { acceptDocumentJob, claimAnalysis } from '../src/push/jobs.js';
import { triageDocument, completeRoutineJobs, routineCategories, highCategories } from '../src/push/triage.js';
import { processAnalysis } from '../src/push/analysis.js';

const at = Date.parse('2026-11-02T10:00:00Z');
const doc = { sha256: 'a'.repeat(64), title: 'Original notice', url: 'https://issuer.example/notice.pdf', pages: [{ page: 4, text: 'The Board meeting is scheduled on 12 November 2026 to consider the statutory business set out in this notice.' }] };
function setup(category, text = doc.pages[0].text) {
  const state = initialPushState(); const document = { ...doc, pages: [{ page: 4, text }] };
  const filing = { id: 'notice', symbol: 'ABC', category, title: 'Notice', summary: '', source: { url: doc.url }, publishedAt: new Date(at).toISOString() };
  mergeFilings(state, [filing], new Date(at).toISOString());
  const event = state.events.notice; event.documentHash = doc.sha256;
  acceptDocumentJob(state, event, at);
  return { state, event, document, store: { read: async () => structuredClone(state), mutate: async fn => fn(state), document: async () => document } };
}
test('all five routine categories complete from exact physical-page excerpts without quota or model calls', async () => {
  for (const category of routineCategories) {
    const { state, store, event } = setup(category); const job = state.jobs[event.processingKey];
    job.attempts = 2; job.status = 'deferred'; job.nextAt = at + 60000; job.rejectedDraft = { retained: true };
    const quota = JSON.stringify(state.quota);
    const result = await completeRoutineJobs({ store, now: () => at });
    assert.equal(result.completed, 1); assert.equal(result.llmCalls, 0); assert.equal(job.status, 'complete'); assert.equal(event.status, 'complete');
    assert.equal(job.analysis.method, 'rules'); assert.equal(job.analysis.claims[1].references[0].page, 4);
    assert.deepEqual(job.analysis.ruleSummary.mentionedDates, ['12 November 2026']);
    assert.equal(job.attempts, 2); assert.deepEqual(job.rejectedDraft, { retained: true }); assert.equal(JSON.stringify(state.quota), quota);
    const outcome = await processAnalysis({ store, now: () => at, env: { FINN_PUSH_ENABLED: 'true', GEMINI_API_KEY: 'fake', FINN_AI_FREE_TIER_CONFIRMED: 'true' }, fetchImpl: () => { assert.fail('Routine jobs must never call a model'); } });
    assert.equal(outcome.llmCalls, 0);
  }
});
test('material filings stay in the model queue; board outcomes with CEO changes and results are promoted', async () => {
  for (const category of highCategories) assert.equal(triageDocument({ category }, doc).mode, 'model');
  for (const [text, category] of [['The Chief Executive Officer has resigned with effect from today.', 'management_change'], ['The Board approved the unaudited financial results for this quarter.', 'results']]) {
    const { state, store, event, document } = setup('board_meeting', text);
    event.triageSources = [triageDocument(event.filing, document)];
    assert.equal(event.triageSources[0].category, category);
    assert.equal((await completeRoutineJobs({ store, now: () => at })).completed, 0);
    assert.equal(state.jobs[event.processingKey].status, 'pending');
  }
});
test('new routine jobs complete immediately; captured work and active leases remain untouched', async () => {
  const { state, event, document, store } = setup('postal_ballot');
  event.triageSources = [triageDocument(event.filing, document)];
  acceptDocumentJob(state, event, at); assert.equal(event.status, 'complete');
  const job = state.jobs[event.processingKey]; job.status = 'pending'; job.lease = { token: 'other', until: at + 1000 };
  assert.equal((await completeRoutineJobs({ store, now: () => at })).completed, 0);
  job.lease = null; event.filing.evidenceMode = 'captured_evaluation';
  assert.equal((await completeRoutineJobs({ store, now: () => at })).completed, 0);
  delete event.filing.evidenceMode;
  const oldKey = event.processingKey; event.documentHash = 'b'.repeat(64); event.triageSources = [triageDocument({ category: 'results' }, document)];
  acceptDocumentJob(state, event, at); assert.notEqual(event.processingKey, oldKey); assert.equal(event.status, 'pending');
});
test('high priority filings precede newer ordinary items without changing quota', async () => {
  const { state, store, event } = setup('other'); const old = state.jobs[event.processingKey];
  const high = { ...event, filing: { ...event.filing, id: 'high', category: 'results', publishedAt: new Date(at - 1000).toISOString() }, processingKey: 'high' };
  state.events.high = high; state.jobs.high = { ...old, key: 'high', eventId: 'high' };
  assert.equal((await claimAnalysis(store, at)).eventId, 'high');
});
test('one unavailable routine document stays pending without blocking reconciliation', async () => {
  const { store, state, event } = setup('board_meeting'); store.document = async () => { throw new Error('temporary storage failure'); };
  assert.equal((await completeRoutineJobs({ store, now: () => at })).completed, 0);
  assert.equal(state.jobs[event.processingKey].status, 'pending');
});
