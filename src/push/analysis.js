import { claimAnalysis, settleJob } from './jobs.js';
import { filingEvidence } from './evidence.js';
import { pushSchema, pushPrompt, validatePush, ANALYSIS_VERSION, missingContext, presentationAnalysis } from './interpretation.js';
import { reserveAttempt, finishAttempt, classifyFailure, Deferred } from './quota.js';
import { extractFinancialMetrics } from './metrics.js';
import { randomUUID } from 'node:crypto';

export function pushGenerationState(env = process.env) {
  const configured = Boolean(env.GEMINI_API_KEY);
  const freeTierConfirmed = env.FINN_AI_FREE_TIER_CONFIRMED === 'true';
  const hostedApproved = !env.VERCEL || env.FINN_PUSH_HOSTED_APPROVED === 'true';
  const enabled = env.FINN_PUSH_ENABLED === 'true' && configured && freeTierConfirmed && hostedApproved;
  const reason = !configured ? 'Model credentials are not configured.' : !freeTierConfirmed ? 'Billing-disabled project confirmation is missing.' : !hostedApproved ? 'Hosted generation is disabled pending quality acceptance.' : !enabled ? 'Push generation is disabled.' : null;
  return { enabled, configured, freeTierConfirmed, hostedApproved, reason };
}

function publishedResult(analysis, { doc, financials, complexityReasons, model, at }) {
  if (analysis.eventType === 'results') {
    if (!financials.rows.some(r => /revenue/i.test(r.label) && Number.isFinite(r.value))) analysis.missing.push('financial_table');
    if (!financials.rows.some(r => /^EBITDA$/i.test(r.label) && Number.isFinite(r.value))) analysis.missing.push('reported_ebitda');
    if (!financials.rows.some(r => r.previousQuarter !== null && r.previousYear !== null)) analysis.missing.push('comparatives');
  }
  const missingMetrics = analysis.eventType === 'results' ? ['Revenue', 'PBT', 'PAT', 'EBITDA'].filter(metric => !financials.rows.some(r => Number.isFinite(r.value) && (metric === 'PAT' ? /^(?:reported )?PAT$|^net profit$|^profit after tax$/i.test(r.label) : new RegExp(`^(?:total )?${metric}(?: from operations)?$`, 'i').test(r.label)))) : [];
  const uncertainties = [...new Set(analysis.missing)].map(code => missingContext[code]);
  if (missingMetrics.length) uncertainties.push(`Verified structured values unavailable: ${missingMetrics.join(', ')}. Narrative figures, if present, remain separately cited.`);
  return presentationAnalysis({ ...analysis, missing: [...new Set(analysis.missing)], uncertainties, model, analysisVersion: ANALYSIS_VERSION, documentHash: doc.sha256, generatedAt: new Date(at).toISOString(), metrics: financials.rows, complexityReasons });
}

