# Push workflow acceptance and operating contract

November 1, 2026, IST. This is the active Push scope; it supersedes the older manual-only scope in SPEC. Research expansion, OS notifications and submission work remain deferred.

## What useful means

Main assessment p.2 asks for a default 24-hour configurable digest, prioritised portfolio filings, configurable EOD triggers, a short supported incoming-manager background, and quarterly Revenue/EBITDA/PBT/PAT with QoQ/YoY. The reference pp.1–3 distinguishes announcement categories, financial metrics and primary documents. A useful card must explain the actual event and its significant details in roughly 30 seconds, with evidence expandable. A meeting notice is not a result; EBIT is not EBITDA; a missing biography or comparative is unavailable. Category alone is not materiality.

Initial gap assessment: saved Latest and narrow recorded enrichments worked, while durable automatic collection/interpretation/recovery were missing. November 1 local pipeline now implements those stages and passes 108 tests; source-reviewed unseen quality and intended-host unattended acceptance remain open. Recorded examples remain regression evidence only.

## Implementation sequence and acceptance

1. Durable collection: official NSE feed only; overlapping bounded windows; checkpoint advances only with committed filings; stable exchange IDs, metadata revisions and attachment hashes; failed sources preserve checkpoint and prior successes. Retain work at least 90 days, do not age pending work out of the digest. Test missed windows, duplicates, corrections and concurrent leases.
2. Evidence and interpretation: generic PDF parser, immutable physical pages/hash, source-owned quote IDs, independent Push prompt/cache/queue/model allocation. Facts, conditional significance, uncertainty and justified priority. Explicit unreadable/ambiguous/partial states. No completed publication on rejection/truncation.
3. Atomic reservations and recovery: fail closed on absent/corrupt quota configuration/state; per workflow/model request/token limits; conservative unknown attempts, Pacific reset, retry budget, backoff/circuit/auth stops. No browser generation. Content identity, not prompt changes/preferences, triggers work.
4. Cached delivery: Latest default, saved cards first, refresh requests freshness/catch-up without rewriting completed analysis. Pending/error/partial states, collection/publication times, delayed important work, transparent priority and evidence pages. EOD signals stay separate.
5. Verify local real unseen outputs and deployment persistence, then activate only with applicable hosted-secret/scheduler approval. Completion requires observed unattended production collection and new-event analysis. Passing fixtures/tests is insufficient.

## Evaluation set and current evidence

| Case | Required review | Evidence status |
| --- | --- | --- |
| Existing L&T results / HDFC succession | Preserve reviewed arithmetic, p.11 / profile p.3 and caveats | Captured regression examples, already reviewed |
| Unseen results issuer | Revenue, PBT, PAT, exact profit labels, period/unit/entity; absent EBITDA/comparatives explicit | Captured APL/Sun results evaluated; no accepted summary. APL aligned metric table reviewed. |
| Unseen management issuer | Person, role, effective date, reason, supported issuer-attributed background or explicit omission | CDSL retirement partial; Elecon/Safari incoming-profile cases refused/deferred, not passed. |
| Acquisition / contract / capital allocation | Consideration/order size, conditions, timing, counterparty, uncertainty; no implied revenue/profit | L&T contract partial with size-band omission; APL acquisition timed out. |
| Regulatory / litigation | Authority, amount/currency, operative order, appeal/contingency; no unsupported insolvency conclusion | Polycab appeal timed out; attached operative-order text unreadable. |
| Routine notice | Correct dates/purpose, concise low-priority reason; unknowns remain visible | Bharti/CDSL notices refused; routine usefulness/priority not passed. |
| Ambiguous, corrected, unreadable | Refuse invented cells/biography; retain original/replacement identities; expose limitation | Correction/reference/malformed-cell controls pass; real unreadable legal/table pages retained. Hosted correction recovery unverified. |

Actual reviews are in [PUSH_EVALUATION.md](PUSH_EVALUATION.md). For each output record source URL/hash/physical pages, collection vs publication time, model/version/calls, supported facts, important omissions, fair emphasis/priority and reading effort. Review originals, including table headers and footnotes. Captured evidence is never labelled live collection or unattended verification.

## Infrastructure verification (November 1)

Official Google models page lists gemini-3.5-flash-lite, gemini-3.1-flash-lite, gemini-3.8-flash and gemini-3.6-flash. Actual model listing can establish project access, not rate limits. Google directs active quotas to AI Studio; RPM/TPM/RPD are project limits and daily reset is midnight Pacific. Existing 20/day is a local policy, not Google entitlement. User supplied active AI Studio limits: Lite 15 RPM/250k input TPM/500 RPD; Flash 5 RPM/250k input TPM/20 RPD. Local total 20, Research 6/Push 14/retries 4 is separate; four complex slots are capture-only. Both Pacific and rolling24h caps apply. IDs/roles/limits are configurable, not generation-specific runtime branches.

Keep Vercel/Neon. Vercel Hobby cron permits once/day with hour-level timing, so it cannot meet a 15-minute target. Prepare a minimal Cloudflare scheduled fetch worker (15-minute target, bounded awaited Vercel jobs, durable resume). Cloudflare Free has limited CPU; the worker only dispatches, while Vercel performs parsing/generation within its configured 300-second bound. Activation/new terms and hosted Gemini transfer require approval. Do not activate or imply a freshness guarantee. Measure workload, dispatch lateness, pending age and actual free capacity before claiming reliability.

Sources: [Google models](https://ai.google.dev/gemini-api/docs/models), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing), [function limits](https://vercel.com/docs/functions/limitations), [Cloudflare cron](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Neon plans](https://neon.com/docs/introduction/plans). Exact approval/rollout/capacity limits are in [DEPLOYMENT.md](DEPLOYMENT.md).


## Current architecture and limits

Local SQLite and intended-host Neon share one CAS queue/quota state record with separate immutable document records. Checkpoints commit with normalized filings. Primary/reference pages persist before a content-key job is accepted. Same issuer/full hashes share analysis across observation IDs; evaluation and collected namespaces stay separate. Normal document/analysis workers exclude captured tests; explicit evaluation shares the same quota and never populates Latest.

Original/layout text survives parsing. Complete source-owned sentence quotes feed the independent structured Push prompt; facts, conditional significance and editorial priority remain distinct. Financial cells enter deterministic calculations only with aligned explicit headers/units/scope and matching periods. Restatement/nonpositive bases/missing values remain limitations. Referenced PDFs are bounded to two explicit official links; missing unlinked comparatives/profiles are not invented.

A signed awaited worker runs bounded source/document/analysis stages with durable leases and independent configured collection/analysis cadences. App opens read saved cards; Refresh requests source catch-up only. Rejections, malformed/truncated output, unsuitable model capacity, cooldowns and missing state retain honest failed/deferred/unavailable status. Prompt upgrades alone never regenerate accepted history.

All current records are retained; 90-day operation/free-tier headroom has not been measured. Initial 66 filings exceed the small approved analysis allowance; backlog may grow even with 15-minute dispatch. Capture-only slots cannot silently become production capacity. Actual intended-host persistence, concurrent CAS performance, free usage and freshness must be demonstrated before completion.

Backlog age covers active unparsed/reference/retry filings as well as analysis jobs; captured/superseded observations and terminal document failures do not become pending backlog. A missing PDF job must not hide an old disclosure's delay.
