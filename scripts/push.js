import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createPushStore } from '../src/push/store.js';
import { runtimeCacheDirectory } from '../src/storage/snapshots.js';
import { workflowPolicy } from '../src/ai/workflows.js';
import { collectPush } from '../src/push/collection.js';
import { processDocument } from '../src/push/jobs.js';
import { processAnalysis, revalidateRejected } from '../src/push/analysis.js';

const store = createPushStore(); const command = process.argv[2] ?? 'status';
try {
  if (command === 'init') {
    await store.initialize();
    const prior = await store.read();
    if (prior.quota.initialized) throw new Error('Quota already initialized. Existing attempts/cooldowns were preserved; no reset is permitted.');
    // A new worker must import the previous local Research ledger, not pretend
    // its attempts did not happen. No inference from missing/corrupt old state.
    const legacy = JSON.parse(await readFile(resolve(runtimeCacheDirectory, 'ai/quota.json'), 'utf8'));
    if (!Array.isArray(legacy.entries) || !legacy.cooldowns || legacy.entries.some(e => typeof e.model !== 'string' || !Number.isFinite(e.at))) throw new Error('Previous Research quota is missing/corrupt; operator reconciliation required.');
    await store.mutate(s => {
      if (s.quota.initialized) throw new Error('Quota was concurrently initialized; nothing reset.');
      s.quota.initialized = true; s.quota.policy = workflowPolicy();
      s.quota.attempts = legacy.entries.filter(e => Date.now() - e.at < 2 * 86400000).map((e, i) => ({ id: `imported-${e.at}-${i}`, model: e.model, workflow: 'research', at: e.at, estimatedTokens: 30000, retry: false, outcome: 'imported_previous_ledger' }));
      s.quota.cooldowns = legacy.cooldowns; s.quota.projectUntil = legacy.projectCooldown ?? 0;
      s.quota.initializedAt = new Date().toISOString();
    });
    console.log('Push state initialized; previous Research attempts imported, no model call made.');
  } else if (command === 'collect') console.log(JSON.stringify(await collectPush({ store })));
  else if (command === 'revalidate') console.log(JSON.stringify(await revalidateRejected({ store, key: process.argv[3], reason: process.argv.slice(4).join(' ') })));
  else if (command === 'policy') {
    const policy = workflowPolicy();
    await store.mutate(s => { if (!s.quota.initialized) throw new Error('Quota missing; policy cannot recreate it.'); s.quota.policy = policy; });
    console.log('Applied configured roles/limits; every existing attempt/cooldown preserved.');
  }
  else if (command === 'retry') {
    const key = process.argv[3]; const reason = process.argv.slice(4).filter(value => value !== '--complex').join(' ');
    if (reason.length < 20 || reason.length > 500) throw new Error('An explicit operator review/fix reason (20–500 characters) is required.');
    await store.mutate(s => {
      const job = s.jobs[key];
      if (!job || job.status !== 'failed' || job.attempts >= 3 || s.quota.attempts.filter(a => a.jobKey === key).length >= 3) throw new Error('Only reviewed failed jobs below the attempt cap may be retried. Completed analysis/allowance are never reset.');
      job.reviewRetries ??= []; job.reviewRetries.push({ at: new Date().toISOString(), reason }); job.status = 'deferred'; job.nextAt = 0;
      if (process.argv.includes('--complex')) job.complex = true;
      if (s.events[job.eventId]?.processingKey === key) s.events[job.eventId].status = 'deferred';
    });
    console.log('Reviewed job requeued; attempts, cooldowns and all quota limits preserved.');
  }
  else if (command === 'tick') {
    console.log(JSON.stringify({ collection: await collectPush({ store }) }));
    for (let i = 0; i < 2; i++) console.log(JSON.stringify({ document: await processDocument({ store }) }));
    console.log(JSON.stringify({ analysis: await processAnalysis({ store }) }));
  } else if (command === 'status') {
    const s = await store.read(); console.log(JSON.stringify({ collection: s.collection, events: Object.keys(s.events).length, jobs: Object.values(s.jobs).reduce((counts, j) => ({ ...counts, [j.status]: (counts[j.status] ?? 0) + 1 }), {}), quotaInitialized: s.quota.initialized, attempts: s.quota.attempts.length, projectPausedUntil: s.quota.projectUntil ? new Date(s.quota.projectUntil).toISOString() : null }, null, 2));
  } else throw new Error('Use push.js init | collect | tick | status | retry KEY REVIEW_REASON.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
