import test from 'node:test';
import assert from 'node:assert/strict';
import { comparableChange, extractFinancialMetrics } from '../src/push/metrics.js';

const document = { sha256: 'a'.repeat(64), url: 'https://nsearchives.nseindia.com/corporate/fixture.pdf', pages: [{ page: 1, text: 'Sales Volume and Financials are on consolidated basis.', layoutText: '' }, { page: 2, text: 'Financial Snapshot', layoutText: 'Profit & Loss (Rs  Q2FY26  Q1FY27  Q2FY27\nMn)\nRevenue  52,063  56,067  70,017\nEBITDA  4,470  4,113  5,778\nNet Profit  3,015  2,631  3,824\nPBT  5,100  5,000  6,500\nEBIT  4,000  3,000  5,000\nAdjusted PAT  4,000  3,000  4,500' }] };
test('generic aligned table preserves metric, scope, scale and periods, computes QoQ/YoY and never substitutes adjusted PAT', () => {
  const result = extractFinancialMetrics(document); assert.equal(result.rows.length, 6);
  const revenue = result.rows[0]; assert.equal(revenue.currency, 'INR'); assert.equal(revenue.unit, 'million'); assert.equal(revenue.scope, 'consolidated'); assert.equal(revenue.period, 'Q2FY27');
  assert.equal(revenue.value, 70017); assert.equal(revenue.previousQuarter, 56067); assert.equal(revenue.previousYear, 52063); assert.equal(revenue.yoy.percent, 34.485); assert.equal(revenue.source.scopePage, 1);
  assert.notEqual(result.rows[2].value, result.rows[5].value); assert.equal(result.rows[4].label, 'EBIT');
});
test('ambiguous cells, scope and units stay unavailable, restatements suppress unreviewed comparisons', () => {
  const clone = structuredClone(document); clone.pages[1].layoutText = clone.pages[1].layoutText.replace('70,017', '70,01,7').replace('5,778', '5 778');
  assert.equal(extractFinancialMetrics(clone).rows.some(r => r.label === 'EBITDA'), false);
  assert.equal(extractFinancialMetrics({ ...document, pages: [document.pages[1]] }).rows.length, 0);
  const missingUnits = structuredClone(document); missingUnits.pages[1].layoutText = missingUnits.pages[1].layoutText.replace('Rs ', '').replace('Mn)', ''); assert.equal(extractFinancialMetrics(missingUnits).rows.length, 0);
  const restated = structuredClone(document); restated.pages[0].text += ' Comparatives have been restated.';
  assert.equal(extractFinancialMetrics(restated).rows[0].yoy.percent, null);
  assert.equal(comparableChange(5, 0).percent, null); assert.equal(comparableChange(5, -2).percent, null); assert.equal(comparableChange(5, null).delta, null);
});

test('explicit missing cells stay null; malformed grouping/unbalanced parentheses never become numbers', () => {
  const data = structuredClone(document);
  data.pages[1].layoutText = data.pages[1].layoutText.replace('52,063', '—').replace('3,824', '(3,824)');
  const rows = extractFinancialMetrics(data).rows;
  assert.equal(rows[0].value, 70017); assert.equal(rows[0].previousYear, null); assert.equal(rows[0].yoy.percent, null); assert.equal(rows[2].value, -3824);
  for (const value of ['(70,017', '70,017)', '(-70,017)', '70,01,7', '12,345,67']) {
    const bad = structuredClone(document); bad.pages[1].layoutText = bad.pages[1].layoutText.replace('70,017', value); assert.equal(extractFinancialMetrics(bad).rows.some(r => r.label === 'Revenue'), false);
  }
});
