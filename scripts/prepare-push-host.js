// Existing approved Neon only. Never sends Gemini credentials to a host.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createPushStore } from '../src/push/store.js';

if (!process.env.DATABASE_URL) throw new Error('Load the existing approved Neon environment before preparing Push.');
// A production env pull sets VERCEL; the migration source is still the owner's
// durable local ledger, never Vercel's disposable runtime cache directory.
const local = createPushStore({ env: {}, path: resolve(process.env.FINN_PUSH_MIGRATION_SOURCE ?? 'data/cache/push.sqlite') });
const remote = createPushStore(); const state = await local.read();
if (!state.quota.initialized) throw new Error('Reconcile/import local attempt history first; no fresh hosted allowance is inferred.');
await remote.initialize();
const existing = await remote.read();
if (existing.quota.initialized || Object.keys(existing.events).length || existing.quota.attempts.length) throw new Error('Hosted Push already has state; migration refuses to overwrite it or grant allowance.');
const hashes = [...new Set([...Object.values(state.jobs).flatMap(j => j.documentHashes ?? [j.documentHash]), ...Object.values(state.events).flatMap(e => [e.documentHash, ...(e.relatedHashes ?? [])])].filter(Boolean))];
for (const hash of hashes) { const doc = await local.document(hash); if (!doc) throw new Error('Original pages missing; migration stopped before accepting state.'); await remote.saveDocument(doc); }
await remote.mutate(s => {
  if (s.quota.initialized || Object.keys(s.events).length) throw new Error('Concurrent hosted initialization; nothing overwritten.');
  Object.assign(s, state); s.workerLease = null; s.migratedAt = new Date().toISOString();
});
// Bind future local workers to the same ledger while preserving the original key
// and every unrelated local setting. DATABASE_URL stays in ignored backend .env.
const envPath = resolve('.env'); const original = await readFile(envPath, 'utf8');
const match = original.match(/^DATABASE_URL=(.*)$/m);
if (match && match[1].trim().replace(/^['"]|['"]$/g, '') !== process.env.DATABASE_URL) throw new Error('Local DATABASE_URL differs; hosted state is preserved, local binding needs operator review.');
if (!match) await writeFile(envPath, original.trimEnd() + `\nDATABASE_URL=${process.env.DATABASE_URL}\n`);
console.log(JSON.stringify({ migrated: true, documents: hashes.length, events: Object.keys(state.events).length, attemptsPreserved: state.quota.attempts.length, localAndHostedShareLedger: true, hostedModelEnabled: false }));
