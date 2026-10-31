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
