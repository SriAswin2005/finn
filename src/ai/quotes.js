// Quote text is selected before generation; a model may reference IDs but cannot
// write, lengthen or repair its own supporting quotations.
export function buildQuoteBank(evidence) {
  const bank = [];
  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
  for (const item of evidence) {
    for (const { segment } of segmenter.segment(item.text)) {
      let remaining = segment.trim();
      while (remaining.length) {
        let end = Math.min(remaining.length, 220);
        if (end < remaining.length) end = remaining.lastIndexOf(' ', end) || end;
        const quote = remaining.slice(0, end).trim();
        if (quote.length >= 20) bank.push({ id: `q${bank.length + 1}`, evidenceId: item.id, quote });
        remaining = remaining.slice(end).trim();
      }
    }
  }
  return bank;
}

export function resolveQuoteReferences(value, bank) {
  const byId = new Map(bank.map(quote => [quote.id, quote]));
  if (!value || !Array.isArray(value.claims)) throw new Error('Invalid claim list.');
  return { ...value, claims: value.claims.map(claim => {
    if (!claim || !Array.isArray(claim.references)) throw new Error('Invalid reference list.');
    return { ...claim, references: claim.references.map(ref => {
      const selected = byId.get(ref?.quoteId);
      if (!selected) throw new Error('Unknown source quote.');
      return { evidenceId: selected.evidenceId, quote: selected.quote };
    }) };
  }) };
}
