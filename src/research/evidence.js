import { createHash } from 'node:crypto';

export const EVIDENCE_VERSION = 'primary-excerpts-v2';
const questionStopWords = new Set('the and what how does this company companies are did do is was were will would can could should has have had why when which where who that these those for from about say said tell me please management report annual transcript call using describe latest current recent keep reported units reporting period quoted evidence establishes them in on at to of with as it its our their they we us an be by or'.split(' '));
const noQuestionMatch = "No direct mentions found in the annual report or transcripts for this specific term. Try broader terms like 'growth', 'capex', or 'margins'.";
function queryTerms(question) {
  return [...new Set(question.toLowerCase().match(/[a-z]{2,}/g) ?? [])].filter(term => !questionStopWords.has(term));
}
function directScore(chunk, terms) {
  return terms.reduce((sum, term) => {
    const stem = /^investments?$/.test(term) ? 'invest' : term.length > 4 ? term.replace(/s$/, '') : term;
    return sum + (new RegExp(`\\b${stem}${term === 'ai' ? '' : '\\w*'}\\b`, 'i').test(chunk.text) ? 1 : 0);
  }, 0);
}
const topics = [
  { id: 'business', title: 'Business snapshot', terms: ['business overview', 'our business', 'we provide', 'segments', 'manufactur', 'products', 'services', 'customers'], kind: 'annual_report' },
  { id: 'financial', title: 'Financial snapshot & trends', terms: ['revenue', 'profit', 'margin', 'cash flow', 'growth', 'crore', 'million'] },
  { id: 'guidance', title: 'Management outlook & delivery', terms: ['guidance', 'outlook', 'expect', 'target', 'full year', 'fiscal', 'margin'], kind: 'transcript' },
  { id: 'opportunities', title: 'Opportunity evidence', terms: ['opportunity', 'demand', 'growth drivers', 'capacity', 'order book', 'pipeline', 'new products'] },
  { id: 'risks', title: 'Risk evidence', terms: ['risk', 'uncertain', 'headwind', 'challeng', 'pressure', 'decline', 'competition'] },
];
export function chunkPages(documents) {
  const chunks = [];
  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
  for (const doc of documents) for (const page of doc.pages) {
    const boundaries = new Set([...segmenter.segment(page.text)].map(s => s.index + s.segment.match(/^\s*/)[0].length));
    for (let start = 0; start < page.text.length; start += 1050) {
      const raw = page.text.slice(start, start + 1250); const text = raw.trim();
      if (text.length < 150) continue;
      chunks.push({ id: `${doc.id}-p${page.page}-${start}`, documentId: doc.id, kind: doc.kind, page: page.page, text, leadingFragment: !boundaries.has(start + raw.match(/^\s*/)[0].length) });
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
  let questionReferenceId = null;
  let questionReferenceText = null;
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
    const metrics = terms.filter(term => /^(?:revenues?|profit|ebitda|ebit|pbt|pat|margin|cash|guidance)$/.test(term));
    const totalRevenue = metrics.some(term => /^revenues?$/.test(term)) && !/\b(?:segment|division|subsidiary|software|services|guidance|outlook|target)\b/i.test(question);
    const latest = /\b(?:latest|current|recent)\b/i.test(question) ? documents.find(d => d.kind === 'transcript')?.id : null;
    const matches = chunks.map(chunk => ({ chunk, score: score(chunk, terms) + 3 * score(chunk, metrics)
      + (totalRevenue && /\b(?:total|overall|our|company(?:'s)?)\s+revenue\b.{0,100}(?:\$|USD|INR|₹)/i.test(chunk.text) ? 24 : 0)
      + (metrics.length && latest === chunk.documentId ? 8 : 0) })).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    for (const match of matches) selected.set(match.chunk.id, match.chunk);
    const directTerms = queryTerms(question);
    const asksAI = /\bAI\b|artificial intelligence/i.test(question);
    // Keep existing saved-note retrieval identity. The prominent source reference
    // excludes generic question words; add a passage only if old retrieval missed it.
    let direct = matches.filter(item => directScore(item.chunk, directTerms) > 0);
    if (asksAI || !direct.length) direct = chunks.map(chunk => ({ chunk,
      score: directScore(chunk, directTerms) + (asksAI && /\bAI\b|artificial intelligence/i.test(chunk.text) ? 5 : 0) }))
      .filter(item => item.score > 0 && (!asksAI || /\bAI\b|artificial intelligence/i.test(item.chunk.text)))
      .sort((a, b) => b.score - a.score || a.chunk.page - b.chunk.page).slice(0, 4);
    for (const match of direct) selected.set(match.chunk.id, match.chunk);
    questionReferenceId = direct[0]?.chunk.id ?? null;
    if (direct[0]) {
      const text = direct[0].chunk.text;
      const sentences = [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text)]
        .map(({ segment }) => segment.trim()).filter(sentence => sentence.length >= 30 && /[.!?]["”’']?$/.test(sentence))
        .map(sentence => ({ text: sentence, score: directScore({ text: sentence }, directTerms) }))
        .filter(item => item.score > 0 && (!asksAI || /\bAI\b|artificial intelligence/i.test(item.text)))
        .sort((a, b) => b.score - a.score);
      questionReferenceText = sentences[0]?.text ?? text;
    }
    sections.unshift({ id: 'question', title: 'Evidence for your question', evidenceIds: direct.map(match => match.chunk.id), note: direct.length ? 'Relevant source passages, not a generated answer.' : noQuestionMatch });
  }
  const focused = /\b(?:revenues?|profit|ebitda|ebit|pbt|pat|margin|cash|guidance)\b/i.test(question) ? sections.find(s => s.id === 'question')?.evidenceIds ?? [] : [];
  const evidence = [...focused.map(id => selected.get(id)), ...[...selected.values()].filter(chunk => !focused.includes(chunk.id))];
  // Boundary metadata does not change original evidence/recorded-note identity.
  const hashEvidence = evidence.map(({ leadingFragment, ...chunk }) => chunk);
  const evidenceHash = createHash('sha256').update(JSON.stringify({ version: EVIDENCE_VERSION, hashes: documents.map(d => d.sha256), question, evidence: hashEvidence })).digest('hex');
  return { sections, evidence, evidenceHash, questionReferenceId, questionReferenceText, version: EVIDENCE_VERSION };
}
