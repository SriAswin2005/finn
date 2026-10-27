import { readFile, mkdir, writeFile, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
export const dataDirectory = fileURLToPath(new URL('../../data/', import.meta.url));
export const liveSnapshotPath = resolve(dataDirectory, 'cache/snapshot.json');
export const recordedSnapshotPath = resolve(dataDirectory, 'recorded-snapshot.json');

export async function readSnapshot(path) {
  try {
    const data = JSON.parse(await readFile(path, 'utf8'));
    if (data.schemaVersion !== 1 || !Array.isArray(data.portfolio) || !Array.isArray(data.announcements) || !data.sources || !Number.isFinite(Date.parse(data.asOf))) throw new Error('Invalid snapshot schema.');
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error(`Cannot read snapshot: ${error.message}`);
  }
}
export async function writeJsonAtomic(path, data) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, JSON.stringify(data, null, 2) + '\n'); await rename(temporary, path); }
  finally { await rm(temporary, { force: true }); }
}
