import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createHmac } from 'node:crypto';
import gateway, { FinnRecords } from '../scheduler/storage-worker.js';
import { createRemoteRecords } from '../src/storage/remote-records.js';
import { createPushStore, initialPushState } from '../src/push/store.js';
import { createResearchStore } from '../src/storage/research-store.js';
import { createSourceSnapshotStore } from '../src/storage/source-snapshot.js';
import { readFile } from 'node:fs/promises';

const env = { FINN_STORAGE_URL: 'https://storage.example/', FINN_STORAGE_SECRET: 'test-only-storage-secret-32-characters', DATABASE_URL: 'must-not-be-used' };

test('opt-in research reads retry transient failures once but refuse authorization and corrupt responses', async () => {
  for (const failure of [new DOMException('timeout', 'TimeoutError'), new TypeError('network'), new Response('busy', { status: 503 })]) {
    let calls = 0;
    const records = createRemoteRecords({ env, retryReads: true, fetchImpl: async () => {
      calls++; if (calls === 1) { if (failure instanceof Error) throw failure; return failure; }
      return Response.json(null);
    } });
    assert.equal(await records.get('research:TCS'), null); assert.equal(calls, 2);
  }
  for (const response of [() => new Response('denied', { status: 403 }), () => new Response('bad json'), () => new Response('busy', { status: 503 })]) {
    let calls = 0;
    const records = createRemoteRecords({ env, retryReads: true, fetchImpl: async () => { calls++; return response(); } });
    await assert.rejects(records.get('research:TCS'));
    assert.equal(calls, response().status === 503 ? 2 : 1);
  }
});

test('an uncertain committed write is never automatically replayed even with read retries enabled', async () => {
  let calls = 0;
  const records = createRemoteRecords({ env, retryReads: true, fetchImpl: async () => { calls++; throw new TypeError('connection closed after commit'); } });
  await assert.rejects(records.cas('push:state', 1, { preserved: true })); assert.equal(calls, 1);
  await assert.rejects(records.create('research:TCS', { preserved: true })); assert.equal(calls, 2);
});
function backend() {
  const db = new DatabaseSync(':memory:');
  const object = new FinnRecords({ storage: { sql: { exec(sql, ...args) { const statement = db.prepare(sql); if (statement.columns().length) return statement.all(...args); statement.run(...args); return []; } } } });
  const bindings = { ...env, FINN_RECORDS: { idFromName: () => 'canonical', get: () => object } };
  const fetchImpl = (url, init) => gateway.fetch(new Request(url, init), bindings);
  return { db, bindings, fetchImpl, records: createRemoteRecords({ env, fetchImpl }) };
}

test('remote storage preserves full records, rejects stale/replayed writes and keeps one winner', async () => {
  const { records, db } = backend();
  try {
    const initial = { history: 'physical source quote '.repeat(120000), quota: { attempts: [1, 2, 3], hold: 999 } };
    assert.equal(await records.get('push:state'), null);
    assert.equal(await records.create('push:state', initial), true);
    assert.equal(await records.create('push:state', {}), false);
    assert.deepEqual((await records.get('push:state')).record, initial);
    const results = await Promise.all([records.cas('push:state', 0, { ...initial, winner: 1 }), records.cas('push:state', 0, { ...initial, winner: 2 })]);
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(await records.cas('push:state', 0, {}), false);
    assert.deepEqual((await records.get('push:state')).record.quota, initial.quota);
  } finally { db.close(); }
});

test('gateway refuses unauthenticated, expired, tampered and unexpected records', async () => {
  const { bindings, db } = backend();
  const send = async (message, secret = env.FINN_STORAGE_SECRET) => {
    const body = JSON.stringify(message);
    return gateway.fetch(new Request(`${env.FINN_STORAGE_URL}v1/records`, { method: 'POST', body, headers: { 'x-finn-storage-signature': createHmac('sha256', secret).update(`finn-storage\n${body}`).digest('hex') } }), bindings);
  };
  try {
    assert.equal((await gateway.fetch(new Request(env.FINN_STORAGE_URL), bindings)).status, 404);
    assert.equal((await gateway.fetch(new Request(`${env.FINN_STORAGE_URL}v1/records`, { method: 'POST', body: '{}' }), bindings)).status, 401);
    const message = { operation: 'get', key: 'push:state', expires: Math.floor(Date.now() / 1000) + 60 };
    assert.equal((await send(message, 'wrong-secret')).status, 401);
    assert.equal((await send({ ...message, expires: 1 })).status, 401);
    assert.equal((await send({ ...message, key: '../secrets' })).status, 400);
    assert.equal((await send({ ...message, operation: 'delete' })).status, 400);
    assert.equal((await send({ ...message, operation: 'cas', revision: -1, payload: 'abcd' })).status, 400);
    assert.equal((await send({ ...message, operation: 'create', payload: 'x'.repeat(1900001) })).status, 400);
  } finally { db.close(); }
});

test('all application stores use remote authority, preserve concurrent quota and refuse resets/fallback', async () => {
  const { records, fetchImpl, db } = backend();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    const state = initialPushState(); state.quota.initialized = true; state.quota.projectUntil = 777;
    const push = createPushStore({ env });
    await assert.rejects(push.read(), /not initialized/);
    await assert.rejects(push.initialize(), /forbidden/);
    await records.create('push:state', state);
    await Promise.all(Array.from({ length: 8 }, () => createPushStore({ env }).mutate(s => { s.collection.count = (s.collection.count ?? 0) + 1; })));
    assert.equal((await push.read()).collection.count, 8);
    assert.deepEqual((await push.read()).quota, state.quota);
    const doc = { sha256: 'a'.repeat(64), pages: [{ page: 1, text: 'Original source.' }] };
    await push.saveDocument(doc); await push.saveDocument({ ...doc, pages: [{ page: 1, text: 'Different' }] });
    assert.deepEqual(await push.document(doc.sha256), doc);
    const research = createResearchStore({ env });
    await research.set('INFY', { notes: ['kept'], sources: ['exact quotes'] });
    assert.deepEqual(await createResearchStore({ env }).get('INFY'), { notes: ['kept'], sources: ['exact quotes'] });
    const snapshot = JSON.parse(await readFile(new URL('../data/recorded-snapshot.json', import.meta.url)));
    const source = createSourceSnapshotStore({ env });
    assert.equal(await source.set(snapshot), true);
    assert.equal(await source.set({ ...snapshot, asOf: '2000-01-01T00:00:00.000Z' }), false);
    assert.deepEqual(await source.get(), snapshot);
    globalThis.fetch = async () => new Response('unavailable', { status: 503 });
    await assert.rejects(createPushStore({ env }).read(), /503/);
    await assert.rejects(createResearchStore({ env }).get('INFY'), /503/);
    await assert.rejects(createSourceSnapshotStore({ env }).get(), /unavailable/);
  } finally { globalThis.fetch = originalFetch; db.close(); }
});
