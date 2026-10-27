import { readSnapshot, liveSnapshotPath, recordedSnapshotPath } from '../storage/snapshots.js';
import { getDemoDataset } from './demo.js';

export class DatasetUnavailable extends Error {}
export async function getDataset(mode = 'live', { now = new Date(), livePath = liveSnapshotPath, recordedPath = recordedSnapshotPath } = {}) {
  if (mode === 'demo') return getDemoDataset();
  if (!['live', 'recorded'].includes(mode)) throw new RangeError('Data mode must be live, recorded or demo.');
  const data = await readSnapshot(mode === 'live' ? livePath : recordedPath);
  if (!data) throw new DatasetUnavailable(mode === 'live' ? 'No live snapshot yet. Run npm run ingest, then refresh. Recorded sources and fictional demo remain available from Data mode.' : 'No recorded snapshot is available.');
  const asOf = mode === 'live' ? now.toISOString() : data.asOf;
  const age = Date.parse(asOf) - Date.parse(data.asOf);
  for (const source of Object.values(data.sources)) {
    const stale = Date.parse(asOf) - Date.parse(source.fetchedAt) > 24 * 3600000;
    if (source.status === 'ok' && stale) source.status = 'stale';
  }
  return { ...data, mode, asOf, snapshotAt: data.asOf, stale: age > 24 * 3600000 || Object.values(data.sources).some(source => source.status !== 'ok') };
}
