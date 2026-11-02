// Bounded two-row issuer tables: a classification band is not a contract price.
export function extractOrderBand(doc) {
  const labels = 'Significant|Large|Major|Mega|Ultra-Mega';
  const headline = doc.pages.slice(0, 2).map(p => p.text).join(' ').match(new RegExp(`orders?\\s*\\(\\s*(${labels})\\s*\\*?\\s*\\)`, 'i'));
  if (!headline) return null;
  for (const page of doc.pages) {
    const lines = (page.originalText ?? '').split(/\r?\n/).map(l => l.trim());
    const index = lines.findIndex(l => /^Classification\s+/i.test(l));
    if (index < 0 || !/^Value in ₹ Cr\s+/i.test(lines[index + 1] ?? '')) continue;
    const headers = lines[index].replace(/^Classification\s+/i, '').split(/\s+/);
    if (headers.length < 2 || new Set(headers.map(s => s.toLowerCase())).size !== headers.length || headers.some(h => !new RegExp(`^(?:${labels})$`, 'i').test(h))) continue;
    const values = lines[index + 1].replace(/^Value in ₹ Cr\s+/i, '');
    const cells = values.match(/\d[\d,]*\s+to\s+\d[\d,]*|>\s*\d[\d,]*/g) ?? [];
    if (cells.length !== headers.length || cells.join(' ').replace(/\s+/g, '') !== values.replace(/\s+/g, '')) continue;
    const tokens = cells.map(cell => cell.match(/\d[\d,]*/g) ?? []);
    if (tokens.flat().some(v => !/^(?:\d{1,3}(?:,\d{3})+|\d+)$/.test(v))) continue;
    const bounds = tokens.map(b => b.map(v => Number(v.replaceAll(',', ''))));
    if (bounds.some((b, i) => b.length === 2 && b[1] <= b[0] || i > 0 && bounds[i - 1][1] !== b[0])) continue;
    const selected = headers.findIndex(h => h.toLowerCase() === headline[1].toLowerCase());
    if (selected < 0) continue;
    return { label: headers[selected], band: cells[selected], currency: 'INR', unit: 'crore', isExactPrice: false,
      source: { page: page.page, url: doc.url, header: lines[index], row: lines[index + 1] } };
  }
  return null;
}
