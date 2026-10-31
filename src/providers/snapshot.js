import { readSnapshot, validateSnapshot, liveSnapshotPath, recordedSnapshotPath } from '../storage/snapshots.js';
import { createSourceSnapshotStore } from '../storage/source-snapshot.js';
import { getDemoDataset } from './demo.js';
import { enrichFilings } from './filings.js';

export class DatasetUnavailable extends Error {}
const persistent = createSourceSnapshotStore();
export async function getDataset(mode = 'live', { now = new Date(), livePath = liveSnapshotPath, recordedPath = recordedSnapshotPath, liveProvider } = {}) {
  if (mode === 'demo') return getDemoDataset();
  if (!['live', 'recorded'].includes(mode)) throw new RangeError('Data mode must be live, recorded or demo.');
  let data;
  try { data = mode === 'live' ? await (liveProvider ? liveProvider() : process.env.DATABASE_URL ? persistent.get() : readSnapshot(livePath)) : await readSnapshot(recordedPath); }
  catch { throw new DatasetUnavailable('Source snapshot could not be loaded. Try another data mode or retry shortly.'); }
  if (!data) throw new DatasetUnavailable(mode === 'live' ? 'Latest sources have not been collected for this host. Choose Recorded sources or try again later.' : 'No recorded snapshot is available.');
  try { validateSnapshot(data); } catch { throw new DatasetUnavailable('Source snapshot is unreadable. No replacement data has been invented.'); }
  const asOf = mode === 'live' ? now.toISOString() : data.asOf;
  const age = Date.parse(asOf) - Date.parse(data.asOf);
  for (const source of Object.values(data.sources)) {
    const stale = Date.parse(asOf) - Date.parse(source.fetchedAt) > 24 * 3600000;
    if (source.status === 'ok' && stale) source.status = 'stale';
  }
  return enrichFilings({ ...data, mode, asOf, snapshotAt: data.asOf, stale: age > 24 * 3600000 || Object.values(data.sources).some(source => source.status !== 'ok') });
}