export async function processAnalysis({ store, env = process.env, now = Date.now, fetchImpl = fetch, random = Math.random, eventId } = {}) {
  const generation = pushGenerationState(env);
  if (!generation.enabled) return { disabled: true, reason: generation.reason };
  const job = await claimAnalysis(store, now(), { eventId }); if (!job) return { skipped: true };
  let attemptId; let draft; let observedTokens;
  try {
    const doc = await store.document(job.documentHash); if (!doc) throw new Error('Original document pages missing; analysis cannot be published.');
    const documents = [doc];
    for (const hash of (job.documentHashes ?? []).slice(1)) { const related = await store.document(hash); if (!related) throw new Error('Referenced original pages missing; analysis withheld.'); documents.push(related); }
    const bundle = filingEvidence(documents); bundle.warnings.push(...(job.evidenceWarnings ?? []));
    const financials = extractFinancialMetrics(doc);
    bundle.warnings.push(...financials.limitations);
    if (doc.pages.some(p => p.text.length < 40)) bundle.warnings.push('Some physical pages have no usable text; unreadable content is not interpreted.');
    if (doc.pages.some(p => p.layoutLimited)) bundle.warnings.push('Some page layouts could not be extracted safely; financial cells remain unavailable there.');
    if (!bundle.quotes.length) throw new Error('No usable complete original quotes; analysis unavailable.');
    const state = await store.read(); const policy = state.quota.policy;
    const metadata = `${job.filing.title} ${job.filing.summary}`;
    const complexityReasons = [
      ...(job.complex === true ? ['Earlier interpretation required escalation or explicit evidence review; suitable complex capacity is required.'] : []),
      ...(/results|financial/i.test(metadata) && !financials.rows.length && doc.pages.length > 8 ? ['Financial table context is unresolved across a long filing.'] : []),
      ...(/insolvency|litigation/i.test(metadata) && doc.pages.some(p => p.text.length < 40) ? ['Attached operative legal pages are unreadable.'] : []),
      ...(/acqui|merger/i.test(metadata) && /related part|regulatory approval/i.test(doc.pages.map(p => p.text).join(' ')) ? ['Acquisition includes related-party or approval conditions.'] : []),
      ...(/appoint|management/i.test(metadata) && (doc.pages.map(p => p.text).join(' ').match(/appointment/gi)?.length ?? 0) > 3 && (doc.pages.length > 8 || doc.pages.some(p => /brief profile/i.test(p.text))) ? ['Multiple appointments/profiles require matching people across the disclosed profile sections.'] : []),
    ];
    const complex = job.complex === true || complexityReasons.length > 0;
    const trial = job.filing.evidenceMode === 'captured_evaluation' ? env.FINN_PUSH_EVALUATION_MODEL : null;
    const candidates = Object.entries(policy?.models ?? {}).filter(([m, c]) => c.workflow === 'push' && c.capability === (complex ? 'complex' : 'ordinary') && (!c.evaluationOnly || trial === m) && (!trial || trial === m)).map(([m]) => m);
    if (!candidates.length) throw new Deferred('No approved suitable Push model is configured; work remains pending.', now() + 3600000, 'configuration');
    const prompt = pushPrompt(job.filing, bundle.quotes, financials.rows);
    const estimatedTokens = Math.ceil(Buffer.byteLength(prompt, 'utf8') / 3) + 4000;
    let model; let lastError;
    for (const candidate of candidates) {
      try { attemptId = await reserveAttempt(store, { workflow: 'push', model: candidate, jobKey: job.key, leaseToken: job.lease.token, estimatedTokens, retry: job.attempts > 0, now: now() }); model = candidate; break; }
      catch (error) { if (!(error instanceof Deferred) || error.kind === 'configuration' || /Project/.test(error.message)) throw error; lastError = error; }
    }
    if (!model) throw lastError;
    await store.mutate(s => { s.jobs[job.key].attempts++; s.jobs[job.key].attemptModel = model; s.jobs[job.key].attemptPromptVersion = ANALYSIS_VERSION; });
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
      return { failed: job.attempts >= 2, deferred: job.attempts < 2 };
    }
    if (!response.ok) {
      const failure = classifyFailure({ status: response.status, body, retryAfter: response.headers.get('retry-after'), now: now(), attempt: job.attempts + 1, random });
      await finishAttempt(store, attemptId, { outcome: `http_${response.status}`, failure, now: now() }); attemptId = null;
      await settleJob(store, job, { status: failure.terminal || job.attempts >= 2 ? 'failed' : 'deferred', nextAt: failure.until, error: `Model ${failure.kind} failure; original disclosure retained.` });
      return { failed: failure.terminal || job.attempts >= 2, deferred: !failure.terminal && job.attempts < 2 };
    }
    const candidate = body?.candidates?.[0];
    observedTokens = body?.usageMetadata?.totalTokenCount;
    if (candidate?.finishReason !== 'STOP') throw new Error('Truncated/unfinished model output rejected.');
    const value = JSON.parse(candidate.content.parts.filter(p => !p.thought && typeof p.text === 'string').map(p => p.text).join('')); draft = value;
    const analysis = validatePush(value, bundle);
    await finishAttempt(store, attemptId, { outcome: analysis.needsComplex && !complex ? 'escalated' : 'validated', observedTokens: body.usageMetadata?.totalTokenCount, now: now() }); attemptId = null;
    if (analysis.needsComplex && !complex) {
      await settleJob(store, job, { status: 'deferred', complex: true, nextAt: now() + 60000, error: 'Ordinary model requested stronger interpretation; draft not published.' }); return { escalated: true };
    }
    if (analysis.needsComplex && complex) throw new Error('Complex model remains uncertain; output withheld for review.');
    const result = publishedResult(analysis, { doc, financials, complexityReasons, model, at: now() });
    const accepted = await settleJob(store, job, { status: result.uncertainties.length || bundle.warnings.length ? 'partial' : 'complete', analysis: result, publishedAt: new Date(now()).toISOString(), nextAt: 0, error: null });
    if (!accepted) return { deferred: true, superseded: true };
    return { completed: true, key: job.key, model };
  } catch (error) {
    if (attemptId) await finishAttempt(store, attemptId, { outcome: 'invalid_or_unsupported_output', observedTokens, now: now() });
    await settleJob(store, job, { status: error instanceof Deferred ? error.kind === 'attempt_limit' ? 'failed' : 'deferred' : 'failed', nextAt: error.until ?? 0, error: error.message, ...(draft ? { rejectedDraft: draft } : {}) });
    return { failed: !(error instanceof Deferred), deferred: error instanceof Deferred, error: error.message };
  }
}

