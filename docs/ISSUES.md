# Current issues and continuation register

Last reconciled October 30, 2026. Status is about observed evidence, not an implied promise to implement every PDF example. For all capabilities, see [the requirements audit](REQUIREMENTS_AUDIT_2026-10-30.md). Update this register when resolving or changing scope; retain resolution evidence.

## Q-001 — AI citation does not establish the claimed metric

**Open / high priority / actual quality gap.** New ASIANPAINT guidance summary labelled 8–10% as volume growth, but its attached August-call quote stated only a range for FY27. Other retrieved context is not automatically supporting evidence for that attached citation. The value may be correct; the displayed reference does not establish the metric. Exact-quote/numeric tests passed, exposing a semantic-coverage blind spot.

Minimal reproduction without an API call: a claim asserts “8–10% volume growth for FY27”; its only reference says “At the current stage, we are looking at the band of 8-10% for the full FY27.” Numeric membership and quote membership pass, but no quoted text identifies volume. This is the regression to protect, not a markup assertion.

Inspect `src/ai/gemini.js` validation/prompt, `quotes.js` quote selection, and `src/research/evidence.js` chunk boundaries/context. Preserve source page/period/currency/basis. Prefer rejecting/marking ambiguous analysis unavailable or requiring adequate linked context; do not claim a simple keyword heuristic proves entailment.

Containment: only the new audit cache entry was renamed to ignored `data/cache/ai/*.review-rejected.json`; local capture is `tmp/audit-ASIANPAINT-2026-10-30.json`. Those files do not travel with Git. Quarantine is not a fix and another generation can recur. Use the reproduction above when local captures are absent.

Acceptance: a meaningful regression rejects or appropriately marks this insufficient citation; a supported metric case still passes; reviewed demo outputs establish every asserted metric/period/unit; quote/numeric/unavailable behavior is not weakened. Mark resolved only after those checks and a recorded source review, not merely passing existing tests.

## Q-002 — Broader model and demo quality verification

**Partial verification.** Reviewed INFY v6 note exists locally; all three demo companies have verified document retrieval. New ASIANPAINT note exposed Q-001; PERSISTENT AI output is not reviewed. Gemma 26B/31B timed out on October 28 and were not reverified October 30. Larger Flash models also had timeout/503/truncation failures during iteration; bounded fallback works, guaranteed fast generation does not exist.

Inspect `src/ai/models.js`, `gemini.js`, `docs/AI_REVIEW.md`. Retain free-tier caps/cache and do not spend repeated calls retesting healthy paths. Acceptance: chosen demo notes individually reviewed; failure/unavailable states honest; latency described as measured observations, never guarantees. No need to test speech/embedding models for this P0 slice.

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
| Older logs show 16 or 34 tests | Historical checkpoints. Latest observed suite is 40 passing; run current checks before claiming a new result. |
| Merge/document conflicts | No unmerged Git files at handoff. Older summaries were reconciled; any new discrepancy should be recorded with evidence. Never reset or discard user changes. |
