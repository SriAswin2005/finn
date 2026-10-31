import { readFile } from 'node:fs/promises';
import { buildResults } from '../domain/results.js';

const records = JSON.parse(await readFile(new URL('../../data/filings.json', import.meta.url), 'utf8')).items;
export function enrichFilings(dataset) {
  return { ...dataset, announcements: dataset.announcements.map(item => {
    const record = records.find(record => record.symbol === item.symbol && record.filingUrl === item.source?.url);
    if (!record) return item;
    const details = record.kind === 'results' ? { kind: record.kind, ...buildResults(record) } : record;
    const why = record.kind === 'results'
      ? 'Compare the page-reviewed quarter figures on the stated reporting basis. Check the derived EBITDA proxy and its finance-cost limitations in the original table.'
      : 'Check the succession date and outgoing tenure against the filing. Read the bank-attributed appointee profile from the earlier disclosure; it is not independent background verification.';
    return { ...item, exchangeTitle: item.title, title: record.title, details, why, source: { ...item.source, evidence: 'Recorded filing detail reviewed against physical PDF pages. Open the cited page and inspect reporting basis before comparison.' } };
  }) };
}
