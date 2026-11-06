// Dedicated authenticated storage gateway, independent of the cron dispatcher.
const validKey = key => typeof key === 'string' && /^(push:state|source:snapshot|document:[a-f0-9]{64}|research:[A-Z0-9&-]{1,33})$/.test(key);
const json = value => Response.json(value, { headers: { 'cache-control': 'no-store' } });

export default {
  async fetch(request, env) {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/v1/records') return new Response('Not found', { status: 404 });
    if ((env.FINN_STORAGE_SECRET ?? '').length < 32) return new Response('Unavailable', { status: 503 });
    const signature = request.headers.get('x-finn-storage-signature') ?? '';
    if (!/^[a-f0-9]{64}$/.test(signature)) return new Response('Unauthorized', { status: 401 });
    const reader = request.body?.getReader();
    if (!reader) return new Response('Invalid body', { status: 400 });
    const chunks = []; let size = 0;
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.length;
      if (size > 2000000) { await reader.cancel(); return new Response('Too large', { status: 413 }); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body = new TextDecoder().decode(bytes);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.FINN_STORAGE_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const signatureBytes = Uint8Array.from(signature.match(/../g), hex => parseInt(hex, 16));
    if (!await crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(`finn-storage\n${body}`))) return new Response('Unauthorized', { status: 401 });
    let message;
    try { message = JSON.parse(body); } catch { return new Response('Invalid body', { status: 400 }); }
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isInteger(message.expires) || message.expires < now || message.expires > now + 90) return new Response('Expired', { status: 401 });
    if (!validKey(message.key) || !['get', 'create', 'cas'].includes(message.operation)
      || (message.operation !== 'get' && (typeof message.payload !== 'string' || message.payload.length > 1900000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(message.payload)))
      || (message.operation === 'cas' && (!Number.isSafeInteger(message.revision) || message.revision < 0))) return new Response('Invalid record', { status: 400 });
    const object = env.FINN_RECORDS.get(env.FINN_RECORDS.idFromName('canonical'));
    return object.fetch(new Request('https://storage.internal/record', { method: 'POST', body: JSON.stringify(message) }));
  },
};

export class FinnRecords {
  constructor(ctx) {
    this.sql = ctx.storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS records (key TEXT PRIMARY KEY, revision INTEGER NOT NULL, payload TEXT NOT NULL)');
  }
  async fetch(request) {
    const { operation, key, revision, payload } = await request.json();
    // After parsing, SQL runs synchronously. The conditional UPDATE is the quota
    // transaction boundary even when multiple Vercel instances reserve at once.
    if (operation === 'get') return json([...this.sql.exec('SELECT revision,payload FROM records WHERE key=?', key)][0] ?? null);
    const rows = operation === 'create'
      ? this.sql.exec('INSERT INTO records (key,revision,payload) VALUES (?,0,?) ON CONFLICT(key) DO NOTHING RETURNING revision', key, payload)
      : this.sql.exec('UPDATE records SET revision=revision+1,payload=? WHERE key=? AND revision=? RETURNING revision', payload, key, revision);
    return json({ changed: [...rows].length === 1 });
  }
}
