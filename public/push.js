const el = (tag, text, cls = '') => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; n.className = cls; return n; };
const labels = { pending_collection: 'Awaiting collection', pending_document: 'Awaiting document processing', document_retry: 'Source retry pending', document_failed: 'Document unavailable', pending: 'Awaiting analysis', processing: 'Analysis in progress', deferred: 'Awaiting model capacity', failed: 'Analysis unavailable', partial: 'Partial briefing', complete: 'Saved briefing' };
const date = value => value ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) + ' IST' : 'unavailable';
function pageLink(ref, label) { const a = el('a', label, 'source-link'); a.href = `${ref.url.split('#')[0]}#page=${ref.page}`; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }
export function pushAnalysis(item) {
  const section = el('section', undefined, 'push-brief');
  section.append(el('p', `${labels[item.analysisStatus] ?? item.analysisStatus}${item.delayed ? ' · delayed coverage' : ''}`, 'eyebrow'));
  section.append(el('p', `Collected ${date(item.collectedAt ?? item.fetchedAt)}${item.analysisPublishedAt ? ` · briefing published ${date(item.analysisPublishedAt)}` : ''}`, 'muted'));
  if (item.correction) section.append(el('p', item.correction, 'muted'));
  if (!item.analysis) { if (item.analysisError) section.append(el('p', item.analysisError, 'muted')); return section; }
  const a = item.analysis;
  if (a.metrics.length) {
    const table = el('table', undefined, 'results-table'); const tr = el('tr');
    for (const t of ['Metric', 'Latest', 'QoQ', 'YoY']) tr.append(el('th', t));
    const head = el('thead'); head.append(tr); const body = el('tbody');
    for (const metric of a.metrics) {
      const row = el('tr'); const title = el('th', metric.label); title.scope = 'row';
      const change = value => value.percent === null ? 'Unavailable' : `${value.percent > 0 ? '+' : ''}${value.percent.toFixed(1)}%`;
      row.append(title, el('td', metric.value.toLocaleString('en-IN')), el('td', change(metric.qoq)), el('td', change(metric.yoy))); body.append(row);
    }
    table.append(head, body); section.append(table);
    const first = a.metrics[0]; section.append(el('p', `${first.period} · ${first.scope} · ${first.currency} ${first.unit}. Changes are derived from matching source columns. Metric labels are retained as disclosed.`, 'muted'));
  }
  const uncertainty = [...new Set([...(a.uncertainties ?? []), ...(a.warnings ?? [])])];
  if (uncertainty.length) {
    const detail = el('details'); detail.append(el('summary', `Uncertainties & limits · ${uncertainty.length}`));
    for (const text of uncertainty) detail.append(el('p', text, 'muted')); section.append(detail);
  }
  const evidence = el('details'); evidence.append(el('summary', 'Evidence & priority reason'));
  evidence.append(el('p', item.priorityReason, 'muted'), el('p', 'Facts are disclosed by the issuer. Significance and priority are conditional AI interpretations. Issuer-provided background is not independently verified.', 'muted'));
  for (const claim of a.claims) {
    evidence.append(el('p', `${claim.inference ? 'Interpretation' : 'Disclosed fact'}: ${claim.text}`));
    for (const ref of claim.references) evidence.append(el('blockquote', ref.quote), pageLink(ref, `Original filing · physical p.${ref.page} ↗`));
  }
  for (const metric of a.metrics) {
    evidence.append(el('p', `${metric.label}: latest ${metric.value}; previous quarter ${metric.previousQuarter ?? 'unavailable'}; previous year ${metric.previousYear ?? 'unavailable'}. ${metric.currency} ${metric.unit}; ${metric.scope}. ${metric.qoq.reason}. ${metric.basis}`, 'muted'),
      el('blockquote', `${metric.source.header}\n${metric.source.row}\n${metric.source.units}`), pageLink(metric.source, `Check metric row · physical p.${metric.source.page} ↗`));
    if (metric.source.scopePage !== metric.source.page) evidence.append(pageLink({ ...metric.source, page: metric.source.scopePage }, `Check reporting scope · physical p.${metric.source.scopePage} ↗`));
  }
  section.append(evidence); return section;
}
export function pushStatusText(status) {
  if (status.unavailable) return status.error;
  const c = status.collection;
  const source = c.status === 'failed' ? `Collection failed: ${c.error}. Last success ${date(c.lastSuccessAt)}.` : c.status === 'ok' ? `NSE checked ${date(c.lastSuccessAt)}. ${c.counts?.added === 0 && c.counts?.changed === 0 ? 'No new disclosures in the checked window.' : `${c.counts?.added ?? 0} new, ${c.counts?.changed ?? 0} changed disclosures in the checked window.`}` : 'Automatic collection has not completed yet.';
  const catchup = c.checkpoint && Date.now() - Date.parse(c.checkpoint) > 86400000 ? ' Catch-up is processing missed collection windows.' : '';
  return `${source}${catchup} ${status.pending} awaiting processing.${status.delayed ? ' Delayed disclosures remain visible.' : ''}${status.overload ? ` Incoming workload (${status.incoming24h}) exceeds the local daily analysis budget (${status.localDailyCapacity}).` : ''}${status.operationalProblem ? ' Model configuration needs operator attention.' : ''}${status.projectPausedUntil ? ` Analysis paused until ${date(status.projectPausedUntil)}.` : ''}`;
}
