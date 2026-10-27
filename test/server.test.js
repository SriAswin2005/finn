import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createAppServer } from '../src/server.js';
import { DatasetUnavailable } from '../src/providers/snapshot.js';
import { AiUnavailable } from '../src/ai/gemini.js';

test('HTTP contract, validation, static isolation and install assets', async t => {
  const server = createAppServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = path => fetch(base + path);
  const health = await request('/api/health');
  assert.deepEqual(await health.json(), { ok: true, modes: ['live', 'recorded', 'demo'] });
  const response = await request('/api/briefing?mode=demo&hours=168&price=50&volume=20');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const data = await response.json();
  assert.equal(data.counts.material, 6);
  assert.equal(data.counts.signals, 0);
  for (const path of ['/api/briefing?hours=bad', '/api/briefing?price=', '/api/briefing?volume=100', '/api/briefing?mode=unknown']) assert.equal((await request(path)).status, 400);
  for (const path of ['/src/server.js', '/package.json', '/.env', '/%2e%2e/package.json', '/api/missing', '/data/cache/snapshot.json']) assert.equal((await request(path)).status, 404);
  assert.equal((await fetch(base + '/api/briefing', { method: 'POST' })).status, 405);
  assert.match(await (await request('/')).text(), /Your portfolio,/);
  assert.equal((await fetch(base, { method: 'HEAD' })).status, 200);
  const manifest = await (await request('/manifest.webmanifest')).json();
  assert.equal(manifest.display, 'standalone');
  for (const icon of manifest.icons) {
    const response = await request(icon.src);
    assert.equal(response.headers.get('content-type'), 'image/png');
    const buffer = Buffer.from(await response.arrayBuffer());
    assert.equal(buffer.toString('hex', 0, 8), '89504e470d0a1a0a');
    const size = Number(icon.sizes.split('x')[0]);
    assert.equal(buffer.readUInt32BE(16), size);
    assert.equal(buffer.readUInt32BE(20), size);
  }
  assert.equal((await request('/sw.js')).headers.get('cache-control'), 'no-cache');
});

test('research HTTP contract preserves page citations and protects generation requests', async t => {
  let generated = 0;
  const server = createAppServer({ aiProvider: { generate: async () => { generated++; throw new AiUnavailable('Free quota not configured.'); } } });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(base + '/api/research?ticker=ASIANPAINT');
  assert.equal(response.status, 200); const result = await response.json();
  assert.equal(result.documents.length, 3); assert.ok(result.evidence.every(item => item.page >= 1));
  assert.equal((await fetch(base + '/api/research?ticker=../private')).status, 400);
  assert.equal((await fetch(base + '/data/cache/research/ASIANPAINT.json')).status, 404);
  const post = options => fetch(base + '/api/research/analysis', { method: 'POST', ...options });
  assert.equal((await post({ body: '{}' })).status, 415);
  assert.equal((await post({ headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.test' }, body: '{}' })).status, 403);
  assert.equal((await post({ headers: { 'Content-Type': 'application/json' }, body: '{bad' })).status, 400);
  assert.equal((await post({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticker: 'INFY' }) })).status, 503);
  assert.equal(generated, 1);
});

test('missing live data returns a useful 503, never a fictional briefing', async t => {
  const server = createAppServer({ datasetProvider: async () => { throw new DatasetUnavailable('No live snapshot yet.'); } });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/briefing?mode=live`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'No live snapshot yet.' });
});
