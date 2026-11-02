import { buildQuoteBank } from '../ai/quotes.js';

// Preserve issuer reporting context alongside short model-selected facts. This
// is exact primary text, never a generated period or a calculated currency.
export function reportingContext(analysis, evidence) {
  const financial = (analysis.claims ?? []).filter(c => c.section === 'financial');
  if (!financial.length) return [];
  const ids = new Set(financial.flatMap(c => c.references.map(r => r.evidenceId)));
  const growth = financial.some(c => /\b(?:growth|grew|QoQ|YoY)\b/i.test(c.text));
  const quotes = buildQuoteBank(evidence.filter(e => ids.has(e.id)), { maxLength: 600, joinAbbreviations: true });
  const selected = [];
  for (const quote of quotes) {
    const kind = growth && /\b(?:growth (?:rates|numbers)|numbers quoted).{0,100}constant currency/i.test(quote.quote) ? 'growth_basis'
      : /\bQ[1-4].{0,45}(?:financial|fiscal)\s+year.{0,45}earnings call/i.test(quote.quote) ? 'reporting_period' : null;
    if (kind && !selected.some(item => item.kind === kind)) selected.push({ kind, quote: quote.quote, evidenceId: quote.evidenceId });
  }
  return selected;
}
