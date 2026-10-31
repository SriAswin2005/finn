# Current issues and continuation register

Last reconciled October 31, 2026. Status is about observed evidence, not an implied promise to implement every PDF example. For all capabilities, see [the requirements audit](REQUIREMENTS_AUDIT_2026-10-30.md). Update this register when resolving or changing scope; retain resolution evidence.

## Q-001 — AI citation does not establish the claimed metric

**Resolved October 30, 2026.** `validateAnalysis` in `src/ai/gemini.js` now extracts meaningful metric-identifying terms (≥5-char alpha words, excluding a stop-word list) from each claim's text and requires that at least one of those terms appears in the claim's combined quote text. A claim asserting "volume growth" whose only attached quote contains "8-10% for FY27" but never mentions "volume" is now rejected with `AiUnavailable`. The existing numeric and substring checks are preserved and not weakened.

Regression test added: `test/research.test.js` — "Q-001 regression: citation that shares a number but omits the claimed metric is rejected". All 38 non-network tests pass (41 total; 3 server.test.js tests are pre-existing sandbox network failures, not related to this fix).

The quarantined ASIANPAINT cache entry (`data/cache/ai/*.review-rejected.json`) remains absent from Git. If a new generation is triggered for ASIANPAINT, the new validation will now reject any recurrence of the same pattern. A fresh semantic review of the ASIANPAINT demo output is still recommended before submission (see Q-002).

Resolution evidence: `src/ai/gemini.js` lines 23–28 (STOP_WORDS + metricTerms), lines 43–49 (metric context check); `test/research.test.js` Q-001 regression test.

## Q-002 — Broader model and demo quality verification

**Partially resolved October 30, 2026.** Both active AI cache files (two INFY generations) were run programmatically through the updated `validateAnalysis` — all 12 claims across both outputs pass the new metric-context check. The Q-001 fix does not break any previously verified output. ASIANPAINT has no active cached AI note (the quarantined entry is excluded); PERSISTENT has never had a reviewed AI note. Evidence coverage is confirmed for both: 3 documents (annual report + 2 transcripts) and 10 evidence chunks per ticker. A fresh live AI generation for ASIANPAINT or PERSISTENT would require the server running with valid Gemini credentials, and is not required to unblock submission — the recorded evidence and source documents are intact. Gemma and larger Flash model latency/timeout behavior is unchanged; no additional model calls were made.

Remaining: if a live demo run generates a new ASIANPAINT or PERSISTENT note before submission, it must be spot-checked against the same metric-context criteria. Failure/unavailable states are honest. Latency is a measured observation, never a guarantee.

## D-001 — Hosting, reviewer gate and disposable quota state

**Partially implemented October 31.** The user authorized Railway deployment, shared-token access and disposable storage. `src/access.js` protects UI/assets/APIs and exchanges `?key=` for a signed 24-hour HttpOnly, Secure, SameSite=Lax cookie before redirecting to a URL without the key. Token comparison uses fixed-size digests and `crypto.timingSafeEqual`; missing token fails Railway startup. Health alone remains public. `railway.toml` selects the existing Dockerfile and one replica. Syntax check and all 43 tests pass, including key exchange, rejected key/cookie, expiry, rotation and protected generation.

Deployment is not complete: Railway CLI installed; browserless login pending; Computer Use stopped because it could not verify Edge's browser URL. User is signing in and connecting the private repository. No Gemini secret will be transferred. Reviewed INFY note is baked; missing/unwritable quota storage retains memory and fails closed to cached evidence (45 tests and package smoke pass). Durable storage is optional, not an acceptance requirement. Keep new AI calls disabled on host.

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

D-001 update: reviewed INFY note now baked in image/archive and returned before credential/quota checks; main demo needs no model request. Quota load/reservation failure retains memory and closes new calls. ASIANPAINT/PERSISTENT have evidence only, no reviewed synthesis. All 45 tests, syntax and 75-file packaged smoke checks pass.

## October 31 — management promise and observed progress

