# Milestones and acceptance gates

Dates are targets in IST; finish the core before November 1, 2026.

Start new sessions with [HANDOFF.md](../HANDOFF.md). This checklist records bounded milestones, not universal feature correctness. [ISSUES.md](ISSUES.md) owns unresolved failures and acceptance criteria; newer audit findings can reopen quality work even when an earlier example's gate is checked. In particular, Q-002 (broader demo review) remains open.

## M0 — Environment and plan (October 28)
- [x] Read both challenge PDFs, choose product scope and write project instructions.
- [x] Verify Node 24.16.0, npm 11.13.0, Python 3.12.10 and Git 2.53.0.windows.2 on PATH.
- [x] Initialize repository; local Git author identity is configured.
- [x] Choose zero-runtime-dependency Node + browser module implementation.

## M1 — First complete briefing slice (October 28)
- [x] 15-company portfolio served by an explicit demo provider and same-origin API.
- [x] Ranked announcements; selectable window; routine items collapsed; detail view.
- [x] Configurable price/volume thresholds; preferences survive reload.
- [x] Responsive UI with semantic controls, labelled dialogs and loading/error/empty states.
- [x] PWA manifest, real PNG icons, shell cache and honest unavailable-data state.
- [x] Domain + HTTP tests and desktop/mobile browser checks pass (see docs/VERIFICATION.md).
- [x] Git checkpoint with run instructions and known limitations.

## M2 — Real data spine (October 29)
- [x] Implement one EOD source and one NSE/BSE announcement source; verify access early.
- [x] Persist/cache normalized data with source/fetch times and explicit stale/error states.
- [x] Verify 15–20 portfolio symbols and configurable alerts against known calculations.
- [x] Capture a reproducible source-backed demo dataset; retain evidence URLs.
- [x] Gate: real filing and real EOD record travel from provider through API to phone-sized browser UI. Physical phone verification remains M4.

Initial M2 capture had 43 announcements and missing latest closes. Later October 28 hardening added the official NSE closing-report fallback: current capture has 44 announcements, complete October 27 data for all 15 companies, and two default market signals. Failed sources still remain explicit.

## M3A — Primary-source retrieval (implemented October 28)
- [x] Generic NSE ticker input, discovery and document retrieval with bounded failures.
- [x] Parse/chunk annual reports and transcripts; preserve physical-page provenance.
- [x] Three recorded examples (INFY, ASIANPAINT, PERSISTENT); cold HCLTECH lookup and missing-evidence behavior verified.
- [x] Source corpus excludes Screener financials/AI summaries, broker reports and news.
- [x] Gate: original documents and selected passages travel through API to Research UI with page references.

## M3B — AI synthesis (one reviewed live example verified)
- [x] Gemini free-tier-only opt-in, backend secrets, bounded context/output, structured claims and evidence/prompt/model cache.
- [x] Test quote/citation/numeric guards, quota ledger, concurrency and conservative model-specific fallback with simulated responses.
- [x] Include guidance from both available calls, prefer explicit forward ranges, and retain financial context from both call/annual evidence. Add hidden-input local key setup and persisted project-level cooldowns.
- [x] Fix setup rejection of larger inventories: validate before secret input, preserve specialist IDs, route supported Gemma/Flash text models and bound timeout/server fallback. Verify with simulated responses; live model quality remains below.
- [x] Verify actual Gemini output using the user's billing-disabled project; validate quality and failure behavior. Flash-Lite returned the reviewed INFY note in 6.5 seconds; timeout, busy-server, truncated, numeric and quote errors were observed and rejected during live iteration.
- [x] Verify a supported business/financial snapshot and conditional bull/bear interpretation. INFY's earlier/later guidance is cited separately; full-year guidance delivery remains explicitly unverified because matching outcome evidence is not established.
- [x] Gate for the reviewed INFY example: all six displayed AI claims inspected against primary support. Browser verified server-resolved quotes, PDF page links and cache reuse. This is not a quality guarantee for arbitrary future generations; see docs/AI_REVIEW.md.
- [x] October 30 audit follow-up: added metric-context check to `validateAnalysis` — a claim whose key metric terms are absent from its combined quote text is now rejected. Regression test passes. See ISSUES.md Q-001 (resolved). ASIANPAINT and PERSISTENT demo semantic review remains open (Q-002).

## P0 navigation and alert preferences
- [x] Today / Portfolio / Ask FINN / Alerts with portfolio-to-research links.
- [x] In-app announcement-category, price/volume and pause preferences survive reload.
- [x] Missing-source and empty states; no claim of OS push support.

