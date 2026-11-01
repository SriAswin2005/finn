import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPushStore } from '../src/push/store.js';
import { collectPush, collectionWindow, mergeFilings } from '../src/push/collection.js';
import { normalizeNse } from '../src/providers/nse.js';
import { processDocument, claimAnalysis, settleJob } from '../src/push/jobs.js';
import { reserveAttempt, finishAttempt, classifyFailure, nextPacificReset } from '../src/push/quota.js';
import { filingEvidence } from '../src/push/evidence.js';
import { validatePush } from '../src/push/interpretation.js';
import { processAnalysis, revalidateRejected } from '../src/push/analysis.js';
import { researchAssignments } from '../src/ai/workflows.js';

export async function temporaryStore() {
  const directory = await mkdtemp(join(tmpdir(), 'finn-push-'));
  const path = join(directory, 'state.sqlite'); const store = createPushStore({ env: {}, path });
  await store.initialize(); return { store, path };
}
const at = Date.parse('2026-11-01T10:00:00Z');
const filing = { id: 'new-filing', symbol: 'TCS', title: 'Appointment', summary: 'New CFO', publishedAt: new Date(at).toISOString(), source: { url: 'https://nsearchives.nseindia.com/a.pdf' } };
test('Push storage persists across instances, CAS preserves concurrent mutations and quota fails closed', async () => {
  const { store, path } = await temporaryStore(); const other = createPushStore({ env: {}, path });
  await Promise.all(Array.from({ length: 8 }, (_, i) => (i % 2 ? store : other).mutate(s => { s.collection.counter = (s.collection.counter ?? 0) + 1; })));
  assert.equal((await other.read()).collection.counter, 8); assert.equal((await other.read()).quota.initialized, false);
  await assert.rejects(createPushStore({ env: {}, path: path + '.missing' }).read(), /not initialized/);
});
test('overlapping collection commits before checkpoint, skips duplicates, recovers failures and missed windows', async () => {
  const { store } = await temporaryStore(); let calls = 0;
  const fetchFilings = async () => { calls++; return { announcements: [filing, filing], rejected: 0 }; };
  await collectPush({ store, now: () => at, fetchFilings });
  const first = await store.read(); assert.equal(Object.keys(first.events).length, 1); assert.ok(Date.parse(first.collection.checkpoint) < at);
  await collectPush({ store, now: () => at, fetchFilings: async () => { throw new Error('NSE timed out'); } });
  assert.equal((await store.read()).collection.checkpoint, first.collection.checkpoint); assert.equal((await store.read()).collection.status, 'failed');
  await collectPush({ store, now: () => at + 61000, fetchFilings }); assert.equal(calls, 2);
  const window = collectionWindow(first.collection.checkpoint, at); assert.ok(Date.parse(window.from) < Date.parse(first.collection.checkpoint));
  assert.ok(Date.parse((await store.read()).collection.checkpoint) > Date.parse(first.collection.checkpoint));
});
test('concurrent collectors share lease; only affected metadata revision is invalidated', async () => {
  const { store } = await temporaryStore(); let calls = 0;
  await Promise.all(Array.from({ length: 6 }, () => collectPush({ store, now: () => at, fetchFilings: async () => { calls++; return { announcements: [filing], rejected: 0 }; } })));
  assert.equal(calls, 1);
  await store.mutate(s => { mergeFilings(s, [{ ...filing, id: 'other' }], 'now'); s.events.other.status = 'complete'; mergeFilings(s, [{ ...filing, summary: 'Corrected effective date' }], 'later'); });
  const s = await store.read(); assert.equal(s.events.other.status, 'complete'); assert.equal(s.events[filing.id].status, 'pending_document'); assert.ok(s.events[filing.id].supersedesRevision);
});
test('exchange sequence ID is stable across URL and timestamp corrections', () => {
  const row = { symbol: 'TCS', seq_id: '123', an_dt: '01-Nov-2026 15:00:00', desc: 'Appointment', attchmntText: 'CFO', attchmntFile: filing.source.url };
  const normalize = r => normalizeNse([r], ['TCS'], new Date(at).toISOString(), 'feed').announcements[0];
  assert.equal(normalize(row).id, normalize({ ...row, an_dt: '01-Nov-2026 15:01:00', attchmntFile: filing.source.url + '?v=2' }).id);
});

