import { fetchText, SourceError } from './http.js';
import { parseNseTime } from './nse.js';
import { marketDate } from './yahoo.js';

export function nseEodUrl(session) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(session) || new Date(`${session}T00:00:00Z`).toISOString().slice(0, 10) !== session) throw new SourceError('Invalid EOD report date.');
  return `https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_${session.split('-').reverse().join('')}.csv`;
}
export function normalizeNseEod(csv, session, symbols) {
  const lines = csv.trim().replace(/^\uFEFF/, '').split(/\r?\n/);
  const header = lines.shift()?.split(',').map(value => value.trim());
  const required = ['SYMBOL', 'SERIES', 'DATE1', 'PREV_CLOSE', 'CLOSE_PRICE', 'TTL_TRD_QNTY'];
  if (!header || required.some(column => !header.includes(column))) throw new SourceError('NSE closing-report schema is unsupported.');
  const wanted = new Set(symbols); const rows = new Map(); const rejected = [];
  for (const line of lines) {
    const fields = line.split(',').map(value => value.trim());
    const row = Object.fromEntries(header.map((name, index) => [name, fields[index]]));
    if (!wanted.has(row.SYMBOL) || row.SERIES !== 'EQ') continue;
    if (fields.length !== header.length) { rejected.push(row.SYMBOL); continue; }
    const timestamp = parseNseTime(`${row.DATE1} 00:00:00`);
    if (!timestamp || marketDate(timestamp) !== session) throw new SourceError('NSE closing report returned a different session.');
    const numeric = value => /^\d+(?:\.\d+)?$/.test(value ?? '') ? Number(value) : NaN;
    const previousClose = numeric(row.PREV_CLOSE); const close = numeric(row.CLOSE_PRICE); const volume = numeric(row.TTL_TRD_QNTY);
    if (!Number.isFinite(close) || !Number.isFinite(previousClose) || close <= 0 || previousClose <= 0 || !Number.isSafeInteger(volume) || volume < 0) { rejected.push(row.SYMBOL); continue; }
    if (rows.has(row.SYMBOL)) throw new SourceError('NSE closing report contains ambiguous duplicate equity rows.');
    rows.set(row.SYMBOL, { symbol: row.SYMBOL, series: 'EQ', session, close, previousClose, volume, rawLine: line });
  }
  return { rows, rejected };
}
export function completeEod(eod, row, symbol, fetchedAt) {
  if (row.symbol !== symbol || eod.currency !== 'INR' || row.session !== eod.latestSourceSession || row.session <= eod.session) throw new SourceError('NSE closing record does not match the incomplete market session.');
  const today = marketDate(fetchedAt);
  if (row.session > today || (row.session === today && Date.parse(fetchedAt) < Date.parse(`${today}T16:00:00+05:30`))) throw new SourceError('The NSE session is not yet complete.');
  const baseline = eod.history.filter(day => day.session < row.session).slice(-20);
  if (!baseline.length) throw new SourceError('No prior valid volume sessions are available.');
  const splitAffected = eod.hasSplitInBaseline || (eod.splitSessions ?? []).some(session => session > baseline[0].session && session <= row.session);
  const current = { session: row.session, close: row.close, volume: row.volume };
  return {
    ...eod, ...current, previousClose: row.previousClose, previousSession: baseline.at(-1).session,
    averageVolume: baseline.reduce((sum, day) => sum + day.volume, 0) / baseline.length,
    baselineSessions: baseline.length, history: [...baseline, current], fetchedAt,
    source: { label: 'NSE official EOD closing report', url: nseEodUrl(row.session), requestUrl: nseEodUrl(row.session) },
    baselineSource: eod.source, officialRecord: row, hasIncompleteLatestSession: false,
    hasSplitInBaseline: Boolean(splitAffected),
    comparisonWarning: splitAffected ? 'A stock split occurs in the comparison window. Alerts are suppressed until the baseline is comparable.' : null,
  };
}
export async function fetchNseEod(session, symbols, options) {
  const requestUrl = nseEodUrl(session); const raw = await fetchText(requestUrl, options);
  return { ...normalizeNseEod(raw, session, symbols), raw, requestUrl };
}