## M4 — Demo hardening and delivery (October 31)
- [x] Verify local clean restart, updated shell cache, unavailable-research state with the server stopped, and recovery to the reviewed cached note after restart.
- [ ] Verify mobile installation on HTTPS, offline/stale behavior and clean startup.
- [x] Verify one strong cited analysis example: INFY business/financial highlight, balanced conditional cases and guidance revision. Do not claim verified guidance delivery.
- [x] Build local deployable archive with checksum/secret-exclusion checks and packaged HTTP/research smoke test.
- [x] With user authorization, create private GitHub repository https://github.com/SriAswin2005/finn and push preserved history on master. Credentials/runtime caches are excluded.
- [x] Assess free hosting against Node/Python, private source and durable quota storage. Conditional recommendation: Railway trial if eligible; Render limited-demo fallback. See docs/HOSTING_ASSESSMENT.md. No host/account/deployment approved yet.
- [ ] Deploy on authorized Railway trial, verify hosted API and physical-phone workflow. Shared-token gate implemented October 31; local syntax/43-test verification passed; hosted verification pending. Private source pushes remain authorized.
- [ ] Finalize covering note, architecture/tradeoffs, original AI build history and demo steps. Draft prepared locally.
- [ ] Final reproducible checks and tagged demo checkpoint. Keep November 1 as buffer.

## Decisions needed later
Gemini free quota ONLY is approved; the manually corrected local `.env` key is accepted by Google and all six configured text models are listed. One INFY AI note is reviewed and cached. Gemma inference remains unverified because both hosted candidates timed out; no low-latency guarantee is claimed. The user authorized private GitHub creation/publication; https://github.com/SriAswin2005/finn now contains the preserved source history. Railway and shared-token access were authorized October 31; the user is supplying the hosting connection. Docker CLI exists but its engine is not running; the container image is prepared but unbuilt. This does not block the tested Node release archive. No email has been sent and no app has been deployed externally.

- [x] October 31 disposable-demo gate: baked reviewed INFY note, immediate GET cache, Railway cache-only and fail-closed lost quota implemented; syntax, all 45 tests and packaged smoke checks pass.

## October 31 — management promise and observed progress

`src/research/guidance.js` deterministically pairs complete earlier/later transcript prose with source pages. INFY: FY2027 CC revenue-growth promise 1.5–3.5%, later Q1 actual 2.4% YoY/1% QoQ, later forecast 1.5–3.0%. UI shows all three side by side, labels quarter versus full year non-comparable and gives no met/missed verdict. This is a thin management-progress view; completed annual/four-quarter delivery remains unavailable. Narrow generic extraction returns unavailable for unsupported formats; different explicit years/segment/qualified statements rejected. Added research loading skeleton and removed the remaining dialog blur; editorial theme is the only theme. Syntax and all 47 tests pass, including quote/page membership, unsupported chronology, different fiscal years and qualified/segment refusals. Browser and physical-phone checks remain unavailable.

## October 31 — adversarial citation context

Added `test/citation-adversarial.test.js`: 15 synthetic bad claims cover currency/scale, percent/pp/bps, quarter/full-year, segment/subsidiary/peer, sliced negation/conditions, bounds, direction and guidance-as-actual. Extra checks reject ambiguous flattened tables/empty text. `src/ai/context.js` applies conservative deterministic context guards; this is not general semantic proof. Quote bank skips overlong sentences rather than slicing off conditions. PDF parse failures now say Unreadable PDF. Syntax and all 64 tests pass, including all 15 adversarial refusals, qualified positive controls and compatibility of the baked INFY note. Browser verification unavailable.

October 31 hosting steering: the user replaced Railway with Vercel + Neon or Cloudflare Workers + D1 and asked the agent to choose. Vercel + Neon selected to preserve the existing Node/Python research flow; serverless adapter and persistent collected-research storage are next. Railway login cancelled; no Railway deployment occurred. Deployment/phone verification remain incomplete.

## October 31 — Vercel + Neon adapter (in progress)

User selected Vercel/Neon or Workers/D1; Vercel/Neon preserves native Node and Python PDF parsing as two functions. `api/finn.js` reuses the HTTP handler and gate; all assets route through it. `api/parse.py` validates a short-lived HMAC-signed source request, pins public DNS addresses with TLS hostname verification, bounds downloads/redirects/pages/text and returns page-preserving pypdf output. It shares `scripts/pdf_text.py` with the local parser. `src/storage/research-store.js` uses parameterized Neon queries for collected public research; recorded examples load first without database/network/model calls. Official Neon driver 1.2.0 is the first Node runtime dependency, justified by durable serverless PostgreSQL access. Local parser remains subprocess-based; Vercel scratch files move to /tmp. Live Gemini is disabled on Vercel regardless of key. Syntax and all 67 tests pass; deployment/real persistence/phone checks pending; no hosted URL yet. Railway configuration removed, login cancelled.

