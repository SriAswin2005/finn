import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSourceSnapshotStore } from '../src/storage/source-snapshot.js';
import { getDataset, DatasetUnavailable } from '../src/providers/snapshot.js';

const recorded = JSON.parse(await readFile(new URL('../data/recorded-snapshot.json', import.meta.url)));
test('Latest snapshot persists across adapters, rejects older publication and does not leak mutable cache state', async () => {
  let saved = null;
  const query = async (text, params) => {
    if (text.startsWith('INSERT')) {
      const next = JSON.parse(params[0]);
      if (saved && Date.parse(next.asOf) < Date.parse(saved.asOf)) return [];
      saved = next; return [{ record: saved }];
    }
    return text.startsWith('SELECT') && saved ? [{ record: saved }] : [];
  };
  assert.equal(await createSourceSnapshotStore({ query }).set(recorded), true);
  const store = createSourceSnapshotStore({ query }); const first = await store.get();
  first.sources.prices.status = 'broken'; assert.notEqual((await store.get()).sources.prices.status, 'broken');
  assert.equal(await store.set({ ...recorded, asOf: '2026-10-01T00:00:00Z' }), false);
  assert.equal((await createSourceSnapshotStore({ query }).get()).asOf, recorded.asOf);
  await assert.rejects(store.set({ ...recorded, asOf: 'bad' }), /schema/);
});

test('Latest mode retains collection times and staleness and never substitutes recorded data on failure', async () => {
  const data = await getDataset('live', { now: new Date('2026-10-31T12:00:00Z'), liveProvider: async () => structuredClone(recorded) });
  assert.equal(data.mode, 'live'); assert.equal(data.snapshotAt, recorded.asOf); assert.equal(data.stale, true);
  assert.equal(data.sources.prices.status, 'stale');
  await assert.rejects(getDataset('live', { liveProvider: async () => { throw new Error('private database detail'); } }), error => error instanceof DatasetUnavailable && !error.message.includes('private database detail'));
  await assert.rejects(getDataset('live', { liveProvider: async () => null }), /not been collected/);
  await assert.rejects(getDataset('live', { liveProvider: async () => ({ schemaVersion: 9 }) }), /unreadable/);
});
