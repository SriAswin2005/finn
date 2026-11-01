// Explicit captured evaluation, never a live fallback or a separate allowance.
import { readFile, writeFile } from 'node:fs/promises';
import { createPushStore } from '../src/push/store.js';
import { mergeFilings } from '../src/push/collection.js';
import { processDocument } from '../src/push/jobs.js';
import { processAnalysis } from '../src/push/analysis.js';

const store = createPushStore();
for (const path of process.argv.slice(2)) {
  const captured = JSON.parse(await readFile(path, 'utf8'));
  const filing = { ...captured.filing, id: `evaluation-${captured.filing.id}`, evidenceMode: 'captured_evaluation' };
  await store.mutate(s => mergeFilings(s, [filing], new Date().toISOString()));
  // Claim this captured attachment without consuming another event's document job.
  await store.saveDocument(captured.document);
  const key = (await import('../src/push/collection.js')).hash(`${filing.id}|${captured.document.sha256}`);
  await store.mutate(s => {
    const e = s.events[filing.id]; e.processingKey = key; e.documentHash = captured.document.sha256;
    s.jobs[key] ??= { key, eventId: filing.id, documentHash: captured.document.sha256, status: 'pending', attempts: 0, nextAt: 0, createdAt: new Date().toISOString(), revision: e.revision };
    e.status = s.jobs[key].status;
  });
  const result = await processAnalysis({ store, env: { ...process.env, FINN_PUSH_ENABLED: 'true' }, eventId: filing.id });
  const state = await store.read(); const job = state.jobs[key];
  await writeFile(path.replace(/\.json$/, '-output.json'), JSON.stringify(job, null, 2));
  console.log(JSON.stringify({ input: path, result, status: job.status, error: job.error, claims: job.analysis?.claims.length ?? 0, metrics: job.analysis?.metrics.length ?? 0 }));
}
