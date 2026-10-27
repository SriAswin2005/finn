const priorities = {
  litigation: 100, results: 95, 'M&A': 90, management_change: 85, capex: 75,
  fund_raise: 70, credit_rating: 65, dividend: 45, earnings_call: 15,
  investor_meetings: 10, unclassified: 5,
};
const routineCategories = new Set(['earnings_call', 'investor_meetings', 'unclassified', 'postal_ballot', 'agm_egm']);

export function buildBriefing(dataset, { hours = 24, priceThreshold = 3, volumeThreshold = 2 } = {}) {
  if (![24, 72, 168].includes(hours)) throw new RangeError('Window must be 24, 72 or 168 hours.');
  if (!Number.isFinite(priceThreshold) || priceThreshold < 0.1 || priceThreshold > 50) throw new RangeError('Price threshold must be between 0.1 and 50%.');
  if (!Number.isFinite(volumeThreshold) || volumeThreshold < 1 || volumeThreshold > 20) throw new RangeError('Volume threshold must be between 1 and 20x.');
  const now = Date.parse(dataset.asOf);
  const symbols = new Set(dataset.portfolio.map(c => c.symbol));
  const announcements = dataset.announcements.filter(a => {
    const time = Date.parse(a.publishedAt);
    return symbols.has(a.symbol) && time <= now && time >= now - hours * 3600000;
  }).map(a => ({ ...a, priority: priorities[a.category] ?? 30, routine: routineCategories.has(a.category) }))
    .sort((a, b) => b.priority - a.priority || Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
  const signals = dataset.portfolio.flatMap(company => {
    const eod = company.eod;
    if (!eod) return [];
    const priceChange = Number.isFinite(eod.close) && Number.isFinite(eod.previousClose) && eod.previousClose > 0
      ? (eod.close / eod.previousClose - 1) * 100 : null;
    const volumeRatio = Number.isFinite(eod.volume) && eod.volume >= 0 && Number.isFinite(eod.averageVolume) && eod.averageVolume > 0 && eod.baselineSessions === 20
      ? eod.volume / eod.averageVolume : null;
    const reasons = [];
    if (priceChange !== null && Math.abs(priceChange) + 1e-9 >= priceThreshold) reasons.push('price');
    if (volumeRatio !== null && volumeRatio + 1e-9 >= volumeThreshold) reasons.push('volume');
    return reasons.length ? [{ symbol: company.symbol, name: company.name, priceChange, volumeRatio, reasons, session: eod.session }] : [];
  });
  return {
    mode: dataset.mode, asOf: dataset.asOf, hours,
    thresholds: { price: priceThreshold, volume: volumeThreshold },
    portfolio: dataset.portfolio.map(({ eod, ...company }) => company),
    announcements, signals,
    counts: { material: announcements.filter(a => !a.routine).length, routine: announcements.filter(a => a.routine).length, signals: signals.length },
  };
}