const managerDoc = { id: 'abc', sha256: 'a'.repeat(64), url: filing.source.url, pages: [{ page: 1, text: 'The company appointed Maya Rao as Chief Financial Officer effective 1 November 2026. Maya Rao previously served as finance director with 12 years of experience.' }] };
const managerWire = () => ({ eventType: 'management_change', priority: 'normal', needsComplex: false, missing: ['reason'], claims: [
  { role: 'event', text: 'The company appointed Maya Rao as Chief Financial Officer effective 1 November 2026.', inference: false, references: [{ quoteId: 'q1' }] },
  { role: 'fact', text: 'Maya Rao previously served as finance director with 12 years of experience.', inference: false, references: [{ quoteId: 'q2' }] },
  { role: 'significance', text: 'The Chief Financial Officer may affect financial leadership.', inference: true, references: [{ quoteId: 'q1' }] },
  { role: 'priority', text: 'The Chief Financial Officer may deserve attention during the transition.', inference: true, references: [{ quoteId: 'q1' }] },
] });
test('Push validates supported management claims, rejects advice/action/person substitutions and preserves complete long legal sentences', () => {
  const bundle = filingEvidence([managerDoc]); const result = validatePush(managerWire(), bundle); assert.equal(result.claims[0].references[0].page, 1);
  for (const bad of ['The company appointed Elena Rao as Chief Financial Officer effective 1 November 2026.', 'The company resigned Maya Rao as Chief Financial Officer effective 1 November 2026.', 'Buy the company after this appointment.']) {
    const value = managerWire(); value.claims[0].text = bad; assert.throws(() => validatePush(value, bundle));
  }
  const legalText = 'In continuation of the earlier intimations dated October 07, 2026, October 08, 2026, October 09, 2026, October 14, 2026, October 16, 2026 and October 28, 2026, the company informs that the Honorable NCLAT has allowed the appeal filed by the company and set aside the order of the National Company Law Tribunal dated October 07, 2026.';
  const legal = filingEvidence([{ ...doc, pages: [{ page: 1, text: legalText }] }]);
  assert.equal(legal.quotes.length, 1); assert.equal(legal.quotes[0].quote, legalText); assert.ok(legal.quotes[0].quote.length > 220);
  assert.throws(() => validatePush({ ...managerWire(), claims: managerWire().claims.map(c => ({ ...c, references: [{ quoteId: 'invented' }] })) }, bundle), /Unknown/);
});
test('unseen generic management analysis persists once; repeated/concurrent jobs use zero new calls', async () => {
  const { store, path } = await temporaryStore(); await store.mutate(s => { mergeFilings(s, [filing], 'now'); s.quota.initialized = true; s.quota.policy = { ...policy, models: { ...policy.models, 'gemini-3.1-flash-lite': { ...policy.models['gemini-3.1-flash-lite'], capability: 'ordinary' } } }; });
  await processDocument({ store, now: () => at, collectDocument: async () => managerDoc });
  let calls = 0; const env = { FINN_PUSH_ENABLED: 'true', GEMINI_API_KEY: 'fake', FINN_AI_FREE_TIER_CONFIRMED: 'true' };
  const fetchImpl = async () => { calls++; return new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(managerWire()) }] } }], usageMetadata: { totalTokenCount: 1234 } })); };
  const results = await Promise.all(Array.from({ length: 5 }, () => processAnalysis({ store, now: () => at, env, fetchImpl })));
  assert.equal(calls, 1); assert.equal(results.filter(r => r.completed).length, 1);
  const restarted = createPushStore({ env: {}, path }); await processAnalysis({ store: restarted, now: () => at + 1000, env, fetchImpl });
  assert.equal(calls, 1); const state = await restarted.read(); const job = Object.values(state.jobs)[0]; assert.equal(job.status, 'partial'); assert.equal(job.analysis.claims.length, 4); assert.equal(state.quota.attempts[0].observedTokens, 1234);
});
test('workflow assignments support configured model upgrades and exclude all Push models from Research', () => {
  assert.deepEqual(researchAssignments({}).text, ['gemini-3.5-flash-lite']);
  const future = { ...policy, models: { 'gemini-4.0-flash-lite': { workflow: 'research', rpm: 1, tpm: 10000, rpd: 1 }, 'gemini-4.0-flash': { workflow: 'push', capability: 'complex', rpm: 1, tpm: 10000, rpd: 1 } } };
  assert.deepEqual(researchAssignments({ FINN_MODEL_POLICY_JSON: JSON.stringify(future) }).text, ['gemini-4.0-flash-lite']);
});

