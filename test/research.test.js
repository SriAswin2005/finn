import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalizeTicker, discoverDocuments, directDocumentUrl } from '../src/research/discovery.js';
import { isPublicAddress, publicUrl, downloadPublic } from '../src/research/download.js';
import { buildEvidence } from '../src/research/evidence.js';
import { getResearch, parseDocument, ResearchUnavailable } from '../src/research/service.js';
import { createGeminiProvider, validateAnalysis, selectEligibleModel, AiUnavailable } from '../src/ai/gemini.js';

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
test('AI validation rejects invented citations, quotes and numbers', () => {
  assert.equal(validateAnalysis(validAnalysis(), evidence).claims.length, 1);
  const badId = validAnalysis(); badId.claims[0].references[0].evidenceId = 'invented'; assert.throws(() => validateAnalysis(badId, evidence), /citation validation/);
  const badQuote = validAnalysis(); badQuote.claims[0].references[0].quote = 'This exact quote does not exist anywhere.'; assert.throws(() => validateAnalysis(badQuote, evidence), /citation validation/);
  const badNumber = validAnalysis(); badNumber.claims[0].text = 'Revenue was 999 million.'; assert.throws(() => validateAnalysis(badNumber, evidence), /number absent/);
});

test('Gemini uses cached results, bounded model fallback and durable local quota', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'finn-ai-')); t.after(() => rm(directory, { recursive: true, force: true }));
  let calls = 0;
  const env = { GEMINI_API_KEY: 'test-only-not-a-real-key', FINN_AI_FREE_TIER_CONFIRMED: 'true', FINN_GEMINI_MODELS: 'gemini-3.5-flash-lite,gemini-3.1-flash-lite' };
  const provider = createGeminiProvider({ env, directory, fetchImpl: async () => {
    calls++;
    if (calls === 1) return new Response(JSON.stringify({ error: { details: [{ quotaId: 'RequestsPerDayPerProjectPerModel-FreeTier' }] } }), { status: 429, headers: { 'retry-after': '3600' } });
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(validAnalysis()) }] } }] }));
  } });
  const research = { evidenceHash: 'abc', evidence, documents: [], company: 'Owned test company', question: '' };
  const first = await provider.generate(research); assert.equal(first.model, 'gemini-3.1-flash-lite'); assert.equal(calls, 2);
  const cached = await provider.generate(research); assert.equal(cached.cached, true); assert.equal(calls, 2);
  await assert.rejects(createGeminiProvider({ env: {}, directory }).generate(research), AiUnavailable);
  assert.equal(selectEligibleModel(['m'], { entries: [{ model: 'm', at: 1000 }], cooldowns: {} }, 1100, { total: 20, daily: 20, hourly: 5 }), undefined);
});

test('Gemini does not rotate around ambiguous project quotas or bad credentials', async t => {
  for (const status of [403, 429]) {
    const directory = await mkdtemp(join(tmpdir(), 'finn-ai-stop-')); t.after(() => rm(directory, { recursive: true, force: true }));
    let calls = 0;
    const provider = createGeminiProvider({ directory, env: { GEMINI_API_KEY: 'test', FINN_AI_FREE_TIER_CONFIRMED: 'true' }, fetchImpl: async () => { calls++; return new Response('{}', { status }); } });
    await assert.rejects(provider.generate({ evidenceHash: `stop-${status}`, evidence, documents: [], company: 'Test', question: '' }), AiUnavailable);
    assert.equal(calls, 1);
  }
});
