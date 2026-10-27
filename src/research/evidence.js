import { createHash } from 'node:crypto';

export const EVIDENCE_VERSION = 'primary-excerpts-v1';
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
export function buildEvidence(documents, question = '') {
  const chunks = chunkPages(documents); const selected = new Map();
  const sections = topics.map(topic => {
    const matches = chunks.filter(chunk => !topic.kind || chunk.kind === topic.kind).map(chunk => ({ chunk, score: score(chunk, topic.terms) }))
      .filter(item => item.score >= 2 && (topic.id !== 'financial' || /\d/.test(item.chunk.text)))
      .sort((a, b) => b.score - a.score || a.chunk.page - b.chunk.page);
    const chosen = []; const pages = new Set();
    for (const match of matches) {
      const pageKey = `${match.chunk.documentId}-${match.chunk.page}`;
      if (pages.has(pageKey)) continue;
      chosen.push(match.chunk.id); selected.set(match.chunk.id, match.chunk); pages.add(pageKey);
      if (chosen.length === 2) break;
    }
    return { id: topic.id, title: topic.title, evidenceIds: chosen, note: topic.id === 'guidance' ? 'Quoted management commentary. A comparable-quarter promise-versus-delivery conclusion requires further analysis.' : 'Primary-source excerpts selected by keywords; not an AI conclusion.' };
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
