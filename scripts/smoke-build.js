import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { createAppServer } from '../dist/finn/src/server.js';

const manifest = JSON.parse(await readFile(new URL('../dist/finn/BUILD_MANIFEST.json', import.meta.url)));
for (const file of manifest.files) {
  assert.ok(!file.path.startsWith('data/cache/') && file.path !== '.env' && !file.path.startsWith('.venv/'));
  const bytes = await readFile(new URL('../dist/finn/' + file.path, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
}
await assert.rejects(access(new URL('../dist/finn/.env', import.meta.url)));
const server = createAppServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
try {
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base)).status, 200);
  const briefing = await (await fetch(base + '/api/briefing?mode=recorded')).json(); assert.equal(briefing.portfolio.length, 15);
  const research = await (await fetch(base + '/api/research?ticker=ASIANPAINT')).json(); assert.equal(research.mode, 'recorded'); assert.equal(research.documents.length, 3);
  assert.ok(research.evidence.length); assert.equal((await fetch(base + '/data/research/ASIANPAINT.json')).status, 404);
  const infy = await (await fetch(base + '/api/research?ticker=INFY')).json();
  assert.equal(infy.analysis.recorded, true); assert.equal(infy.analysis.requestLlmCalls, 0); assert.equal(infy.analysis.claims.length, 6);
  console.log('Packaged application passed checksums, secret exclusions, HTTP briefing and recorded research smoke checks.');
} finally { await new Promise(resolve => server.close(resolve)); }
