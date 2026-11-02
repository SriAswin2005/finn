import test from 'node:test';
import assert from 'node:assert/strict';
import { reportingContext } from '../src/research/reporting-context.js';

test('financial growth carries exact issuer period/basis and exceptions from its cited passage only', () => {
  const text = "Welcome to our Q2 financial year '27 earnings call. Please note that all growth numbers quoted are in constant currency, unless noted otherwise. Total revenue for the quarter is $3,724 million, a growth of 2.3% QoQ.";
  const claim = { section: 'financial', text: 'Total revenue grew 2.3% QoQ.', references: [{ evidenceId: 'current' }] };
  const result = reportingContext({ claims: [claim] }, [{ id: 'current', text }]);
  assert.equal(result.length, 2); assert.ok(result.every(r => text.includes(r.quote)));
  assert.ok(result.some(r => r.kind === 'growth_basis' && r.quote.includes('unless noted otherwise')));
  assert.ok(result.some(r => r.kind === 'reporting_period' && r.quote.includes("'27")));
  assert.deepEqual(reportingContext({ claims: [{ ...claim, references: [{ evidenceId: 'different' }] }] }, [{ id: 'current', text }]), []);
  assert.deepEqual(reportingContext({ claims: [{ ...claim, section: 'business' }] }, [{ id: 'current', text }]), []);
});
