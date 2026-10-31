import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalizeTicker, discoverDocuments, directDocumentUrl } from '../src/research/discovery.js';
import { isPublicAddress, publicUrl, downloadPublic } from '../src/research/download.js';
import { buildEvidence } from '../src/research/evidence.js';
import { getResearch, parseDocument, ResearchUnavailable } from '../src/research/service.js';
import { createGeminiProvider, validateAnalysis, selectEligibleModel, retryDeadline, AiUnavailable } from '../src/ai/gemini.js';
import { mergeGeminiEnvironment } from '../src/config/ai-env.js';
import { modelInventory, researchModelOrder } from '../src/ai/models.js';
import { buildQuoteBank, resolveQuoteReferences } from '../src/ai/quotes.js';

async function fundedTestDirectory(prefix) {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  await writeFile(join(directory, 'quota.json'), JSON.stringify({ entries: [], cooldowns: {} }));
  return directory;
}

test('discovery accepts arbitrary NSE symbols but only report/transcript evidence links', () => {
  assert.equal(normalizeTicker(' m&m.ns '), 'M&M');
  for (const symbol of ['', '../INFY', 'INFY/..', 'ABC.BO', 'x y']) assert.throws(() => normalizeTicker(symbol), RangeError);
  const html = '<h1>Example Ltd</h1><h3>Annual reports</h3><a href="https://www.bseindia.com/report.pdf">Annual Report 2026</a><button>AI summary</button><h3>Concalls</h3><li><div>Oct 2026</div><a href="https://example.com/transcript.pdf" title="Raw Transcript">Transcript</a><a href="https://example.com/slides.pdf">PPT</a></li>';
  const result = discoverDocuments(html, 'EXAMPLE');
  assert.equal(result.documents.length, 2); assert.equal(result.company, 'Example Ltd');
  assert.equal(result.documents[1].title, 'Earnings call · Oct 2026');
  assert.equal(directDocumentUrl('https://www.bseindia.com/stockinfo/AnnPdfOpen.aspx?Pname=95f8af86-dc92-49dc-a7cf-ecce287f8cce.pdf'), 'https://www.bseindia.com/xml-data/corpfiling/AttachHis/95f8af86-dc92-49dc-a7cf-ecce287f8cce.pdf');
});

test('document fetching rejects private hosts, unsafe redirects, and oversized bodies', async () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.1.2', '169.254.169.254', '192.168.1.1', '::1', '::ffff:127.0.0.1', 'fc00::1']) assert.equal(isPublicAddress(ip), false);
  assert.equal(isPublicAddress('8.8.8.8'), true);
  const publicDns = async () => [{ address: '8.8.8.8' }];
  const privateDns = async () => [{ address: '127.0.0.1' }];
  await assert.rejects(publicUrl('https://public.test/document.pdf', privateDns), /not a public/);
  for (const url of ['http://public.test/a', 'https://user:pass@public.test/a', 'https://127.0.0.1/a', 'https://public.test:5000/a']) await assert.rejects(publicUrl(url, publicDns));
  await assert.rejects(downloadPublic('https://public.test/a', { resolveHost: publicDns, fetchImpl: async () => new Response('', { status: 302, headers: { location: 'http://127.0.0.1/private' } }) }), /public HTTPS/);
  await assert.rejects(downloadPublic('https://public.test/a', { resolveHost: publicDns, maxBytes: 4, fetchImpl: async () => new Response('12345') }), /size limit/);
});

test('research examples contain primary documents and reproducible physical page references', async () => {
  for (const ticker of ['INFY', 'ASIANPAINT', 'PERSISTENT']) {
    const result = await getResearch(ticker);
    assert.ok(result.documents.some(doc => doc.kind === 'annual_report'));
    assert.ok(result.documents.some(doc => doc.kind === 'transcript'));
    assert.ok(result.evidence.length > 0);
    for (const evidence of result.evidence) {
      const doc = result.documents.find(doc => doc.id === evidence.documentId);
      assert.ok(doc); assert.ok(evidence.page >= 1 && evidence.page <= doc.pageCount); assert.ok(doc.url.startsWith('https://'));
    }
    const repeated = await getResearch(ticker); assert.equal(repeated.evidenceHash, result.evidenceHash);
  }
});

