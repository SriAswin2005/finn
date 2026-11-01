import { createHash, randomUUID } from 'node:crypto';
import { fetchAnnouncements } from '../providers/nse.js';
import { portfolio } from '../config/portfolio.js';

const DAY = 86400000;
export const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export function collectionWindow(checkpoint, now) {
  const start = checkpoint ? Date.parse(checkpoint) : now - 7 * DAY;
  return { from: new Date(start - DAY).toISOString(), to: new Date(Math.min(now, start + 3 * DAY)).toISOString(), gapDays: Math.max(0, (now - start) / DAY) };
}
export function mergeFilings(state, filings, collectedAt) {
  let added = 0; let changed = 0;
  for (const filing of filings) {
    const revision = hash({ symbol: filing.symbol, title: filing.title, summary: filing.summary, publishedAt: filing.publishedAt, url: filing.source.url });
    const old = state.events[filing.id];
    if (old?.revision === revision) { old.lastSeenAt = collectedAt; continue; }
    state.events[filing.id] = { filing, revision, firstCollectedAt: old?.firstCollectedAt ?? collectedAt, lastSeenAt: collectedAt, status: 'pending_document', nextAt: 0, documentAttempts: 0,
      previousKey: old?.processingKey ?? old?.previousKey ?? null, supersedesRevision: old?.revision ?? null };
    // An explicit feed identity revision invalidates only this event. Never guess
    // that two similarly titled filings are replacements of each other.
    if (old) changed++; else added++;
  }
  return { added, changed };
}

export async function collectPush({ store, now = Date.now, fetchFilings = fetchAnnouncements, intervalMs = 15 * 60000, symbols = portfolio.map(p => p.symbol) } = {}) {
  if (!Number.isInteger(intervalMs) || intervalMs < 60000) throw new Error('Invalid collection interval.');
  const at = now(); const token = randomUUID();
  const window = await store.mutate(state => {
    const c = state.collection;
    if (c.lease?.until > at || c.nextAt > at && !c.requested) return null;
    c.lease = { token, until: at + 90000 }; c.requested = false;
    return collectionWindow(c.checkpoint, at);
  });
  if (!window) return { skipped: true };
  try {
    const result = await fetchFilings(symbols, new Date(at).toISOString(), { from: window.from, to: window.to, retries: 0, timeoutMs: 12000 });
    if (result.rejected) throw new Error(`${result.rejected} unsupported portfolio rows; checkpoint retained for recovery.`);
    return await store.mutate(state => {
      const c = state.collection; if (c.lease?.token !== token) return { skipped: true };
      const counts = mergeFilings(state, result.announcements, new Date(at).toISOString());
      Object.assign(c, { checkpoint: window.to, lastSuccessAt: new Date(at).toISOString(), lastAttemptAt: new Date(at).toISOString(), status: 'ok', error: null, lease: null,
        nextAt: Date.parse(window.to) < at ? at : at + intervalMs, window, counts, totalSourceRows: result.totalSourceRows, requestUrl: result.requestUrl });
      return { ...counts, checkpoint: c.checkpoint };
    });
  } catch (error) {
    await store.mutate(state => { if (state.collection.lease?.token === token) Object.assign(state.collection, { lease: null, status: 'failed', error: error.message, lastAttemptAt: new Date(at).toISOString(), nextAt: at + 60000 }); });
    return { failed: true, error: error.message };
  }
}
