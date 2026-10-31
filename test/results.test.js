import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildResults, financialChange } from '../src/domain/results.js';
import { getDataset } from '../src/providers/snapshot.js';

const record = JSON.parse(await readFile(new URL('../data/filings.json', import.meta.url))).items.find(item => item.kind === 'results');
test('recorded results calculate comparable Revenue/PBT/PAT and the explicitly derived EBITDA proxy', async () => {
  const view = buildResults(record); const byMetric = new Map(view.rows.map(row => [row.metric, row]));
  assert.equal(byMetric.get('revenue').value, 78749.94);
  assert.equal(byMetric.get('pat').value, 5202.10);
  assert.equal(byMetric.get('pbt').value, 7641.06);
  assert.equal(byMetric.get('ebitda').value, 6844.65);
  assert.ok(Math.abs(byMetric.get('revenue').yoy.percent - 15.836794) < 0.001);
  const data = await getDataset('recorded');
  const filing = data.announcements.find(item => item.symbol === 'LT' && item.source.url === record.filingUrl);
  assert.equal(filing.details.source.page, 11); assert.equal(filing.details.scope, 'consolidated');
});

test('financial parsing refuses uncertain units, shifted columns and mixed periods; missing inputs are not zero', () => {
  assert.throws(() => buildResults({ ...record, unit: 'lakh' }), /units/);
  assert.throws(() => buildResults({ ...record, columns: ['2026-09-30', '2025-09-30', '2026-06-30', ...record.columns.slice(3)] }), /comparable/);
  assert.throws(() => buildResults({ ...record, rows: [{ metric: 'revenue', values: ['1.00'] }] }), /column/);
  assert.throws(() => buildResults({ ...record, rows: [{ metric: 'revenue', values: ['1,234.50', ...Array(5).fill('1.00')] }] }), /Ambiguous/);
  const absent = buildResults({ ...record, rows: record.rows.filter(row => row.metric !== 'financeCost') });
  assert.equal(absent.rows.find(row => row.metric === 'ebitda').value, null);
  assert.equal(financialChange(10, 0).percent, null);
  assert.equal(financialChange(10, -10).label, 'Loss → profit');
  assert.equal(financialChange(null, 10).percent, null);
});

test('management background retains the primary profile page and its historical disclosure date', async () => {
  const data = await getDataset('recorded'); const event = data.announcements.find(item => item.symbol === 'HDFCBANK' && item.details?.kind === 'management_change');
  assert.equal(event.details.incoming, 'Anup Bagchi'); assert.equal(event.details.effectiveDate, '2026-10-27');
  assert.equal(event.details.profileAsOf, '2026-10-01'); assert.equal(event.details.profileSource.page, 3);
  assert.match(event.details.profileSource.url, /^https:\/\/nsearchives\.nseindia\.com\//);
  assert.equal(event.details.background.length, 3); assert.match(event.details.note, /not independently verified/);
});
