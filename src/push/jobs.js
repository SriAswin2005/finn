import { randomUUID } from 'node:crypto';
import { hash } from './collection.js';
import { collectFilingDocument, referencedFilings } from './evidence.js';

export function acceptDocumentJob(state, current, at) {
  const hashes = [current.documentHash, ...(current.relatedHashes ?? [])];
  const namespace = filing => filing.evidenceMode === 'captured_evaluation' ? 'evaluation' : 'collected';
  const existing = Object.values(state.jobs).find(job => {
    const original = state.events[job.eventId];
    return original && original.filing.symbol === current.filing.symbol && namespace(original.filing) === namespace(current.filing)
      && (job.documentHashes ?? [job.documentHash]).join('|') === hashes.join('|');
  });
  const key = existing?.key ?? hash(`${namespace(current.filing)}|${current.filing.symbol}|${hashes.join('|')}`);
  const priorKey = current.processingKey ?? current.previousKey;
  current.processingKey = key; current.lease = null; current.documentAttempts = 0; current.error = null;
  const previous = state.jobs[key];
  if (!previous) state.jobs[key] = { key, eventId: current.filing.id, documentHash: hashes[0], documentHashes: hashes, observations: [current.filing.id], status: 'pending', attempts: 0, nextAt: 0, createdAt: new Date(at).toISOString(), revision: current.revision, evidenceWarnings: current.evidenceWarnings ?? [] };
  else previous.observations = [...new Set([...(previous.observations ?? [previous.eventId]), current.filing.id])];
  current.status = state.jobs[key].status;
  if (priorKey && priorKey !== key) { current.previousKey = priorKey; current.correction = 'Attachment or referenced evidence changed; previous analysis superseded for this event.'; }
  return { key, unchanged: Boolean(previous) };
}

export async function processDocument({ store, now = Date.now, collectDocument = collectFilingDocument } = {}) {
  const at = now(); const token = randomUUID();
  const event = await store.mutate(state => {
    const eligible = Object.values(state.events).filter(e => !e.replacedBy && (['pending_document', 'pending_related', 'document_retry'].includes(e.status) || e.nextCheckAt <= at) && (e.nextAt ?? 0) <= at && !(e.lease?.until > at))
      .sort((a, b) => (a.status === 'complete') - (b.status === 'complete') || Date.parse(b.filing.publishedAt) - Date.parse(a.filing.publishedAt))[0];
    if (!eligible) return null;
    eligible.lease = { token, until: at + 120000 }; eligible.documentAttempts++;
    return structuredClone(eligible);
  });
  if (!event) return { skipped: true };
  try {
    const relatedUrl = event.status === 'pending_related' ? event.relatedUrls?.[0] : null;
    const document = await collectDocument(relatedUrl ? { ...event.filing, source: { ...event.filing.source, url: relatedUrl } } : event.filing);
    await store.saveDocument(document); // Persist original pages before publishing a job.
    return store.mutate(state => {
      const current = state.events[event.filing.id];
      if (current?.revision !== event.revision || current.lease?.token !== token) return { superseded: true };
      if (relatedUrl) {
        current.relatedHashes = [...new Set([...(current.relatedHashes ?? []), document.sha256])]; current.relatedUrls.shift();
      } else {
        const priorHash = current.documentHash;
        if (priorHash && priorHash !== document.sha256) for (const other of Object.values(state.events)) {
          if (other.filing.id !== current.filing.id && other.filing.source.url === current.filing.source.url && other.documentHash === priorHash && !other.replacedBy) {
            other.previousKey = other.processingKey; other.processingKey = null; other.status = 'pending_document'; other.nextAt = 0;
            other.correction = 'The shared source attachment changed; previous analysis is withheld pending processing.';
          }
        }
        current.documentHash = document.sha256; current.relatedHashes = []; current.relatedUrls = referencedFilings(document); current.evidenceWarnings = [];
        current.documentCheckedAt = new Date(at).toISOString(); current.nextCheckAt = at + 86400000;
        const correction = /\bcorrected\b|\brevised\b|\bsupersed/i.test(document.pages.map(p => p.text).join(' '));
        if (correction) {
          const exactReplaced = Object.values(state.events).filter(other => other.filing.id !== current.filing.id && other.filing.symbol === current.filing.symbol && current.relatedUrls.includes(other.filing.source.url));
          const replacedKeys = new Set(exactReplaced.map(e => e.processingKey).filter(Boolean));
          for (const other of Object.values(state.events)) if (exactReplaced.includes(other) || other.filing.id !== current.filing.id && replacedKeys.has(other.processingKey)) { other.status = 'superseded'; other.replacedBy = current.filing.id; }
          if (!exactReplaced.length) current.evidenceWarnings.push('Correction/revision language is present, but the exact earlier filing was not identified. Earlier records are not silently invalidated.');
        }
      }
      current.lease = null; current.nextAt = 0;
      if (current.relatedUrls.length) { current.status = 'pending_related'; return { pendingRelated: true }; }
      return acceptDocumentJob(state, current, at);
    });
  } catch (error) {
    await store.mutate(state => {
      const current = state.events[event.filing.id]; if (current?.revision !== event.revision || current.lease?.token !== token) return;
      if (event.status === 'pending_related') {
        current.relatedUrls.shift(); current.evidenceWarnings.push('A referenced original disclosure could not be retrieved; its missing contents are not inferred.'); current.lease = null;
        if (current.relatedUrls.length) current.status = 'pending_related'; else acceptDocumentJob(state, current, at);
        return;
      }
      current.lease = null; current.error = error.message;
      const unreadable = /unreadable|OCR|no usable|not return a PDF|No allowed/i.test(error.message);
      current.status = unreadable || current.documentAttempts >= 3 ? 'document_failed' : 'document_retry';
      current.nextAt = at + 60000 * 2 ** Math.min(current.documentAttempts, 6); current.nextCheckAt = at + 86400000;
    });
    return { failed: true, error: error.message };
  }
}
export async function claimAnalysis(store, at = Date.now(), { eventId } = {}) {
  const token = randomUUID();
  return store.mutate(state => {
    const active = j => Object.values(state.events).find(e => e.processingKey === j.key && !e.replacedBy && (!eventId || e.filing.id === eventId));
    const job = Object.values(state.jobs).filter(j => active(j) && ['pending', 'deferred', 'processing'].includes(j.status) && j.nextAt <= at && !(j.lease?.until > at))
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))[0];
    if (!job) return null;
    const event = active(job); job.eventId = event.filing.id;
    job.lease = { token, until: at + 90000 }; job.status = 'processing';
    return { ...structuredClone(job), filing: structuredClone(event.filing) };
  });
}
export async function settleJob(store, job, update) {
  return store.mutate(state => {
    const current = state.jobs[job.key];
    if (current?.lease?.token !== job.lease.token) return false;
    Object.assign(current, update, { lease: null });
    for (const event of Object.values(state.events)) if (event.processingKey === job.key && !event.replacedBy) event.status = current.status;
    return true;
  });
}