Vercel adapter verification passed (67 tests): parameterized cross-instance Neon adapter test, signed metadata-only Python request test, real Python HMAC expiry/private-DNS/blank-PDF checks. Build/archive and Docker include the lockfile/runtime dependency. Host accounts and Neon database are not yet connected; no persistence claim is made from simulated queries.

Vercel project `sriak/finn` is linked locally. Automatic private GitHub integration failed; deployment will use CLI source upload without expanding GitHub permissions. Source commits still push to the private origin. Neon Free (Singapore, app auth disabled) provisioning started; host secrets remain server-only. No hosted success/phone test claimed yet.

October 31 Vercel checkpoint: syntax, all 67 tests and 92-file archive smoke/secret exclusions pass. Neon Free provisioned/connected successfully; real cross-process persistence verification pending. Automatic approval review rejected uploading locally generated FINN_ACCESS_TOKEN/FINN_PARSER_SECRET to Vercel; the user explicitly approved both secrets for sriak/finn production; upload is proceeding before a gated deployment. No Gemini key transferred.

User explicitly approved the reviewer token and parser secret for sriak/finn production. Neon persistence verified with a public INFY record written by one Node process and read by a fresh process (3 documents); no credentials displayed. Host deployment and phone checks still pending.

## October 31 — first hosted verification and cold-research finding

Production ready: https://finn-zeta-one.vercel.app (deployment `dpl_2PE1UQ9ruymL8yXpmpkfWZqkY9SZ`). Hosted gate/clean 303 redirect/Secure HttpOnly cookie, protected assets, blocked .env, 15-company recorded briefing, all three recorded research examples, immediate six-claim INFY note (0 request model calls), guidance progress and private Python 403 verified. Warm request observations 300–411 ms; first observed health 1,162 ms. No after-idle cold-start or physical-phone result. One transient transport failure on app.js passed on a fresh full run.

D-003: cold hosted TCS returned 503 after 2.8 s. Parser was calling the per-deployment URL, which has Vercel authentication; switch to VERCEL_PROJECT_PRODUCTION_URL alias (our private HMAC endpoint) and retain source failure details. Regression test updated; syntax and all 67 tests pass. Hosted cold retry pending after deployment. Reviewer phone-test request remains pending. Private reviewer URL is only in ignored tmp/reviewer-link.txt.

## October 31 — reviewer path, ledger and refusal

Added About navigation with three-step reviewer path, exact scope/omissions, historical measured timings and free-tier/cache behavior. Current digest/research request latency is measured in the browser with 0 retrieval model calls/₹0 model spend. Live synthetic refusal endpoint runs the actual direction validator; no fake cached success. Mobile hero spacing reduced so priority content appears earlier. Syntax and all 67 tests pass, including live refusal HTTP contract. Browser/device verification pending; results/profile extraction still absent.

## October 31 — physical-phone report and research latency

User reports the hosted app loads/scrolls smoothly, alert preferences save, recorded examples become quick after the first load, and non-demo TCS returns in about 2–3 seconds. Device/browser unspecified; installation and PDF citation opening not confirmed. Recorded October 27–28 dates are expected, not a loading failure; button now says Reload saved snapshot and fixed capture date is explicit. Vercel region is moved to sin1 beside Neon; five public research records may be cached in process for five minutes, with persistent storage on expiry/restart. Syntax and all 67 tests pass, including repeat-read reuse and expiry back to durable storage. Hosted timings pending for this optimization.

D-003 resolved: hosted TCS cold retrieval succeeded with annual report (361 pages), October/July transcripts (29/25 pages), ten evidence chunks, no source errors in 47.5 s. After a new deployment, TCS reloaded from Neon in 3.3 s; another fresh Node process confirmed three persisted documents. No model call made.

## October 31 — recorded results extraction (in progress)

