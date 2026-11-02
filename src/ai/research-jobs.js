import { randomUUID } from 'node:crypto';

// Research answers and leases share the existing durable CAS record, in their
// own namespace. Neither a cold function nor a second instance gets new quota.
export async function claimResearch(store, key, now) {
  const token = randomUUID();
  return store.mutate(state => {
    state.research ??= { notes: {}, requests: {} };
    const saved = state.research.notes[key];
    if (saved) return { saved };
    const request = state.research.requests[key];
    if (request?.lease?.until > now) throw new Error('This research answer is already being generated. Please retry shortly.');
    if (request?.status === 'rejected') throw new Error(request.error);
    if (request?.nextAt > now) throw new Error(`Research generation is cooling down until ${new Date(request.nextAt).toISOString()}. Saved evidence remains available.`);
    state.research.requests[key] = { ...request, lease: { token, until: now + 90000 }, status: 'processing' };
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
