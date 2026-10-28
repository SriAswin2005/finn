import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalizeYahoo } from '../src/providers/yahoo.js';
import { normalizeNse, parseNseTime, filingUrl } from '../src/providers/nse.js';
import { classifyAnnouncement } from '../src/domain/announcements.js';
import { fetchJson } from '../src/providers/http.js';
import { normalizeNseEod, completeEod, nseEodUrl } from '../src/providers/nse-eod.js';
import { collectSnapshot } from '../src/ingest.js';
import { getDataset, DatasetUnavailable } from '../src/providers/snapshot.js';
import { writeJsonAtomic, readSnapshot } from '../src/storage/snapshots.js';
import { buildBriefing } from '../src/domain/briefing.js';

function chart() {
  return { chart: { result: [{
    meta: { symbol: 'TEST.NS', currency: 'INR' },
    timestamp: Array.from({ length: 23 }, (_, i) => Date.parse(`2026-10-${String(i + 1).padStart(2, '0')}T09:15:00+05:30`) / 1000),
    indicators: { quote: [{ close: Array.from({ length: 23 }, (_, i) => 100 + i), volume: Array.from({ length: 23 }, (_, i) => 1000 + i * 10) }] },
  }] } };
}

test('Yahoo excludes the unfinished session and uses exactly the prior 20 volumes', () => {
  const body = chart();
  const beforeClose = normalizeYahoo(body, 'TEST', '2026-10-23T09:59:59Z');
  assert.equal(beforeClose.session, '2026-10-22');
  const eod = normalizeYahoo(body, 'TEST', '2026-10-23T10:30:00Z');
  assert.equal(eod.session, '2026-10-23');
  assert.equal(eod.previousClose, 121);
  assert.equal(eod.baselineSessions, 20);
  assert.equal(eod.averageVolume, 1115); // indices 2..21; current index 22 is excluded.
  assert.equal(eod.history.length, 21);
});

test('Yahoo handles missing sessions, partial history, symbol mismatch and split warnings', () => {
  const body = chart();
  body.chart.result[0].indicators.quote[0].volume[22] = null;
  const incomplete = normalizeYahoo(body, 'TEST', '2026-10-24T12:00:00Z');
  assert.equal(incomplete.session, '2026-10-22');
  assert.match(incomplete.comparisonWarning, /missing price or volume/);
  body.chart.result[0].events = { splits: { a: { date: Date.parse('2026-10-22T03:45:00Z') / 1000 } } };
  const eod = normalizeYahoo(body, 'TEST', '2026-10-24T12:00:00Z');
  assert.match(eod.comparisonWarning, /split/);
  assert.equal(buildBriefing({ mode: 'live', asOf: eod.fetchedAt, portfolio: [{ symbol: 'TEST', eod }], announcements: [] }, { priceThreshold: 0.1, volumeThreshold: 1 }).signals.length, 0);
  assert.throws(() => normalizeYahoo(body, 'OTHER', '2026-10-24T12:00:00Z'), /unexpected symbol/);
  body.chart.result[0].timestamp = body.chart.result[0].timestamp.slice(0, 3);
  assert.equal(normalizeYahoo(body, 'TEST', '2026-10-24T12:00:00Z').baselineSessions, 2);
});

test('NSE dates are interpreted as IST; invalid dates and unsafe links are rejected', () => {
  assert.equal(parseNseTime('28-Oct-2026 00:30:01'), '2026-10-27T19:00:01.000Z');
  for (const date of ['31-Feb-2026 12:00:00', '28-Oct-2026 25:00:00', '2026-10-28', null]) assert.equal(parseNseTime(date), null);
  assert.equal(filingUrl('https://nsearchives.nseindia.com/corporate/example.pdf'), 'https://nsearchives.nseindia.com/corporate/example.pdf');
  for (const url of ['javascript:alert(1)', 'http://nsearchives.nseindia.com/a', 'https://nsearchives.nseindia.com.attacker.test/a', 'https://user:pass@nsearchives.nseindia.com/a']) assert.equal(filingUrl(url), null);
});

