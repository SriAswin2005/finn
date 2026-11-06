import { readFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { isDeepStrictEqual } from 'node:util';
import { createRemoteRecords } from '../src/storage/remote-records.js';

const [operation, filename] = process.argv.slice(2);
if (!['import', 'verify'].includes(operation) || !filename) throw new Error('Usage: migrate-storage.js import|verify tmp/neon-recovery/backup-….json.gz');
const base = resolve('tmp/neon-recovery');
const path = resolve(filename); const within = relative(base, path);
if (within.startsWith('..') || isAbsolute(within)) throw new Error('Use an ignored recovery backup inside tmp/neon-recovery.');
const { tables } = JSON.parse(gunzipSync(await readFile(path), { maxOutputLength: 128 * 1024 * 1024 }));
if (tables.finn_push_state.length !== 1 || tables.finn_source_snapshots.length !== 1 || tables.finn_push_state[0].record?.quota?.initialized !== true) throw new Error('Canonical backup is incomplete; refusing migration.');
const entries = [
  ['push:state', tables.finn_push_state[0].record],
  ['source:snapshot', tables.finn_source_snapshots[0].record],
  ...tables.finn_push_documents.map(row => [`document:${row.hash}`, row.record]),
  ...tables.finn_research_cache.map(row => [`research:${row.ticker}`, row.record]),
];
const records = createRemoteRecords(); let verified = 0;
for (const [key, record] of entries) {
  if (operation === 'import') await records.create(key, record); // Never overwrite target history.
  const saved = await records.get(key);
  if (!saved || !isDeepStrictEqual(saved.record, record)) throw new Error(`Migration mismatch for ${key}; no cutover permitted.`);
  verified++;
}
console.log(JSON.stringify({ operation, verified, attempts: tables.finn_push_state[0].record.quota.attempts.length, exactRecords: true }));
