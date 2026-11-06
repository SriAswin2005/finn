// Recovery export only: never initializes, mutates, or resets production data.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const tables = ['finn_push_state', 'finn_push_documents', 'finn_research_cache', 'finn_source_snapshots'];
const sql = neon(process.env.DATABASE_URL);
const rows = await sql.transaction(tables.map(table => sql.query(`SELECT * FROM ${table}`)), { isolationLevel: 'RepeatableRead', readOnly: true });
const backup = { exportedAt: new Date().toISOString(), tables: Object.fromEntries(tables.map((table, i) => [table, rows[i]])) };
const directory = resolve('tmp', 'neon-recovery');
await mkdir(directory, { recursive: true });
const bytes = gzipSync(JSON.stringify(backup));
const filename = `backup-${Date.now()}.json.gz`;
await writeFile(resolve(directory, filename), bytes, { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify({ backup: `tmp/neon-recovery/${filename}`, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), counts: Object.fromEntries(tables.map((table, i) => [table, rows[i].length])) }));