test('NSE normalization scopes and deduplicates disclosures; unknowns remain visible', () => {
  const row = { symbol: 'TEST', seq_id: '123', an_dt: '27-Oct-2026 12:00:00', desc: 'Updates', attchmntText: 'A novel disclosure', attchmntFile: 'https://nsearchives.nseindia.com/corporate/test.pdf' };
  const data = normalizeNse([row, row, { ...row, symbol: 'OTHER' }, { ...row, an_dt: 'bad' }], ['TEST'], '2026-10-28T00:00:00Z', 'https://www.nseindia.com/api/corporate-announcements');
  assert.equal(data.announcements.length, 1);
  assert.equal(data.rejected, 1);
  assert.equal(data.announcements[0].category, 'other');
  assert.equal(data.announcements[0].summary, row.attchmntText);
  assert.equal(buildBriefing({ mode: 'live', asOf: '2026-10-28T00:00:00Z', portfolio: [{ symbol: 'TEST' }], announcements: data.announcements }).counts.material, 1);
  assert.throws(() => normalizeNse({ error: 'blocked' }, ['TEST'], '2026-10-28T00:00:00Z'), /schema/);
  assert.equal(classifyAnnouncement('Board Meeting Intimation', 'to approve financial results'), 'board_meeting');
  assert.equal(classifyAnnouncement('Outcome of Board Meeting', 'Company has submitted financial results'), 'results');
  assert.equal(classifyAnnouncement('Updates', 'The meeting of the Board of Directors is scheduled to consider financial results'), 'board_meeting');
  assert.equal(classifyAnnouncement('Financial Results', 'Quarterly financial results'), 'results');
  assert.equal(classifyAnnouncement('Updates', 'Investor Conference'), 'investor_meetings');
  assert.equal(classifyAnnouncement('Updates', 'Analyst(s)/Investor(s) meet.'), 'investor_meetings');
});

test('HTTP source retries are bounded; permanent errors and oversized payloads fail', async () => {
  let attempts = 0;
  const result = await fetchJson('https://example.test/data', { fetchImpl: async () => ++attempts === 1 ? new Response('', { status: 503 }) : new Response('{"ok":true}'), wait: async () => {} });
  assert.deepEqual(result, { ok: true }); assert.equal(attempts, 2);
  attempts = 0;
  await assert.rejects(fetchJson('https://example.test/data', { fetchImpl: async () => { attempts++; return new Response('', { status: 403 }); } }), /403/);
  assert.equal(attempts, 1);
  await assert.rejects(fetchJson('https://example.test/data', { fetchImpl: async () => new Response('123456'), maxBytes: 5 }), /size limit/);
  await assert.rejects(fetchJson('https://example.test/data', { fetchImpl: async () => new Response('<html>blocked</html>') }), /valid JSON/);
  attempts = 0;
  await assert.rejects(fetchJson('https://example.test/data', { fetchImpl: async () => { attempts++; throw new Error('network'); }, wait: async () => {} }), /connection failed/);
  assert.equal(attempts, 2);
});

test('source requests abort on their deadline', async () => {
  await assert.rejects(fetchJson('https://example.test/data', {
    timeoutMs: 10, retries: 0,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      const keepAlive = setTimeout(() => reject(new Error('test safety deadline')), 1000);
      signal.addEventListener('abort', () => { clearTimeout(keepAlive); reject(signal.reason); }, { once: true });
    }),
  }), /TimeoutError/);
});

