import { claimAnalysis, settleJob } from './jobs.js';
import { filingEvidence } from './evidence.js';
import { pushSchema, pushPrompt, validatePush, ANALYSIS_VERSION, missingContext } from './interpretation.js';
import { reserveAttempt, finishAttempt, classifyFailure, Deferred } from './quota.js';
import { extractFinancialMetrics } from './metrics.js';

export async function processAnalysis({ store, env = process.env, now = Date.now, fetchImpl = fetch, random = Math.random, eventId } = {}) {
  if (env.FINN_PUSH_ENABLED !== 'true' || !env.GEMINI_API_KEY || env.FINN_AI_FREE_TIER_CONFIRMED !== 'true') return { disabled: true };
  if (env.VERCEL && env.FINN_PUSH_HOSTED_APPROVED !== 'true') return { disabled: true, reason: 'Hosted Gemini transfer/activation is not approved.' };
  const job = await claimAnalysis(store, now(), { eventId }); if (!job) return { skipped: true };
  let attemptId; let draft;
  try {
    const doc = await store.document(job.documentHash); if (!doc) throw new Error('Original document pages missing; analysis cannot be published.');
    const bundle = filingEvidence([doc]);
    const financials = extractFinancialMetrics(doc);
    bundle.warnings.push(...financials.limitations);
    if (doc.pages.some(p => p.text.length < 40)) bundle.warnings.push('Some physical pages have no usable text; unreadable content is not interpreted.');
    if (doc.pages.some(p => p.layoutLimited)) bundle.warnings.push('Some page layouts could not be extracted safely; financial cells remain unavailable there.');
    if (!bundle.quotes.length) throw new Error('No usable complete original quotes; analysis unavailable.');
    const state = await store.read(); const policy = state.quota.policy;
    const metadata = `${job.filing.title} ${job.filing.summary}`;
    const complexityReasons = [
      ...(/results|financial/i.test(metadata) && !financials.rows.length && doc.pages.length > 8 ? ['Financial table context is unresolved across a long filing.'] : []),
      ...(/insolvency|litigation/i.test(metadata) && doc.pages.some(p => p.text.length < 40) ? ['Attached operative legal pages are unreadable.'] : []),
      ...(/acqui|merger/i.test(metadata) && /related part|regulatory approval/i.test(doc.pages.map(p => p.text).join(' ')) ? ['Acquisition includes related-party or approval conditions.'] : []),
    ];
    const complex = job.complex === true || complexityReasons.length > 0;
    const candidates = Object.entries(policy?.models ?? {}).filter(([, c]) => c.workflow === 'push' && c.capability === (complex ? 'complex' : 'ordinary')).map(([m]) => m);
    if (!candidates.length) throw new Deferred('No approved suitable Push model is configured; work remains pending.', now() + 3600000, 'configuration');
    const prompt = pushPrompt(job.filing, bundle.quotes, financials.rows);
    const estimatedTokens = Math.ceil(Buffer.byteLength(prompt, 'utf8') / 3) + 4000;
    let model; let lastError;
    for (const candidate of candidates) {
      try { attemptId = await reserveAttempt(store, { workflow: 'push', model: candidate, jobKey: job.key, leaseToken: job.lease.token, estimatedTokens, retry: job.attempts > 0, now: now() }); model = candidate; break; }
      catch (error) { if (!(error instanceof Deferred) || error.kind === 'configuration' || /Project/.test(error.message)) throw error; lastError = error; }
    }
    if (!model) throw lastError;
    await store.mutate(s => { s.jobs[job.key].attempts++; });
    let response; let body;
    try {
      response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY }, signal: AbortSignal.timeout(30000),
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', responseJsonSchema: pushSchema, maxOutputTokens: 4000, temperature: 0.1, ...(policy.models[model].thinkingLevel ? { thinkingConfig: { thinkingLevel: policy.models[model].thinkingLevel } } : {}) } }),
      }); body = await response.json();
    } catch {
      const failure = classifyFailure({ now: now(), attempt: job.attempts + 1, random });
      await finishAttempt(store, attemptId, { outcome: 'timeout_or_network_unknown', failure, now: now() }); attemptId = null;
      await settleJob(store, job, { status: job.attempts >= 2 ? 'failed' : 'deferred', nextAt: failure.until, error: 'Model network/timeout error; reserved attempt counted conservatively.' });
      return { deferred: true };
    }
    if (!response.ok) {
      const failure = classifyFailure({ status: response.status, body, retryAfter: response.headers.get('retry-after'), now: now(), attempt: job.attempts + 1, random });
      await finishAttempt(store, attemptId, { outcome: `http_${response.status}`, failure, now: now() }); attemptId = null;
      await settleJob(store, job, { status: failure.terminal || job.attempts >= 2 ? 'failed' : 'deferred', nextAt: failure.until, error: `Model ${failure.kind} failure; original disclosure retained.` });
      return { failed: failure.terminal, deferred: !failure.terminal };
    }
    const candidate = body?.candidates?.[0];
    if (candidate?.finishReason !== 'STOP') throw new Error('Truncated/unfinished model output rejected.');
    const value = JSON.parse(candidate.content.parts.filter(p => !p.thought && typeof p.text === 'string').map(p => p.text).join('')); draft = value;
    const analysis = validatePush(value, bundle);
    await finishAttempt(store, attemptId, { outcome: analysis.needsComplex && !complex ? 'escalated' : 'validated', observedTokens: body.usageMetadata?.totalTokenCount, now: now() }); attemptId = null;
    if (analysis.needsComplex && !complex) {
      await settleJob(store, job, { status: 'deferred', complex: true, nextAt: now() + 60000, error: 'Ordinary model requested stronger interpretation; draft not published.' }); return { escalated: true };
    }
    if (analysis.needsComplex && complex) throw new Error('Complex model remains uncertain; output withheld for review.');
    if (analysis.eventType === 'results') {
      if (!financials.rows.some(r => /revenue/i.test(r.label))) analysis.missing.push('financial_table');
      if (!financials.rows.some(r => /^EBITDA$/i.test(r.label))) analysis.missing.push('reported_ebitda');
      if (!financials.rows.some(r => r.previousQuarter !== null && r.previousYear !== null)) analysis.missing.push('comparatives');
    }
    const missingMetrics = analysis.eventType === 'results' ? ['Revenue', 'PBT', 'PAT', 'EBITDA'].filter(metric => !financials.rows.some(r => metric === 'PAT' ? /^(?:reported )?PAT$|^net profit$|^profit after tax$/i.test(r.label) : new RegExp(`^(?:total )?${metric}(?: from operations)?$`, 'i').test(r.label))) : [];
    const uncertainties = [...new Set(analysis.missing)].map(code => missingContext[code]);
    if (missingMetrics.length) uncertainties.push(`Verified structured values unavailable: ${missingMetrics.join(', ')}. Narrative figures, if present, remain separately cited.`);
    const result = { ...analysis, missing: [...new Set(analysis.missing)], uncertainties, model, analysisVersion: ANALYSIS_VERSION, documentHash: doc.sha256, generatedAt: new Date(now()).toISOString(), metrics: financials.rows, complexityReasons };
    await settleJob(store, job, { status: analysis.missing.length || bundle.warnings.length ? 'partial' : 'complete', analysis: result, nextAt: 0, error: null });
    return { completed: true, key: job.key, model };
  } catch (error) {
    if (attemptId) await finishAttempt(store, attemptId, { outcome: 'invalid_or_unsupported_output', now: now() });
    await settleJob(store, job, { status: error instanceof Deferred ? error.kind === 'attempt_limit' ? 'failed' : 'deferred' : 'failed', nextAt: error.until ?? 0, error: error.message, ...(draft ? { rejectedDraft: draft } : {}) });
    return { failed: !(error instanceof Deferred), deferred: error instanceof Deferred, error: error.message };
  }
}
