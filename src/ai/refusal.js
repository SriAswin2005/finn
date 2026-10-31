import { validateAnalysis, AiUnavailable } from './gemini.js';

export function refusalExample() {
  const quote = 'Revenue declined 8% in Q2 during the period.';
  const text = 'Revenue grew 8% in Q2.';
  const evidence = [{ id: 'synthetic-e1', page: 1, text: quote }];
  const candidate = { claims: [{ section: 'financial', text, inference: false, references: [{ evidenceId: 'synthetic-e1', quote }] }], unavailableSections: [] };
  try { validateAnalysis(candidate, evidence); return { synthetic: true, claim: text, quote, rejected: false, reason: 'Unexpected acceptance; do not rely on this demonstration.', llmCalls: 0 }; }
  catch (error) {
    if (!(error instanceof AiUnavailable)) throw error;
    return { synthetic: true, claim: text, quote, rejected: true, reason: error.message, llmCalls: 0 };
  }
}
