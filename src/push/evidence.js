import { createHash } from 'node:crypto';
import { downloadPublic } from '../research/download.js';
import { parseDocument } from '../research/service.js';
import { collectRemoteDocument } from '../research/remote-parser.js';
import { filingUrl } from '../providers/nse.js';
import { buildQuoteBank } from '../ai/quotes.js';

export async function collectFilingDocument(filing, { env = process.env } = {}) {
  if (!filingUrl(filing.source.url)) throw new Error('No allowed original NSE attachment; document analysis unavailable.');
  const source = { url: filing.source.url, kind: 'filing', title: filing.title, fetchedAt: new Date().toISOString() };
  const document = env.VERCEL ? await collectRemoteDocument(source, source.fetchedAt, { env }) : await (async () => {
    const result = await downloadPublic(source.url, { maxBytes: 15_000_000, timeoutMs: 15000 });
    if (!filingUrl(result.url)) throw new Error('Attachment redirected outside official NSE archives.');
    return parseDocument(result.bytes, { ...source, url: result.url });
  })();
  if (!filingUrl(document.url)) throw new Error('Parsed attachment is not on the official NSE archives.');
  return document;
}
export function filingEvidence(documents) {
  const evidence = [];
  for (const doc of documents) for (const page of doc.pages) {
    evidence.push({ id: `${doc.id}-p${page.page}`, documentId: doc.id, page: page.page, url: doc.url, text: page.text });
  }
  // Preserve full pages in storage; selected complete sentence quotes are bounded.
  const all = buildQuoteBank(evidence);
  const score = q => /appoint|resign|effective|acquir|consideration|contract|order|tribunal|penalt|appeal|revenue|profit|ebit|quarter|consolidat|crore|million|billion|experience|served|subject to|not |meeting|record date/i.test(q.quote) ? 2 : 0;
  const quotes = all.map((q, i) => ({ ...q, index: i })).sort((a, b) => score(b) - score(a) || a.index - b.index).slice(0, 120).sort((a, b) => a.index - b.index).map(({ index, ...q }) => q);
  const warnings = [];
  if (all.length > quotes.length) warnings.push('Only selected complete sentences fit the interpretation budget; full documents remain available.');
  if (!quotes.length) warnings.push('No short complete sentences could be safely quoted. Tables/scans need further processing.');
  return { evidence, quotes, warnings, hash: createHash('sha256').update(documents.map(d => d.sha256).join('|')).digest('hex') };
}
