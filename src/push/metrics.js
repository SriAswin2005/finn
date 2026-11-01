// Deliberately narrow generic table acceptance: original aligned text, explicit
// scope/unit, a full quarterly header and exactly one value per header column.
// No model-proposed row/column values and no repaired OCR digits enter this path.
const normalize = text => text.replace(/\s+/g, ' ').trim();
const numberPattern = /^\(?-?(?:\d+|\d{1,3}(?:,\d{2,3})+)(?:\.\d+)?\)?$/;
export function comparableChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return { percent: null, delta: null, reason: 'Comparative unavailable' };
  const delta = current - previous;
  if (previous <= 0) return { percent: null, delta, reason: previous === 0 ? 'Zero comparison base; percentage unavailable' : 'Negative comparison base; percentage unavailable' };
  return { percent: Math.round(delta / previous * 100000) / 1000, delta, reason: 'Derived: (current - comparison) / comparison × 100' };
}
function quarter(value) {
  const m = /^Q\s*([1-4])\s*FY\s*(\d{2}|\d{4})$/i.exec(value.trim());
  if (!m) return null;
  const fy = Number(m[2]) + (m[2].length === 2 ? 2000 : 0);
  return { label: `Q${m[1]}FY${String(fy).slice(-2)}`, index: fy * 4 + Number(m[1]) };
}
function metricLabel(value) {
  const label = normalize(value);
  if (/^(?:total )?revenue(?: from operations)?$/i.test(label)) return label;
  if (/^(?:reported |adjusted )?(?:PAT|PBT|EBITDA|EBIT|net profit|operating profit)$/i.test(label)) return label;
  if (/^profit (?:before tax|after tax)$/i.test(label)) return label;
  return null;
}
export function extractFinancialMetrics(doc) {
  const rows = []; const limitations = [];
  for (const [index, page] of doc.pages.entries()) {
    if (!page.layoutText) continue;
    const lines = page.layoutText.split(/\r?\n/);
    const scopeEvidence = [page, ...doc.pages.slice(Math.max(0, index - 2), index).reverse()].find(p => /financials? (?:are |is )?on consolidated basis|consolidated financial|consolidated results/i.test(p.text) && !/standalone/i.test(p.text));
    const scope = /consolidated/i.test(page.text) && !/standalone/i.test(page.text) || scopeEvidence ? 'consolidated' : /standalone/i.test(page.text) && !/consolidated/i.test(page.text) ? 'standalone' : null;
    const unitLine = lines.find(l => /(?:₹|INR|Rs\.?|Rupees|USD|US\$).{0,25}\b(?:mn|million|crores?|lakhs?|billion)\b/i.test(l))
      ?? lines.map((l, i) => `${l.trim().split(/\s{2,}/)[0]} ${lines[i + 1]?.trim().split(/\s{2,}/)[0] ?? ''}`).find(l => /(?:₹|INR|Rs\.?|Rupees|USD|US\$)\s*\b(?:mn|million|crores?|lakhs?|billion)\b/i.test(l));
    if (!scope || !unitLine) continue;
    const units = unitLine.match(/(?:₹|INR|Rs\.?|Rupees|USD|US\$).{0,25}?\b(mn|million|crores?|lakhs?|billion)\b/i);
    const currency = /USD|US\$/i.test(units[0]) ? 'USD' : 'INR';
    const unit = units[1].toLowerCase().replace(/^mn$/, 'million').replace(/s$/, '');
    for (const [headerIndex, line] of lines.entries()) {
      const cells = line.trim().split(/\s{2,}/); const periods = cells.map(quarter);
      const start = periods.findIndex(Boolean);
      if (start < 0 || periods.slice(start).some(p => !p) || periods.length - start < 3) continue;
      const headers = periods.slice(start); const latest = headers.reduce((best, p, i) => p.index > headers[best].index ? i : best, 0);
      const restatement = doc.pages.some(p => /restated|recast|regrouped/i.test(p.text));
      for (const rowText of lines.slice(headerIndex + 1, headerIndex + 25)) {
        const rowCells = rowText.trim().split(/\s{2,}/); const label = metricLabel(rowCells[0]);
        if (!label) continue;
        const rawValues = rowCells.slice(1);
        if (rawValues.length !== headers.length || rawValues.some(n => !numberPattern.test(n))) { limitations.push(`Ambiguous ${label} row on physical page ${page.page}; no cells repaired.`); continue; }
        const values = rawValues.map(n => Number(n.replaceAll(',', '').replace(/^\((.*)\)$/, '-$1')));
        const previousQuarterIndex = headers.findIndex(p => p.index === headers[latest].index - 1);
        const previousYearIndex = headers.findIndex(p => p.index === headers[latest].index - 4);
        rows.push({ label, value: values[latest], currency, unit, scope, period: headers[latest].label,
          previousQuarter: previousQuarterIndex < 0 ? null : values[previousQuarterIndex], previousYear: previousYearIndex < 0 ? null : values[previousYearIndex],
          qoq: restatement ? { percent: null, delta: null, reason: 'Restatement/regrouping context requires review' } : comparableChange(values[latest], values[previousQuarterIndex]),
          yoy: restatement ? { percent: null, delta: null, reason: 'Restatement/regrouping context requires review' } : comparableChange(values[latest], values[previousYearIndex]),
          source: { url: doc.url, page: page.page, scopePage: scopeEvidence?.page ?? page.page, documentHash: doc.sha256, header: normalize(line), row: normalize(rowText), units: normalize(unitLine) },
          basis: restatement ? 'Comparatives as disclosed; restatement/regrouping review required' : 'Same table, scope, units and matching fiscal quarter; changes computed by FINN',
        });
      }
    }
  }
  return { rows, limitations };
}
