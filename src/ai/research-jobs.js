import { randomUUID } from 'node:crypto';

// Research answers and leases share the existing durable CAS record, in their
// own namespace. Neither a cold function nor a second instance gets new quota.
export function researchHistory(state, key, identity = {}) {
  const keys = new Set([key, ...(identity.aliases ?? [])]);
  for (const [id, request] of Object.entries(state.research?.requests ?? {})) {
    if (identity.evidenceHash && request.evidenceHash === identity.evidenceHash && request.promptVersion === identity.promptVersion) keys.add(id);
  }
  for (const id of keys) for (const alias of state.research?.requests[id]?.aliases ?? []) keys.add(alias);
  return { keys: [...keys], requests: [...keys].map(id => state.research?.requests[id]).filter(Boolean) };
}
export async function claimResearch(store, key, now, identity = {}) {
  const token = randomUUID();
  return store.mutate(state => {
    state.research ??= { notes: {}, requests: {} };
    const saved = state.research.notes[key];
    if (saved) return { saved };
    const { keys, requests } = researchHistory(state, key, identity);
    const request = state.research.requests[key];
    if (requests.some(r => r.lease?.until > now)) throw new Error('This research answer is already being generated. Please retry shortly.');
    const rejected = requests.find(r => r.status === 'rejected');
    if (rejected) throw new Error(rejected.error);
    const nextAt = Math.max(0, ...requests.map(r => r.nextAt ?? 0));
    if (nextAt > now) throw new Error(`Research generation is cooling down until ${new Date(nextAt).toISOString()}. Saved evidence remains available.`);
    state.research.requests[key] = { ...request, ...identity, aliases: keys.filter(id => id !== key), lease: { token, until: now + 90000 }, status: 'processing' };
    return { token };
  });
}

export async function settleResearch(store, key, token, result) {
  return store.mutate(state => {
    const request = state.research?.requests[key];
    if (request?.lease?.token !== token) throw new Error('Research request ownership expired; answer was not published.');
    if (result.note) state.research.notes[key] = result.note;
    Object.assign(request, { status: result.note ? 'complete' : result.rejected ? 'rejected' : 'deferred', error: result.error ?? null, nextAt: result.nextAt ?? 0, lease: null });
  });
}
