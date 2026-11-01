import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createHmac } from 'node:crypto';
import { createAppServer } from '../src/server.js';
import { createPushService, decoratePushDataset, pushStatus } from '../src/push/service.js';
import { initialPushState, createPushStore } from '../src/push/store.js';
import { mergeFilings } from '../src/push/collection.js';
import { buildBriefing } from '../src/domain/briefing.js';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { processAnalysis } from '../src/push/analysis.js';

const at = Date.parse('2026-11-01T10:00:00Z');
const base = { mode: 'live', asOf: new Date(at).toISOString(), portfolio: [{ symbol: 'ABC', name: 'Example', eod: null }], announcements: [], sources: { prices: { status: 'unavailable' }, announcements: { status: 'ok' } } };
const filing = { id: 'unseen', symbol: 'ABC', title: 'Other', summary: 'Unclassified disclosure', category: 'unclassified', source: { url: 'https://nsearchives.nseindia.com/a.pdf' }, publishedAt: new Date(at - 7 * 86400000).toISOString() };
test('pending old unknowns stay visible, captured tests excluded, semantic priority overrides category and delayed complete items expire explicitly', () => {
  const state = initialPushState(); mergeFilings(state, [filing], new Date(at).toISOString());
  const event = state.events[filing.id]; event.processingKey = 'key'; event.status = 'deferred'; state.jobs.key = { status: 'deferred', eventId: filing.id, createdAt: new Date(at).toISOString() };
  const data = decoratePushDataset(base, state, at); const brief = buildBriefing(data);
  assert.equal(brief.announcements.length, 1); assert.equal(brief.announcements[0].routine, false); assert.equal(brief.announcements[0].delayed, true);
  event.filing.evidenceMode = 'captured_evaluation'; assert.equal(decoratePushDataset(base, state, at).announcements.length, 0);
  delete event.filing.evidenceMode;
  state.jobs.key = { status: 'complete', analysis: { eventType: 'other', priority: 'high', claims: [{ role: 'event', text: 'A supported event' }, { role: 'priority', text: 'A supported conditional reason' }], missing: [], generatedAt: new Date(at).toISOString() } };
  const completed = buildBriefing(decoratePushDataset(base, state, at)); assert.ok(completed.announcements[0].priority >= 80); assert.equal(completed.announcements[0].priorityReason, 'A supported conditional reason');
  assert.equal(buildBriefing({ ...decoratePushDataset(base, state, at + 4 * 86400000), asOf: new Date(at + 4 * 86400000).toISOString() }).announcements.length, 0);
});
test('collection failures and no-new/pending status are distinct and capacity overload is exposed', () => {
  const state = initialPushState(); mergeFilings(state, [filing], new Date(at).toISOString()); state.collection.status = 'failed'; state.collection.error = 'NSE timeout';
  const failed = pushStatus(state, at); assert.equal(failed.collection.status, 'failed'); assert.equal(failed.pending, 1); assert.equal(failed.overload, true);
  state.collection.status = 'ok'; state.collection.counts = { added: 0, changed: 0 }; assert.equal(pushStatus(state, at).collection.counts.added, 0); assert.equal(pushStatus(state, at).pending, 1);
});
test('worker tick is awaited and concurrent invocations share durable whole-tick lease', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'finn-worker-')); const store = createPushStore({ env: {}, path: join(directory, 's.sqlite') }); await store.initialize();
  let collections = 0; let documents = 0; let calls = 0;
  const service = createPushService({ store, now: () => at, collect: async () => { collections++; }, document: async () => { documents++; }, analyse: async () => { calls++; return { disabled: true }; } });
  await Promise.all(Array.from({ length: 5 }, () => service.tick())); assert.equal(collections, 1); assert.equal(documents, 2); assert.equal(calls, 1); assert.equal((await store.read()).workerLease, null);
});
test('HTTP opens and source refresh make zero model calls; signed worker route is isolated from reviewer auth', async t => {
  let generated = 0; let refreshes = 0; let ticks = 0;
  const secret = 'synthetic-worker-secret-for-contract-only-123';
  const pushService = { decorate: async d => d, status: async () => ({ pending: 1 }), refresh: async () => { refreshes++; return { llmCalls: 0 }; }, tick: async () => { ticks++; return { done: true }; } };
  const server = createAppServer({ datasetProvider: async () => base, aiProvider: { generate: async () => { generated++; } }, accessGate: () => true, pushService, env: { FINN_PUSH_WORKER_SECRET: secret } });
  server.listen(0, '127.0.0.1'); await once(server, 'listening'); t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  for (let i = 0; i < 3; i++) assert.equal((await fetch(url + '/api/briefing')).status, 200);
  assert.equal((await fetch(url + '/api/push/status')).status, 200);
  assert.equal((await (await fetch(url + '/api/push/refresh', { method: 'POST' })).json()).llmCalls, 0); assert.equal(refreshes, 1); assert.equal(generated, 0);
  assert.equal((await fetch(url + '/api/push/refresh', { method: 'POST', headers: { Origin: 'https://attacker.test' } })).status, 403);
  assert.equal((await fetch(url + '/api/push/worker', { method: 'POST', body: '{}' })).status, 403);
  const body = JSON.stringify({ expires: Math.floor(Date.now() / 1000) + 60, runId: 'test' });
  const signature = createHmac('sha256', secret).update(`push-worker\n${body}`).digest('hex');
  assert.equal((await fetch(url + '/api/push/worker', { method: 'POST', headers: { 'x-finn-worker-signature': signature }, body })).status, 200); assert.equal(ticks, 1); assert.equal(generated, 0);
});

