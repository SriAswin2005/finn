import { validateSnapshot } from './snapshots.js';

export function createSourceSnapshotStore({ env = process.env, query: injectedQuery, now = Date.now } = {}) {
  let ready; let memory = null;
  async function database() {
    if (!ready) ready = (async () => {
      const query = injectedQuery ?? (await import('@neondatabase/serverless')).neon(env.DATABASE_URL).query;
      await query('CREATE TABLE IF NOT EXISTS finn_source_snapshots (id smallint PRIMARY KEY CHECK (id = 1), record jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())', [], { fetchOptions: { signal: AbortSignal.timeout(8000) } });
      return query;
    })().catch(error => { ready = null; throw error; });
    return ready;
  }
  return {
    async get() {
      if (memory?.expires > now()) return structuredClone(memory.record);
      try {
        const query = await database();
        const rows = await query('SELECT record FROM finn_source_snapshots WHERE id = 1', [], { fetchOptions: { signal: AbortSignal.timeout(8000) } });
        const record = rows[0]?.record ?? null;
        if (record) { validateSnapshot(record); memory = { record, expires: now() + 30000 }; }
        return record ? structuredClone(record) : null;
      } catch { throw new Error('Latest source storage is unavailable. Recorded sources remain available.'); }
    },
    async set(record) {
      validateSnapshot(record);
      try {
        const query = await database();
        const rows = await query("INSERT INTO finn_source_snapshots (id, record) VALUES (1, $1::jsonb) ON CONFLICT (id) DO UPDATE SET record = EXCLUDED.record, updated_at = now() WHERE (EXCLUDED.record->>'asOf')::timestamptz >= (finn_source_snapshots.record->>'asOf')::timestamptz RETURNING record", [JSON.stringify(record)], { fetchOptions: { signal: AbortSignal.timeout(8000) } });
        memory = null;
        return rows.length > 0;
      } catch { throw new Error('Source snapshot was saved locally but could not be published to persistent storage.'); }
    },
  };
}
