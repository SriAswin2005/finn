import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPushStore } from '../src/push/store.js';
import { createGeminiProvider } from '../src/ai/gemini.js';
import policy from '../src/config/model-policy.json' with { type: 'json' };
import { buildQuoteBank } from '../src/ai/quotes.js';
import { validateAnalysis } from '../src/ai/gemini.js';
import { reserveAttempt } from '../src/push/quota.js';
import { chunkPages } from '../src/research/evidence.js';
import { citationNumberText } from '../src/ai/numbers.js';

const env = { FINN_GEMINI_MODELS: 'gemini-3.5-flash-lite', VERCEL: '1', FINN_AI_LIVE_ENABLED: 'true', FINN_AI_FREE_TIER_CONFIRMED: 'true', GEMINI_API_KEY: 'synthetic-server-only-key' };
const research = { evidenceHash: 'hosted-contract', question: '', company: 'Example', documents: [], evidence: [{ id: 'e1', documentId: 'd1', page: 2, text: 'The company reported revenue of 100 million for the year.' }] };
const wire = { claims: [{ section: 'financial', text: 'Reported revenue was 100 million for the year.', inference: false, references: [{ quoteId: 'q1' }] }], unavailableSections: [] };
const response = () => new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(wire) }] } }] }));

test('clipped retrieval fragments and uncited inference drivers are refused', () => {
  const evidence = [{ id: 'e1', text: 'Enterprise AI adoption transitioned from experimentation to sca' }];
  assert.deepEqual(buildQuoteBank(evidence), []);
  evidence[0].text = 'Enterprise AI adoption transitioned from experimentation to scale.';
  assert.equal(buildQuoteBank(evidence).length, 1);
  const note = { claims: [{ section: 'bull', text: 'AI adoption may keep demand for automation robust.', inference: true, references: [{ evidenceId: 'e1', quote: evidence[0].text }] }], unavailableSections: [] };
  assert.throws(() => validateAnalysis(note, evidence), /uncited business driver/);
  assert.deepEqual(buildQuoteBank([{ id: 'partial', text: 'es, cognitive business operations, cyber security, and products and platforms.' }]), []);
  const lead = 'A'.repeat(1049) + ' Capitalised fragment is still inside the preceding sentence. The next complete sentence is available for exact citation. ' + 'X'.repeat(160);
  const chunks = chunkPages([{ id: 'd', kind: 'annual_report', pages: [{ page: 1, text: lead }] }]);
  assert.equal(chunks[1].leadingFragment, true);
  const bank = buildQuoteBank([chunks[1]]); assert.equal(bank.length, 1); assert.equal(bank[0].quote, 'The next complete sentence is available for exact citation.');
  const qualified = 'Appointment of Mr. Rohit Jawa as an independent director w.e.f. January 1, 2027, subject to shareholder approval.';
  assert.deepEqual(buildQuoteBank([{ id: 'whole', text: qualified }], { maxLength: 1000, joinAbbreviations: true }).map(q => q.quote), [qualified]);
});
test('font-split dated years compare without merging financial cells or changing quoted evidence', () => {
  const text = 'The company approved the scheme on 2nd November, 202 6.';
  const evidence = [{ id: 'date', text }];
  const note = { claims: [{ section: 'business', text: 'The company approved the scheme on 2nd November, 2026.', inference: false, references: [{ evidenceId: 'date', quote: text }] }], unavailableSections: [] };
  assert.equal(validateAnalysis(note, evidence).claims[0].references[0].quote, text);
  assert.throws(() => validateAnalysis({ ...note, claims: [{ ...note.claims[0], text: note.claims[0].text.replace('2026', '2027') }] }, evidence), /number absent/);
  const malformed = 'Revenue for November was 202 6 million.';
  assert.equal(citationNumberText(malformed), malformed);
  assert.throws(() => validateAnalysis({ claims: [{ section: 'financial', text: 'Revenue was 2026 million.', inference: false, references: [{ evidenceId: 'amount', quote: malformed }] }], unavailableSections: [] }, [{ id: 'amount', text: malformed }]), /number absent/);
  assert.equal(citationNumberText('The date was 2 Nov, 20 26.'), 'The date was 2 Nov, 2026.');
  const split = [{ id: 'd1', text: 'The company approved the scheme on 2nd November.' }, { id: 'd2', text: '202 6 million was reported as revenue.' }];
  assert.throws(() => validateAnalysis({ claims: [{ ...note.claims[0], references: split.map(s => ({ evidenceId: s.id, quote: s.text })) }], unavailableSections: [] }, split), /number absent/);
});
test('no new shares cannot become an unsupported assertion of zero cash consideration', () => {
  const text = 'The company will not be required to issue any fresh shares for the merger.';
  const note = { claims: [{ section: 'business', text: 'The company may not need fresh shares and could complete the merger without external cash outflow.', inference: true, references: [{ evidenceId: 'merger', quote: text }] }], unavailableSections: [] };
  assert.throws(() => validateAnalysis(note, [{ id: 'merger', text }]), /absence of cash consideration/);
  const explicit = 'No cash consideration is payable for the merger.';
  assert.doesNotThrow(() => validateAnalysis({ claims: [{ ...note.claims[0], text: 'No cash outflow is required for the merger.', inference: false, references: [{ evidenceId: 'merger', quote: explicit }] }], unavailableSections: [] }, [{ id: 'merger', text: explicit }]));
});

