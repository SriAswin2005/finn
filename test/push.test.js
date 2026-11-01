import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPushStore } from '../src/push/store.js';
import { collectPush, collectionWindow, mergeFilings } from '../src/push/collection.js';
import { normalizeNse } from '../src/providers/nse.js';

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
