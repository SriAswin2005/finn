# Current issues and continuation register

Last reconciled October 30, 2026. Status is about observed evidence, not an implied promise to implement every PDF example. For all capabilities, see [the requirements audit](REQUIREMENTS_AUDIT_2026-10-30.md). Update this register when resolving or changing scope; retain resolution evidence.

## Q-001 — AI citation does not establish the claimed metric

**Resolved October 30, 2026.** `validateAnalysis` in `src/ai/gemini.js` now extracts meaningful metric-identifying terms (≥5-char alpha words, excluding a stop-word list) from each claim's text and requires that at least one of those terms appears in the claim's combined quote text. A claim asserting "volume growth" whose only attached quote contains "8-10% for FY27" but never mentions "volume" is now rejected with `AiUnavailable`. The existing numeric and substring checks are preserved and not weakened.

Regression test added: `test/research.test.js` — "Q-001 regression: citation that shares a number but omits the claimed metric is rejected". All 38 non-network tests pass (41 total; 3 server.test.js tests are pre-existing sandbox network failures, not related to this fix).

The quarantined ASIANPAINT cache entry (`data/cache/ai/*.review-rejected.json`) remains absent from Git. If a new generation is triggered for ASIANPAINT, the new validation will now reject any recurrence of the same pattern. A fresh semantic review of the ASIANPAINT demo output is still recommended before submission (see Q-002).

Resolution evidence: `src/ai/gemini.js` lines 23–28 (STOP_WORDS + metricTerms), lines 43–49 (metric context check); `test/research.test.js` Q-001 regression test.

## Q-002 — Broader model and demo quality verification

**Partially resolved October 30, 2026.** Both active AI cache files (two INFY generations) were run programmatically through the updated `validateAnalysis` — all 12 claims across both outputs pass the new metric-context check. The Q-001 fix does not break any previously verified output. ASIANPAINT has no active cached AI note (the quarantined entry is excluded); PERSISTENT has never had a reviewed AI note. Evidence coverage is confirmed for both: 3 documents (annual report + 2 transcripts) and 10 evidence chunks per ticker. A fresh live AI generation for ASIANPAINT or PERSISTENT would require the server running with valid Gemini credentials, and is not required to unblock submission — the recorded evidence and source documents are intact. Gemma and larger Flash model latency/timeout behavior is unchanged; no additional model calls were made.

Remaining: if a live demo run generates a new ASIANPAINT or PERSISTENT note before submission, it must be spot-checked against the same metric-context criteria. Failure/unavailable states are honest. Latency is a measured observation, never a guarantee.

## D-001 — Hosting, access control and durable quota storage

**Blocked on user destination/access approval and unimplemented hosted controls.** Private GitHub publication is complete, app deployment is not authorized. No reviewer authentication is implemented. Same-origin checks do not prevent anonymous non-browser API calls. Local quota files assume one instance and durable storage; ephemeral host restarts can erase caps.

See `src/server.js`, `src/storage/snapshots.js`, [DEPLOYMENT.md](DEPLOYMENT.md), [HOSTING_ASSESSMENT.md](HOSTING_ASSESSMENT.md). Acceptance after approval: chosen access mechanism, one instance/durable ledger, write permissions/restart persistence tested, host secrets approved and server-only, no paid upgrade. Keep live AI disabled on a public host until these controls exist.

## D-002 — Hosted/mobile/container and submission gates

**Unverified / incomplete.** Local Node archive passes; Docker image has not been built/verified. Local responsive/offline checks do not prove HTTPS phone installation. Original AI chat exports, final covering note/links, reviewer repository access and final tagged demo checkpoint are unfinished. No email sent.

Acceptance: run the actual release/container on approved host; test source access, HTTPS and a physical phone; preserve original conversation history; finalize reviewed limitations and deliverable links. Do not substitute this handoff/build log for original AI conversations.

## S-001 — Desired depth and deliberately missing workflows

**Missing/partial scope, not failing tests.** Automatic ingestion/background monitoring/OS alerts; quarterly Revenue/EBITDA/PBT/PAT with QoQ/YoY; executive biographies; four-quarter guidance delivery; structured multi-year, balance-sheet and cash-quality analysis; full revenue mix are absent or partial. The PDF offers many as examples/menu choices. The user's research priorities remain important, but do not silently declare the whole menu implemented or start every item at once.

For an approved analysis slice: acquire comparable primary periods, normalize metrics/units/consolidation/currency and preserve source/page; independently test comparisons before adding synthesis/UI. For an approved monitoring slice: collection cadence/freshness and delivery semantics must be explicit. Current browser Refresh does not collect data. Voice/native/on-device work remains deferred.

## Resolved or expected conditions to avoid rediscovering

| Condition | Current disposition |
| --- | --- |
| Old three-model wizard restriction | Fixed; up to 40 inventory IDs, specialist/unknown IDs excluded from generation. |
| Invalid saved Gemini key | Resolved by user manual `.env` edit; metadata and real generation subsequently succeeded. Original cause not established. Do not assume the copied original key was invalid. |
| EADDRINUSE on port 3000 | Earlier FINN process was identified/restarted. May recur operationally; inspect owner and use Ctrl+C in the original terminal. |
| October 28 live snapshot stale on October 30 | Manual ingestion succeeded; 15/15 October 29 closes and 55 filings. Staleness will recur without ingestion; do not disable the safeguard. |
| Recorded snapshot still dated October 28 | Intentional replay with October 27 closes and 44 filings, not current/live data. Not a conflict with the refreshed ignored snapshot. |
| Older logs show 16 or 34 tests | Historical checkpoints. Latest observed suite is 41 total (38 pass; 3 server.test.js require a running server and fail in sandbox); run current checks before claiming a new result. |
| Merge/document conflicts | No unmerged Git files at handoff. Older summaries were reconciled; any new discrepancy should be recorded with evidence. Never reset or discard user changes. |
| Q-001 ASIANPAINT citation gap | Fixed October 30: metric-term check added to validateAnalysis; regression test passes. Quarantined cache entry remains absent from Git. |
