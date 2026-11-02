const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const number = '([+−-]?\\d+(?:\\.\\d+)?)';
const bounds = `[^.]*?${number}\\s*%?\\s*(?:to|[-–])\\s*${number}\\s*%`;
const metrics = [
  ...['revenue', 'volume', 'sales'].map(name => ({ key: name, label: `${name[0].toUpperCase()}${name.slice(1)} growth`, pattern: new RegExp(`\\b${name}\\s+(?:growth\\s+)?(?:guidance|outlook|target)${bounds}`, 'i') })),
  ...['EBITDA', 'EBIT', 'PBDIT', 'operating'].map(name => ({ key: name, label: `${name} margin`, pattern: new RegExp(`\\b${name}\\s+margin\\s+(?:guidance|band|expectation)${bounds}`, 'i') })),
];
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
      if (match && !/segment|subsidiar|standalone|not expected|subject to|up to|no guidance|not provid|withdraw|no longer/i.test(quote)) return { match, quote, documentId: document.id, page: page.page, url: document.url, title: document.title };
    }
  }
  return null;
}

function fiscalPeriod(quote) {
  const match = quote.match(/\b(?:financial year|fiscal year|FY)\s*['’]?(20\d{2}|\d{2})(?:\s*[-–/]\s*(20\d{2}|\d{2}))?\b/i);
  if (!match) return 'not stated';
  const ending = match[2] ?? match[1]; const year = ending.length === 2 ? `20${ending}` : ending;
  return `${quote.match(/\bQ[1-4]\b/i)?.[0]?.toUpperCase() ? `${quote.match(/\bQ[1-4]\b/i)[0].toUpperCase()} ` : ''}${year}`;
}
function reportingBasis(quote) {
  return /constant.currency/i.test(quote) ? 'constant currency' : /reported.currency/i.test(quote) ? 'reported currency' : 'reporting basis not stated';
}
const sourceFields = item => Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'match'));

export function buildGuidanceComparison(documents) {
  const calls = documents.filter(doc => doc.kind === 'transcript' && callMonth(doc) !== null).sort((a, b) => callMonth(a) - callMonth(b));
  if (calls.length < 2) return null;
  const earlier = calls.at(-2); const later = calls.at(-1);
  if (callMonth(later) <= callMonth(earlier) || callMonth(later) - callMonth(earlier) > 6) return null;
  for (const metric of metrics) {
    const promised = find(earlier, metric.pattern); const revised = find(later, metric.pattern);
    if (!promised || !revised) continue;
    const forecast = item => ({ lower: Number(item.match[1].replace('−', '-')), upper: Number(item.match[2].replace('−', '-')), unit: '%',
      basis: `${metric.label}; ${reportingBasis(item.quote)}`, period: fiscalPeriod(item.quote), ...sourceFields(item) });
    const original = forecast(promised); const latest = forecast(revised);
    if (original.lower > original.upper || latest.lower > latest.upper || original.basis !== latest.basis) continue;
    if (original.period !== 'not stated' && latest.period !== 'not stated' && original.period !== latest.period) continue;
    if (/\bconsolidated\b/i.test(original.quote) !== /\bconsolidated\b/i.test(latest.quote)) continue;
    const growthPeriod = quote => /\b(?:Q-o-Q|quarter.on.quarter)\b/i.test(quote) ? 'qoq' : /\b(?:Y-o-Y|year.on.year)\b/i.test(quote) ? 'yoy' : null;
    if (growthPeriod(original.quote) && growthPeriod(latest.quote) && growthPeriod(original.quote) !== growthPeriod(latest.quote)) continue;
    // Only the supported, explicitly labelled CC revenue observation is parsed.
    // Revenue actuals cannot stand in for volume, sales or margin delivery.
    const observed = metric.key === 'revenue' && reportingBasis(promised.quote) === 'constant currency' ? find(later, actual) : null;
    return {
      metric: metric.key === 'revenue' && reportingBasis(promised.quote) === 'constant currency' ? 'Revenue growth in constant currency' : metric.label,
      promised: original, revised: latest,
      observed: observed ? { period: observed.match[1], yoy: Number(observed.match[2]), qoq: Number(observed.match[3]), unit: '%', basis: 'constant currency', ...sourceFields(observed) } : null,
      deliveryStatus: 'not_comparable',
      note: 'The revised forecast is not a delivered outcome. A quarterly observation is not full-year delivery. No met/missed verdict is supported. Unstated periods or reporting bases must be checked in the original calls.',
      whatToCheck: `Check the completed-period ${metric.label.toLowerCase()} on the same reporting basis and company scope against the original forecast. Confirm the fiscal period in each original call.`,
    };
  }
  return null;
}
