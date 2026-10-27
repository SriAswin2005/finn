// These are transparent triage rules over exchange metadata, not document analysis.
export function classifyAnnouncement(subject, description = '') {
  const text = `${subject} ${description}`.toLowerCase();
  const heading = subject.toLowerCase();
  if (/board meeting.*intimation/.test(heading) || /(?:meeting of.*board|board.*meeting).*scheduled/.test(text)) return 'board_meeting';
  if (/earnings|conference call|audio.*recording|transcript|link of recording/.test(text) && !/financial results/.test(heading)) return 'earnings_call';
  if (/financial results|quarterly results|audited results|unaudited results/.test(text)) return 'results';
  if (/acquisition|merger|demerger|joint venture|sale of.*stake/.test(text)) return 'M&A';
  if (/litigation|penalty|fine imposed|regulatory order|insolvency|show cause/.test(text)) return 'litigation';
  if (/resign|appointment|change/.test(text) && /director|chief|cfo|ceo|managing/.test(text)) return 'management_change';
  if (/credit rating/.test(text)) return 'credit_rating';
  if (/preferential|fund rais|rights issue|qualified institutional|buyback|commercial paper/.test(text)) return 'fund_raise';
  if (/pledge|pledging/.test(text)) return 'pledging';
  if (/insider trading|promoter.*(acquir|dispos)/.test(text)) return 'insider_trading';
  if (/dividend/.test(text)) return 'dividend';
  if (/bonus|stock split|sub.?division/.test(text)) return 'bonus_split';
  if (/capex|capacity expansion/.test(text)) return 'capex';
  if (/postal ballot/.test(text)) return 'postal_ballot';
  if (/annual general meeting|extraordinary general meeting|shareholders meeting|agm|egm/.test(text)) return 'agm_egm';
  if (/investor(?:\(s\))? meet|investor conference|analysts.*meet/.test(text)) return 'investor_meetings';
  if (/press release/.test(heading)) return 'press_release';
  if (/compliance certificate|certificate under sebi \(depositories|newspaper publication|trading window|loss of share|duplicate.*certificate|dematerial|esop|esos|employee stock/.test(text)) return 'unclassified';
  return 'other'; // Unknown filings stay visible, never silently treated as routine.
}

const context = {
  results: 'Review the financial statements and comparatives. Headline figures have not yet been extracted.',
  'M&A': 'Check the transaction terms, funding and approvals in the filing.',
  management_change: 'Check the role, effective date and succession details. No professional biography has been verified.',
  litigation: 'Read the order and disclosed financial exposure. Materiality has not been assessed.',
  capex: 'Check the investment size, funding and commissioning timeline.',
  other: 'The exchange metadata is not enough to determine materiality. Review the original filing.',
};
export const announcementContext = category => context[category] ?? 'Open the exchange filing for the terms and context. Classification uses metadata only; the document has not been analysed.';