`src/research/guidance.js` deterministically pairs complete earlier/later transcript prose with source pages. INFY: FY2027 CC revenue-growth promise 1.5–3.5%, later Q1 actual 2.4% YoY/1% QoQ, later forecast 1.5–3.0%. UI shows all three side by side, labels quarter versus full year non-comparable and gives no met/missed verdict. This is a thin management-progress view; completed annual/four-quarter delivery remains unavailable. Narrow generic extraction returns unavailable for unsupported formats; different explicit years/segment/qualified statements rejected. Added research loading skeleton and removed the remaining dialog blur; editorial theme is the only theme. Syntax and all 47 tests pass, including quote/page membership, unsupported chronology, different fiscal years and qualified/segment refusals. Browser and physical-phone checks remain unavailable.

## October 31 — adversarial citation context

Added `test/citation-adversarial.test.js`: 15 synthetic bad claims cover currency/scale, percent/pp/bps, quarter/full-year, segment/subsidiary/peer, sliced negation/conditions, bounds, direction and guidance-as-actual. Extra checks reject ambiguous flattened tables/empty text. `src/ai/context.js` applies conservative deterministic context guards; this is not general semantic proof. Quote bank skips overlong sentences rather than slicing off conditions. PDF parse failures now say Unreadable PDF. Syntax and all 64 tests pass, including all 15 adversarial refusals, qualified positive controls and compatibility of the baked INFY note. Browser verification unavailable.

October 31 hosting steering: the user replaced Railway with Vercel + Neon or Cloudflare Workers + D1 and asked the agent to choose. Vercel + Neon selected to preserve the existing Node/Python research flow; serverless adapter and persistent collected-research storage are next. Railway login cancelled; no Railway deployment occurred. Deployment/phone verification remain incomplete.

## October 31 — Vercel + Neon adapter (in progress)

User selected Vercel/Neon or Workers/D1; Vercel/Neon preserves native Node and Python PDF parsing as two functions. `api/finn.js` reuses the HTTP handler and gate; all assets route through it. `api/parse.py` validates a short-lived HMAC-signed source request, pins public DNS addresses with TLS hostname verification, bounds downloads/redirects/pages/text and returns page-preserving pypdf output. It shares `scripts/pdf_text.py` with the local parser. `src/storage/research-store.js` uses parameterized Neon queries for collected public research; recorded examples load first without database/network/model calls. Official Neon driver 1.2.0 is the first Node runtime dependency, justified by durable serverless PostgreSQL access. Local parser remains subprocess-based; Vercel scratch files move to /tmp. Live Gemini is disabled on Vercel regardless of key. Syntax and all 67 tests pass; deployment/real persistence/phone checks pending; no hosted URL yet. Railway configuration removed, login cancelled.

Vercel adapter verification passed (67 tests): parameterized cross-instance Neon adapter test, signed metadata-only Python request test, real Python HMAC expiry/private-DNS/blank-PDF checks. Build/archive and Docker include the lockfile/runtime dependency. Host accounts and Neon database are not yet connected; no persistence claim is made from simulated queries.

D-002 verification finding: Python hosted-parser test initially failed to import `test.hosted_parser_test` (stdlib namespace collision). Changed runner to explicit discovery; all 67 tests now pass. Runtime PDF/parser behavior was not the observed failure.

Vercel project `sriak/finn` is linked locally. Automatic private GitHub integration failed; deployment will use CLI source upload without expanding GitHub permissions. Source commits still push to the private origin. Neon Free (Singapore, app auth disabled) provisioning started; host secrets remain server-only. No hosted success/phone test claimed yet.

October 31 Vercel checkpoint: syntax, all 67 tests and 92-file archive smoke/secret exclusions pass. Neon Free provisioned/connected successfully; real cross-process persistence verification pending. Automatic approval review rejected uploading locally generated FINN_ACCESS_TOKEN/FINN_PARSER_SECRET to Vercel; the user explicitly approved both secrets for sriak/finn production; upload is proceeding before a gated deployment. No Gemini key transferred.

User explicitly approved the reviewer token and parser secret for sriak/finn production. Neon persistence verified with a public INFY record written by one Node process and read by a fresh process (3 documents); no credentials displayed. Host deployment and phone checks still pending.
