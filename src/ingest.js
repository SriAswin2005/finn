import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { portfolio } from './config/portfolio.js';
import { fetchPrices } from './providers/yahoo.js';
import { fetchAnnouncements } from './providers/nse.js';
import { fetchNseEod, completeEod } from './providers/nse-eod.js';
import { readSnapshot, writeJsonAtomic, liveSnapshotPath, recordedSnapshotPath, dataDirectory } from './storage/snapshots.js';

// Independent source failures preserve the last good records with their original fetch times.
export async function collectSnapshot({ previous = null, now = new Date(), companies = portfolio, prices = fetchPrices, announcements = fetchAnnouncements, closingReport = fetchNseEod } = {}) {
  const fetchedAt = now.toISOString(); const slots = [...companies]; const records = new Map(); const errors = []; const raw = {};
  async function worker() {
    while (slots.length) {
      const company = slots.shift();
      try {
        const result = await prices(company.symbol, fetchedAt);
        records.set(company.symbol, { ...company, eod: result.eod, dataError: null });
        raw[company.symbol] = result.raw;
      } catch (error) {
        const old = previous?.portfolio.find(item => item.symbol === company.symbol)?.eod;
        records.set(company.symbol, { ...company, eod: old ?? null, dataError: error.message });
        errors.push({ symbol: company.symbol, error: error.message });
      }
    }
  }
  const announcementTask = announcements(companies.map(c => c.symbol), fetchedAt).then(result => ({ result })).catch(error => ({ error }));
  await Promise.all(Array.from({ length: Math.min(3, companies.length) }, worker));
  const reportErrors = []; let completed = 0;
  const sessions = [...new Set([...records.values()].filter(company => !company.dataError && company.eod?.hasIncompleteLatestSession).map(company => company.eod.latestSourceSession))].sort().slice(-2);
  for (const session of sessions) {
    try {
      const report = await closingReport(session, companies.map(company => company.symbol));
      raw.closingReports ??= {}; raw.closingReports[session] = { url: report.requestUrl, csv: report.raw };
      for (const company of records.values()) {
        if (company.dataError || !company.eod?.hasIncompleteLatestSession || company.eod.latestSourceSession !== session) continue;
        const row = report.rows.get(company.symbol); if (!row) continue;
        company.eod = completeEod(company.eod, row, company.symbol, fetchedAt); completed++;
      }
    } catch (error) { reportErrors.push({ symbol: `NSE report ${session}`, error: error.message }); }
  }
  const result = await announcementTask;
  let filings; let announcementStatus;
  if (result.error) {
    filings = previous?.announcements ?? [];
    announcementStatus = { label: 'NSE announcements', status: previous?.sources.announcements.fetchedAt ? 'stale' : 'unavailable', fetchedAt: previous?.sources.announcements.fetchedAt ?? null, error: result.error.message };
  } else {
    filings = result.result.announcements;
    raw.announcements = result.result.raw;
    announcementStatus = { label: 'NSE announcements', status: result.result.rejected ? 'partial' : 'ok', fetchedAt, requestUrl: result.result.requestUrl, error: result.result.rejected ? `${result.result.rejected} portfolio records had unsupported metadata.` : null, totalSourceRows: result.result.totalSourceRows };
  }
  const snapshot = {
    schemaVersion: 1, mode: 'live', asOf: fetchedAt,
    portfolio: companies.map(company => records.get(company.symbol)), announcements: filings,
    sources: {
      prices: { label: completed ? 'Yahoo history + NSE official EOD' : 'Yahoo Finance EOD', status: errors.length === companies.length ? 'unavailable' : errors.length || reportErrors.length ? 'partial' : 'ok', fetchedAt: errors.length === companies.length ? previous?.sources.prices.fetchedAt ?? null : fetchedAt, errors: [...errors, ...reportErrors], officialRowsUsed: completed },
      announcements: announcementStatus,
    },
  };
  snapshot.sources.prices.warnings = snapshot.portfolio.filter(company => company.eod?.comparisonWarning).map(company => ({ symbol: company.symbol, warning: company.eod.comparisonWarning }));
  if (snapshot.sources.prices.status === 'ok' && snapshot.sources.prices.warnings.length) snapshot.sources.prices.status = 'partial';
  return { snapshot, raw };
}

async function run() {
  const record = process.argv.includes('--record');
  const previous = await readSnapshot(liveSnapshotPath);
  const { snapshot, raw } = await collectSnapshot({ previous });
  const rawHash = createHash('sha256').update(JSON.stringify(raw)).digest('hex');
  snapshot.rawSha256 = rawHash;
  const rawPath = resolve(dataDirectory, `cache/raw/${rawHash}.json`);
  await writeJsonAtomic(rawPath, raw);
  await writeJsonAtomic(liveSnapshotPath, snapshot);
  if (record) {
    if (snapshot.sources.announcements.status === 'ok' && snapshot.portfolio.every(company => company.eod && !company.dataError)) await writeJsonAtomic(recordedSnapshotPath, { ...snapshot, mode: 'recorded' });
    else console.error('Live snapshot saved with source errors; recorded snapshot was not replaced.');
  }
  console.log(`Saved snapshot ${snapshot.asOf}`);
  console.log(`Prices: ${snapshot.portfolio.filter(c => c.eod && !c.dataError).length}/${portfolio.length}; NSE portfolio announcements: ${snapshot.announcements.length}`);
  for (const source of Object.values(snapshot.sources)) console.log(`${source.label}: ${source.status}${source.error ? ` — ${source.error}` : ''}`);
  for (const error of snapshot.sources.prices.errors) console.log(`${error.symbol}: ${error.error}`);
  if (snapshot.sources.prices.warnings.length) console.log(`${snapshot.sources.prices.warnings.length} market records carry comparison warnings; inspect Sources & freshness in FINN.`);
  if (Object.values(snapshot.sources).some(source => source.status !== 'ok')) process.exitCode = 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run().catch(error => { console.error(error.message); process.exitCode = 1; });
