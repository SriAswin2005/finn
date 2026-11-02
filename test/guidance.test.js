import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildGuidanceComparison } from '../src/research/guidance.js';

test('recorded INFY compares complete primary quotes without treating Q1 or revised guidance as annual delivery', async () => {
  const data = JSON.parse(await readFile(new URL('../data/research/INFY.json', import.meta.url)));
  const comparison = buildGuidanceComparison(data.documents);
  assert.ok(comparison); assert.deepEqual([comparison.promised.lower, comparison.promised.upper], [1.5, 3.5]);
  assert.deepEqual([comparison.revised.lower, comparison.revised.upper], [1.5, 3]);
  assert.equal(comparison.observed.period, 'Q1'); assert.equal(comparison.observed.yoy, 2.4); assert.equal(comparison.observed.qoq, 1);
  assert.equal(comparison.deliveryStatus, 'not_comparable');
  for (const item of [comparison.promised, comparison.revised, comparison.observed]) {
    const source = data.documents.find(doc => doc.id === item.documentId);
    assert.ok(source.pages.find(page => page.page === item.page).text.includes(item.quote));
    assert.ok(item.quote.endsWith('.')); assert.match(item.url, /^https:/);
  }
});

test('guidance refuses different full-year periods, missing chronology and qualified/segment quotes', () => {
  const doc = (title, text) => ({ id: title, kind: 'transcript', title, url: 'https://issuer.test/call.pdf', pages: [{ page: 1, text }] });
  const earlier = doc('Call Apr 2026', 'Our revenue growth guidance for the financial year 2027 is 1.5% to 3.5% growth year-on-year in constant currency terms.');
  const later = doc('Call Jul 2026', 'Our revenue growth guidance for the financial year 2028 is 1.5% to 3% growth year-on-year in constant currency terms.');
  assert.equal(buildGuidanceComparison([earlier, later]), null);
  assert.equal(buildGuidanceComparison([earlier, { ...later, title: 'Unknown date' }]), null);
  assert.equal(buildGuidanceComparison([earlier]), null);
  for (const qualifier of ['Subsidiary', 'Segment', 'Subject to demand, our']) {
    const qualified = doc('Call Jul 2026', `${qualifier} revenue growth guidance is 1.5% to 3% in constant currency terms.`);
    assert.equal(buildGuidanceComparison([earlier, qualified]), null);
  }
});

const call = (month, text) => ({ id: month, title: `Call ${month} 2026`, kind: 'transcript', url: 'https://issuer.example/call.pdf', pages: [{ page: 17, text }] });
test('guidance recognizes revenue, sales and volume outlook/targets with range separators and retains exact citations', () => {
  for (const metric of ['Revenue', 'Sales', 'Volume']) for (const word of ['guidance', 'outlook', 'target']) for (const separator of ['to', '-', '–']) {
    const earlier = call('Apr', `${metric} growth ${word} for FY2027 is 8.5% ${separator} 10% across the company.`);
    const later = call('Jul', `${metric} growth ${word} for FY2027 is 9% ${separator} 11% across the company.`);
    const result = buildGuidanceComparison([earlier, later]); assert.ok(result);
    assert.equal(result.metric, `${metric} growth`); assert.equal(result.promised.lower, 8.5); assert.equal(result.revised.upper, 11);
    assert.equal(result.promised.period, '2027'); assert.equal(result.promised.page, 17); assert.equal(result.promised.quote, earlier.pages[0].text);
    assert.equal(result.observed, null); assert.equal(result.deliveryStatus, 'not_comparable');
  }
});
test('margin guidance retains the named metric without substituting revenue actuals', () => {
  for (const metric of ['EBITDA', 'EBIT', 'PBDIT', 'operating']) for (const word of ['guidance', 'band', 'expectation']) {
    const result = buildGuidanceComparison([call('Apr', `${metric} margin ${word} is 18 to 20% for FY2026-27.`), call('Jul', `${metric} margin ${word} is 19%–21% for FY2027. Our revenue growth for Q1 was at 2.4% Y-on-Y and 1% Q-on-Q in constant currency terms.`)]);
    assert.ok(result); assert.equal(result.metric, `${metric} margin`); assert.equal(result.observed, null); assert.equal(result.revised.upper, 21);
  }
});
test('general guidance refuses metric/basis/period mismatches, reversed bounds and qualifications', () => {
  const earlier = call('Apr', 'EBITDA margin guidance is 18% to 20% for FY2027.');
  for (const text of ['EBIT margin guidance is 19% to 21% for FY2027.', 'EBITDA margin guidance is 19% to 21% for FY2028.', 'EBITDA margin guidance is 21% to 19% for FY2027.', 'Subsidiary EBITDA margin guidance is 19% to 21% for FY2027.', 'Subject to demand, EBITDA margin guidance is 19% to 21% for FY2027.']) assert.equal(buildGuidanceComparison([earlier, call('Jul', text)]), null);
  assert.equal(buildGuidanceComparison([call('Apr', 'Revenue growth guidance is 8% to 10% in constant currency terms.'), call('Jul', 'Revenue growth guidance is 9% to 11% in reported currency terms.')]), null);
  const negative = buildGuidanceComparison([call('Apr', 'Volume outlook is -5% to -3% for FY2027.'), call('Jul', 'Volume outlook is -4% to -2% for FY2027.')]);
  assert.equal(negative.promised.lower, -5); assert.equal(negative.observed, null);
});
