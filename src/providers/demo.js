// Fictional scenarios, never a representation of actual disclosures or market data.
import { portfolio as companies } from '../config/portfolio.js';
export const DEMO_AS_OF = '2026-10-28T12:30:00.000Z';
const movements = [1.2, -0.8, 0.6, -3.7, 1.1, 2.2, 4.2, 0.3, -1.5, -2.1, 1.4, 0.7, 3.4, -0.9, 1.8];
const volumes = [1.1, 0.8, 1.2, 2.6, 0.9, 1.8, 2.2, 0.7, 1.1, 1.6, 1.2, 0.8, 2.4, 1.3, 1.4];
const scenarios = [
  ['LT', 'capex', 2, 'Capacity expansion approved', 'A fictional board approval commits capital to a new manufacturing facility.', 'Track the size and timing of the spend against operating cash generation.'],
  ['INFY', 'results', 4, 'Results need a closer read', 'A fictional quarterly release shows revenue growth alongside softer operating profitability.', 'Growth and profitability are moving in different directions. Read the accounts before forming a view.'],
  ['HDFCBANK', 'management_change', 6, 'A finance leadership transition', 'A fictional filing announces a change in finance leadership.', 'Check the effective date and succession plan. No executive biography has been verified.'],
  ['SUNPHARMA', 'litigation', 20, 'Regulatory disclosure to review', 'A fictional regulatory update describes a potential operational constraint.', 'The financial impact is unknown; the actual order would be needed to assess exposure.'],
  ['TCS', 'earnings_call', 10, 'Earnings-call schedule published', 'A fictional notice sets out the next earnings-call schedule.', 'A scheduling notice adds no new financial evidence.'],
  ['ITC', 'unclassified', 8, 'Routine compliance certificate', 'A fictional periodic compliance certificate has been filed.', 'No material business change is described in this scenario.'],
  ['RELIANCE', 'investor_meetings', 12, 'Investor meeting notice', 'A fictional meeting notice lists institutional investor interactions.', 'A meeting notice alone is not evidence of a change in outlook.'],
  ['MARICO', 'dividend', 50, 'Dividend record date announced', 'A fictional disclosure sets a dividend record date.', 'Review the corporate-action details if holding through the record date.'],
  ['POLYCAB', 'M&A', 130, 'Acquisition proposal announced', 'A fictional proposal outlines a purchase of an adjacent business.', 'Terms, funding and integration assumptions need a closer look.'],
];

export function getDemoDataset() {
  const portfolio = companies.map((company, i) => ({
    ...company, eod: {
      session: '2026-10-28', previousClose: 1000, close: 1000 * (1 + movements[i] / 100),
      volume: Math.round(100000 * volumes[i]), averageVolume: 100000, baselineSessions: 20,
    },
  }));
  const announcements = scenarios.map(([symbol, category, hoursAgo, title, summary, why], i) => ({
    id: `demo-${i + 1}`, symbol, category, title, summary, why,
    publishedAt: new Date(Date.parse(DEMO_AS_OF) - hoursAgo * 3600000).toISOString(),
    source: { label: 'Fictional demo fixture', url: null, evidence: 'No primary filing attached. This scenario tests the product workflow only.' },
  }));
  return { mode: 'demo', asOf: DEMO_AS_OF, portfolio, announcements };
}
