import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createResearchStore } from '../src/storage/research-store.js';
import { collectRemoteDocument } from '../src/research/remote-parser.js';

test('Neon store uses bound values and survives a fresh adapter instance', async () => {
  const saved = new Map(); const statements = [];
  const query = async (text, params) => {
    statements.push({ text, params });
    if (text.startsWith('INSERT')) saved.set(params[0], JSON.parse(params[1]));
    return text.startsWith('SELECT') && saved.has(params[0]) ? [{ record: saved.get(params[0]) }] : [];
  };
  const record = { ticker: 'TEST', documents: [{ title: "source's title" }], fetchedAt: '2026-10-31T00:00:00Z' };
  await createResearchStore({ query }).set('TEST', record);
  assert.deepEqual(await createResearchStore({ query }).get('TEST'), record);
  assert.ok(statements.some(item => item.text.includes('$1') && item.params[0] === 'TEST'));
  assert.ok(statements.every(item => !item.text.includes("source's title")));
  await assert.rejects(createResearchStore({ query }).get("';DROP TABLE x;"), RangeError);
  const failed = createResearchStore({ query: async () => { throw new Error('private-connection-string'); } });
  await assert.rejects(failed.get('TEST'), error => !error.message.includes('private-connection-string') && /unavailable/.test(error.message));
});

test('remote PDF parser sends signed small metadata and rejects malformed page output', async () => {
  const env = { VERCEL_URL: 'finn.example', FINN_PARSER_SECRET: 'test-private-parser-secret' };
  let received;
  const fetchImpl = async (url, options) => {
    received = { url, options };
    return Response.json({ sha256: 'a'.repeat(64), parser: 'pypdf-6.10.0-v1', url: 'https://issuer.example/source.pdf', pages: [{ page: 1, text: 'Original source passage.' }] });
  };
  const source = { kind: 'annual_report', url: 'https://issuer.example/source.pdf', title: 'Annual report' };
  const result = await collectRemoteDocument(source, '2026-10-31', { env, fetchImpl, now: () => 100000 });
  assert.equal(result.pageCount, 1); assert.equal(result.pages[0].page, 1);
  assert.equal(received.url, 'https://finn.example/api/parse');
  assert.equal(received.options.headers['x-finn-parser-signature'], createHmac('sha256', env.FINN_PARSER_SECRET).update(received.options.body).digest('hex'));
  assert.ok(!JSON.stringify(received).includes(env.FINN_PARSER_SECRET));
  assert.equal(JSON.parse(received.options.body).expires, 190);
  await assert.rejects(collectRemoteDocument(source, '', { env, fetchImpl: async () => Response.json({ pages: [] }) }), /invalid page data/);
  await assert.rejects(collectRemoteDocument(source, '', { env: {} }), /not configured/);
});

test('Python hosted parser verifies authorization, private-address rejection and unreadable text', async () => {
  let python = process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python';
  try { await access(python); } catch { python = process.platform === 'win32' ? 'python' : 'python3'; }
  const { stderr } = await promisify(execFile)(python, ['-m', 'unittest', 'discover', '-s', 'test', '-p', 'hosted_parser_test.py'], { timeout: 15000, windowsHide: true });
  assert.match(stderr, /OK/);
});
