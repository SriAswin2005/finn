import test from 'node:test';
import assert from 'node:assert/strict';
import { extractOrderBand } from '../src/push/order-band.js';

const doc = { url: 'https://nsearchives.nseindia.com/official.pdf', pages: [{ page: 1, text: 'Issuer wins orders (Major*) for an overseas metro.' }, { page: 3, text: '', originalText: 'Classification Significant Large Major Mega Ultra-Mega\nValue in ₹ Cr 1,000 to 2,500 2,500 to 5,000 5,000 to 10,000 10,000 to 15,000 >15,000' }] };
test('order classification maps complete paired rows and preserves band rather than inventing exact price', () => {
  const band = extractOrderBand(doc); assert.equal(band.label, 'Major'); assert.equal(band.band, '5,000 to 10,000'); assert.equal(band.isExactPrice, false); assert.equal(band.source.page, 3);
  for (const [from, to] of [['Large Major', 'Major Major'], ['5,000 to 10,000', '5,000 to 10,000 20,000'], ['5,000 to 10,000', '5,00,0 to 10,000'], ['5,000 to 10,000', '6,000 to 10,000'], ['₹ Cr', 'USD million']]) {
    const bad = structuredClone(doc); bad.pages[1].originalText = bad.pages[1].originalText.replace(from, to); assert.equal(extractOrderBand(bad), null);
  }
  const missing = structuredClone(doc); missing.pages[0].text = 'Orders announced without a classification.'; assert.equal(extractOrderBand(missing), null);
});