// Explicit operator recovery for a demonstrated false refusal. The complete,
// unchanged draft must pass all current guards; no partial curation, new model
// request, budget refund or automatic archive regeneration is performed.
export async function revalidateRejected({ store, key, reason, now = Date.now } = {}) {
  if (typeof reason !== 'string' || reason.length < 20) throw new Error('A source-reviewed false-refusal reason is required.');
  const token = randomUUID();
  const job = await store.mutate(s => {
    const j = s.jobs[key]; if (!j || j.status !== 'failed' || !j.rejectedDraft || j.lease?.until > now()) throw new Error('Only an unchanged rejected structured draft can be reviewed.');
    j.lease = { token, until: now() + 180000 }; return structuredClone(j);
  });
  try {
    const docs = [];
    for (const hash of job.documentHashes ?? [job.documentHash]) { const doc = await store.document(hash); if (!doc) throw new Error('Original evidence missing.'); docs.push(doc); }
    const bundle = filingEvidence(docs); bundle.warnings.push(...(job.evidenceWarnings ?? []));
    const analysis = validatePush(job.rejectedDraft, bundle);
    if (analysis.needsComplex) throw new Error('Draft requests stronger interpretation; revalidation cannot bypass escalation.');
    const state = await store.read(); const attempt = state.quota.attempts.filter(a => a.jobKey === key).at(-1);
    if (!attempt) throw new Error('Original reserved attempt missing; no result accepted.');
    const financials = extractFinancialMetrics(docs[0]); bundle.warnings.push(...financials.limitations);
    const result = publishedResult(analysis, { doc: docs[0], financials, complexityReasons: [], model: attempt.model, at: attempt.finishedAt ?? attempt.at });
    result.review = { kind: 'unchanged_draft_revalidated', reason, reviewedAt: new Date(now()).toISOString(), originalPromptVersion: job.attemptPromptVersion ?? 'not_persisted' };
    const accepted = await settleJob(store, job, { status: result.uncertainties.length || bundle.warnings.length ? 'partial' : 'complete', analysis: result, publishedAt: new Date(now()).toISOString(), error: null, nextAt: 0 });
    if (!accepted) return { accepted: false, superseded: true, llmCalls: 0 };
    return { accepted: true, llmCalls: 0 };
  } catch (error) { await settleJob(store, job, { status: 'failed', error: error.message }); throw error; }
}
