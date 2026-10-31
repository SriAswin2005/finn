const normalize = text => text.replace(/\s+/g, ' ').trim();
const future = /\b(?:guidance|expects?|expected|forecasts?|targets?|plans?|aims?|intends?|estimates?|will|would|could|may|might)\b/i;
const metrics = ['revenue', 'ebitda', 'pbt', 'pat', 'profit', 'volume', 'margin', 'cash flow', 'headcount'];
const genericNames = new Set(['Revenue', 'Reported', 'The', 'Company', 'Management', 'Profit', 'Annual', 'Quarterly', 'Earlier', 'Later', 'Operating', 'Consolidated', 'Our']);

function facts(text) {
  return [...text.matchAll(/\d[\d,]*(?:\.\d+)?/g)].map(match => {
    const after = text.slice(match.index + match[0].length, match.index + match[0].length + 32);
    const before = text.slice(Math.max(0, match.index - 8), match.index);
    const inherited = after.match(/^\s*(?:to|[-–])\s*\d[\d,]*(?:\.\d+)?\s*(%|percentage points?|percent(?:age)?|bps|basis points?|crores?|lakhs?|millions?|billions?)(?=\W|$)/i)?.[1];
    const unit = (after.match(/^\s*(%|percentage points?|percent(?:age)?|bps|basis points?|crores?|lakhs?|millions?|billions?)\b|^\s*(%)/i)?.[0].trim() ?? inherited)?.toLowerCase();
    const currency = /(?:US\$|\$|USD)\s*$/i.test(before) ? 'USD' : /(?:₹|INR|Rs\.?)\s*$/i.test(before) ? 'INR' : null;
    return { value: match[0].replaceAll(',', ''), unit: unit?.replace(/s$/, '').replace(/^percent(?:age)?$/, '%').replace(/^basis point$/, 'bps').replace(/^percentage point$/, 'pp'), currency };
  });
}

function contexts(ref, evidence) {
  const source = normalize(evidence.text); const quote = normalize(ref.quote);
  // Inspect the whole source sentence as well as the selected words to catch sliced-away hedges.
  const segments = [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(source)];
  const start = source.indexOf(quote); const end = start + quote.length;
  return segments.filter(item => item.index < end && item.index + item.segment.length > start).map(item => item.segment).join(' ');
}

export function citationContextFailure(claim, evidenceById) {
  const quotes = claim.references.map(ref => normalize(ref.quote)).join(' ');
  const surrounding = claim.references.map(ref => contexts(ref, evidenceById.get(ref.evidenceId))).join(' ');
  const stated = claim.text;
  const quoteFacts = facts(quotes);
  for (const fact of facts(stated)) {
    const matching = quoteFacts.filter(other => other.value === fact.value);
    if (fact.unit && !matching.some(other => other.unit === fact.unit)) return 'unit or scale mismatch';
    if (fact.currency && !matching.some(other => other.currency === fact.currency && (!fact.unit || other.unit === fact.unit))) return 'currency mismatch';
    if (!fact.unit && matching.length && matching.every(other => other.unit)) return 'missing unit or scale';
  }
  for (const metric of metrics) if (new RegExp(`\\b${metric}s?\\b`, 'i').test(stated) && !new RegExp(`\\b${metric}s?\\b`, 'i').test(quotes)) return `missing ${metric} metric context`;
  const periods = text => [...text.matchAll(/\bQ[1-4]\b|\bFY\s*(?:20)?\d{2}\b|\b(?:fiscal|financial) year\s*20\d{2}\b/gi)].map(match => match[0].toLowerCase().replace(/\s+/g, '').replace(/(?:fiscal|financial)year/, 'fy').replace(/^fy20/, 'fy'));
  const supportedPeriods = new Set(periods(quotes));
  if (periods(stated).some(period => !supportedPeriods.has(period))) return 'reporting period mismatch';
  if (/\bfull.year\b|\bfor the year\b/i.test(stated) && /\bquarter\b|\bQ[1-4]\b/i.test(quotes) && !/\bfull.year\b|\bfor the year\b/i.test(quotes)) return 'quarter is not a full-year result';
  if (/\b(?:segments?|subsidiar\w*|peers?|standalone)\b/i.test(quotes) && !/\b(?:segments?|subsidiar\w*|peers?|standalone)\b/i.test(stated)) return 'entity or consolidation scope mismatch';
  if (/\b(?:not|never|no)\b/i.test(surrounding.replace(/not only/gi, '')) && !/\b(?:not|never|no)\b/i.test(stated)) return 'negation omitted from source context';
  for (const hedge of ['subject to', 'up to', 'at most', 'at least']) if (surrounding.toLowerCase().includes(hedge) && !stated.toLowerCase().includes(hedge)) return 'qualifier omitted from source context';
  if (future.test(surrounding) && !future.test(stated) && !/\bif\b/i.test(stated)) return 'forward statement presented as actual';
  const up = /\b(?:grew|increased|rose|improved|expanded)\b/i; const down = /\b(?:declined|decreased|fell|dropped|contracted)\b/i;
  if ((up.test(stated) && down.test(quotes) && !up.test(quotes)) || (down.test(stated) && up.test(quotes) && !down.test(quotes))) return 'direction mismatch';
  if (['financial', 'guidance'].includes(claim.section)) {
    const names = stated.match(/\b[A-Z][a-z]+(?:[A-Z][A-Za-z]*)?\b/g) ?? [];
    if (names.some(name => !genericNames.has(name) && !quotes.toLowerCase().includes(name.toLowerCase()))) return 'named entity absent from quote';
    const tableLabels = ['revenue', 'ebitda', 'pbt', 'pat'].filter(label => new RegExp(`\\b${label}\\b`, 'i').test(quotes));
    if (tableLabels.length >= 2 && quoteFacts.length >= 3 && !/\b(?:was|reported|grew|declined|crosses)\b/i.test(quotes)) return 'flattened table requires verified row and column mapping';
  }
  return null;
}
