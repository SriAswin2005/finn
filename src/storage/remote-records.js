import { createHmac } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';

// Server-only storage transport. A configured remote backend never falls back to
// Neon or a fresh local ledger on errors: there must be one quota authority.
export function createRemoteRecords({ env = process.env, fetchImpl = fetch } = {}) {
  const origin = new URL(env.FINN_STORAGE_URL);
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== '/') throw new Error('Storage requires an HTTPS origin.');
  if ((env.FINN_STORAGE_SECRET ?? '').length < 32) throw new Error('Storage authentication is missing.');
  async function request(operation, key, extra = {}) {
    const body = JSON.stringify({ operation, key, ...extra, expires: Math.floor(Date.now() / 1000) + 60 });
    const signature = createHmac('sha256', env.FINN_STORAGE_SECRET).update(`finn-storage\n${body}`).digest('hex');
    const response = await fetchImpl(new URL('/v1/records', origin), { method: 'POST', headers: { 'content-type': 'application/json', 'x-finn-storage-signature': signature }, body, signal: AbortSignal.timeout(8000), redirect: 'error' });
    if (!response.ok) throw new Error(`Durable storage unavailable (HTTP ${response.status}).`);
    return response.json();
  }
  function encode(record) {
    const payload = gzipSync(JSON.stringify(record)).toString('base64');
    if (payload.length > 1900000) throw new Error('Compressed storage record exceeds the safe row limit.');
    return payload;
  }
  return {
    async get(key) {
      const row = await request('get', key);
      return row === null ? null : { revision: row.revision, record: JSON.parse(gunzipSync(Buffer.from(row.payload, 'base64'), { maxOutputLength: 64 * 1024 * 1024 }).toString('utf8')) };
    },
    async create(key, record) { return (await request('create', key, { payload: encode(record) })).changed; },
    async cas(key, revision, record) { return (await request('cas', key, { revision, payload: encode(record) })).changed; },
    async set(key, record, accepts = () => true) {
      for (let attempt = 0; attempt < 16; attempt++) {
        const old = await this.get(key);
        if (old && !accepts(old.record)) return false;
        if (old ? await this.cas(key, old.revision, record) : await this.create(key, record)) return true;
      }
      throw new Error('Durable storage is busy; retry later.');
    },
  };
}