test('hosted Pull uses durable leases, one shared reservation and saved notes across cold instances', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'finn-research-hosted-')); t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, 'shared.sqlite'); const store = createPushStore({ env: {}, path }); await store.initialize();
  await store.mutate(s => { s.quota.initialized = true; s.quota.policy = policy; });
  let calls = 0; let release; let entered;
  const barrier = new Promise(resolve => { entered = resolve; });
  const wait = new Promise(resolve => { release = resolve; });
  const options = { env, directory: join(directory, 'missing-cache'), sharedStore: store, fetchImpl: async () => { calls++; entered(); await wait; return response(); } };
  const first = createGeminiProvider(options).generate(research); await barrier;
  await assert.rejects(createGeminiProvider({ ...options, sharedStore: createPushStore({ env: {}, path }) }).generate(research), /already being generated/);
  release(); const note = await first; assert.equal(note.cached, false);
  const restarted = createGeminiProvider({ ...options, directory: join(directory, 'different-empty-cache'), env: { ...env, GEMINI_API_KEY: '' }, sharedStore: createPushStore({ env: {}, path }) });
  const saved = await restarted.generate(research); assert.equal(saved.cached, true); assert.deepEqual(saved.claims, note.claims);
  assert.equal(calls, 1); assert.equal((await store.read()).quota.attempts.length, 1);
  assert.equal(createGeminiProvider({ ...options, env: { ...env, FINN_AI_LIVE_ENABLED: 'false' } }).enabled, false);
  assert.equal(createGeminiProvider({ ...options, env: { ...env, FINN_AI_CACHE_ONLY: 'true' } }).enabled, false);
});