test('Push keeps subject and action together across Mr/Rs abbreviations without slicing away qualifiers', () => {
  const text = 'The board approved the appointment of Mr. Aayush Shah as Executive Director, subject to shareholder approval. Revenue was Rs. 100 million for the quarter.';
  const bundle = filingEvidence([{ ...managerDoc, pages: [{ page: 1, text }] }]);
  assert.equal(bundle.quotes.length, 2); assert.equal(bundle.quotes[0].quote, text.split(' Revenue')[0]); assert.match(bundle.quotes[1].quote, /Revenue was Rs\. 100 million/);
});

test('referenced NSE evidence resumes as separate steps; exact explicit corrections supersede only the linked event', async () => {
  const { store } = await temporaryStore();
  const old = { ...filing, id: 'old', source: { url: 'https://nsearchives.nseindia.com/old.pdf' } };
  const current = { ...filing, id: 'corrected', source: { url: 'https://nsearchives.nseindia.com/corrected.pdf' } };
  await store.mutate(s => mergeFilings(s, [old, current], new Date(at).toISOString()));
  let downloads = 0;
  const collectDocument = async f => {
    downloads++;
    if (f.id === 'old') return { ...doc, url: old.source.url };
    if (f.source.url === old.source.url) return { ...doc, sha256: 'c'.repeat(64), url: old.source.url };
    return { ...doc, sha256: 'b'.repeat(64), url: current.source.url, pages: [{ page: 1, text: `This corrected disclosure supersedes the earlier filing. See ${old.source.url}`, links: [old.source.url, 'https://unapproved.example/profile.pdf'] }] };
  };
  await processDocument({ store, now: () => at, collectDocument });
  await processDocument({ store, now: () => at, collectDocument });
  let state = await store.read(); assert.equal(state.events.corrected.status, 'pending_related'); assert.equal(state.events.old.replacedBy, 'corrected');
  await processDocument({ store, now: () => at, collectDocument });
  state = await store.read(); const job = state.jobs[state.events.corrected.processingKey]; assert.equal(job.documentHashes.length, 2); assert.equal(downloads, 3);
  assert.equal((await claimAnalysis(store, at)).eventId, 'corrected');
});
test('corrupt quota entries/cooldowns fail closed before mutation and never create an allowance', async () => {
  const { store } = await temporaryStore();
  await assert.rejects(store.mutate(s => { s.quota.cooldowns['model'] = 'invalid'; }), /corrupt/);
  await assert.rejects(store.mutate(s => { s.quota.attempts.push({ model: 'm', at: 1 }); }), /corrupt/);
  assert.equal((await store.read()).quota.attempts.length, 0);
});