test('source failures preserve old evidence and timestamps without creating fresh alerts', async () => {
  const oldTime = '2026-10-24T12:00:00.000Z';
  const oldEod = normalizeYahoo(chart(), 'TEST', oldTime);
  const previous = { portfolio: [{ symbol: 'TEST', eod: oldEod }], announcements: [{ id: 'old' }], sources: { prices: { fetchedAt: oldTime }, announcements: { fetchedAt: oldTime } } };
  const failure = async () => { throw new Error('Source unavailable'); };
  const { snapshot } = await collectSnapshot({ previous, now: new Date('2026-10-28T12:00:00Z'), companies: [{ symbol: 'TEST' }], prices: failure, announcements: failure });
  assert.equal(snapshot.portfolio[0].eod.fetchedAt, oldTime);
  assert.equal(snapshot.sources.announcements.status, 'stale');
  assert.equal(snapshot.announcements[0].id, 'old');
  assert.match(snapshot.portfolio[0].dataError, /unavailable/);
  const view = buildBriefing({ ...snapshot, announcements: [] }, { priceThreshold: 0.1, volumeThreshold: 1 });
  assert.equal(view.signals.length, 0);
});

test('snapshot reads are explicit, atomic, stale-aware and never fall back to fixtures', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'finn-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, 'snapshot.json');
  assert.equal(await readSnapshot(path), null);
  await assert.rejects(getDataset('live', { livePath: path }), DatasetUnavailable);
  const snapshot = { schemaVersion: 1, asOf: '2026-10-24T12:00:00Z', portfolio: [], announcements: [], sources: { prices: { status: 'ok', fetchedAt: '2026-10-24T12:00:00Z' } } };
  await writeJsonAtomic(path, snapshot);
  await writeJsonAtomic(path, snapshot); // Replacement works on Windows too.
  const live = await getDataset('live', { livePath: path, now: new Date('2026-10-28T12:00:00Z') });
  assert.equal(live.sources.prices.status, 'stale');
  assert.equal(live.stale, true);
  assert.equal(live.mode, 'live');
  const recorded = await getDataset('recorded', { recordedPath: path, now: new Date('2026-11-02T12:00:00Z') });
  assert.equal(recorded.asOf, snapshot.asOf); assert.equal(recorded.mode, 'recorded');
  await assert.rejects(getDataset('nonsense'), RangeError);
});

test('recorded source snapshot reproduces calculations for all configured companies', async () => {
  const data = await getDataset('recorded');
  assert.equal(data.portfolio.length, 15);
  assert.ok(data.announcements.length > 0);
  for (const company of data.portfolio) {
    const eod = company.eod;
    assert.equal(eod.history.length, 21);
    const baseline = eod.history.slice(0, 20);
    assert.equal(eod.averageVolume, baseline.reduce((sum, session) => sum + session.volume, 0) / 20);
    assert.equal(eod.close, eod.history[20].close);
    if (eod.officialRecord) {
      assert.equal(eod.previousClose, eod.officialRecord.previousClose);
      assert.equal(eod.close, eod.officialRecord.close); assert.equal(eod.volume, eod.officialRecord.volume);
      assert.equal(eod.source.label, 'NSE official EOD closing report');
      assert.equal(eod.baselineSource.label, 'Yahoo Finance · NSE daily history');
    } else {
      assert.equal(eod.previousClose, eod.history[19].close);
      assert.equal(eod.source.label, 'Yahoo Finance · NSE daily history');
    }
  }
  for (const filing of data.announcements) assert.ok(filingUrl(filing.source.url));
});

