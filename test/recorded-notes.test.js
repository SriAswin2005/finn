import test from 'node:test';
import assert from 'node:assert/strict';
import { getResearch } from '../src/research/service.js';
import { createGeminiProvider, validateAnalysis } from '../src/ai/gemini.js';

test('all three recorded notes match primary evidence and survive no-key cache-only startup', async () => {
  let calls = 0;
  for (const ticker of ['INFY', 'ASIANPAINT', 'PERSISTENT']) {
    const research = await getResearch(ticker);
    const provider = createGeminiProvider({ env: { VERCEL: '1' }, fetchImpl: async () => { calls++; throw new Error('No model call allowed'); } });
    const note = await provider.generate(research);
    assert.equal(note.evidenceHash, research.evidenceHash); assert.equal(note.cached, true); assert.equal(note.recorded, true);
    assert.equal(note.requestLlmCalls, 0); assert.ok(note.claims.length >= 4);
    assert.doesNotThrow(() => validateAnalysis(note, research.evidence));
    if (ticker !== 'INFY') { assert.equal(note.reviewStatus, 'reviewer-curated'); assert.ok(note.curationNote.length); }
    if (ticker === 'ASIANPAINT') assert.ok(note.claims.every(claim => !/8-10|volume growth/i.test(claim.text)));
    if (ticker === 'PERSISTENT') assert.ok(note.unavailableSections.includes('guidance'));
  }
  assert.equal(calls, 0);
});
