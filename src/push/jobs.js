import { randomUUID } from 'node:crypto';
import { hash } from './collection.js';
import { collectFilingDocument } from './evidence.js';

export async function processDocument({ store, now = Date.now, collectDocument = collectFilingDocument } = {}) {
  const at = now(); const token = randomUUID();
  const event = await store.mutate(state => {
    const eligible = Object.values(state.events).filter(e => (e.status === 'pending_document' || e.status === 'document_retry' || e.nextCheckAt <= at) && (e.nextAt ?? 0) <= at && !(e.lease?.until > at))
      .sort((a, b) => (a.status === 'complete') - (b.status === 'complete') || Date.parse(b.filing.publishedAt) - Date.parse(a.filing.publishedAt))[0];
    if (!eligible) return null;
    eligible.lease = { token, until: at + 120000 }; eligible.documentAttempts++;
    return structuredClone(eligible);
  });
  if (!event) return { skipped: true };
  try {
    const document = await collectDocument(event.filing);
    await store.saveDocument(document); // Persist original pages before publishing a job.
    return store.mutate(state => {
      const current = state.events[event.filing.id];
      if (current?.revision !== event.revision || current.lease?.token !== token) return { superseded: true };
      const key = hash(`${event.filing.id}|${document.sha256}`);
      const priorKey = current.processingKey ?? current.previousKey;
      current.processingKey = key; current.documentHash = document.sha256; current.documentCheckedAt = new Date(at).toISOString(); current.nextCheckAt = at + 86400000; current.lease = null; current.documentAttempts = 0; current.error = null;
      const previous = state.jobs[key];
      if (!previous) state.jobs[key] = { key, eventId: event.filing.id, documentHash: document.sha256, status: 'pending', attempts: 0, nextAt: 0, createdAt: new Date(at).toISOString(), revision: current.revision };
      // Same immutable content reuses accepted analysis even after metadata/prompt changes.
      current.status = state.jobs[key].status;
      if (priorKey && priorKey !== key) { current.previousKey = priorKey; current.correction = 'Attachment changed; previous analysis superseded for this event.'; }
      return { key, unchanged: Boolean(previous) };
    });
  } catch (error) {
    await store.mutate(state => {
      const current = state.events[event.filing.id]; if (current?.revision !== event.revision || current.lease?.token !== token) return;
      current.lease = null; current.error = error.message;
      const unreadable = /unreadable|OCR|no usable|not return a PDF|No allowed/i.test(error.message);
      current.status = unreadable || current.documentAttempts >= 3 ? 'document_failed' : 'document_retry';
      current.nextAt = at + 60000 * 2 ** Math.min(current.documentAttempts, 6); current.nextCheckAt = at + 86400000;
    });
    return { failed: true, error: error.message };
  }
}
export async function claimAnalysis(store, at = Date.now()) {
  const token = randomUUID();
  return store.mutate(state => {
    const job = Object.values(state.jobs).filter(j => ['pending', 'deferred', 'processing'].includes(j.status) && j.nextAt <= at && !(j.lease?.until > at) && state.events[j.eventId]?.processingKey === j.key)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))[0];
    if (!job) return null;
    job.lease = { token, until: at + 90000 }; job.status = 'processing';
    return { ...structuredClone(job), filing: structuredClone(state.events[job.eventId].filing) };
  });
}
export async function settleJob(store, job, update) {
  return store.mutate(state => {
    const current = state.jobs[job.key];
    if (current?.lease?.token !== job.lease.token) return false;
    Object.assign(current, update, { lease: null });
    const event = state.events[job.eventId];
    if (event?.processingKey === job.key) event.status = current.status;
    return true;
  });
}