test('unsupported research returns an explicit failure and no fabricated company answer', async () => {
  await assert.rejects(getResearch('ZZUNSUPPORTED', '', { collect: async () => { throw new ResearchUnavailable('No primary documents.'); } }), /No primary documents/);
  await assert.rejects(getResearch('INFY', 'x'.repeat(401)), RangeError);
  const result = await getResearch('INFY', 'zzzznonexistentword');
  assert.equal(result.sections[0].evidenceIds.length, 0);
});

test('evidence selection does not manufacture financial rows or conclusions', () => {
  const result = buildEvidence([{ id: 'd', sha256: 'hash', kind: 'annual_report', pages: [{ page: 9, text: 'A short note with no relevant financial data.' }] }]);
  assert.equal(result.evidence.length, 0);
  assert.ok(result.sections.every(section => section.evidenceIds.length === 0));
});

test('guidance compares source coverage across calls; financial evidence includes a call and annual context', () => {
  const guidance = 'Our revenue growth guidance for the financial year is 2% to 4%. Our margin guidance remains 20% to 22%. We expect demand growth and maintain our outlook. ';
  const documents = [
    { id: 'annual', sha256: 'a', kind: 'annual_report', pages: [{ page: 2, text: 'Annual revenue was 100 million. Profit, margin, cash flow and growth are discussed here. '.repeat(5) }] },
    { id: 'latest', sha256: 'b', kind: 'transcript', pages: [{ page: 3, text: guidance.repeat(5) }, { page: 4, text: guidance.repeat(5) }] },
    { id: 'earlier', sha256: 'c', kind: 'transcript', pages: [{ page: 6, text: guidance + 'Our revenue and profit growth for the period was reported at 3%. '.repeat(4) }] },
  ];
  const result = buildEvidence(documents);
  const ids = section => result.sections.find(item => item.id === section).evidenceIds.map(id => result.evidence.find(item => item.id === id).documentId);
  assert.deepEqual(ids('guidance'), ['latest', 'earlier']);
  assert.deepEqual(ids('financial'), ['latest', 'annual']);
});

test('captured guidance includes both available transcripts for each research example', async () => {
  for (const ticker of ['INFY', 'ASIANPAINT', 'PERSISTENT']) {
    const result = await getResearch(ticker);
    const guidance = result.sections.find(section => section.id === 'guidance');
    const documentIds = new Set(guidance.evidenceIds.map(id => result.evidence.find(item => item.id === id).documentId));
    assert.equal(documentIds.size, 2);
  }
});

test('explicit forward ranges outrank a passing mention of old guidance', () => {
  const actual = 'Revenue growth and operating margin improved versus earlier guidance. Expectations, outlook and fiscal targets are discussed. '.repeat(4);
  const forward = 'Our revenue growth guidance for the financial year is 2% to 4%. Our operating margin guidance remains 20% to 22%. '.repeat(2);
  const result = buildEvidence([{ id: 'call', sha256: 'x', kind: 'transcript', pages: [{ page: 1, text: actual }, { page: 2, text: forward }] }]);
  const guidance = result.sections.find(section => section.id === 'guidance');
  assert.equal(result.evidence.find(evidence => evidence.id === guidance.evidenceIds[0]).page, 2);
});

