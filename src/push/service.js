import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { createPushStore } from './store.js';
import { collectPush } from './collection.js';
import { processDocument } from './jobs.js';
import { processAnalysis, pushGenerationState } from './analysis.js';
import { presentationAnalysis } from './interpretation.js';

export function workerAuthorized(body, signature, secret, now = Date.now()) {
  if (!secret || secret.length < 32 || typeof body !== 'string' || Buffer.byteLength(body) > 1024 || !/^[a-f0-9]{64}$/.test(signature ?? '')) return false;
  const expected = createHmac('sha256', secret).update(`push-worker\n${body}`).digest('hex');
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try { const payload = JSON.parse(body); return Number.isInteger(payload.expires) && payload.expires * 1000 > now && payload.expires * 1000 <= now + 90000 && typeof payload.runId === 'string'; } catch { return false; }
}
export function pushStatus(state, at = Date.now(), { targetMinutes = 15, analysisMinutes = 15 } = {}) {
  const events = Object.values(state.events).filter(e => e.filing.evidenceMode !== 'captured_evaluation' && !e.replacedBy);
  const ids = new Set(events.map(e => e.filing.id));
  const jobs = Object.values(state.jobs).filter(j => ids.has(j.eventId)); const pending = jobs.filter(j => ['pending', 'processing', 'deferred'].includes(j.status));
  const oldest = pending.length ? Math.min(...pending.map(j => Date.parse(state.events[j.eventId]?.filing.publishedAt ?? j.createdAt))) : null;
  const incoming = events.filter(e => Date.parse(e.firstCollectedAt) > at - 86400000).length;
  const capacity = state.quota.policy?.allocations.push ?? 0;
  const counts = events.reduce((c, e) => ({ ...c, [e.status]: (c[e.status] ?? 0) + 1 }), {});
  return { collection: state.collection, counts, pending: pending.length + (counts.pending_document ?? 0) + (counts.pending_related ?? 0) + (counts.document_retry ?? 0), oldestPendingAt: oldest ? new Date(oldest).toISOString() : null,
    incoming24h: incoming, localDailyCapacity: capacity, overload: incoming > capacity, delayed: oldest !== null && at - oldest > 86400000,
    quotaReady: state.quota.initialized, projectPausedUntil: state.quota.projectUntil > at ? new Date(state.quota.projectUntil).toISOString() : null, operationalProblem: state.quota.stopped,
    targetMinutes, analysisMinutes, freshnessGuarantee: false };
}
export function decoratePushDataset(dataset, state, at = Date.now()) {
  const byUrl = new Map(dataset.announcements.map(a => [a.source.url ?? a.id, { ...a, details: undefined, analysisStatus: 'pending_collection', routine: false, priority: 40, priorityReason: 'Awaiting document analysis; significance has not been established.' }]));
  for (const e of Object.values(state.events)) {
    if (e.filing.evidenceMode === 'captured_evaluation') continue;
    if (e.replacedBy) { byUrl.delete(e.filing.source.url ?? e.filing.id); continue; }
    const job = state.jobs[e.processingKey]; const analysis = ['complete', 'partial'].includes(job?.status) ? presentationAnalysis(job.analysis) : null;
    const eventClaim = analysis?.claims.find(c => c.role === 'event'); const significance = analysis?.claims.find(c => c.role === 'significance');
    const priorityReason = analysis?.claims.find(c => c.role === 'priority')?.text ?? 'Awaiting document analysis; significance has not been established.';
    const delayed = at - Date.parse(e.filing.publishedAt) > 86400000 && (!analysis || Date.parse(analysis.generatedAt) - Date.parse(e.filing.publishedAt) > 86400000);
    const keepDelayed = delayed && (!analysis || analysis.priority !== 'low' && at - Date.parse(analysis.generatedAt) < 3 * 86400000);
    const level = analysis?.priority ?? 'normal'; const ageHours = Math.max(0, (at - Date.parse(e.filing.publishedAt)) / 3600000);
    const priority = ({ high: 80, normal: 45, low: 10 }[level]) + Math.max(0, 10 - ageHours / 12) + (analysis?.missing.length ? 2 : 0);
    const documentKey = e.processingKey ? `document:${e.processingKey}` : e.filing.source.url ?? e.filing.id;
    byUrl.delete(e.filing.source.url ?? e.filing.id);
    const old = byUrl.get(documentKey);
    const disclosures = [...(old?.disclosures ?? []), { id: e.filing.id, publishedAt: e.filing.publishedAt, url: e.filing.source.url }];
    if (old && Date.parse(old.publishedAt) > Date.parse(e.filing.publishedAt)) { old.disclosures = disclosures; continue; }
    byUrl.set(documentKey, { ...e.filing, disclosures, title: eventClaim?.text ?? e.filing.title, summary: analysis?.claims.filter(c => c.role === 'fact').map(c => c.text).join(' ') ?? e.filing.summary,
      category: analysis?.eventType === 'routine' ? 'unclassified' : analysis?.eventType ?? e.filing.category,
      why: significance?.text ?? 'Document interpretation is pending; the exchange title alone does not establish significance.', analysis, analysisStatus: e.status, analysisError: job?.error ?? e.error ?? null,
      collectedAt: e.firstCollectedAt, analysisPublishedAt: analysis ? job.publishedAt ?? analysis.generatedAt : null, delayed, keepDelayed, correction: e.correction,
      priority, priorityReason, routine: analysis?.eventType === 'routine' && level === 'low',
      source: { ...e.filing.source, evidence: analysis ? 'AI interpretation of original filing evidence; disclosed facts and conditional interpretation are separated. Issuer-provided background is not independently verified.' : 'Original disclosure collected; document analysis is pending or unavailable. Exchange metadata is not completed analysis.' },
    });
  }
  const status = pushStatus(state, at);
  return { ...dataset, announcements: [...byUrl.values()], push: status, sources: { ...dataset.sources, announcements: { label: 'NSE Push collection', fetchedAt: state.collection.lastSuccessAt ?? dataset.sources.announcements.fetchedAt, status: state.collection.status === 'ok' ? 'ok' : state.collection.status === 'failed' ? 'stale' : 'unavailable', error: state.collection.error ?? null } } };
}
export function createPushService({ store = createPushStore(), env = process.env, now = Date.now, collect = collectPush, document = processDocument, analyse = processAnalysis } = {}) {
  const minutes = name => { const n = Number(env[name] ?? 15); if (!Number.isInteger(n) || n < 1 || n > 1440) throw new Error('Push cadence must be an integer from 1 to 1440 minutes.'); return n; };
  const targetMinutes = minutes('FINN_PUSH_COLLECTION_MINUTES'); const analysisMinutes = minutes('FINN_PUSH_ANALYSIS_MINUTES');
  const status = state => ({ ...pushStatus(state, now(), { targetMinutes, analysisMinutes }), generation: pushGenerationState(env) });
  return {
    store,
    async decorate(dataset) {
      try { const state = await store.read(); const decorated = decoratePushDataset(dataset, state, now()); decorated.push = status(state); return decorated; }
      catch { return { ...dataset, push: { unavailable: true, error: 'Automatic Push storage is unavailable or not initialized. Saved sources remain readable.' } }; }
    },
    async status() { return status(await store.read()); },
    async refresh() {
      // Every browser may ask, but the durable per-source cooldown/lease bounds requests.
      await store.mutate(s => { if (!s.collection.lastAttemptAt || now() - Date.parse(s.collection.lastAttemptAt) >= 60000) s.collection.requested = true; });
      const result = await collect({ store, now, intervalMs: targetMinutes * 60000 }); return { collection: result, status: status(await store.read()), llmCalls: 0 };
    },
    async tick() {
      const token = randomUUID(); const started = now();
      const accepted = await store.mutate(s => { if (s.workerLease?.until > started) return false; s.workerLease = { token, until: started + 300000 }; return true; });
      if (!accepted) return { busy: true };
      try {
        const collection = await collect({ store, now, intervalMs: targetMinutes * 60000 }); const documents = [];
        for (let i = 0; i < 2 && now() - started < 120000; i++) documents.push(await document({ store, now }));
        const due = await store.mutate(s => { if ((s.nextAnalysisAt ?? 0) > now()) return false; s.nextAnalysisAt = now() + analysisMinutes * 60000; return true; });
        const analysis = due && now() - started < 90000 ? await analyse({ store, env, now }) : { deferred: true };
        await store.mutate(s => { s.lastWorkerAt = new Date(now()).toISOString(); });
        return { collection, documents, analysis, status: status(await store.read()) };
      } finally { await store.mutate(s => { if (s.workerLease?.token === token) s.workerLease = null; }); }
    },
  };
}
