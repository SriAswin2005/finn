# Push workflow acceptance and operating contract

November 1, 2026, IST. This is the active Push scope; it supersedes the older manual-only scope in SPEC. Research expansion, OS notifications and submission work remain deferred.

## What useful means

Main assessment p.2 asks for a default 24-hour configurable digest, prioritised portfolio filings, configurable EOD triggers, a short supported incoming-manager background, and quarterly Revenue/EBITDA/PBT/PAT with QoQ/YoY. The reference pp.1–3 distinguishes announcement categories, financial metrics and primary documents. A useful card must explain the actual event and its significant details in roughly 30 seconds, with evidence expandable. A meeting notice is not a result; EBIT is not EBITDA; a missing biography or comparative is unavailable. Category alone is not materiality.

Existing saved Latest, recorded L&T/HDFC enrichment, reviewed research notes, parser and quote guards work. Missing: unattended collection, durable work identity/leases, generic attachment interpretation, atomic shared quota, corrections, recovery and source-reviewed unseen Push outputs. Recorded examples are regression evidence only.

## Implementation sequence and acceptance

1. Durable collection: official NSE feed only; overlapping bounded windows; checkpoint advances only with committed filings; stable exchange IDs, metadata revisions and attachment hashes; failed sources preserve checkpoint and prior successes. Retain work at least 90 days, do not age pending work out of the digest. Test missed windows, duplicates, corrections and concurrent leases.
2. Evidence and interpretation: generic PDF parser, immutable physical pages/hash, source-owned quote IDs, independent Push prompt/cache/queue/model allocation. Facts, conditional significance, uncertainty and justified priority. Explicit unreadable/ambiguous/partial states. No completed publication on rejection/truncation.
3. Atomic reservations and recovery: fail closed on absent/corrupt quota configuration/state; per workflow/model request/token limits; conservative unknown attempts, Pacific reset, retry budget, backoff/circuit/auth stops. No browser generation. Content identity, not prompt changes/preferences, triggers work.
4. Cached delivery: Latest default, saved cards first, refresh requests freshness/catch-up without rewriting completed analysis. Pending/error/partial states, collection/publication times, delayed important work, transparent priority and evidence pages. EOD signals stay separate.
5. Verify local real unseen outputs and deployment persistence, then activate only with applicable hosted-secret/scheduler approval. Completion requires observed unattended production collection and new-event analysis. Passing fixtures/tests is insufficient.

## Evaluation set (define first, fill actual evidence after collection)

| Case | Required review | Evidence status |
| --- | --- | --- |
| Existing L&T results / HDFC succession | Preserve reviewed arithmetic, p.11 / profile p.3 and caveats | Captured regression examples, already reviewed |
| Unseen results issuer | Revenue, PBT, PAT, exact profit labels, period/unit/entity; absent EBITDA/comparatives explicit | New original filing required; not yet evaluated |
| Unseen management issuer | Person, role, effective date, reason, supported issuer-attributed background or explicit omission | New original filing required; not yet evaluated |
| Acquisition / contract / capital allocation | Consideration/order size, conditions, timing, counterparty, uncertainty; no implied revenue/profit | New original filing required; not yet evaluated |
| Regulatory / litigation | Authority, amount/currency, operative order, appeal/contingency; no unsupported insolvency conclusion | New original filing required; not yet evaluated |
| Routine notice | Correct dates/purpose, concise low-priority reason; unknowns remain visible | New original filing required; not yet evaluated |
| Ambiguous, corrected, unreadable | Refuse invented cells/biography; retain original/replacement identities; expose limitation | Synthetic adversarial controls plus captured document required |

For each actual output record source URL/hash/physical pages, collection vs publication time, model/version/calls, supported facts, important omissions, fair emphasis/priority and reading effort. Review originals, including table headers and footnotes. Captured evidence is never labelled live collection or unattended verification.

## Infrastructure verification (November 1)

Official Google models page lists gemini-3.5-flash-lite, gemini-3.1-flash-lite, gemini-3.8-flash and gemini-3.6-flash. Actual model listing can establish project access, not rate limits. Google directs active quotas to AI Studio; RPM/TPM/RPD are project limits and daily reset is midnight Pacific. Existing 20/day is a local policy, not Google entitlement. No assumed 500/day.

Keep Vercel/Neon. Vercel Hobby cron permits once/day with hour-level timing, so it cannot meet a 15-minute target. Prepare a minimal Cloudflare scheduled fetch worker (15-minute target, bounded awaited Vercel jobs, durable resume). Cloudflare Free has limited CPU; the worker only dispatches, while Vercel performs parsing/generation within its configured 300-second bound. Activation/new terms and hosted Gemini transfer require approval. Do not activate or imply a freshness guarantee. Measure workload, dispatch lateness, pending age and actual free capacity before claiming reliability.

Sources: [Google models](https://ai.google.dev/gemini-api/docs/models), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing), [function limits](https://vercel.com/docs/functions/limitations), [Cloudflare cron](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).
