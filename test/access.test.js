import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createAppServer } from '../src/server.js';
import { createAccessGate } from '../src/access.js';

test('shared token protects assets and APIs, exchanges for a signed secure cookie and expires', async t => {
  const token = 'test-reviewer-token-with-32-characters'; let now = Date.now();
  let calls = 0;
  const server = createAppServer({ accessGate: createAccessGate({ token, now: () => now }), aiProvider: { generate: async () => { calls++; return {}; } } });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const path of ['/', '/app.js', '/api/research?ticker=INFY', '/api/briefing?mode=recorded']) assert.equal((await fetch(base + path)).status, 401);
  assert.equal((await fetch(base + '/api/research/analysis', { method: 'POST' })).status, 401);
  assert.equal(calls, 0);
  assert.equal((await fetch(base + '/api/health')).status, 200);
  assert.equal((await fetch(base + '/?key=wrong')).status, 403);
  const login = await fetch(base + `/?key=${token}&mode=recorded`, { redirect: 'manual' });
  assert.equal(login.status, 303); assert.equal(login.headers.get('location'), '/?mode=recorded');
  assert.equal(login.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(login.headers.get('cache-control'), 'no-store');
  const raw = login.headers.get('set-cookie');
  assert.match(raw, /HttpOnly; Secure; SameSite=Lax/); assert.ok(!raw.includes(token));
  const cookie = raw.split(';')[0];
  assert.equal((await fetch(base, { headers: { Cookie: cookie } })).status, 200);
  assert.equal((await fetch(base, { headers: { Cookie: cookie + 'tampered' } })).status, 401);
  const rotated = createAccessGate({ token: token + '-rotated', now: () => now });
  const fake = { headers: { cookie } }; let status;
  rotated(fake, { setHeader() {}, writeHead(code) { status = code; }, end() {} }, new URL(base));
  assert.equal(status, 401);
  now += 86400001;
  assert.equal((await fetch(base, { headers: { Cookie: cookie } })).status, 401);
});

test('host startup fails closed with missing or weak reviewer token', () => {
  assert.throws(() => createAccessGate({ required: true, token: '' }), /Set FINN_ACCESS_TOKEN/);
  assert.throws(() => createAccessGate({ token: 'weak' }), /at least 32/);
});
