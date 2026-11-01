const priorities = {
  litigation: 100, results: 95, 'M&A': 90, management_change: 85, capex: 75,
  fund_raise: 70, credit_rating: 65, pledging: 65, insider_trading: 55, dividend: 45, earnings_call: 15,
  investor_meetings: 10, unclassified: 5,
};
const routineCategories = new Set(['earnings_call', 'investor_meetings', 'unclassified', 'postal_ballot', 'agm_egm']);

export function evaluateEod(company, asOf, mode) {
  const eod = company.eod;
  if (!eod) return { priceChange: null, volumeRatio: null, warning: company.dataError ?? 'No completed price history available.', alertEligible: false };
  const priceChange = Number.isFinite(eod.close) && Number.isFinite(eod.previousClose) && eod.previousClose > 0
    ? (eod.close / eod.previousClose - 1) * 100 : null;
  const volumeRatio = Number.isFinite(eod.volume) && eod.volume >= 0 && Number.isFinite(eod.averageVolume) && eod.averageVolume > 0 && eod.baselineSessions === 20
    ? eod.volume / eod.averageVolume : null;
  const tooOld = mode !== 'demo' && (!Number.isFinite(Date.parse(eod.fetchedAt)) || !Number.isFinite(Date.parse(`${eod.session}T16:00:00+05:30`)) || Date.parse(asOf) - Date.parse(eod.fetchedAt) > 24 * 3600000 || Date.parse(asOf) - Date.parse(`${eod.session}T16:00:00+05:30`) > 4 * 86400000);
  const warning = company.dataError || eod.comparisonWarning || (tooOld ? 'Cached market data is stale. Refresh ingestion before using alerts.' : null);
  return { priceChange, volumeRatio, warning, alertEligible: !warning };
}

export function buildBriefing(dataset, { hours = 24, priceThreshold = 3, volumeThreshold = 2 } = {}) {
  if (![24, 72, 168].includes(hours)) throw new RangeError('Window must be 24, 72 or 168 hours.');
  if (!Number.isFinite(priceThreshold) || priceThreshold < 0.1 || priceThreshold > 50) throw new RangeError('Price threshold must be between 0.1 and 50%.');
  if (!Number.isFinite(volumeThreshold) || volumeThreshold < 1 || volumeThreshold > 20) throw new RangeError('Volume threshold must be between 1 and 20x.');
  const now = Date.parse(dataset.asOf);
  const symbols = new Set(dataset.portfolio.map(c => c.symbol));
  const announcements = dataset.announcements.filter(a => {
    const time = Date.parse(a.publishedAt);
    return symbols.has(a.symbol) && time <= now && (time >= now - hours * 3600000 || a.keepDelayed);
  }).map(a => ({ ...a, priority: a.priority ?? priorities[a.category] ?? 30, routine: a.routine ?? routineCategories.has(a.category) }))
    .sort((a, b) => b.priority - a.priority || Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
  const portfolio = dataset.portfolio.map(company => ({ ...company, market: evaluateEod(company, dataset.asOf, dataset.mode) }));
  const signals = portfolio.flatMap(company => {
    const { priceChange, volumeRatio, alertEligible } = company.market;
    if (!alertEligible) return [];
    const reasons = [];
    if (priceChange !== null && Math.abs(priceChange) + 1e-9 >= priceThreshold) reasons.push('price');
    if (volumeRatio !== null && volumeRatio + 1e-9 >= volumeThreshold) reasons.push('volume');
    return reasons.length ? [{ symbol: company.symbol, name: company.name, priceChange, volumeRatio, reasons, session: company.eod.session, source: company.eod.source }] : [];
  });
  return {
    mode: dataset.mode, asOf: dataset.asOf, snapshotAt: dataset.snapshotAt ?? dataset.asOf, sources: dataset.sources ?? null, stale: dataset.stale ?? false, push: dataset.push ?? null, hours,
    thresholds: { price: priceThreshold, volume: volumeThreshold },
    portfolio,
    announcements, signals,
    counts: { material: announcements.filter(a => !a.routine).length, routine: announcements.filter(a => a.routine).length, signals: signals.length },
  };
}
