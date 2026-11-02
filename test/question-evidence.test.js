import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEvidence } from '../src/research/evidence.js';

const document = pages => ({ id: 'annual', kind: 'annual_report', title: 'Annual Report 2026', sha256: 'a'.repeat(64), url: 'https://issuer.example/report.pdf', pageCount: 350, partialScan: true, pages });
test('AI investment question prominently selects the best exact source passage with physical page identity', () => {
  const doc = document([
    { page: 2, text: 'The chairman discussed business and company management at the annual meeting. '.repeat(4) },
    { page: 40, text: 'AI supports our customer service capabilities through an internal programme. '.repeat(4) },
    { page: 205, text: 'We increased investment in artificial intelligence capabilities to develop our AI services for customers. '.repeat(3) },
  ]);
  const result = buildEvidence([doc], 'What did management say about AI investments?');
  const top = result.evidence.find(item => item.id === result.questionReferenceId);
  assert.equal(top.page, 205); assert.equal(top.documentId, 'annual'); assert.equal(top.text, doc.pages[2].text.trim());
  assert.equal(result.sections[0].evidenceIds[0], top.id);
  assert.equal(result.questionReferenceText, 'We increased investment in artificial intelligence capabilities to develop our AI services for customers.');
  assert.ok(top.text.includes(result.questionReferenceText));
});
test('unknown query and AI substring false positives show useful zero-match guidance', () => {
  const docs = [document([{ page: 4, text: 'The chairman explained management priorities at the company annual meeting and discussed the airport services business. '.repeat(3) }])];
  for (const question of ['What did management say about quantumflux?', 'What did management say about AI investments?']) {
    const result = buildEvidence(docs, question);
    assert.equal(result.questionReferenceId, null); assert.deepEqual(result.sections[0].evidenceIds, []);
    assert.match(result.sections[0].note, /No direct mentions found/); assert.match(result.sections[0].note, /growth.*capex.*margins/);
  }
  const plain = buildEvidence(docs); assert.equal(plain.questionReferenceId, null); assert.notEqual(plain.sections[0].id, 'question');
});
