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
const records = createRemoteRecords({ timeoutMs: 30000 }); let verified = 0;
async function copy([key, record]) {
  try {
    let saved = await records.get(key);
    if (!saved && operation === 'import') { await records.create(key, record); saved = await records.get(key); }
    if (!saved || !isDeepStrictEqual(saved.record, record)) throw new Error('Record mismatch; no cutover permitted.');
    verified++;
    if (verified % 25 === 0) console.log(JSON.stringify({ verified }));
  } catch (error) { throw new Error(`Migration failed for ${key}: ${error.message}`); }
}
// Independent records can be copied in small batches. Every operation is
// non-overwriting; a timed-out run can resume without replacing target history.
for (let index = 0; index < entries.length; index += 4) {
  const results = await Promise.allSettled(entries.slice(index, index + 4).map(copy));
  const failed = results.find(result => result.status === 'rejected');
  if (failed) throw failed.reason;
}
console.log(JSON.stringify({ operation, verified, attempts: tables.finn_push_state[0].record.quota.attempts.length, exactRecords: true }));