test('hosted status verifies credential presence without disclosure or calls and shares the generation gate', async t => {
  const secret = 'synthetic-gemini-key-never-return-to-client';
  const env = { VERCEL: '1', GEMINI_API_KEY: secret, FINN_AI_FREE_TIER_CONFIRMED: 'true', FINN_PUSH_ENABLED: 'true', FINN_PUSH_HOSTED_APPROVED: 'false' };
  const store = { read: async () => initialPushState(), mutate: async () => { throw new Error('Disabled generation must not claim jobs or reserve attempts.'); } };
  const pushService = createPushService({ store, env });
  const server = createAppServer({ accessGate: () => true, aiProvider: {}, pushService });
  server.listen(0, '127.0.0.1'); await once(server, 'listening'); t.after(() => new Promise(resolve => server.close(resolve)));
  const text = await (await fetch(`http://127.0.0.1:${server.address().port}/api/push/status`)).text();
  const status = JSON.parse(text); assert.equal(text.includes(secret), false);
  assert.equal(status.generation.configured, true); assert.equal(status.generation.enabled, false); assert.equal(status.generation.freeTierConfirmed, true);
  const result = await processAnalysis({ store, env, fetchImpl: async () => { throw new Error('No model call allowed.'); } });
  assert.equal(result.disabled, true); assert.equal(result.reason, status.generation.reason);
  delete env.GEMINI_API_KEY; assert.equal((await pushService.status()).generation.configured, false);
});

test('source and analysis cadences are independent configuration and unchanged time skips generation checks', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'finn-cadence-')); const store = createPushStore({ env: {}, path: join(directory, 's.sqlite') }); await store.initialize();
  let analyses = 0; let interval;
  const service = createPushService({ store, now: () => at, env: { FINN_PUSH_COLLECTION_MINUTES: '30', FINN_PUSH_ANALYSIS_MINUTES: '60' }, collect: async options => { interval = options.intervalMs; }, document: async () => ({ skipped: true }), analyse: async () => { analyses++; } });
  await service.tick(); await service.tick(); assert.equal(analyses, 1); assert.equal(interval, 30 * 60000); assert.equal((await service.status()).analysisMinutes, 60);
  assert.throws(() => createPushService({ store, env: { FINN_PUSH_COLLECTION_MINUTES: '0' } }), /cadence/);
});
