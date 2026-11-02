import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPushStore } from '../src/push/store.js';
import { reserveAttempt, validatePolicy } from '../src/push/quota.js';
import { applyPolicy } from '../src/push/policy.js';
import { researchAssignments } from '../src/ai/workflows.js';
import { createGeminiProvider } from '../src/ai/gemini.js';
import { createHash } from 'node:crypto';
import { PROMPT_VERSION } from '../src/ai/gemini.js';
import { modelInventory, researchModelOrder } from '../src/ai/models.js';
import policy from '../src/config/model-policy.json' with { type: 'json' };

const at = Date.parse('2026-11-02T13:00:00Z');
const model = 'gemini-3.5-flash-lite'; const fallback = 'gemini-3.6-flash';
async function setup(t) {
  const directory = await mkdtemp(join(tmpdir(), 'finn-model-policy-')); t.after(() => rm(directory, { recursive: true, force: true }));
  const store = createPushStore({ env: {}, path: join(directory, 'state.sqlite') }); await store.initialize();
  await store.mutate(s => { s.quota.initialized = true; s.quota.policy = structuredClone(policy); });
  return { store, directory };
}
test('configured quotas permit more than20 calls while enforcing each model and the unchanged lifetime cap', async t => {
  const { store } = await setup(t);
  assert.equal(validatePolicy(structuredClone(policy)).totalDaily, 1040);
  assert.throws(() => validatePolicy({ ...policy, retryDaily: 1041 }), /exceed/);
  await store.mutate(s => {
    for (let i = 0; i < 25; i++) s.quota.attempts.push({ id: `old-${i}`, workflow: 'research', model, at: at - 120000 - i, estimatedTokens: 100, retry: false, outcome: 'synthetic_prior' });
  });
  await reserveAttempt(store, { workflow: 'research', model, estimatedTokens: 100, now: at });
  await store.mutate(s => {
    s.quota.policy.models[model].appRpd = 26;
    s.research = { notes: {}, requests: { same: { lease: { token: 'owned', until: at + 60000 } } } };
    for (let i = 0; i < 3; i++) s.quota.attempts.push({ id: `same-${i}`, researchKey: 'same', workflow: 'research', model: fallback, at: at - 120000 - i, estimatedTokens: 100, retry: true, outcome: 'synthetic_prior' });
  });
  await assert.rejects(reserveAttempt(store, { workflow: 'research', model, estimatedTokens: 100, now: at }), /Daily/);
  await assert.rejects(reserveAttempt(store, { workflow: 'research', model: fallback, researchKey: 'same', leaseToken: 'owned', estimatedTokens: 100, now: at }), /attempt limit/);
  assert.equal((await store.read()).quota.attempts.length, 29);
});
test('policy updates audit previous limits and release only allocation waits, preserving failures, leases and provider holds', async t => {
  const { store } = await setup(t);
  const error = 'Daily local/model allowance exhausted; pending work is retained.';
  await store.mutate(s => {
    s.quota.policy = { ...policy, totalDaily: 20, allocations: { research: 6, push: 14 }, retryDaily: 4 };
    s.quota.attempts.push({ id: 'historical', model, workflow: 'research', at: at - 1, estimatedTokens: 100, retry: false, outcome: 'http_503' });
    s.quota.projectUntil = at + 600000; s.quota.cooldowns[model] = at + 700000; s.quota.failures[model] = 3;
    s.jobs = { local: { status: 'deferred', error, nextAt: at + 86400000, attempts: 2 }, provider: { status: 'deferred', error: 'Model transient failure; original disclosure retained.', nextAt: at + 600000 }, rejected: { status: 'failed', error, nextAt: at + 86400000 }, leased: { status: 'deferred', error, nextAt: at + 86400000, lease: { until: at + 60000 } } };
    s.research = { notes: {}, requests: { local: { status: 'deferred', error: `Research generation paused: ${error}`, nextAt: at + 86400000 }, rejected: { status: 'rejected', error: 'unsupported', nextAt: 0 } } };
  });
  const before = await store.read(); assert.equal((await applyPolicy(store, structuredClone(policy), at)).released, 2);
  const s = await store.read(); assert.deepEqual(s.quota.attempts, before.quota.attempts); assert.deepEqual(s.quota.cooldowns, before.quota.cooldowns); assert.deepEqual(s.quota.failures, before.quota.failures); assert.equal(s.quota.projectUntil, before.quota.projectUntil);
  assert.equal(s.quota.policyChanges[0].previous.totalDaily, 20); assert.equal(s.jobs.local.nextAt, at); assert.equal(s.jobs.local.attempts, 2);
  for (const key of ['provider', 'rejected', 'leased']) assert.deepEqual(s.jobs[key], before.jobs[key]);
  assert.equal(s.research.requests.local.nextAt, at); assert.deepEqual(s.research.requests.rejected, before.research.requests.rejected);
  assert.equal((await applyPolicy(store, policy, at)).unchanged, true); assert.equal((await store.read()).quota.policyChanges.length, 1);
});
test('Research evaluation isolates one assigned model and cannot select a Push model', () => {
  assert.deepEqual(researchAssignments({}).text, [model, fallback]);
  assert.deepEqual(researchAssignments({ FINN_RESEARCH_EVALUATION_MODEL: fallback }).text, [fallback]);
  assert.throws(() => researchAssignments({ FINN_RESEARCH_EVALUATION_MODEL: 'gemini-3.8-flash' }), /No approved Research/);
});
test('a future model needs only approved configuration, and explicit Research order overrides version heuristics', () => {
  const future = { ...policy, researchOrder: ['gemini-4.0-flash', 'gemini-4.0-flash-lite'], models: { 'gemini-4.0-flash': { workflow: 'research', rpm: 5, tpm: 250000, rpd: 20 }, 'gemini-4.0-flash-lite': { workflow: 'research', rpm: 15, tpm: 250000, rpd: 500 }, 'gemini-4.1-flash': { workflow: 'push', rpm: 5, tpm: 250000, rpd: 20 } } };
  const futureEnv = { FINN_MODEL_POLICY_JSON: JSON.stringify(future) };
  assert.deepEqual(modelInventory('gemini-4.0-flash', futureEnv).text, ['gemini-4.0-flash']);
  assert.deepEqual(researchModelOrder(researchAssignments(futureEnv), 'Compare financial results'), ['gemini-4.0-flash', 'gemini-4.0-flash-lite']);
  assert.equal(modelInventory(model + ',gemini-unknown-version', {}).unverified.includes('gemini-unknown-version'), true);
});
const evidence = { evidenceHash: 'rotation-contract', company: 'Example', question: '', documents: [], evidence: [{ id: 'e1', text: 'The company reported revenue of 100 million for the year.' }] };
const env = { GEMINI_API_KEY: 'synthetic-key', FINN_AI_FREE_TIER_CONFIRMED: 'true', FINN_AI_LIVE_ENABLED: 'true' };
test('Research skips zero-call model holds, charges real fallback attempts and never rotates around a project pause', async t => {
  for (const global of [false, true]) {
    const { store, directory } = await setup(t); const approved = structuredClone(policy); delete approved.models[fallback].evaluationOnly;
    await store.mutate(s => { s.quota.policy = approved; s.quota.cooldowns[model] = at + 600000; if (global) s.quota.projectUntil = at + 600000; });
    const calls = [];
    const provider = createGeminiProvider({ env: { ...env, FINN_MODEL_POLICY_JSON: JSON.stringify(approved) }, sharedStore: store, directory, now: () => at, fetchImpl: async (url, options) => {
      calls.push(url); assert.equal('temperature' in JSON.parse(options.body).generationConfig, false);
      return new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ claims: [{ section: 'financial', text: 'Reported revenue was 100 million for the year.', inference: false, references: [{ quoteId: 'q1' }] }], unavailableSections: [] }) }] } }] }));
    } });
    if (global) { await assert.rejects(provider.generate(evidence), /Project quota/); assert.equal(calls.length, 0); }
    else { assert.equal((await provider.generate(evidence)).model, fallback); assert.equal(calls.length, 1); const attempt = (await store.read()).quota.attempts[0]; assert.equal(attempt.model, fallback); assert.equal(attempt.retry, false); }
  }
});
test('routing changes preserve legacy rejected requests, leases and attempt lifetimes without rewriting reservations', async t => {
  const oldKey = createHash('sha256').update(JSON.stringify({ evidenceHash: evidence.evidenceHash, models: [model], prompt: PROMPT_VERSION })).digest('hex');
  for (const reason of ['rejected', 'leased', 'exhausted']) {
    const { store, directory } = await setup(t); const approved = structuredClone(policy); delete approved.models[fallback].evaluationOnly;
    await store.mutate(s => {
      s.quota.policy = approved;
      s.research = { notes: {}, requests: { [oldKey]: { status: reason === 'rejected' ? 'rejected' : 'deferred', error: reason === 'rejected' ? 'unsupported original claim' : null, lease: reason === 'leased' ? { token: 'old-owner', until: at + 60000 } : null } } };
      if (reason === 'exhausted') for (let i = 0; i < 3; i++) s.quota.attempts.push({ id: `old-request-${i}`, researchKey: oldKey, workflow: 'research', model, at: at - 120000 - i, estimatedTokens: 100, retry: i > 0, outcome: 'http_503' });
    });
    const before = (await store.read()).quota.attempts; let calls = 0;
    const provider = createGeminiProvider({ env: { ...env, FINN_MODEL_POLICY_JSON: JSON.stringify(approved) }, sharedStore: store, directory, now: () => at, fetchImpl: async () => { calls++; throw Error('must not call'); } });
    await assert.rejects(provider.generate(evidence), reason === 'rejected' ? /unsupported original/ : reason === 'leased' ? /already being generated/ : /attempt limit/);
    assert.equal(calls, 0); assert.deepEqual((await store.read()).quota.attempts, before);
    if (reason !== 'leased') assert.equal((await provider.status(evidence)).paused, true);
  }
});
