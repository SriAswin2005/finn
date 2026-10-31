import { readFile } from 'node:fs/promises';
import { buildResults } from '../domain/results.js';

const records = JSON.parse(await readFile(new URL('../../data/filings.json', import.meta.url), 'utf8')).items;
export function enrichFilings(dataset) {
  return { ...dataset, announcements: dataset.announcements.map(item => {
    const record = records.find(record => record.symbol === item.symbol && record.filingUrl === item.source?.url);
    if (!record) return item;
    const details = record.kind === 'results' ? { kind: record.kind, ...buildResults(record) } : record;
    return { ...item, exchangeTitle: item.title, title: record.title, details, source: { ...item.source, evidence: 'Recorded filing detail reviewed against physical PDF pages. Open the cited page and inspect reporting basis before comparison.' } };
  }) };
}
