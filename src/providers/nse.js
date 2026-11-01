import { createHash } from 'node:crypto';
import { fetchJson, SourceError } from './http.js';
import { marketDate } from './yahoo.js';
import { classifyAnnouncement, announcementContext } from '../domain/announcements.js';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function parseNseTime(value) {
  const match = /^(\d{2})-([A-Z][a-z]{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const [, day, month, year, hour, minute, second] = match;
  const m = months.indexOf(month) + 1;
  if (!m || +hour > 23 || +minute > 59 || +second > 59) return null;
  const local = `${year}-${String(m).padStart(2, '0')}-${day}`;
  const millis = Date.parse(`${local}T${hour}:${minute}:${second}+05:30`);
  return Number.isFinite(millis) && marketDate(millis) === local ? new Date(millis).toISOString() : null;
}
export function filingUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['nsearchives.nseindia.com', 'archives.nseindia.com'].includes(url.hostname) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export function nseUrl(now, { from, to } = {}) {
  const format = date => marketDate(date).split('-').reverse().join('-');
  const query = new URLSearchParams({ index: 'equities', from_date: format(from ?? new Date(now).getTime() - 7 * 86400000), to_date: format(to ?? now) });
  return `https://www.nseindia.com/api/corporate-announcements?${query}`;
}
export function normalizeNse(rows, symbols, fetchedAt, requestUrl) {
  if (!Array.isArray(rows)) throw new SourceError('NSE announcement schema is unsupported.');
  const wanted = new Set(symbols); const seen = new Set(); const announcements = []; let rejected = 0;
  for (const row of rows) {
    if (!wanted.has(row.symbol)) continue;
    const publishedAt = parseNseTime(row.an_dt);
    if (!publishedAt || typeof row.desc !== 'string' || typeof row.attchmntText !== 'string') { rejected++; continue; }
    const url = filingUrl(row.attchmntFile);
    const identity = row.seq_id ? `${row.symbol}|seq:${row.seq_id}` : `${row.symbol}|${publishedAt}|${url ?? row.attchmntText}`;
    const id = `nse-${createHash('sha256').update(identity).digest('hex').slice(0, 24)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const category = classifyAnnouncement(row.desc, row.attchmntText);
    announcements.push({
      id, symbol: row.symbol, category, title: row.desc, summary: row.attchmntText,
      why: announcementContext(category), publishedAt, fetchedAt, classification: 'metadata rules',
      source: { label: 'NSE corporate announcement', url, requestUrl,
        evidence: 'Title and description supplied by NSE. The linked document has not yet been parsed or analysed.' },
    });
  }
  return { announcements, rejected, totalSourceRows: rows.length };
}
export async function fetchAnnouncements(symbols, fetchedAt, options = {}) {
  const requestUrl = nseUrl(fetchedAt, options); const raw = await fetchJson(requestUrl, options);
  return { raw, ...normalizeNse(raw, symbols, fetchedAt, requestUrl), requestUrl };
}
