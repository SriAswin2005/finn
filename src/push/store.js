import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { runtimeCacheDirectory } from '../storage/snapshots.js';

export function initialPushState() {
  return { schemaVersion: 1, events: {}, jobs: {}, collection: { checkpoint: null, nextAt: 0, status: 'not_collected', requested: false }, quota: { initialized: false, attempts: [], cooldowns: {}, projectUntil: 0, stopped: null, failures: {} } };
}
function validate(state) {
  if (state?.schemaVersion !== 1 || !state.events || !state.jobs || !state.collection || !state.quota || !Array.isArray(state.quota.attempts) || !state.quota.cooldowns || !state.quota.failures) throw new Error('Push storage is corrupt; processing is paused.');
  return state;
}

// Compare-and-swap covers leases, accepted jobs and quota in one durable record.
// PDF pages live separately; callbacks must be synchronous and have no side effects.
export function createPushStore({ env = process.env, path = resolve(runtimeCacheDirectory, 'push.sqlite'), query: injectedQuery } = {}) {
  let ready;
  async function backend() {
    if (!ready) ready = (async () => {
      if (env.DATABASE_URL || injectedQuery) {
        const query = injectedQuery ?? (await import('@neondatabase/serverless')).neon(env.DATABASE_URL).query;
        const run = (sql, args = []) => query(sql, args, { fetchOptions: { signal: AbortSignal.timeout(8000) } });
        await run('CREATE TABLE IF NOT EXISTS finn_push_state (id smallint PRIMARY KEY CHECK (id=1), revision bigint NOT NULL, record jsonb NOT NULL)');
        await run('CREATE TABLE IF NOT EXISTS finn_push_documents (hash text PRIMARY KEY, record jsonb NOT NULL, saved_at timestamptz NOT NULL DEFAULT now())');
        return {
          read: async () => (await run('SELECT revision, record FROM finn_push_state WHERE id=1'))[0],
          initialize: async () => run('INSERT INTO finn_push_state (id,revision,record) VALUES (1,0,$1::jsonb) ON CONFLICT (id) DO NOTHING', [JSON.stringify(initialPushState())]),
          cas: async (revision, record) => (await run('UPDATE finn_push_state SET revision=revision+1,record=$1::jsonb WHERE id=1 AND revision=$2 RETURNING revision', [JSON.stringify(record), revision])).length > 0,
          document: async hash => (await run('SELECT record FROM finn_push_documents WHERE hash=$1', [hash]))[0]?.record ?? null,
          saveDocument: async doc => run('INSERT INTO finn_push_documents (hash,record) VALUES ($1,$2::jsonb) ON CONFLICT (hash) DO NOTHING', [doc.sha256, JSON.stringify(doc)]),
        };
      }
      if (env.VERCEL) throw new Error('Durable DATABASE_URL is required for hosted Push.');
      await mkdir(dirname(path), { recursive: true });
      const { DatabaseSync } = await import('node:sqlite');
      const db = new DatabaseSync(path); db.exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, record TEXT NOT NULL); CREATE TABLE IF NOT EXISTS documents (hash TEXT PRIMARY KEY, record TEXT NOT NULL)');
      db.close();
      const statement = (sql, args, kind = 'get') => {
        const connection = new DatabaseSync(path);
        try { connection.exec('PRAGMA busy_timeout=5000'); return connection.prepare(sql)[kind](...args); }
        finally { connection.close(); }
      };
      return {
        read: async () => { const row = statement('SELECT revision,record FROM state WHERE id=1', []); return row && { revision: row.revision, record: JSON.parse(row.record) }; },
        initialize: async () => statement('INSERT OR IGNORE INTO state VALUES (1,0,?)', [JSON.stringify(initialPushState())], 'run'),
        cas: async (revision, record) => statement('UPDATE state SET revision=revision+1,record=? WHERE id=1 AND revision=?', [JSON.stringify(record), revision], 'run').changes > 0,
        document: async hash => { const row = statement('SELECT record FROM documents WHERE hash=?', [hash]); return row ? JSON.parse(row.record) : null; },
        saveDocument: async doc => statement('INSERT OR IGNORE INTO documents VALUES (?,?)', [doc.sha256, JSON.stringify(doc)], 'run'),
      };
    })().catch(error => { ready = null; throw error; });
    return ready;
  }
  return {
    async initialize() { await (await backend()).initialize(); },
    async read() { const row = await (await backend()).read(); if (!row) throw new Error('Push storage is not initialized. Run push:init; quota is never recreated automatically.'); return structuredClone(validate(row.record)); },
    async mutate(change) {
      const db = await backend();
      for (let conflict = 0; conflict < 16; conflict++) {
        const row = await db.read(); if (!row) throw new Error('Push state missing; processing fails closed.');
        const state = structuredClone(validate(row.record));
        const result = change(state);
        if (result?.then) throw new Error('Push transaction callback must be synchronous.');
        if (await db.cas(row.revision, state)) return result;
      }
      throw new Error('Push storage is busy; work remains durable for a later job.');
    },
    async document(hash) { return (await backend()).document(hash); },
    async saveDocument(doc) {
      if (!/^[a-f0-9]{64}$/.test(doc?.sha256 ?? '') || !Array.isArray(doc.pages) || !doc.pages.length || doc.pages.some((p, i) => p.page !== i + 1 || typeof p.text !== 'string')) throw new Error('Invalid Push document pages/hash.');
      await (await backend()).saveDocument(doc);
    },
  };
}
