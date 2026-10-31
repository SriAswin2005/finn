import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createQuotaStore } from '../src/ai/quota.js';
import { createGeminiProvider } from '../src/ai/gemini.js';
import { getResearch } from '../src/research/service.js';

test('lost or unwritable quota retains memory but never grants a new allowance', async () => {
  let disk = { entries: [{ model: 'm', at: 1 }], cooldowns: {} }; let fail = false;
  const store = createQuotaStore({ read: async () => { if (fail) throw new Error('disk wiped'); return disk; }, write: async () => { throw new Error('read-only disk'); } });
  const ledger = await store.load();
  ledger.entries.push({ model: 'm', at: 2 });
  await assert.rejects(store.save(ledger), /AI quota resting/);
  assert.equal(store.snapshot().ledger.entries.length, 2);
  await assert.rejects(store.load(), /AI quota resting/);
  const wiped = createQuotaStore({ read: async () => { if (fail) throw new Error('wiped'); return disk; } });
  await wiped.load(); fail = true;
  await assert.rejects(wiped.load(), /AI quota resting/);
  assert.equal(wiped.snapshot().ledger.entries.length, 1);
  disk = { entries: [], cooldowns: {} }; fail = false;
  await assert.rejects(wiped.load(), /AI quota resting/);
});

test('fresh or corrupt disk makes zero model calls; reviewed note survives no credentials and host restart', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'finn-disposable-')); t.after(() => rm(directory, { recursive: true, force: true }));
  let calls = 0;
  const options = { directory, env: { GEMINI_API_KEY: 'test', FINN_AI_FREE_TIER_CONFIRMED: 'true' }, fetchImpl: async () => { calls++; throw new Error('must not call'); } };
  const evidence = [{ id: 'e1', text: 'Revenue was 100 million in the period.', page: 1 }];
  const unknown = { evidenceHash: 'missing', evidence, documents: [], question: '', company: 'Test' };
  await assert.rejects(createGeminiProvider(options).generate(unknown), /AI quota resting/);
  await writeFile(join(directory, 'quota.json'), '{corrupt');
  await assert.rejects(createGeminiProvider(options).generate(unknown), /AI quota resting/);
  const research = await getResearch('INFY');
  for (let restart = 0; restart < 2; restart++) {
    const provider = createGeminiProvider({ ...options, env: { RAILWAY_ENVIRONMENT: 'production' } });
    assert.equal(provider.enabled, false);
    const note = await provider.generate(research);
    assert.equal(note.cached, true); assert.equal(note.recorded, true); assert.equal(note.claims.length, 6); assert.equal(note.requestLlmCalls, 0);
    assert.equal(await provider.getCached({ ...research, evidenceHash: 'changed' }), null);
  }
  assert.equal(calls, 0);
});
