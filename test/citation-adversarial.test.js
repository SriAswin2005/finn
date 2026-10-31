import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAnalysis } from '../src/ai/gemini.js';
import { buildQuoteBank } from '../src/ai/quotes.js';

// Synthetic attacks, not company facts. Every case must be refused without a model call.
const attacks = [
  ['crore versus million', 'Revenue was 100 crore.', 'Revenue was 100 million in the period.'],
  ['lakh versus crore', 'Revenue was 100 lakh.', 'Revenue was 100 crore in the period.'],
  ['currency', 'Revenue was ₹100 million.', 'Revenue was $100 million in the period.'],
  ['percent versus percentage points', 'Operating margin improved 2%.', 'Operating margin improved 2 percentage points.'],
  ['basis points', 'Operating margin improved 20%.', 'Operating margin improved 20 bps in the period.'],
  ['quarter mismatch', 'Q1 revenue was 100 million.', 'Q2 revenue was 100 million, up 1% sequentially.'],
  ['annual versus quarter', 'Full-year revenue was 100 million.', 'Q2 revenue was 100 million in the quarter.'],
  ['segment versus company', 'Company revenue was 100 million.', 'Widgets segment revenue was 100 million in the period.'],
  ['subsidiary versus company', 'Company revenue was 100 million.', 'Subsidiary revenue was 100 million in the period.'],
  ['peer entity', 'Acme revenue was 100 million.', 'PeerCo revenue was 100 million in the period.'],
  ['negation sliced away', 'Revenue is expected to grow 8%.', 'Revenue is not expected to grow 8%.', 'expected to grow 8%.'],
  ['condition sliced away', 'Revenue will grow 8%.', 'Subject to approvals, revenue will grow 8%.', 'revenue will grow 8%.'],
  ['upper bound', 'Revenue guidance is 8% growth.', 'Revenue guidance is up to 8% growth this year.'],
  ['opposite direction', 'Revenue grew 8% in Q2.', 'Revenue declined 8% in Q2 during the period.'],
  ['guidance versus actual', 'Revenue grew 8% this year.', 'Revenue is expected to grow 8% this year.'],
];
for (const [name, text, source, quote = source] of attacks) test(`adversarial citation refuses ${name}`, () => {
  const evidence = [{ id: 'e', page: 1, text: source }];
  assert.throws(() => validateAnalysis({ claims: [{ section: text.includes('guidance') ? 'guidance' : 'financial', text, inference: false, references: [{ evidenceId: 'e', quote }] }], unavailableSections: [] }, evidence));
});

test('flattened table and empty text are refused; long sentences are not sliced into misleading quotes', () => {
  for (const source of ['Revenue EBITDA PBT PAT Q2 Q1 100 80 50 40 30 20', '']) {
    assert.throws(() => validateAnalysis({ claims: [{ section: 'financial', text: 'Revenue was 100.', inference: false, references: [{ evidenceId: 'e', quote: source }] }], unavailableSections: [] }, [{ id: 'e', text: source }]));
  }
  assert.deepEqual(buildQuoteBank([{ id: 'e', text: 'Revenue is not expected to grow because ' + 'approval conditions remain uncertain '.repeat(10) + '.' }]), []);
});

test('qualified facts and direction survive when the complete claim preserves their meaning', () => {
  for (const text of ['Revenue declined 8% in Q2 during the period.', 'Revenue guidance is up to 8% growth this year.', 'Revenue is not expected to grow 8%.']) {
    assert.doesNotThrow(() => validateAnalysis({ claims: [{ section: 'guidance', text, inference: false, references: [{ evidenceId: 'e', quote: text }] }], unavailableSections: [] }, [{ id: 'e', text }]));
  }
});