test('local AI configuration requires explicit free confirmation and preserves unrelated settings', () => {
  const dummy = 'test_dummy_key_1234567890';
  const existing = 'PORT=3001\nGEMINI_API_KEY=old_dummy_key\nFINN_AI_TOTAL_DAILY_LIMIT=8\n';
  const options = { key: dummy, confirmed: true, models: 'gemini-3.5-flash-lite,gemini-3.5-flash-lite' };
  const merged = mergeGeminiEnvironment(existing, options);
  assert.match(merged, /PORT=3001/); assert.match(merged, /FINN_AI_TOTAL_DAILY_LIMIT=8/);
  assert.equal(merged.match(/GEMINI_API_KEY=/g).length, 1);
  assert.match(merged, /FINN_AI_FREE_TIER_CONFIRMED=true/);
  assert.match(merged, /FINN_GEMINI_MODELS=gemini-3.5-flash-lite\n/);
  assert.throws(() => mergeGeminiEnvironment(existing, { ...options, confirmed: false }), /billing-disabled/);
  assert.throws(() => mergeGeminiEnvironment(existing, { ...options, key: 'bad\nPORT=9' }), /key format/);
  assert.throws(() => mergeGeminiEnvironment(existing, { ...options, models: 'gemini-unverified-model' }), /supported model/);
});

const userModels = 'gemini-3.8-flash,gemini-3.6-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemma-4-31b-it,gemma-4-26b-a4b-it,gemini-embedding-001,gemini-embedding-2,gemini-2.5-flash-native-audio-preview-12-2025,gemini-3.1-flash-live-preview,gemini-3.5-live-translate-preview,gemini-3.5-transcribe-live,gemini-3.8-live,gemini-3.8-live-extended-thinking';
test('setup preserves the full user inventory and excludes specialists and unverified models from research', () => {
  const inventory = modelInventory(userModels + ',gemini-future-model');
  assert.equal(inventory.all.length, 15); assert.equal(inventory.text.length, 6);
  assert.equal(inventory.specialist.length, 8); assert.deepEqual(inventory.unverified, ['gemini-future-model']);
  const content = mergeGeminiEnvironment('', { key: 'dummy_key_123456789012345', confirmed: true, models: userModels });
  assert.ok(content.includes(`FINN_GEMINI_MODELS=${userModels}\n`));
  assert.equal(researchModelOrder(inventory, 'Describe its business and products')[0], 'gemma-4-26b-a4b-it');
  assert.equal(researchModelOrder(inventory, 'Compare financial guidance delivery')[0], 'gemini-3.5-flash-lite');
  assert.equal(researchModelOrder(inventory, '').length, 6);
  for (const invalid of ['gemini-3.8-flash\nPORT=9', '../gemini-model', 'gemini-embedding-001', Array.from({ length: 41 }, (_, i) => `gemini-model-${i}`).join(',')]) assert.throws(() => modelInventory(invalid));
});

function simplePdf() {
  const stream = 'BT /F1 12 Tf 30 700 Td (' + 'Our business provides services and products to customers. '.repeat(5) + ') Tj ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let text = '%PDF-1.4\n'; const offsets = [0];
  for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(text)); text += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = Buffer.byteLength(text); text += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => String(offset).padStart(10, '0') + ' 00000 n ').join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(text);
}
test('real Python PDF parser preserves page numbers and rejects non-PDF input', async () => {
  const parsed = await parseDocument(simplePdf(), { kind: 'annual_report', title: 'Owned test document' });
  assert.equal(parsed.pages[0].page, 1); assert.match(parsed.pages[0].text, /Our business provides/);
  await assert.rejects(parseDocument(Buffer.from('<html>blocked</html>'), {}), /not return a PDF/);
});

const evidence = [{ id: 'e1', documentId: 'd', page: 3, text: 'The company reported revenue of 100 million for the year. Management noted demand uncertainty.' }];
const validAnalysis = () => ({ claims: [{ section: 'financial', text: 'Reported revenue was 100 million for the year.', inference: false, references: [{ evidenceId: 'e1', quote: 'reported revenue of 100 million for the year' }] }], unavailableSections: ['guidance'] });
const wireAnalysis = () => { const value = validAnalysis(); value.claims[0].references = [{ quoteId: 'q1' }]; return value; };
test('AI validation rejects invented citations, quotes and numbers', () => {
  const validated = validateAnalysis(validAnalysis(), evidence);
  assert.equal(validated.claims.length, 1);
  assert.deepEqual(validated.unavailableSections, ['business', 'guidance', 'bull', 'bear']);
  const wrongLabel = validAnalysis(); wrongLabel.claims[0].section = 'bull'; assert.throws(() => validateAnalysis(wrongLabel, evidence), /interpretations/);
  const badId = validAnalysis(); badId.claims[0].references[0].evidenceId = 'invented'; assert.throws(() => validateAnalysis(badId, evidence), /citation validation/);
  const badQuote = validAnalysis(); badQuote.claims[0].references[0].quote = 'This exact quote does not exist anywhere.'; assert.throws(() => validateAnalysis(badQuote, evidence), /citation validation/);
  const badNumber = validAnalysis(); badNumber.claims[0].text = 'Revenue was 999 million.'; assert.throws(() => validateAnalysis(badNumber, evidence), /number absent/);
});

