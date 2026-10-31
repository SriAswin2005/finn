const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const number = '(\\d+(?:\\.\\d+)?)';
const range = new RegExp(`revenue growth guidance[^.]*?${number}%?\\s+to\\s+${number}%[^.]*constant currency terms\\.`, 'i');
const actual = /Our revenue growth for (Q[1-4]) was at (\d+(?:\.\d+)?)% Y-on-Y and (\d+(?:\.\d+)?)% Q-on-Q in constant currency terms\./i;

function callMonth(document) {
  const match = document.title.match(/\b([A-Z][a-z]{2}) (20\d{2})\b/);
  return match && months.includes(match[1]) ? Number(match[2]) * 12 + months.indexOf(match[1]) : null;
}
function find(document, pattern) {
  for (const page of document.pages) {
    // Only complete prose sentences; do not infer financial values from flattened tables.
    for (const { segment } of new Intl.Segmenter('en', { granularity: 'sentence' }).segment(page.text)) {
      const quote = segment.trim(); const match = quote.match(pattern);
      if (match && !/segment|subsidiar|standalone|not expected|subject to|up to/i.test(quote)) return { match, quote, documentId: document.id, page: page.page, url: document.url, title: document.title };
    }
  }
  return null;
}

export function buildGuidanceComparison(documents) {
  const calls = documents.filter(doc => doc.kind === 'transcript' && callMonth(doc) !== null).sort((a, b) => callMonth(a) - callMonth(b));
  if (calls.length < 2) return null;
  const earlier = calls.at(-2); const later = calls.at(-1);
  if (callMonth(later) <= callMonth(earlier) || callMonth(later) - callMonth(earlier) > 6) return null;
  const promised = find(earlier, range); const revised = find(later, range); const observed = find(later, actual);
  if (!promised || !revised) return null;
  const forecast = item => ({ lower: Number(item.match[1]), upper: Number(item.match[2]), unit: '%', basis: 'year-on-year constant-currency revenue growth', period: item.quote.match(/financial year (20\d{2})/i)?.[1] ?? 'financial year, as stated in the later call', ...Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'match')) });
  const original = forecast(promised); const latest = forecast(revised);
  if (original.lower > original.upper || latest.lower > latest.upper) return null;
  if (/^20\d{2}$/.test(latest.period) && latest.period !== original.period) return null;
  return {
    metric: 'Revenue growth in constant currency', promised: original, revised: latest,
    observed: observed ? { period: observed.match[1], yoy: Number(observed.match[2]), qoq: Number(observed.match[3]), unit: '%', basis: 'constant currency', ...Object.fromEntries(Object.entries(observed).filter(([key]) => key !== 'match')) } : null,
    deliveryStatus: 'not_comparable',
    note: 'The later quarter is a progress observation, not the full-year outcome. The revised forecast is not delivered growth. No met/missed verdict is supported.',
    whatToCheck: 'Check the completed full-year revenue growth on the same constant-currency and company reporting basis against the original forecast. Confirm the fiscal period in each original call.',
  };
}