Visually reviewed L&T consolidated results on physical PDF page 11 of the recorded October 27 filing. Six rows are parsed deterministically, six source columns are checked explicitly, first three are quarter/preceding quarter/year-ago quarter, INR crore. Revenue/PBT/PAT and derived EBITDA proxy comparisons preserve negative/zero/missing-base refusal. D&A row includes impairment/obsolescence, so proxy limitation is explicit. Standalone page 16 was rejected because its text layer misread negative parentheses as digits. Consolidated page 11 values match the rendered page; finance-service funding remains operating expense in the explicitly limited EBITDA proxy. PAT is attributable to owners, excluding non-controlling interests. `src/domain/results.js` separates calculations; `src/providers/filings.js` enriches only the exact recorded source URL/symbol. Today card/modal and edge-case tests implemented; syntax and all 69 tests pass. No generalized automatic PDF table claim. PDFs remain ignored.

Results verification finding: initial ownership-label match selected comprehensive income rather than net profit; a source-value test caught it (68/69 tests passed). Extraction now anchors ownership to net-profit row 9 and checks its label/6 columns against the reviewed PDF hash. `scripts/record-lt-results.py` reproduces the narrow adapter. No bad result was committed or deployed. Corrected rerun: syntax and all 69 tests pass.

Hosted latency after optimization: TCS first persistent read 1,612 ms, immediate repeat 513 ms from the test machine, both HTTP 200 with ten evidence chunks/no source errors. These are request observations, not guarantees.

## October 31 — source-backed appointment profile

HDFC Bank recorded October 27 MD/CEO succession is enriched with effective date, outgoing tenure completion and a concise appointee background from its referenced October 1 appointment disclosure (physical PDF p.3, visually inspected). Page links/hashes and profile-as-of date retained. No LinkedIn, secondary-source biography or model call. Profile is bank-attributed, not independently verified. Syntax and all 70 tests pass; UI includes event/profile page links and profile-as-of date.

October 31 submission export: original user/assistant messages from three related Codex chats exported locally under ignored `tmp/session-history/` (144 messages, all available turn pages). Credential redactions applied; reasoning, tool/command outputs and attachment bytes excluded. Current chat is an in-progress snapshot. Other-app/Antigravity history is not accessible. No history uploaded or share link claimed. Covering note update pending.

## October 31 — product browser follow-up

Hosted 72-hour briefing returns the L&T results and HDFC Bank profile; live refusal returns rejected/direction mismatch. Local browser at 390×844 shows no horizontal overflow (results table right edge 344 px). Management modal/profile expansion and page-3 href verified. U-001 found: enriched cards retained obsolete “not extracted/no biography verified” context. Provider now supplies accurate reviewed-results/bank-attributed-profile context, global status describes selected page-reviewed details, and About reflects the user’s smooth-phone report. Missing Latest sources gives a user-facing choice without a server command. U-001 resolved: syntax and all 70 tests pass; refreshed 390 px browser verifies both corrected card contexts, expanded profile page link and live direction refusal. Browser error log is empty. Hosted Latest currently 503 because no persistent snapshot is connected; next product slice.

## October 31 — persistent Latest sources (in progress)

`src/storage/source-snapshot.js` stores the normalized source snapshot in Neon separately from research, with bound values, schema validation, a 30-second in-process read cache and conditional publication that preserves a newer snapshot. `src/ingest.js --publish` explicitly collects/saves locally then publishes to configured Neon; normal ingestion remains local. Hosted Latest mode reads this stored snapshot and preserves collection/source timestamps and staleness. Database failure/missing/unreadable data is explicit and never becomes recorded/fictional data. No collection is added to the briefing request. Tests, real source refresh/publication and hosted/browser checks pending. Submission work remains deferred.

Source-storage check initially 71/72: an old synthetic fixture lacked announcement-source metadata now required by the schema. Fixture corrected without weakening the schema; syntax and all 72 tests pass. The attempted f600c15 deployment failed with a transport fetch error; Git push succeeded, but production remains the preceding successful deployment until retry.

Latest sources publication verified October 31 at 20:43 IST: capture 2026-10-31T15:13:09.876Z, 15/15 October 30 EOD records, 62 portfolio filings, both source adapters OK. A fresh Node process reads the persisted snapshot with original times and no staleness. Recorded replay is unchanged. Local syntax/all 72 tests pass; hosted deployment/browser check pending. No model call made.

D-004 completed October 31: deployment dpl_EiSGNFY8vqXz9zgcKqRamye8bQ6A (2b617c3) is READY at https://finn-zeta-one.vercel.app. HTTPS Latest returns 200; fresh saved capture, source status and 15-company coverage verified. Phone-width browser connected to the same Neon source store shows collected 31 Oct, 8:43 pm IST, Saturday Oct31, 15/15 alert coverage and no console errors. Prior failed filing-context upload is superseded; both that fix and persistent Latest are now deployed. Recorded mode remains unchanged. Next product quality gap: other two demo companies have no reviewed baked AI note.
