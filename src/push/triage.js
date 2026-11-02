// Source excerpts and queue policy, without model calls or materiality conclusions.
export const routineCategories = new Set(['board_meeting', 'postal_ballot', 'investor_meetings', 'agm_egm', 'unclassified']);
export const highCategories = new Set(['results', 'management_change', 'M&A', 'contract', 'litigation']);
const purpose = /meeting|ballot|certificate|compliance|regulation|trading window|share certificate|dematerial|investor/i;

export function triageDocument(filing, document) {
  const text = document.pages.map(page => page.text).join(' ');
  let category = filing.category;
  // Board outcomes/unknown titles can contain substantive disclosures. Preserve
  // them for AI review rather than treating every board notice as administrative.
  if (!highCategories.has(category)) {
    if (/\b(?:resign\w*|retir\w*|appoint\w*)\b.{0,120}\b(?:chief|CEO|CFO|managing director)\b|\b(?:chief|CEO|CFO|managing director)\b.{0,120}\b(?:resign\w*|retir\w*|appoint\w*)\b/i.test(text)) category = 'management_change';
    else if (/\b(?:approved|considered|adopted)\b.{0,100}\b(?:audited|unaudited|quarterly|financial) results\b|\bstatement of (?:consolidated|standalone|unaudited|audited).{0,80}results\b/i.test(text)) category = 'results';
    else if (/\b(?:entered into|executed|approved|completed|completion of)\b.{0,100}\b(?:acquisition|merger|demerger|share purchase agreement)\b/i.test(text)) category = 'M&A';
    else if (/\b(?:awarded|secured|received)\b.{0,70}\b(?:contract|order worth|orders worth)\b/i.test(text)) category = 'contract';
    else if (/\b(?:penalty|fine)\b.{0,60}\b(?:imposed|levied)\b|\b(?:litigation|court order|show cause notice)\b/i.test(text)) category = 'litigation';
  }
  const mode = routineCategories.has(category) ? 'rules' : 'model';
  let source = null;
  if (mode === 'rules') {
    const candidates = document.pages.flatMap(page => [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(page.text)]
      .map(({ segment }) => ({ page: page.page, quote: segment.trim() })).filter(item => item.quote.length >= 40 && item.quote.length <= 700));
    const selected = candidates.find(item => purpose.test(item.quote)) ?? candidates[0];
    if (selected) source = { ...selected, url: document.url, title: document.title ?? filing.title, documentHash: document.sha256 };
  }
  return { mode, category, source, documentHash: document.sha256, version: 'routine-triage-v1' };
}

export function completeRoutine(state, job, triages, at) {
  if (!triages.length || triages.some(t => t.mode !== 'rules') || job.lease?.until > at || !['pending', 'deferred'].includes(job.status)) return false;
  const triage = triages[0]; const source = triage.source;
  if (!source) return false;
  const generatedAt = new Date(at).toISOString();
  const mentionedDates = [...new Set(source.quote.match(/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*,?\s*20\d{2}\b/gi) ?? [])];
  job.analysis = { method: 'rules', model: null, llmCalls: 0, eventType: 'routine', priority: 'low', generatedAt,
    analysisVersion: triage.version, documentHash: job.documentHash, metrics: [], missing: [], warnings: job.evidenceWarnings ?? [],
    uncertainties: ['Rule-based source excerpt. No AI materiality or investment conclusion was generated.'],
    ruleSummary: { category: triage.category, purpose: source.quote, mentionedDates },
    claims: [{ role: 'event', text: 'Source notice', inference: false, references: [source] },
      { role: 'fact', text: source.quote, inference: false, references: [source] }] };
  Object.assign(job, { status: 'complete', publishedAt: generatedAt, nextAt: 0, lease: null,
    triage: { ...triage, completedAt: generatedAt }, priorAnalysisError: job.error ?? null, error: null });
  for (const event of Object.values(state.events)) if (event.processingKey === job.key && !event.replacedBy) event.status = 'complete';
  return true; // Quota, attempts and rejected drafts are deliberately untouched.
}

export async function completeRoutineJobs({ store, now = Date.now, limit = 80 } = {}) {
  const at = now(); const snapshot = await store.read();
  const candidates = Object.values(snapshot.jobs).filter(job => ['pending', 'deferred'].includes(job.status) && !(job.lease?.until > at)
    && Object.values(snapshot.events).some(e => e.processingKey === job.key && !e.replacedBy && e.filing.evidenceMode !== 'captured_evaluation' && routineCategories.has(e.filing.category)
      && !e.triageSources?.some(t => t.mode === 'model' && t.version === 'routine-triage-v1' && (job.documentHashes ?? [job.documentHash]).includes(t.documentHash)))).slice(0, limit);
  // Small batches bound concurrent database reads; immutable documents are shared.
  let completed = 0;
  for (let start = 0; start < candidates.length; start += 8) {
    const ready = await Promise.all(candidates.slice(start, start + 8).map(async job => {
      const event = Object.values(snapshot.events).find(e => e.processingKey === job.key && !e.replacedBy && e.filing.evidenceMode !== 'captured_evaluation');
      try {
        const docs = await Promise.all((job.documentHashes ?? [job.documentHash]).map(hash => store.document(hash)));
        return { job, event, triages: docs.every(Boolean) ? docs.map(doc => triageDocument(event.filing, doc)) : [] };
      } catch {
        return { job, event, triages: [] }; // One unavailable source must not block material work.
      }
    }));
    completed += await store.mutate(state => ready.reduce((count, item) => {
      const job = state.jobs[item.job.key]; const event = state.events[item.event.filing.id];
      if (!job || event?.processingKey !== job.key || event.revision !== item.event.revision || event.replacedBy) return count;
      event.triageSources = item.triages;
      return count + Number(completeRoutine(state, job, item.triages, at));
    }, 0));
  }
  return { completed, llmCalls: 0 };
}