test('Q-001 regression: citation that shares a number but omits the claimed metric is rejected', () => {
  // Minimal reproduction from ISSUES.md: claim asserts "8-10% volume growth for FY27"
  // but its only attached quote says the range for FY27 without mentioning "volume".
  // Numeric membership passes (8, 10 present in quote); metric context must now fail.
  const q001Evidence = [{ id: 'eq1', documentId: 'dq', page: 4, text: 'At the current stage, we are looking at the band of 8-10% for the full FY27. This is based on channel checks.' }];
  const missingMetric = {
    claims: [{ section: 'guidance', text: 'Management guided 8-10% volume growth for FY27.', inference: false,
      references: [{ evidenceId: 'eq1', quote: 'we are looking at the band of 8-10% for the full FY27' }] }],
    unavailableSections: [],
  };
  assert.throws(() => validateAnalysis(missingMetric, q001Evidence), /metric context/, 'claim with volume absent from quote must be rejected');
  // A well-cited claim that includes the metric term in its quote must still pass.
  const correctCitation = {
    claims: [{ section: 'guidance', text: 'Management guided 8-10% volume growth for FY27.', inference: false,
      references: [{ evidenceId: 'eq1', quote: 'we are looking at the band of 8-10% for the full FY27. This is based on channel checks.' }] }],
    unavailableSections: [],
  };
  // Extend evidence text so the full quote is a valid substring
  const extEvidence = [{ id: 'eq1', documentId: 'dq', page: 4, text: 'At the current stage, we are looking at the band of 8-10% for the full FY27. This is based on channel checks. Volume growth assumptions are on track.' }];
  const validVolumeCitation = {
    claims: [{ section: 'guidance', text: 'Management guided 8-10% volume growth for FY27.', inference: false,
      references: [{ evidenceId: 'eq1', quote: 'we are looking at the band of 8-10% for the full FY27. This is based on channel checks. Volume growth assumptions' }] }],
    unavailableSections: [],
  };
  assert.doesNotThrow(() => validateAnalysis(validVolumeCitation, extEvidence), 'quote containing the metric term must pass');
});

test('Gemini uses cached results, bounded model fallback and durable local quota', async t => {
  const directory = await fundedTestDirectory('finn-ai-'); t.after(() => rm(directory, { recursive: true, force: true }));
  let calls = 0;
  const env = { GEMINI_API_KEY: 'test-only-not-a-real-key', FINN_AI_FREE_TIER_CONFIRMED: 'true', FINN_GEMINI_MODELS: 'gemini-3.5-flash-lite,gemini-3.1-flash-lite' };
  const provider = createGeminiProvider({ env, directory, fetchImpl: async () => {
    calls++;
    if (calls === 1) return new Response(JSON.stringify({ error: { details: [{ quotaId: 'RequestsPerDayPerProjectPerModel-FreeTier' }] } }), { status: 429, headers: { 'retry-after': '3600' } });
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(wireAnalysis()) }] } }] }));
  } });
  const research = { evidenceHash: 'abc', evidence, documents: [], company: 'Owned test company', question: '' };
  const first = await provider.generate(research); assert.equal(first.model, 'gemini-3.1-flash-lite'); assert.equal(calls, 2);
  const cached = await provider.generate(research); assert.equal(cached.cached, true); assert.equal(calls, 2);
  assert.equal((await createGeminiProvider({ env: { ...env, GEMINI_API_KEY: '' }, directory }).generate(research)).cached, true);
  assert.equal(selectEligibleModel(['m'], { entries: [{ model: 'm', at: 1000 }], cooldowns: {} }, 1100, { total: 20, daily: 20, hourly: 5 }), undefined);
});