test('official NSE EOD fills only the matching completed session with separate baseline provenance', () => {
  const body = chart(); body.chart.result[0].indicators.quote[0].close[22] = null;
  const fetchedAt = '2026-10-24T12:00:00Z'; const incomplete = normalizeYahoo(body, 'TEST', fetchedAt);
  const csv = 'SYMBOL, SERIES, DATE1, PREV_CLOSE, CLOSE_PRICE, TTL_TRD_QNTY\nTEST, EQ, 23-Oct-2026, 121.10, 124.50, 2500\nTEST, BE, 23-Oct-2026, 90, 91, 100\nOTHER, EQ, 23-Oct-2026, 2, 3, 10';
  const report = normalizeNseEod(csv, '2026-10-23', ['TEST']); assert.equal(report.rows.size, 1);
  const eod = completeEod(incomplete, report.rows.get('TEST'), 'TEST', fetchedAt);
  assert.equal(eod.session, '2026-10-23'); assert.equal(eod.previousClose, 121.10); assert.equal(eod.close, 124.50);
  assert.equal(eod.volume, 2500); assert.equal(eod.baselineSessions, 20); assert.equal(eod.averageVolume, 1115);
  assert.equal(eod.comparisonWarning, null); assert.equal(eod.source.url, nseEodUrl(eod.session));
  assert.equal(eod.baselineSource.url, incomplete.source.url);
  const view = buildBriefing({ mode: 'live', asOf: fetchedAt, portfolio: [{ symbol: 'TEST', eod }], announcements: [] });
  assert.deepEqual(view.signals[0].reasons, ['volume']);
  assert.throws(() => completeEod(incomplete, report.rows.get('TEST'), 'OTHER', fetchedAt), /does not match/);
  assert.throws(() => completeEod(incomplete, report.rows.get('TEST'), 'TEST', '2026-10-23T09:00:00Z'), /not yet complete/);
  const split = completeEod({ ...incomplete, splitSessions: ['2026-10-23'] }, report.rows.get('TEST'), 'TEST', fetchedAt);
  assert.match(split.comparisonWarning, /stock split/);
});

test('NSE EOD rejects wrong dates/schema/duplicates and does not interpret missing values as zero', () => {
  const header = 'SYMBOL,SERIES,DATE1,PREV_CLOSE,CLOSE_PRICE,TTL_TRD_QNTY\n';
  assert.throws(() => normalizeNseEod(header + 'TEST,EQ,22-Oct-2026,100,102,10', '2026-10-23', ['TEST']), /different session/);
  assert.throws(() => normalizeNseEod('<html>blocked</html>', '2026-10-23', ['TEST']), /schema/);
  const row = 'TEST,EQ,23-Oct-2026,100,102,10';
  assert.throws(() => normalizeNseEod(header + row + '\n' + row, '2026-10-23', ['TEST']), /duplicate/);
  const missing = normalizeNseEod(header + 'TEST,EQ,23-Oct-2026,100,-,10', '2026-10-23', ['TEST']);
  assert.equal(missing.rows.size, 0); assert.deepEqual(missing.rejected, ['TEST']);
});

test('collector completes missing Yahoo closes from one NSE report and preserves warnings on failure', async () => {
  const body = chart(); body.chart.result[0].indicators.quote[0].close[22] = null;
  const now = new Date('2026-10-24T12:00:00Z'); const eod = normalizeYahoo(body, 'TEST', now.toISOString());
  const options = {
    now, companies: [{ symbol: 'TEST', name: 'Owned test company' }], prices: async () => ({ eod, raw: body }),
    announcements: async () => ({ announcements: [], raw: [], rejected: 0, totalSourceRows: 0, requestUrl: 'https://www.nseindia.com/api/corporate-announcements' }),
  };
  const csv = 'SYMBOL,SERIES,DATE1,PREV_CLOSE,CLOSE_PRICE,TTL_TRD_QNTY\nTEST,EQ,23-Oct-2026,121.1,124.5,2500';
  let calls = 0;
  const successful = await collectSnapshot({ ...options, closingReport: async session => { calls++; return { ...normalizeNseEod(csv, session, ['TEST']), raw: csv, requestUrl: nseEodUrl(session) }; } });
  assert.equal(calls, 1); assert.equal(successful.snapshot.sources.prices.officialRowsUsed, 1);
  assert.equal(successful.snapshot.sources.prices.status, 'ok');
  assert.equal(successful.snapshot.portfolio[0].eod.session, '2026-10-23');
  const failed = await collectSnapshot({ ...options, closingReport: async () => { throw new Error('Source unavailable'); } });
  assert.equal(failed.snapshot.sources.prices.status, 'partial');
  assert.equal(failed.snapshot.portfolio[0].eod.session, '2026-10-22');
  assert.match(failed.snapshot.portfolio[0].eod.comparisonWarning, /alerts are paused/);
});
