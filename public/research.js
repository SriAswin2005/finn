const $ = id => document.getElementById(id);
function node(tag, className, text) {
  const element = document.createElement(tag); if (className) element.className = className;
  if (text !== undefined) element.textContent = text; return element;
}
function citation(document, page) {
  const link = node('a', 'source-link', `${document.title} · PDF p. ${page} ↗`);
  const url = new URL(document.url); if (url.protocol !== 'https:' || url.username || url.password) return node('span', 'muted', 'Source URL unavailable.');
  url.hash = `page=${page}`; link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; return link;
}
let result = null; let request = 0; let controller;
function render(data) {
  result = data;
  $('research-company').textContent = `${data.company} · ${data.ticker}`;
  $('research-mode').textContent = data.mode === 'recorded' ? 'RECORDED PRIMARY EVIDENCE' : 'CACHED PRIMARY DOCUMENTS';
  const kinds = new Set(data.documents.map(doc => doc.kind));
  $('research-coverage').textContent = `Collected ${new Date(data.fetchedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST. ${data.documents.length} documents.${data.stale ? ' Evidence is over seven days old.' : ''}${!kinds.has('annual_report') ? ' Annual report unavailable.' : ''}${!kinds.has('transcript') ? ' Transcript unavailable.' : ''} Excerpts are selected by keywords; they are not an AI analysis or verified financial comparison.`;
  $('research-documents').replaceChildren(...data.documents.map(doc => {
    const item = node('div', 'document-item'); item.append(citation(doc, 1), node('span', 'muted', `${doc.kind === 'annual_report' ? 'Annual report' : 'Earnings-call transcript'} · ${doc.pageCount} pages · SHA-256 ${doc.sha256.slice(0, 10)}…`)); return item;
  }), ...data.errors.map(error => node('p', 'muted', `${error.title}: ${error.error}`)));
  const evidenceById = new Map(data.evidence.map(item => [item.id, item]));
  const documentById = new Map(data.documents.map(doc => [doc.id, doc]));
  $('research-evidence').replaceChildren(...data.sections.map(section => {
    const panel = node('section', 'research-section'); panel.append(node('h3', '', section.title), node('p', 'muted', section.note));
    if (!section.evidenceIds.length) panel.append(node('p', 'empty', 'No supporting passage was retrieved. No conclusion has been generated.'));
    for (const id of section.evidenceIds) {
      const evidence = evidenceById.get(id); const doc = documentById.get(evidence.documentId);
      const details = node('details', 'evidence-excerpt'); const summary = node('summary', '', `${doc.title} · PDF page ${evidence.page}`);
      details.append(summary, node('p', 'excerpt', evidence.text), citation(doc, evidence.page)); panel.append(details);
    }
    return panel;
  }));
  $('research-ai').disabled = !data.ai.configured || !data.evidence.length;
  $('ai-status').textContent = data.ai.configured ? 'Generate on demand. Repeated notes use the evidence cache; free-quota limits apply.' : 'AI synthesis is not enabled. Verified document retrieval and cited excerpts remain available.';
  $('ai-result').replaceChildren(); $('research-result').hidden = false;
}
async function load() {
  const id = ++request; controller?.abort(); controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300000);
  $('research-status').className = 'status'; $('research-status').textContent = 'Finding primary documents and page references… Cached examples load faster.';
  $('research-result').hidden = true; $('research-submit').disabled = true;
  try {
    const query = new URLSearchParams({ ticker: $('research-ticker').value, question: $('research-question').value.trim() });
    const response = await fetch(`/api/research?${query}`, { signal: controller.signal, cache: 'no-store' });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Research unavailable.');
    if (id !== request) return; render(data);
    $('research-status').textContent = 'Primary evidence is ready. Open a page reference to inspect the original document.';
  } catch (error) {
    if (id !== request) return;
    $('research-status').className = 'status error'; $('research-status').textContent = error.name === 'AbortError' ? 'Document collection timed out. Please retry; completed documents may already be cached.' : error instanceof TypeError ? 'FINN could not be reached. Check your connection and that the server is running. The offline app shell does not include research data.' : error.message;
  } finally { clearTimeout(timeout); if (id === request) $('research-submit').disabled = false; }
}
$('research-form').addEventListener('submit', event => { event.preventDefault(); load(); });
export function researchCompany(ticker) {
  location.hash = 'research'; $('research-ticker').value = ticker; $('research-question').value = ''; $('research-form').requestSubmit();
}
for (const button of document.querySelectorAll('[data-research-ticker]')) button.addEventListener('click', () => researchCompany(button.dataset.researchTicker));
$('research-ai').addEventListener('click', async () => {
  const data = result; const id = request;
  $('research-ai').disabled = true; $('ai-status').textContent = 'Preparing a cited note from the selected primary evidence…';
  try {
    const response = await fetch('/api/research/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticker: data.ticker, question: data.question }), signal: AbortSignal.timeout(150000) });
    const analysis = await response.json(); if (!response.ok) throw new Error(analysis.error || 'AI analysis unavailable.');
    if (id !== request) return;
    if (analysis.evidenceHash !== data.evidenceHash) throw new Error('The source evidence changed. Reload research before generating another note.');
    $('ai-result').replaceChildren(...analysis.claims.map(claim => {
      const article = node('article', 'ai-claim'); article.append(node('span', 'eyebrow', `${claim.section} · ${claim.inference ? 'AI interpretation' : 'AI summary — verify against source'}`), node('p', '', claim.text));
      for (const ref of claim.references) {
        const evidence = data.evidence.find(item => item.id === ref.evidenceId); const doc = data.documents.find(doc => doc.id === evidence.documentId);
        article.append(node('blockquote', '', ref.quote), citation(doc, evidence.page));
      }
      return article;
    }), node('p', 'muted', 'Guidance versus delivery: not verified. A revised forecast does not establish that an earlier forecast was met or missed; matching periods and reporting basis must be checked.'), node('p', 'muted', `Unsupported sections: ${analysis.unavailableSections.join(', ') || 'none declared'}. Citation and quote checks passed; they do not prove semantic correctness. Read the sources before relying on a claim.`));
    $('ai-status').textContent = `${analysis.provider} · ${analysis.model} · ${analysis.cached ? 'cached note; no new generation' : 'new note'} · generated ${new Date(analysis.generatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST · ${analysis.promptVersion}`;
  } catch (error) { if (id === request) $('ai-status').textContent = error.name === 'TimeoutError' ? 'The AI request timed out. Your source evidence remains available; check the connection before retrying.' : error instanceof TypeError ? 'FINN could not be reached. Your loaded evidence remains visible; reconnect before requesting an AI note.' : error.message; }
  finally { if (id === request) $('research-ai').disabled = !data.ai.configured; }
});
