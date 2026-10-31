import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runtimeCacheDirectory, writeJsonAtomic } from './snapshots.js';

export function createResearchStore({ env = process.env, query: injectedQuery, directory = resolve(runtimeCacheDirectory, 'research') } = {}) {
  let ready;
  async function database() {
    if (!ready) ready = (async () => {
      const query = injectedQuery ?? (await import('@neondatabase/serverless')).neon(env.DATABASE_URL).query;
      await query('CREATE TABLE IF NOT EXISTS finn_research_cache (ticker text PRIMARY KEY, record jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())', [], { fetchOptions: { signal: AbortSignal.timeout(8000) } });
      return query;
    })().catch(error => { ready = null; throw error; });
    return ready;
  }
  const validate = ticker => { if (!/^[A-Z0-9&-]{1,33}$/.test(ticker)) throw new RangeError('Invalid research cache key.'); };
  return {
    async get(ticker) {
      validate(ticker);
      if (env.DATABASE_URL || injectedQuery) {
        try {
          const query = await database();
          const rows = await query('SELECT record FROM finn_research_cache WHERE ticker = $1', [ticker], { fetchOptions: { signal: AbortSignal.timeout(8000) } });
          return rows[0]?.record ?? null;
        } catch { throw new Error('Persistent research storage is unavailable. Recorded examples remain available.'); }
      }
      try { return JSON.parse(await readFile(resolve(directory, `${ticker}.json`), 'utf8')); }
      catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    },
    async set(ticker, record) {
      validate(ticker);
      if (env.DATABASE_URL || injectedQuery) {
        try {
          const query = await database();
          await query('INSERT INTO finn_research_cache (ticker, record) VALUES ($1, $2::jsonb) ON CONFLICT (ticker) DO UPDATE SET record = EXCLUDED.record, updated_at = now()', [ticker, JSON.stringify(record)], { fetchOptions: { signal: AbortSignal.timeout(8000) } });
        } catch { throw new Error('Research was collected but persistent storage is unavailable.'); }
      } else await writeJsonAtomic(resolve(directory, `${ticker}.json`), record);
    },
  };
}
