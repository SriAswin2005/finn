import test from 'node:test';
import assert from 'node:assert/strict';
import { createPushStore, initialPushState } from '../src/push/store.js';

function database() {
  const state = initialPushState();
  state.quota.initialized = true;
  state.quota.projectUntil = 123456789;
  state.collection.history = 'Preserved source and audit history. '.repeat(20000);
  const row = { revision: 7, record: state, transfer_gzip: null, transfer_revision: null };
  const reads = [];
  let conflict = false;
  const query = async (sql, args = []) => {
    if (/^(CREATE|ALTER)/.test(sql)) return [];
    if (sql.startsWith('SELECT revision,')) {
      assert.match(sql, /THEN NULL ELSE record/);
      const compressed = row.transfer_revision === row.revision ? row.transfer_gzip : null;
      const result = { revision: row.revision, record: compressed === null ? row.record : null, transfer_gzip: compressed };
      reads.push(Buffer.byteLength(JSON.stringify(result)));
      return [structuredClone(result)];
    }
    if (sql.startsWith('UPDATE finn_push_state')) {
      assert.match(sql, /transfer_revision=revision\+1/);
      if (conflict) { conflict = false; row.record.collection.concurrent = true; row.revision++; return []; }
      if (row.revision !== args[1]) return [];
      row.revision++; row.record = JSON.parse(args[0]); row.transfer_gzip = args[2]; row.transfer_revision = row.revision;
      return [{ revision: row.revision }];
    }
    throw new Error('Unexpected query in transfer test.');
  };
  return { row, reads, query, collide: () => { conflict = true; } };
}

test('Neon Push transfers a compressed revision without dropping history or resetting quota', async () => {
  const db = database(); const store = createPushStore({ query: db.query });
  const original = await store.read();
  await store.mutate(s => { s.collection.counter = 1; });
  const restored = await createPushStore({ query: db.query }).read();
  assert.equal(restored.collection.history, original.collection.history);
  assert.deepEqual(restored.quota, original.quota);
  assert.equal(restored.collection.counter, 1);
  assert.ok(db.reads.at(-1) < db.reads[0] / 10);
  restored.quota.initialized = false;
  assert.equal((await store.read()).quota.initialized, true);
});

test('a legacy writer invalidates compressed state and CAS conflicts retain concurrent changes', async () => {
  const db = database(); const store = createPushStore({ query: db.query });
  await store.mutate(s => { s.collection.counter = 1; });
  db.row.record.quota.projectUntil = 999999999; db.row.revision++;
  assert.equal((await store.read()).quota.projectUntil, 999999999);
  db.collide();
  await store.mutate(s => { s.collection.counter++; });
  const final = await store.read();
  assert.equal(final.collection.concurrent, true);
  assert.equal(final.collection.counter, 2);
  assert.equal(final.quota.projectUntil, 999999999);
});

test('a corrupt current compressed record fails closed without returning an older allowance', async () => {
  const db = database(); const store = createPushStore({ query: db.query });
  await store.mutate(() => {});
  db.row.transfer_gzip = 'not-a-gzip';
  await assert.rejects(store.read());
  await assert.rejects(store.mutate(s => { s.quota.initialized = false; }));
});