test('Gemini does not rotate around ambiguous project quotas or bad credentials', async t => {
  for (const status of [403, 429]) {
    const directory = await fundedTestDirectory('finn-ai-stop-'); t.after(() => rm(directory, { recursive: true, force: true }));
    let calls = 0;
    const provider = createGeminiProvider({ directory, env: { GEMINI_API_KEY: 'test', FINN_AI_FREE_TIER_CONFIRMED: 'true' }, fetchImpl: async () => { calls++; return new Response('{}', { status }); } });
    await assert.rejects(provider.generate({ evidenceHash: `stop-${status}`, evidence, documents: [], company: 'Test', question: '' }), AiUnavailable);
    assert.equal(calls, 1);
    if (status === 429) {
      await assert.rejects(provider.generate({ evidenceHash: 'different-company', evidence, documents: [], company: 'Other', question: '' }), /cooling down/);
      assert.equal(calls, 1);
      const restarted = createGeminiProvider({ directory, env: { GEMINI_API_KEY: 'test', FINN_AI_FREE_TIER_CONFIRMED: 'true' }, fetchImpl: async () => { calls++; return new Response('{}'); } });
      await assert.rejects(restarted.generate({ evidenceHash: 'after-restart', evidence, documents: [], company: 'Other', question: '' }), /cooling down/);
      assert.equal(calls, 1);
    }
  }
});

test('invalid API keys give actionable setup guidance without leaking provider text or rotating', async t => {
  const directory = await fundedTestDirectory('finn-invalid-key-'); t.after(() => rm(directory, { recursive: true, force: true }));
  let calls = 0;
  const secret = 'test-only-secret-not-for-display';
  const provider = createGeminiProvider({ directory, env: { GEMINI_API_KEY: secret, FINN_AI_FREE_TIER_CONFIRMED: 'true', FINN_GEMINI_MODELS: userModels }, fetchImpl: async () => {
    calls++;
    return new Response(JSON.stringify({ error: { message: `Provider text containing ${secret}`, details: [{ reason: 'API_KEY_INVALID' }] } }), { status: 400 });
  } });
  await assert.rejects(provider.generate({ evidenceHash: 'invalid-key', evidence, documents: [], company: 'Test', question: '' }), error => {
    assert.match(error.message, /key as invalid/); assert.match(error.message, /npm run configure:ai/);
    assert.ok(!error.message.includes(secret)); return true;
  });
  assert.equal(calls, 1);
});

test('Gemma uses prompt JSON, filters thinking, and falls back to Flash-Lite after transport failure', async t => {
  const directory = await fundedTestDirectory('finn-gemma-'); t.after(() => rm(directory, { recursive: true, force: true }));
  const calls = [];
  const provider = createGeminiProvider({ directory, env: { GEMINI_API_KEY: 'test', FINN_AI_FREE_TIER_CONFIRMED: 'true', FINN_GEMINI_MODELS: userModels }, fetchImpl: async (url, options) => {
    calls.push(url);
    const request = JSON.parse(options.body);
    assert.equal(request.generationConfig.thinkingConfig.thinkingLevel, 'minimal');
    if (calls.length === 1) {
      assert.equal(request.generationConfig.responseJsonSchema, undefined);
      assert.match(request.contents[0].parts[0].text, /Return ONLY JSON/);
    }
    assert.ok(options.signal instanceof AbortSignal);
    if (calls.length === 1) throw new DOMException('Busy connection', 'TimeoutError');
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ thought: true, text: 'private reasoning' }, { text: JSON.stringify(wireAnalysis()) }] } }] }));
  } });
  const result = await provider.generate({ evidenceHash: 'gemma', evidence, documents: [], company: 'Test', question: 'Describe the business' });
  assert.equal(result.model, 'gemini-3.5-flash-lite'); assert.equal(calls.length, 2);
  assert.match(calls[0], /gemma-4-26b-a4b-it:generateContent$/);
});

