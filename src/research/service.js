import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dataDirectory, runtimeCacheDirectory, writeJsonAtomic } from '../storage/snapshots.js';
import { normalizeTicker, discoverDocuments } from './discovery.js';
import { downloadPublic } from './download.js';
import { buildEvidence } from './evidence.js';
import { createResearchStore } from '../storage/research-store.js';
import { collectRemoteDocument } from './remote-parser.js';
import { buildGuidanceComparison } from './guidance.js';

const runFile = promisify(execFile);
const root = fileURLToPath(new URL('../../', import.meta.url));
const pending = new Map();
const cacheDirectory = resolve(runtimeCacheDirectory, 'research');
const researchStore = createResearchStore();
export class ResearchUnavailable extends Error {}
async function readJson(path) {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function pythonPath() {
  if (process.env.PYTHON_BIN) return process.env.PYTHON_BIN;
  const local = resolve(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  try { await access(local); return local; } catch { return process.platform === 'win32' ? 'python' : 'python3'; }
}
export async function parseDocument(bytes, source) {
  if (bytes.toString('utf8', 0, 5) !== '%PDF-') throw new ResearchUnavailable('The source did not return a PDF.');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const path = resolve(cacheDirectory, `${sha256}.pdf`);
  const parsedPath = resolve(cacheDirectory, `${sha256}-pypdf-6.10.0-v2.json`);
  let parsed = await readJson(parsedPath);
  if (!parsed) {
    await mkdir(cacheDirectory, { recursive: true }); await writeFile(path, bytes);
    try {
      const { stdout } = await runFile(await pythonPath(), [resolve(root, 'scripts/parse_pdf.py'), path], { timeout: 60000, maxBuffer: 8_000_000, windowsHide: true, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
      parsed = JSON.parse(stdout); await writeJsonAtomic(parsedPath, parsed);
    } catch { throw new ResearchUnavailable('Unreadable PDF: text extraction failed, has no usable text layer or exceeded its limit. Check the Python PDF dependency; scanned PDFs need OCR, which is not enabled.'); }
  }
  return { ...source, id: sha256.slice(0, 16), sha256, parser: parsed.parser, pages: parsed.pages, pageCount: parsed.pages.length };
}

export async function collectResearch(ticker) {
  const fetchedAt = new Date().toISOString();
  let previous;
  try { previous = await researchStore.get(ticker); } catch { previous = null; }
  let discovery;
  for (const suffix of ['consolidated/', '']) {
    try {
      const url = `https://www.screener.in/company/${encodeURIComponent(ticker)}/${suffix}`;
      const response = await downloadPublic(url, { maxBytes: 2_000_000 });
      discovery = discoverDocuments(response.bytes.toString('utf8'), ticker); discovery.discoveryUrl = url; break;
    } catch (error) { if (!suffix) throw new ResearchUnavailable(`Document discovery unavailable: ${error.message}`); }
  }
  const documents = []; const errors = [];
  const issuerTerms = discovery.company.toLowerCase().replace(/\b(limited|ltd|the|and)\b/g, '').match(/[a-z]{3,}/g)?.slice(0, 2) ?? [];
  for (const source of discovery.documents) {
    try {
      const cached = previous?.documents.find(doc => doc.discoveredUrl === source.url && Date.now() - Date.parse(doc.fetchedAt) < 7 * 86400000);
      if (cached) { documents.push(cached); continue; }
      let document;
      if (process.env.VERCEL) document = await collectRemoteDocument(source, fetchedAt);
      else {
        const response = await downloadPublic(source.url, { maxBytes: source.kind === 'annual_report' ? 50_000_000 : 25_000_000 });
        document = await parseDocument(response.bytes, { ...source, url: response.url, discoveredUrl: source.url, fetchedAt });
      }
      const opening = document.pages.slice(0, 5).map(p => p.text).join(' ').toLowerCase();
      if (!issuerTerms.length || !issuerTerms.every(term => opening.includes(term))) throw new ResearchUnavailable('The document issuer could not be matched to the selected company.');
      documents.push(document);
    } catch (error) { errors.push({ title: source.title, error: error.message }); }
  }
  if (!documents.length) throw new ResearchUnavailable(`No primary document could be downloaded and verified for this ticker. ${errors.map(error => `${error.title}: ${error.error}`).join(' ')}`);
  const data = { schemaVersion: 1, ticker, company: discovery.company, discoveryUrl: discovery.discoveryUrl, fetchedAt, mode: 'collected', documents, errors };
  try { await researchStore.set(ticker, data); } catch { data.errors.push({ title: 'Research storage', error: 'Collected research could not be saved persistently; this result may need recollection after restart.' }); }
  return data;
}

export async function getResearch(tickerInput, question = '', { collect = collectResearch } = {}) {
  const ticker = normalizeTicker(tickerInput);
  if (typeof question !== 'string' || question.length > 400) throw new RangeError('Keep research questions to 400 characters.');
  let data = await readJson(resolve(dataDirectory, `research/${ticker}.json`));
  if (data) data.mode = 'recorded';
  if (!data) {
    try { data = await researchStore.get(ticker); } catch { throw new ResearchUnavailable('Persistent research storage is unavailable. Try a recorded example or retry shortly.'); }
  }
  if (!data) {
    if (!pending.has(ticker)) {
      if (pending.size >= 1) throw new ResearchUnavailable('Another company is being collected. Please retry shortly.');
      const operation = collect(ticker).finally(() => pending.delete(ticker));
      pending.set(ticker, operation);
    }
    data = await pending.get(ticker);
  }
  const evidence = buildEvidence(data.documents, question);
  return {
    ticker, company: data.company, fetchedAt: data.fetchedAt, mode: data.mode, question,
    stale: Date.now() - Date.parse(data.fetchedAt) > 7 * 86400000,
    documents: data.documents.map(({ pages, ...document }) => document), errors: data.errors,
    ...evidence,
    guidanceComparison: buildGuidanceComparison(data.documents),
    ai: { configured: Boolean(process.env.GEMINI_API_KEY && process.env.FINN_AI_FREE_TIER_CONFIRMED === 'true'), provider: 'Gemini', state: 'not_requested' },
  };
}

export async function recordResearch(tickerInput, { cachedOnly = false } = {}) {
  const ticker = normalizeTicker(tickerInput);
  const data = cachedOnly ? await researchStore.get(ticker) : await collectResearch(ticker);
  if (!data) throw new ResearchUnavailable('No local document cache exists for this ticker. Collect it first.');
  const view = buildEvidence(data.documents); const selected = new Map();
  for (const evidence of view.evidence) {
    if (!selected.has(evidence.documentId)) selected.set(evidence.documentId, new Set());
    selected.get(evidence.documentId).add(evidence.page);
  }
  const recorded = { ...data, mode: 'recorded', documents: data.documents.map(doc => ({ ...doc, pages: doc.pages.filter(page => selected.get(doc.id)?.has(page.page)) })) };
  await writeJsonAtomic(resolve(dataDirectory, `research/${ticker}.json`), recorded);
  return { ticker, company: data.company, documents: data.documents.map(d => ({ title: d.title, pages: d.pageCount })), errors: data.errors, excerpts: view.evidence.length };
}
