import { createHash } from 'node:crypto';

export const EVIDENCE_VERSION = 'primary-excerpts-v2';
const topics = [
  { id: 'business', title: 'Business snapshot', terms: ['business overview', 'our business', 'we provide', 'segments', 'manufactur', 'products', 'services', 'customers'], kind: 'annual_report' },
  { id: 'financial', title: 'Financial snapshot & trends', terms: ['revenue', 'profit', 'margin', 'cash flow', 'growth', 'crore', 'million'] },
  { id: 'guidance', title: 'Management outlook & delivery', terms: ['guidance', 'outlook', 'expect', 'target', 'full year', 'fiscal', 'margin'], kind: 'transcript' },
  { id: 'opportunities', title: 'Opportunity evidence', terms: ['opportunity', 'demand', 'growth drivers', 'capacity', 'order book', 'pipeline', 'new products'] },
  { id: 'risks', title: 'Risk evidence', terms: ['risk', 'uncertain', 'headwind', 'challeng', 'pressure', 'decline', 'competition'] },
];
export function chunkPages(documents) {
  const chunks = [];
  for (const doc of documents) for (const page of doc.pages) {
    for (let start = 0; start < page.text.length; start += 1050) {
      const text = page.text.slice(start, start + 1250).trim();
      if (text.length < 150) continue;
      chunks.push({ id: `${doc.id}-p${page.page}-${start}`, documentId: doc.id, kind: doc.kind, page: page.page, text });
    }
  }
  return chunks;
}
function score(chunk, terms) {
  const lower = chunk.text.toLowerCase();
  if (/table of contents|contents page/.test(lower)) return 0;
  return terms.reduce((sum, term) => sum + (lower.includes(term) ? 1 : 0), 0);
}
function guidanceBonus(text) {
  const metric = /(?:revenue|growth|margin|volume|capex).{0,100}\bguidance\b|\bguidance\b.{0,100}(?:revenue|growth|margin|volume|capex)/i.test(text) ? 4 : 0;
  // Prefer an explicit forward range over a passing mention of earlier guidance.
  const range = /\bguidance\b.{0,180}\d+(?:\.\d+)?\s*%?\s*(?:to|[-–])\s*\d+(?:\.\d+)?\s*%/i.test(text) ? 10 : 0;
  const revenueRange = range && /\brevenue(?:\s+growth)?\s+guidance\b/i.test(text) ? 4 : 0;
  return metric + range + revenueRange;
}
function chooseMatches(matches, topic, documents) {
  const chosen = []; const pages = new Set();
  const add = match => {
    const key = `${match.chunk.documentId}-${match.chunk.page}`;
    if (pages.has(key)) return;
    chosen.push(match); pages.add(key);
  };
  // Preserve an earlier and later management voice instead of two passages from one call.
  if (topic.id === 'guidance') {
    for (const document of documents.filter(doc => doc.kind === 'transcript')) {
      const match = matches.find(item => item.chunk.documentId === document.id);
      if (match) add(match);
      if (chosen.length === 2) return chosen;
    }
  }
  // Put the latest available call alongside annual financial context when both exist.
  if (topic.id === 'financial') {
    for (const kind of ['transcript', 'annual_report']) {
      const document = documents.find(doc => doc.kind === kind && matches.some(item => item.chunk.documentId === doc.id));
      const match = document && matches.find(item => item.chunk.documentId === document.id);
      if (match) add(match);
    }
  }
  for (const match of matches) { if (chosen.length === 2) break; add(match); }
  return chosen;
}
export function buildEvidence(documents, question = '') {
  const chunks = chunkPages(documents); const selected = new Map();
  const sections = topics.map(topic => {
    const matches = chunks.filter(chunk => !topic.kind || chunk.kind === topic.kind).map(chunk => ({ chunk, score: score(chunk, topic.terms) + (topic.id === 'guidance' ? guidanceBonus(chunk.text) : 0) }))
      .filter(item => item.score >= 2 && (topic.id !== 'financial' || /\d/.test(item.chunk.text)))
      .sort((a, b) => b.score - a.score || a.chunk.page - b.chunk.page);
    const chosen = chooseMatches(matches, topic, documents);
    for (const match of chosen) selected.set(match.chunk.id, match.chunk);
    return { id: topic.id, title: topic.title, evidenceIds: chosen.map(match => match.chunk.id), note: topic.id === 'guidance' ? 'Earlier and later call evidence is included where available. Different reporting periods are not proof that annual guidance was met or missed.' : 'Primary-source excerpts selected by keywords; not an AI conclusion.' };
  });
  if (question.trim()) {
    const terms = [...new Set(question.toLowerCase().match(/[a-z]{3,}/g) ?? [])].filter(term => !['the', 'and', 'what', 'how', 'does', 'this', 'company', 'are'].includes(term));
    const matches = chunks.map(chunk => ({ chunk, score: score(chunk, terms) })).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    for (const match of matches) selected.set(match.chunk.id, match.chunk);
    sections.unshift({ id: 'question', title: 'Evidence for your question', evidenceIds: matches.map(match => match.chunk.id), note: matches.length ? 'Relevant source passages, not a generated answer.' : 'No matching passage found. Try a more specific question; no answer has been invented.' });
  }
  const evidence = [...selected.values()];
  const evidenceHash = createHash('sha256').update(JSON.stringify({ version: EVIDENCE_VERSION, hashes: documents.map(d => d.sha256), question, evidence })).digest('hex');
  return { sections, evidence, evidenceHash, version: EVIDENCE_VERSION };
}
