import { randomUUID } from 'node:crypto';

const pacificDay = at => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(at));
export function nextPacificReset(at) {
  let high = at + 26 * 3600000; let low = at;
  while (high - low > 1000) { const mid = Math.floor((high + low) / 2); if (pacificDay(mid) === pacificDay(at)) low = mid; else high = mid; }
  return high;
}
export function validatePolicy(policy) {
  const positive = n => Number.isInteger(n) && n > 0;
  if (!policy || !positive(policy.totalDaily) || !positive(policy.retryDaily) || !positive(policy.allocations?.push) || !positive(policy.allocations?.research) || !policy.models || Object.keys(policy.models).length === 0) throw new Error('Quota policy missing or corrupt; no model attempt allowed.');
  if (policy.totalDaily > 20 || policy.allocations.push + policy.allocations.research > policy.totalDaily) throw new Error('Local allocations exceed the already-approved 20-attempt policy.');
  for (const [model, cap] of Object.entries(policy.models)) {
    if (!/^(?:gemini|gemma)-[a-z0-9.-]{2,100}$/.test(model) || !['push', 'research'].includes(cap.workflow) || !positive(cap.rpm) || !positive(cap.tpm) || !positive(cap.rpd)) throw new Error('Invalid quota/model separation policy.');
    if (cap.appRpd !== undefined && (!positive(cap.appRpd) || cap.appRpd > cap.rpd) || cap.capability !== undefined && !['research', 'ordinary', 'complex'].includes(cap.capability)) throw new Error('Invalid model application allocation/capability.');
  }
  return policy;
}
export class Deferred extends Error { constructor(message, until, kind = 'capacity') { super(message); this.until = until; this.kind = kind; } }
export async function reserveAttempt(store, { workflow, model, jobKey, leaseToken, estimatedTokens, retry = false, now = Date.now() }) {
  return store.mutate(state => {
    const q = state.quota; if (!q.initialized) throw new Error('Shared quota is not initialized; generation is paused.');
    const policy = validatePolicy(q.policy); const cap = policy.models[model];
    if (!cap || cap.workflow !== workflow || !Number.isInteger(estimatedTokens) || estimatedTokens <= 0) throw new Error('Model is not assigned to this workflow or token estimate is invalid.');
    if (q.stopped) throw new Deferred('Model credentials/configuration require operator attention.', now + 86400000, 'configuration');
    if (q.projectUntil > now) throw new Deferred('Project quota is paused.', q.projectUntil);
    if ((q.cooldowns[model] ?? 0) > now) throw new Deferred('Model capacity is cooling down.', q.cooldowns[model]);
    if (jobKey && (!state.jobs[jobKey] || state.jobs[jobKey].lease?.token !== leaseToken || state.jobs[jobKey].lease.until <= now)) throw new Error('Job lease is no longer owned; no model call allowed.');
    const today = q.attempts.filter(a => pacificDay(a.at) === pacificDay(now));
    const modelDay = today.filter(a => a.model === model);
    if (today.length >= policy.totalDaily || today.filter(a => a.workflow === workflow).length >= policy.allocations[workflow] || modelDay.length >= Math.min(cap.rpd, cap.appRpd ?? cap.rpd) || retry && today.filter(a => a.retry).length >= policy.retryDaily) throw new Deferred('Daily local/model allowance exhausted; pending work is retained.', nextPacificReset(now), 'daily');
    const minute = q.attempts.filter(a => a.at > now - 60000 && a.model === model);
    if (minute.length >= cap.rpm || minute.reduce((sum, a) => sum + Math.max(a.estimatedTokens, a.observedTokens ?? 0), estimatedTokens) > cap.tpm) throw new Deferred('Minute request/token allowance unavailable.', now + 60000, 'minute');
    const own = q.attempts.filter(a => jobKey && a.jobKey === jobKey);
    if (own.length >= 3) throw new Deferred('Job attempt limit reached.', now + 86400000, 'attempt_limit');
    const id = randomUUID();
    q.attempts.push({ id, workflow, model, jobKey: jobKey ?? null, at: now, estimatedTokens, retry, outcome: 'reserved_unknown' });
    return id;
  });
}
export function classifyFailure({ status, body, retryAfter, now = Date.now(), attempt = 1, random = Math.random }) {
  const headerDelay = /^\d+(?:\.\d+)?$/.test(retryAfter ?? '') ? Number(retryAfter) * 1000 : Math.max(0, Date.parse(retryAfter) - now) || 0;
  const details = body?.error?.details ?? [];
  const delay = Math.max(headerDelay, ...details.map(d => /^\d+(?:\.\d+)?s$/.test(d.retryDelay ?? '') ? parseFloat(d.retryDelay) * 1000 : 0), 0);
  if ([400, 401, 403, 404].includes(status)) return { kind: 'configuration', until: now + 86400000, terminal: true };
  if (status === 429) {
    const violations = details.flatMap(d => Array.isArray(d.violations) ? d.violations : typeof d.quotaId === 'string' ? [d] : []);
    const ids = violations.map(v => v.quotaId ?? '');
    const perModel = ids.length && ids.every(id => /permodel/i.test(id));
    const daily = ids.some(id => /perday/i.test(id));
    if (!perModel) return { kind: 'project', until: Math.max(nextPacificReset(now), now + delay), terminal: false };
    return { kind: daily ? 'daily' : 'minute', until: Math.max(daily ? nextPacificReset(now) : now + 60000, now + delay), terminal: false };
  }
  if (!status || status >= 500 || status === 408) return { kind: 'transient', until: now + Math.max(delay, Math.min(3600000, 30000 * 2 ** Math.min(attempt, 6)) * (0.75 + random() * 0.5)), terminal: false };
  return { kind: 'invalid', until: now + 86400000, terminal: true };
}
export async function finishAttempt(store, id, { outcome, observedTokens, failure, now = Date.now() }) {
  await store.mutate(state => {
    const q = state.quota; const a = q.attempts.find(entry => entry.id === id);
    if (!a) throw new Error('Reserved attempt disappeared; quota is corrupt.');
    a.outcome = outcome; a.finishedAt = now;
    if (Number.isFinite(observedTokens) && observedTokens >= 0) a.observedTokens = observedTokens;
    if (!failure) { q.failures[a.model] = 0; return; }
    a.failure = failure.kind; q.cooldowns[a.model] = Math.max(q.cooldowns[a.model] ?? 0, failure.until);
    if (failure.kind === 'project') q.projectUntil = Math.max(q.projectUntil, failure.until);
    if (failure.kind === 'configuration') q.stopped = 'credentials_or_model_configuration';
    if (failure.kind === 'transient') {
      q.failures[a.model] = (q.failures[a.model] ?? 0) + 1;
      if (q.failures[a.model] >= 3) q.cooldowns[a.model] = Math.max(q.cooldowns[a.model], now + 15 * 60000);
    }
  });
}