test('rejected Pull output stays unpublished and cannot regenerate on repeated requests', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'finn-research-rejected-')); t.after(() => rm(directory, { recursive: true, force: true }));
  const store = createPushStore({ env: {}, path: join(directory, 'shared.sqlite') }); await store.initialize();
  await store.mutate(s => { s.quota.initialized = true; s.quota.policy = policy; });
  let calls = 0;
  const options = { env, directory, sharedStore: store, fetchImpl: async () => { calls++; return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ ...wire, claims: [{ ...wire.claims[0], text: 'Revenue was 999 million.' }] }) }] } }] })); } };
  await assert.rejects(createGeminiProvider(options).generate(research), /number absent/);
  await assert.rejects(createGeminiProvider(options).generate(research), /number absent/);
  assert.equal(await createGeminiProvider(options).getCached(research), null); assert.equal(calls, 1);
  const state = await store.read();
  assert.equal(state.quota.attempts[0].outcome, 'invalid_or_unsupported_output');
  const draft = Object.values(state.research.requests)[0].rejectedDrafts[0];
  assert.match(draft.output, /999 million/); assert.match(draft.error, /number absent/); assert.equal(draft.attemptId, state.quota.attempts[0].id);
});
test('transient Pull failures use bounded backoff while preserving explicit provider retry guidance', async t => {
  for (const seconds of [null, '600']) {
    const directory = await mkdtemp(join(tmpdir(), 'finn-research-backoff-')); t.after(() => rm(directory, { recursive: true, force: true }));
    const store = createPushStore({ env: {}, path: join(directory, 'shared.sqlite') }); await store.initialize();
    await store.mutate(s => { s.quota.initialized = true; s.quota.policy = policy; });
    const at = Date.now();
    const provider = createGeminiProvider({ env, directory, sharedStore: store, now: () => at, fetchImpl: async () => new Response('{}', { status: 503, headers: seconds ? { 'retry-after': seconds } : {} }) });
    await assert.rejects(provider.generate(research), /could complete/);
    const q = (await store.read()).quota; const until = q.cooldowns[q.attempts[0].model];
    if (seconds) assert.equal(until, at + 600000);
    else assert.ok(until > at && until <= at + 90000);
    assert.equal(q.attempts.length, 1);
  }
});
test('source-only reads expose a temporary model pause without claiming jobs or consuming quota', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'finn-research-status-')); t.after(() => rm(directory, { recursive: true, force: true }));
  const store = createPushStore({ env: {}, path: join(directory, 'shared.sqlite') }); await store.initialize();
  const at = Date.now(); const model = Object.entries(policy.models).find(([, c]) => c.workflow === 'research')[0];
  await store.mutate(s => { s.quota.initialized = true; s.quota.policy = policy; s.quota.cooldowns[model] = at + 600000; });
  const provider = createGeminiProvider({ env, directory, sharedStore: store, now: () => at });
  const status = await provider.status(research); assert.equal(status.paused, true); assert.equal(status.pausedUntil, new Date(at + 600000).toISOString());
  const s = await store.read(); assert.equal(s.quota.attempts.length, 0); assert.equal(s.research, undefined);
});
test('retry readiness waits for both the model pause and the shared allowance, matching reservation enforcement', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'finn-research-allowance-')); t.after(() => rm(directory, { recursive: true, force: true }));
  const store = createPushStore({ env: {}, path: join(directory, 'shared.sqlite') }); await store.initialize();
  await store.mutate(s => { s.quota.initialized = true; s.quota.policy = { ...policy, retryDaily: 4 }; });
  let clock = Date.now(); const started = clock;
  const provider = createGeminiProvider({ env, directory, sharedStore: store, now: () => clock, fetchImpl: async () => { throw new Error('synthetic transport failure'); } });
  await assert.rejects(provider.generate(research));
  const first = (await store.read()).quota.attempts[0];
  await store.mutate(s => {
    for (let i = 0; i < 4; i++) s.quota.attempts.push({ id: `retry-${i}`, workflow: 'push', model: Object.entries(policy.models).find(([, c]) => c.workflow === 'push')[0], at: started - 60000 - i, estimatedTokens: 100, retry: true, outcome: 'synthetic_failure' });
  });
  clock += 120000;
  const status = await provider.status(research); assert.equal(status.paused, true); assert.match(status.reason, /allowance/);
  await store.mutate(s => { s.research.requests[first.researchKey].lease = { token: 'readiness-control', until: clock + 60000 }; });
  await assert.rejects(reserveAttempt(store, { workflow: 'research', model: first.model, researchKey: first.researchKey, leaseToken: 'readiness-control', estimatedTokens: 100, now: clock }), error => { assert.equal(error.until, Date.parse(status.pausedUntil)); return true; });
  assert.equal((await store.read()).quota.attempts.length, 5);
});
test('only explicitly source-reviewed answers survive a prompt-key migration and still revalidate exact evidence', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'finn-reviewed-cache-')); t.after(() => rm(directory, { recursive: true, force: true }));
  const store = createPushStore({ env: {}, path: join(directory, 'shared.sqlite') }); await store.initialize();
  await store.mutate(s => { s.quota.initialized = true; s.quota.policy = policy; });
  const provider = createGeminiProvider({ env, directory, sharedStore: store, fetchImpl: async () => response() });
  const note = await provider.generate(research);
  await store.mutate(s => { s.research.notes = { 'previous-prompt-key': { ...note } }; });
  assert.equal(await provider.getCached(research), null);
  await store.mutate(s => { s.research.notes['previous-prompt-key'].review = { kind: 'source_reviewed' }; });
  assert.equal((await provider.getCached(research)).cached, true);
  assert.equal(await provider.getCached({ ...research, evidence: [{ ...research.evidence[0], text: 'Different evidence without the quoted financial statement.' }] }), null);
  assert.equal((await store.read()).quota.attempts.length, 1);
});
