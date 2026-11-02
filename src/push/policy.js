import { validatePolicy } from './quota.js';

// Updating an approved allocation is not a quota reset. Historical attempts,
// failures, provider holds, rejected output and exhausted jobs remain intact.
export async function applyPolicy(store, policy, now = Date.now()) {
  validatePolicy(policy);
  return store.mutate(s => {
    if (!s.quota.initialized) throw new Error('Quota missing; policy cannot recreate it.');
    const previous = s.quota.policy;
    if (JSON.stringify(previous) === JSON.stringify(policy)) return { unchanged: true, released: 0 };
    s.quota.policyChanges ??= [];
    s.quota.policyChanges.push({ at: new Date(now).toISOString(), previous, policy });
    s.quota.policy = policy;
    let released = 0;
    for (const job of Object.values(s.jobs)) {
      if (job.status === 'deferred' && job.error === 'Daily local/model allowance exhausted; pending work is retained.' && !job.lease?.until) { job.nextAt = now; released++; }
    }
    for (const request of Object.values(s.research?.requests ?? {})) {
      if (request.status === 'deferred' && request.error === 'Research generation paused: Daily local/model allowance exhausted; pending work is retained.' && !request.lease?.until) { request.nextAt = now; released++; }
    }
    return { released };
  });
}
