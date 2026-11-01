# Billing-disabled Gemini and shared workflow policy

Reconciled November 1,2026. One Gemini key is sufficient; no ChatGPT/Sarvam key. Keep the original key in ignored backend `.env`; never print, commit or request it in chat. User approved the exact hosted transfer November1; original key is now a Vercel production Secret, with generation disabled pending quality. Local calls under existing caps are authorized; hosted transfer/activation needs explicit approval in [DEPLOYMENT.md](DEPLOYMENT.md).

## Configurable versions and separate roles

`src/config/model-policy.json` is the default, overridable server-side with `FINN_MODEL_POLICY_JSON`. Model IDs, workflow/capability, thinking level, RPM, input TPM, provider RPD and local appRpd are configuration. Future version IDs require explicit free-access/project-limit verification and evaluation, not generation-specific runtime edits. No automatic version substitution/archive regeneration. Tests accept future4.0 IDs through this policy.

| Current configured model | Role | User-reported RPM / input TPM / RPD | Application allocation |
| --- | --- | --- | --- |
| gemini-3.5-flash-lite | Research |15 /250,000 /500 |6 |
| gemini-3.1-flash-lite | Ordinary Push |15 /250,000 /500 |8 |
| gemini-3.8-flash | Complex Push |5 /250,000 /20 |2 |
| gemini-3.6-flash | Captured-only complex evaluation |5 /250,000 /20 |4 |

AI Studio limits were supplied by the user November 1; authenticated model metadata 200 verified project access to all four, not quota. Google documents project-wide limits and midnight-Pacific RPD reset. This is separate from the approved local ceiling: **20 total attempts**, allocations **Research 6 / Push 14**, retry budget4. Total/workflow/retry caps also enforce rolling24h, so a provider midnight cannot grant another local allowance. No approved total increase occurred.

The4 slots for3.6 require both a captured evaluation event and explicit FINN_PUSH_EVALUATION_MODEL; they are not production fallback capacity. Current production-eligible Push per-model allocations total 10. Models belong to one workflow only. Research's former 3.1/Flash fallbacks are deliberately assigned to Push; unevaluated Gemma is not a default. Research caches/refusal contracts remain; fallback mechanics are tested under explicit isolated Research-only policies.

`FINN_GEMINI_MODELS` remains a legacy inventory, intersected with approved Research assignments. The local configurator's older fixed candidate list is an inventory aid, not the runtime authority for new generation versions. Use the JSON policy for upgrades, and update the legacy inventory if it would exclude the new Research ID. Saving an ID never proves project/free-tier access.

## Local setup and durable reconciliation

`npm run configure:ai` accepts the key through hidden local console input, preserves unrelated settings and makes no network/model call. It requires billing-disabled confirmation; if secure input is unavailable it stops before key entry. Alternatively edit ignored `.env` privately using `.env.example` as a reference, preserving existing keys/settings. FINN cannot inspect/change Google billing. Never enable billing or paid fallback.

Both workflows need the same initialized Push ledger before generation. A brand-new checkout must reconcile actual prior state, not invent a fresh budget. This checkout is already initialized with previous Research attempts imported. `node --env-file=.env scripts/push.js init` explicitly imports ignored `data/cache/ai/quota.json` and refuses missing/corrupt legacy history or initialized state. Do not rerun/reset/delete it to bypass limits. On Vercel durable DATABASE_URL is mandatory; after approved migration every local/hosted worker must use the same Neon ledger.

Changing environment JSON alone does not replace persisted quota policy. After reviewing it, `node --env-file=.env scripts/push.js policy` applies roles/limits **without changing attempts/cooldowns**. Keep total/allocations within existing approval. Ordinary key configuration cannot silently initialize allowance.

| Operator command (prefix `node --env-file=.env scripts/push.js`) | Effect |
| --- | --- |
| status |Read local/shared state; no model call |
| collect |Bounded source refresh/catch-up;0 model calls |
| tick |Shared awaited orchestration: one collection, up to2 document steps, up to1 eligible model call |
| policy |Apply reviewed configuration, preserve all ledger history |
| retry KEY REVIEW_REASON [--complex] |Explicit reviewed failed-job recovery,20–500 character reason; lifetime3-attempt/daily-retry caps retained |
| revalidate KEY REVIEW_REASON |Whole unchanged rejected draft through all current guards; original reservation required;0 calls/refunds, no partial curation |

Local model enablement also needs FINN_PUSH_ENABLED=true, GEMINI_API_KEY and FINN_AI_FREE_TIER_CONFIRMED=true. Hosted Push additionally needs FINN_PUSH_HOSTED_APPROVED=true; `.env.example` keeps safe false defaults. Hosted Research remains disabled. Do not enable production generation merely because tests pass.

`scripts/evaluate-push.js` explicitly imports ignored captures and selects their event IDs; normal workers never claim them and Latest never displays them. Optional FINN_PUSH_EVALUATION_MODEL permits only the matching configured capture-only alternative. Evaluations share the same allowance. Do not run casually or requeue capped jobs.

## Attempts, caching and failure behavior

App opens/navigation/Reload/source Refresh make 0 model calls. Only new/changed evidence can create a new Push job; same issuer/full content hashes share one job across observation IDs. Prompt/model upgrades and preferences do not regenerate accepted history. Existing Research cache identity still includes evidence/question/prompt/model assignments; baked reviewed notes return without credentials/new attempts.

Every attempted network request reserves shared capacity atomically first, including retries and uncertain timeouts. Per-model minute request/token estimates, provider/app daily caps, project/model cooldowns, exponential jitter, circuit stops and configuration/auth stops persist. Token estimates conservatively allow output; observed totals are retained even on rejected bodies. No SDK hidden retries, key rotation or paid fallback.

Push uses one 30s request/invocation, maximum 3 attempts per content job. A failure/deferred job is retained; retry quota and source-specific recovery apply. An unsuitable ordinary model cannot consume a complex job. Invalid/truncated/unsupported output is not automatically regenerated or published; reviewed retry/revalidation cannot reset lifetime counts. Research retains its narrower network/fallback guard (20s/attempt,45s shared request budget, max3 attempts) plus shared reservations and legacy conservative local guard.

Public document excerpts go to Google; explicit Research questions do too. Credentials/user preferences/portfolio account data do not. Structured output/server-owned quote IDs and number/context/name/action guards reduce known errors but do not prove semantic entailment or omission-free financial interpretation. Manual source review remains required. See [PUSH_EVALUATION.md](PUSH_EVALUATION.md) and [AI_REVIEW.md](AI_REVIEW.md).

Official references checked November 1: [models](https://ai.google.dev/gemini-api/docs/models), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [structured output](https://ai.google.dev/gemini-api/docs/structured-output), [thinking](https://ai.google.dev/gemini-api/docs/thinking), [API keys](https://ai.google.dev/gemini-api/docs/api-key). Historical invalid-key issue resolved October 28 after local editing/metadata 200; do not diagnose it as a current blocker.


Hosted generation status now reports only configured/enabled/free-tier/hosted-gate flags and reason from the same gate used by analysis. It cannot expose a key/fingerprint and makes no model request. Syntax/all109 tests pass; approved key stored, runtime deployment verification pending.