test('large inventory never expands three-attempt bound and invalid evidence is not retried', async t => {
  for (const invalidOutput of [false, true]) {
    const directory = await fundedTestDirectory('finn-attempts-'); t.after(() => rm(directory, { recursive: true, force: true }));
    let calls = 0;
    const provider = createGeminiProvider({ directory, env: { GEMINI_API_KEY: 'test', FINN_AI_FREE_TIER_CONFIRMED: 'true', FINN_GEMINI_MODELS: userModels }, fetchImpl: async () => {
      calls++;
      if (!invalidOutput) return new Response('{}', { status: 503 });
      const bad = wireAnalysis(); bad.claims[0].text = 'Revenue was 999 million.';
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(bad) }] } }] }));
    } });
    await assert.rejects(provider.generate({ evidenceHash: 'bounded', evidence, documents: [], company: 'Test', question: '' }), AiUnavailable);
    assert.equal(calls, invalidOutput ? 1 : 3);
  }
});

test('Gemini cooldown honors HTTP dates, long delays and structured retry guidance', () => {
  const now = Date.parse('2026-10-28T00:00:00Z');
  assert.equal(retryDeadline('30', {}, now), now + 60000);
  assert.equal(retryDeadline('172800', {}, now), now + 172800000);
  assert.equal(retryDeadline('Thu, 29 Oct 2026 00:00:00 GMT', {}, now), now + 86400000);
  assert.equal(retryDeadline('60', { error: { details: [{ retryDelay: '120.5s' }] } }, now), now + 120500);
});

test('Flash uses its supported thinking level and rejects truncated notes even with valid JSON', async t => {
  for (const model of ['gemini-3.8-flash', 'gemini-3.6-flash']) {
    const directory = await fundedTestDirectory('finn-thinking-'); t.after(() => rm(directory, { recursive: true, force: true }));
    let calls = 0;
    const provider = createGeminiProvider({ directory, env: { GEMINI_API_KEY: 'test', FINN_AI_FREE_TIER_CONFIRMED: 'true', FINN_GEMINI_MODELS: model }, fetchImpl: async (_url, options) => {
      calls++; const config = JSON.parse(options.body).generationConfig;
      assert.equal(config.thinkingConfig.thinkingLevel, model === 'gemini-3.8-flash' ? 'low' : 'minimal');
      assert.equal(config.maxOutputTokens, 3200);
      return new Response(JSON.stringify({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: JSON.stringify(validAnalysis()) }] } }] }));
    } });
    await assert.rejects(provider.generate({ evidenceHash: model, evidence, documents: [], company: 'Test', question: '' }), /No partial analysis/);
    assert.equal(calls, 1);
  }
});

test('quote bank preserves exact bounded source text and rejects invented IDs', () => {
  const source = [{ id: 'd-p3', text: 'Revenue was 100 million in the reporting period. ' + 'Detailed source context and conditions apply here. '.repeat(12) }];
  const quotes = buildQuoteBank(source);
  assert.ok(quotes.length > 2);
  for (const quote of quotes) { assert.ok(source[0].text.includes(quote.quote)); assert.ok(quote.quote.length >= 20 && quote.quote.length <= 220); }
  const wire = { claims: [{ references: [{ quoteId: quotes[0].id }] }] };
  assert.equal(resolveQuoteReferences(wire, quotes).claims[0].references[0].quote, quotes[0].quote);
  assert.throws(() => resolveQuoteReferences({ claims: [{ references: [{ quoteId: 'made-up' }] }] }, quotes), /Unknown source quote/);
  const long = buildQuoteBank([{ id: 'long', text: 'word '.repeat(140) }]);
  assert.ok(long.length >= 3); assert.ok(long.every(q => q.quote.length <= 220));
});