test('font-inserted spaces inside a person name do not change its letters or allow a different surname', () => {
  const source = { ...managerDoc, pages: [{ page: 1, text: managerDoc.pages[0].text.replaceAll('Maya Rao', 'Ma ya Rao') }] };
  assert.doesNotThrow(() => validatePush(managerWire(), filingEvidence([source])));
  const bad = managerWire(); bad.claims[0].text = bad.claims[0].text.replace('Maya Rao', 'Maya Ray');
  assert.throws(() => validatePush(bad, filingEvidence([source])), /Named entity/);
});
test('explicit unchanged-draft revalidation keeps original reservations and rejects an unsupported draft', async () => {
  const { store } = await temporaryStore();
  await store.saveDocument(managerDoc); await store.mutate(s => {
    mergeFilings(s, [filing], 'now'); s.events[filing.id].processingKey = 'review';
    s.jobs.review = { key: 'review', eventId: filing.id, documentHash: managerDoc.sha256, status: 'failed', rejectedDraft: managerWire() };
    s.quota.attempts.push({ id: 'original', model: 'test', workflow: 'push', jobKey: 'review', at, estimatedTokens: 1000, retry: false, outcome: 'original_rejection' });
  });
  const result = await revalidateRejected({ store, key: 'review', reason: 'Original source reviewed; only font spacing caused the false refusal.', now: () => at });
  assert.equal(result.llmCalls, 0); assert.equal((await store.read()).quota.attempts.length, 1); assert.equal((await store.read()).jobs.review.analysis.claims.length, 4);
  await assert.rejects(revalidateRejected({ store, key: 'review', reason: 'Cannot change a completed accepted analysis.', now: () => at }), /Only an unchanged/);
});

test('Push truncation/unsupported output is not published and records observed tokens without automatic retry', async () => {
  for (const truncated of [true, false]) {
    const { store } = await temporaryStore();
    await store.mutate(s => { mergeFilings(s, [filing], 'now'); s.quota.initialized = true; s.quota.policy = { ...policy, models: { 'gemini-3.1-flash-lite': { ...policy.models['gemini-3.1-flash-lite'], capability: 'ordinary' } } }; });
    await processDocument({ store, now: () => at, collectDocument: async () => managerDoc });
    let calls = 0; const wire = managerWire(); if (!truncated) wire.claims[0].text = wire.claims[0].text.replace('2026', '2099');
    const result = await processAnalysis({ store, now: () => at, env: { FINN_PUSH_ENABLED: 'true', GEMINI_API_KEY: 'fake', FINN_AI_FREE_TIER_CONFIRMED: 'true' }, fetchImpl: async () => { calls++; return new Response(JSON.stringify({ candidates: [{ finishReason: truncated ? 'MAX_TOKENS' : 'STOP', content: { parts: [{ text: JSON.stringify(wire) }] } }], usageMetadata: { totalTokenCount: 1234 } })); } });
    assert.equal(result.failed, true); await processAnalysis({ store, now: () => at + 1000, env: { FINN_PUSH_ENABLED: 'true', GEMINI_API_KEY: 'fake', FINN_AI_FREE_TIER_CONFIRMED: 'true' }, fetchImpl: async () => { calls++; } });
    const state = await store.read(); assert.equal(calls, 1); assert.equal(Object.values(state.jobs)[0].analysis, undefined); assert.equal(state.quota.attempts[0].observedTokens, 1234);
  }
});
test('third transient attempt reports failed consistently and does not silently exceed the per-job cap', async () => {
  const { store } = await temporaryStore();
  await store.mutate(s => { mergeFilings(s, [filing], 'now'); s.quota.initialized = true; s.quota.policy = { ...policy, models: { 'gemini-3.1-flash-lite': { ...policy.models['gemini-3.1-flash-lite'], capability: 'ordinary' } } }; });
  await processDocument({ store, now: () => at, collectDocument: async () => managerDoc });
  await store.mutate(s => { const job = Object.values(s.jobs)[0]; job.attempts = 2; for (let i = 0; i < 2; i++) s.quota.attempts.push({ id: `prior${i}`, jobKey: job.key, model: 'gemini-3.1-flash-lite', workflow: 'push', at: at - 120000 - i, estimatedTokens: 1000, retry: i > 0, outcome: 'transient' }); });
  const result = await processAnalysis({ store, now: () => at, env: { FINN_PUSH_ENABLED: 'true', GEMINI_API_KEY: 'fake', FINN_AI_FREE_TIER_CONFIRMED: 'true' }, fetchImpl: async () => new Response('{}', { status: 503 }) });
  assert.equal(result.failed, true); assert.equal(result.deferred, false); assert.equal(Object.values((await store.read()).jobs)[0].status, 'failed'); assert.equal((await store.read()).quota.attempts.length, 3);
});

