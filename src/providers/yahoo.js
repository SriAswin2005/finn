import { fetchJson, SourceError } from './http.js';

export const marketDate = value => new Date(new Date(value).getTime() + 330 * 60000).toISOString().slice(0, 10);
export function yahooUrl(symbol) {
  if (!/^[A-Z0-9&-]{1,30}$/.test(symbol)) throw new SourceError('Invalid NSE symbol.');
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}.NS?interval=1d&range=3mo&events=splits`;
}

export function normalizeYahoo(body, symbol, fetchedAt) {
  const result = body?.chart?.result?.[0];
  if (body?.chart?.error || !result) throw new SourceError('No price history returned for this symbol.');
  if (result.meta?.symbol !== `${symbol}.NS` || result.meta?.currency !== 'INR') throw new SourceError('Price source returned an unexpected symbol or currency.');
  const quote = result.indicators?.quote?.[0];
  if (!Array.isArray(result.timestamp) || !Array.isArray(quote?.close) || !Array.isArray(quote?.volume)) throw new SourceError('Price history schema is unsupported.');
  const today = marketDate(fetchedAt);
  const afterClose = new Date(fetchedAt).getTime() >= Date.parse(`${today}T16:00:00+05:30`);
  const bySession = new Map();
  let latestSourceSession = null;
  for (let i = 0; i < result.timestamp.length; i++) {
    const timestamp = result.timestamp[i];
    if (!Number.isFinite(timestamp) || timestamp <= 0) continue;
    const session = marketDate(timestamp * 1000);
    if (session > today || (session === today && !afterClose)) continue;
    if (!latestSourceSession || session > latestSourceSession) latestSourceSession = session;
    const close = quote.close[i]; const volume = quote.volume[i];
    if (!Number.isFinite(close) || close <= 0 || !Number.isFinite(volume) || volume < 0) continue;
    bySession.set(session, { session, close, volume });
  }
  const history = [...bySession.values()].sort((a, b) => a.session.localeCompare(b.session)).slice(-21);
  if (history.length < 2) throw new SourceError('Fewer than two completed valid sessions are available.');
  const current = history.at(-1); const previous = history.at(-2); const baseline = history.slice(0, -1);
  const splitSessions = Object.values(result.events?.splits ?? {}).filter(event => Number.isFinite(event.date)).map(event => marketDate(event.date * 1000));
  const splitInBaseline = splitSessions.some(date => date > baseline[0].session && date <= current.session);
  return {
    ...current, previousClose: previous.close, previousSession: previous.session,
    averageVolume: baseline.reduce((sum, day) => sum + day.volume, 0) / baseline.length,
    baselineSessions: baseline.length, history, currency: 'INR', fetchedAt,
    source: { label: 'Yahoo Finance · NSE daily history', url: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}.NS/history/`, requestUrl: yahooUrl(symbol) },
    latestSourceSession,
    hasIncompleteLatestSession: latestSourceSession > current.session,
    hasSplitInBaseline: splitInBaseline,
    splitSessions,
    comparisonWarning: splitInBaseline ? 'A stock split occurs in the comparison window. Alerts are suppressed until the baseline is comparable.' : latestSourceSession > current.session ? `The newer source session ${latestSourceSession} has missing price or volume. Showing ${current.session}; alerts are paused.` : null,
  };
}

export async function fetchPrices(symbol, fetchedAt, options) {
  const raw = await fetchJson(yahooUrl(symbol), options);
  return { raw, eod: normalizeYahoo(raw, symbol, fetchedAt) };
}
