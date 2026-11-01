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