test('Pacific reset never grants a fresh local allowance inside the approved rolling 24-hour cap', async () => {
  const { store } = await temporaryStore(); const midnight = Date.parse('2026-11-01T07:00:00Z');
  await store.mutate(s => {
    s.quota.initialized = true; s.quota.policy = { ...policy, totalDaily: 2, allocations: { push: 1, research: 1 } };
    s.quota.attempts.push({ id: 'prior-day', model: 'gemini-3.1-flash-lite', workflow: 'push', at: midnight - 1000, estimatedTokens: 100, retry: false, outcome: 'timeout_unknown' });
  });
  await assert.rejects(reserveAttempt(store, { workflow: 'push', model: 'gemini-3.1-flash-lite', estimatedTokens: 100, now: midnight + 1000 }), error => error.kind === 'daily' && error.until >= midnight - 1000 + 86400000);
});

const doc = { id: 'abc', sha256: 'a'.repeat(64), url: filing.source.url, pages: [{ page: 1, text: 'The company appointed a chief financial officer effective immediately.' }] };
const policy = { totalDaily: 20, allocations: { push: 10, research: 10 }, retryDaily: 2, models: { 'gemini-3.1-flash-lite': { workflow: 'push', rpm: 2, tpm: 10000, rpd: 10 }, 'gemini-3.8-flash': { workflow: 'push', rpm: 1, tpm: 10000, rpd: 2 } } };
test('generic attachment hashes share one analysis job and correction invalidates only changed content', async () => {
  const { store } = await temporaryStore(); await store.mutate(s => mergeFilings(s, [filing], new Date(at).toISOString()));
  let downloads = 0;
  const collectDocument = async () => { downloads++; return doc; };
  await Promise.all(Array.from({ length: 5 }, () => processDocument({ store, now: () => at, collectDocument })));
  assert.equal(downloads, 1); assert.equal(Object.keys((await store.read()).jobs).length, 1);
  const job = await claimAnalysis(store, at); assert.ok(job); assert.equal(await claimAnalysis(store, at), null);
  await settleJob(store, job, { status: 'complete', analysis: { test: true } });
  await processDocument({ store, now: () => at + 86400001, collectDocument });
  assert.equal(Object.keys((await store.read()).jobs).length, 1); assert.equal((await store.read()).events[filing.id].status, 'complete');
  await processDocument({ store, now: () => at + 2 * 86400001, collectDocument: async () => ({ ...doc, sha256: 'b'.repeat(64) }) });
  const state = await store.read(); assert.equal(Object.keys(state.jobs).length, 2); assert.equal(state.events[filing.id].status, 'pending'); assert.match(state.events[filing.id].correction, /changed/);
  assert.deepEqual((await store.document(doc.sha256)).pages, doc.pages);
});
test('unreadable attachments expose a limitation and expired analysis leases recover after restart', async () => {
  const { store, path } = await temporaryStore(); await store.mutate(s => mergeFilings(s, [filing], 'now'));
  await processDocument({ store, now: () => at, collectDocument: async () => { throw new Error('Unreadable PDF; OCR unavailable'); } });
  assert.equal((await store.read()).events[filing.id].status, 'document_failed'); assert.equal(Object.keys((await store.read()).jobs).length, 0);
  await store.mutate(s => { s.events[filing.id].status = 'pending_document'; s.events[filing.id].nextAt = 0; });
  await processDocument({ store, now: () => at, collectDocument: async () => doc });
  const first = await claimAnalysis(store, at); const restarted = createPushStore({ env: {}, path });
  assert.equal(await claimAnalysis(restarted, at + 1000), null);
  const next = await claimAnalysis(restarted, at + 91000); assert.ok(next); assert.notEqual(first.lease.token, next.lease.token);
  assert.equal(await settleJob(store, first, { status: 'complete' }), false);
});
test('durable quota reserves atomically before calls, retains uncertain attempts and enforces workflow/token/retry caps', async () => {
  const { store } = await temporaryStore(); const args = { workflow: 'push', model: 'gemini-3.1-flash-lite', estimatedTokens: 4000, now: at };
  await assert.rejects(reserveAttempt(store, args), /not initialized/);
  await store.mutate(s => { s.quota.initialized = true; s.quota.policy = policy; });
  const results = await Promise.allSettled(Array.from({ length: 6 }, () => reserveAttempt(store, args)));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 2);
  assert.equal((await store.read()).quota.attempts[0].outcome, 'reserved_unknown');
  await assert.rejects(reserveAttempt(store, { ...args, workflow: 'research' }), /not assigned/);
  await assert.rejects(reserveAttempt(store, { ...args, now: at + 61000, estimatedTokens: 10001 }), /Minute/);
  const id = await reserveAttempt(store, { ...args, now: at + 61000, retry: true });
  await finishAttempt(store, id, { outcome: 'network_timeout', failure: classifyFailure({ now: at + 61000, random: () => 0 }), now: at + 61000 });
  const state = await store.read(); assert.equal(state.quota.attempts.length, 3); assert.ok(state.quota.cooldowns[args.model] > at + 61000);
  await assert.rejects(reserveAttempt(store, { ...args, now: at + 62000 }), /cooling/);
});
test('429 daily/model, ambiguous project, authentication and transient circuit are separate and Pacific reset handles DST', async () => {
  const body = quotaId => ({ error: { details: [{ violations: [{ quotaId }] }] } });
  const daily = classifyFailure({ status: 429, body: body('GenerateRequestsPerDayPerProjectPerModel-FreeTier'), now: at });
  assert.equal(daily.kind, 'daily'); assert.equal(daily.until, nextPacificReset(at));
  assert.equal(classifyFailure({ status: 429, body: body('GenerateContentInputTokensPerMinutePerModel'), now: at }).kind, 'minute');
  assert.equal(classifyFailure({ status: 429, now: at }).kind, 'project');
  assert.equal(classifyFailure({ status: 403, now: at }).kind, 'configuration');
  const reset = nextPacificReset(Date.parse('2026-11-01T07:30:00Z')); assert.ok(Math.abs(reset - Date.parse('2026-11-02T08:00:00Z')) < 1000);
  const { store } = await temporaryStore(); await store.mutate(s => { s.quota.initialized = true; s.quota.policy = { ...policy, models: { ...policy.models, 'gemini-3.1-flash-lite': { ...policy.models['gemini-3.1-flash-lite'], rpm: 10 } } }; });
  for (let i = 0; i < 3; i++) {
    const time = at + i * 100000;
    const id = await reserveAttempt(store, { workflow: 'push', model: 'gemini-3.1-flash-lite', estimatedTokens: 100, now: time });
    await finishAttempt(store, id, { outcome: 'transient', failure: { kind: 'transient', until: time + 10 }, now: time });
  }
  assert.ok((await store.read()).quota.cooldowns['gemini-3.1-flash-lite'] >= at + 200000 + 15 * 60000);
});
