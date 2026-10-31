# Build decisions

## October 28, 2026 — M0 and M1
- Read both supplied challenge PDFs in full; rendered all seven pages for layout/context inspection.
- Verified the user's installed tools; selected Node built-ins and browser modules to avoid installation and framework overhead.
- Established product scope, project instructions, architecture boundaries and milestone gates in an initial Git commit.
- Built one complete push workflow with explicitly fictional data. Separating provider, domain, HTTP and presentation keeps the live-source migration bounded.
- Chose fixed demo timestamps so filtering stays reproducible after the challenge date. Windows retain all announcements; priority determines order and only routine categories are collapsed.
- Kept API responses network-only. The PWA shell can open offline, but a failed data request cannot look like fresh market information.
- Verified domain/HTTP behavior and desktop/mobile UI interactions, including server failure and recovery. See VERIFICATION.md for evidence and limits.
- Next iteration: verify real EOD and exchange-announcement access, then implement one provider-to-UI source path before adding research.

This log records decisions only. Preserve the original AI chat exports/share links separately for the required build-history submission.

## October 28, 2026 — M2
- Verified public Yahoo daily-history and NSE announcements endpoints; added no runtime dependencies.
- Separated the portfolio configuration from the fictional provider. Replaced an inaccessible mock holding with EICHERMOT after checking its history response.
- Added bounded collection, explicit IST date normalization, price baselines, split/incomplete-row warnings, raw-response hashes and atomic snapshot persistence.
- Captured real history for all 15 companies and 43 portfolio announcements. Preserved a committed replay so the source-backed workflow runs without an external network call.
- Source failures preserve the last successful record with its original fetch time; missing live data never falls back to the fictional demo.
- Added source modes, freshness warnings, original filing links and inspectable market calculations. Verified a real LT results attachment is a PDF.
- Refined category rules against observed source metadata: results submissions must not be collapsed as board-meeting notices. Kept unknown categories visible.
- Yahoo's newest source rows had missing closes. Kept the valid previous session visible and paused affected alerts rather than using the metadata's intraday quote.
- Verified 16 automated tests and the source/replay/demo workflows in the browser. M3 remains focused primary-document retrieval and research.

## October 28, 2026 — Reconciliation, M3A and P0 screens
- Re-read both challenge PDFs and the pasted instructions. Added root SPEC.md and PROGRESS.md; retained the working stack instead of migrating to suggested frameworks.
- Added one justified dependency, pypdf 6.10.0, for bounded page-preserving extraction. Full PDFs/text stay in ignored cache; three recorded examples retain selected pages, hashes and citations.
- Generic discovery uses annual-report/transcript links only. Cold HCLTECH lookup succeeded without ticker-specific mappings.
- Added Today / Portfolio / Ask FINN / Alerts, portfolio research links, announcement categories and pause preferences; verified navigation, narrow phones, landscape, errors and persistence.
- User approved Gemini free quota only. Implemented opt-in, backend secrets, cached structured claims, exact quote/numeric guards, durable caps and model-specific fallback. Simulated tests consume no model allowance. Actual quality remains unverified pending a local key.
- Prepared and smoke-tested a local release archive with checksums and secret exclusions; prepared container instructions and covering-email draft. Docker engine is stopped. Nothing published or emailed.

## October 28, 2026 — EOD completeness and synthesis preparation
- Continued independent P0 work while the Gemini key remained absent. Added a hidden-input local setup command; confirmed with a dummy key and removed the test credential.
- Fixed project quota cooldown persistence so a later question or restart cannot rotate around a project-level 429. Added standard retry-date/structured-delay handling and explicit unavailable-section/interpretation checks.
- Guidance retrieval now preserves both call periods and prefers explicit forward ranges; annual and call financial context are both included. Rebuilt replay excerpts from cached primary documents.
- Verified NSE's official closing CSV as a fallback for incomplete Yahoo sessions. Exact symbol/series/session, price/volume validation and stock-split safeguards preserve honest calculations and source links. Fresh collection completed all 15 EOD records; two required NSE fallback.
- Regression suite: 34 passing tests. Local release/progress updated; live model verification still requires the user's Gemini key. No paid or real model requests made.

## October 28, 2026 — Model setup recovery
- User supplied the exact setup rejection: the wizard had enforced three specific Flash IDs and only checked them after hidden key input. Removed that restriction, moved inventory validation before secret input, and retained the full supplied list without invoking specialist/unknown IDs.
- Checked Google's official Gemma API and free-tier pricing documentation. Added the two hosted Gemma 4 IDs and current free Flash candidates; no paid fallback. Gemma uses prompt JSON and minimal thinking; all responses retain existing evidence validation.
- Narrow business questions prefer Gemma; broader research preserves configured Flash order. Transport/server failures receive bounded fallback with at most three calls and a shared 45-second network budget. No automatic retry of invalid analysis or shared project limits.
- 37 tests pass. No browser changes; live provider verification remains pending rerun of local setup, as the failed run saved no credential.

## October 28, 2026 — Live credential check
- User confirmed setup saved. Verified configuration without exposing the secret, then made one bounded INFY research attempt. Google rejected the key; a separate model-list metadata check confirmed HTTP 400 / invalid API key. No generated analysis or model rotation occurred.
- Improved invalid-key errors with local setup instructions and a regression test for secret-safe output/no fallback. User intervention is required to replace the key. Provider availability, latency and semantic-quality gates remain open.

## October 28, 2026 — Port conflict recovery
- Identified and replaced the confirmed stale FINN server on port 3000. The new server loads saved AI configuration and answers research HTTP requests. No unrelated Node process was stopped.
- Rechecked Google model metadata without a generation: the saved key is still rejected. Non-secret format checks did not identify a recoverable paste issue; user must supply a valid Gemini API key locally.
- Added actionable EADDRINUSE console guidance and documented the Ctrl+C / npm start workflow. Live AI verification remains blocked by the credential rather than the port.

## October 28, 2026 — Reviewed live synthesis and local recovery
- Manually saved key now passes Google's metadata API; six configured text candidates are available. Continued approved Gemini free-tier verification with durable local caps; no paid provider or quota bypass.
- Actual responses revealed output-starving thinking, unsupported numbers, lengthy model-written quotes and service overload. Added model-specific low/minimal thinking, 3,200-token cap, rejection of truncated finish reasons and server-owned quote-ID selection. Short grouped quote IDs reduced prompt overhead. Invalid analysis is still rejected without automatic regeneration.
- Both Gemma candidates timed out. Small questions now try Gemma 26B then Flash-Lite; general concise notes prefer Flash-Lite. Bounded network/attempt limits and shared-project cooldowns remain intact.
- Reviewed six primary-supported INFY claims: business, financial headline, earlier/later growth guidance and conditional cases. Flash-Lite completed the accepted v6 note in about 6.5 seconds. Comparable full-year guidance delivery is explicitly unverified. Browser rendering, timestamps and cache reuse verified; AI_REVIEW.md records the bounded acceptance case.
- Verified 390-pixel layout and local server-offline recovery. Shell cache updated to v4 so new client code is available offline; API responses remain network-only. Updated demo/submission/progress records. All 40 tests and syntax checks pass. External delivery remains pending hosting/GitHub decisions and approval.

## October 28, 2026 — Authorized private repository
- User authorized use of the GitHub account configured on the device and creation of a private repository. Git Credential Manager identified SriAswin2005; authentication stayed in memory and was not printed or embedded in URLs.
- Scanned all nine existing Git commits for the current key and common API/private-key patterns; no findings. Confirmed `.env`, runtime caches, tmp and dist were absent from tracked history.
- Created https://github.com/SriAswin2005/finn as private and pushed the existing master branch/history without rewriting it. Updated delivery documents. No app deployment, collaborator invitation or email was performed.

## October 28, 2026 — Free hosting assessment
- Compared official Render, Railway, Koyeb and Hugging Face documentation against FINN's combined Node/Python runtime, private source and persistent cache/quota ledger.
- Recommended Railway trial conditionally for the complete demo, pending automated account/network eligibility and finite-credit checks. Render Free remains a limited-demo fallback; ephemeral disk cannot preserve local AI caps. Koyeb onboarding/resource limits and new Docker Space paid-plan requirements make them lower priority.
- Recorded deployment/access prerequisites in HOSTING_ASSESSMENT.md. Documentation-only work; runtime unchanged. No accounts, permissions, secrets, payment methods or hosted resources were created/changed.

## October 30, 2026 — Original-document audit
- User requested an honest full feature check. Re-read both original PDFs and mapped every described capability, distinguishing required delivery/source/generalization items from illustrative menu features.
- Syntax, 40 tests and packaged-release verification passed. Refreshed stale ignored live data successfully; tested current HTTP responses and a cold generic TCS lookup. Recorded replay remained unchanged.
- One new ASIANPAINT free-tier note exposed insufficient metric context in its supporting quote despite passing mechanical guards. Reported immediately, quarantined only that newly generated cache entry, and left semantic validation explicitly open. No source-code changes or claim that all functionality is complete.
- Added REQUIREMENTS_AUDIT_2026-10-30.md and updated milestones/progress. Missing automatic monitoring, financial workflows and delivery tasks are listed precisely.

## October 30, 2026 — Maintainer/AI handoff
- Added root HANDOFF.md with product intent, reading order, authority rules, feature/verification matrix, architecture-to-file map, setup, permission boundaries and next slice.
- Added docs/ISSUES.md with stable issue IDs, actual failure reproduction and acceptance criteria; added a copyable new-session prompt. Linked entry points from AGENTS.md, README.md and specifications/milestones.
- Reconciled PROGRESS.md into current state, distinguishing refreshed live data from intentional recorded replay, historical test counts from the current suite, and passing mechanical checks from open semantic quality issues. No unmerged Git files at start; no runtime feature or AI fix claimed.
- Included HANDOFF.md in release packaging so an extracted archive has the same continuation context as a clone. Credentials, caches and local captures remain excluded.

## October 30, 2026 — Standing user workflow
- User requires future AI/human workers to inherit the established style without repeated instructions. Added WORKING_AGREEMENT.md with targeted read routes, document ownership, immediate status/issue/challenge updates for every small logical change, verification and prompt private commit/push duties.
- Specified one- or two-sentence commit messages describing the final change, useful at a glance; no vague labels or long paragraphs. Documented how to report failed pushes, interruptions and unresolved conflicts without claiming completion.
- Linked the agreement from AI/human entry points and the continuation prompt. Added CONTRIBUTING.md to release contents. Q-001 and all runtime feature statuses remain unchanged; these are repository workflow instructions, not universal enforcement on unrelated tools.

## October 31 — reviewer gate and Railway preparation

User authorized deployment/gating and disposable demo state. Added native Node shared-token exchange with signed expiring secure cookies and HTTP behavior tests; Railway uses Docker and one replica. Hosting connection pending after browser URL verification stopped automation. Syntax and all 43 tests pass; no deployment claimed.

## October 31 — bake reviewed INFY research

Copied only the public, reviewed INFY six-claim note into committed evidence fixtures. Runtime cache remains ignored. Shared UI renderer shows saved note immediately; Railway defaults cache-only. Quota storage is best-effort, with in-memory retention and fail-closed calls on loss. Syntax, all 45 tests and 75-file package smoke checks pass. Browser/phone unverified; Docker engine unavailable.

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

## October 31 — additional demo AI review

Two authorized local free-tier calls attempted ASIANPAINT/PERSISTENT; both drafts were rejected and not published. Asian Paints repeated the unsupported-volume citation; Persistent exposed conservative false refusals for margin/margins and a unit shared by a numeric range. Context normalization now recognizes ordinary plurals and unambiguous adjacent shared range units while retaining currency/scale/direction/scope guards. Positive regression cases added; original 15 attacks must still fail. Syntax and all 73 tests pass, including all 15 original refusals and supported plural/range cases. Drafts remain ignored; no Gemini key transferred and no extra retry bypassed validation.

## October 31 — reviewed cached notes for all recorded examples

Two local free-tier drafts were rejected as whole outputs. They were not automatically partially published. An explicit source review omitted unsupported claims and narrowed wording before revalidation: ASIANPAINT now has four curated claims (decorative business, international-segment revenue, PBDIT guidance, conditional inflation risk scoped to affected international markets); unsupported 8–10% volume guidance and APPPG figure omitted. PERSISTENT has four claims (business, revenue, EBIT margin decline, headcount); formal guidance/aspiration and bull/bear claims omitted. Original models: Flash-Lite 3.5 and 3.1, one call each, observed draft latency 2.6/6.0 s. Each quote/document/page/period/unit was checked against recorded primary evidence.

Public notes are deliberately baked under data/research/notes, hash-matched and validated at read time, with reviewer-curated wording/omission disclosure in UI. All demo notes need zero new model calls/keys after restart. Syntax and all 74 tests pass. Phone-width browser shows each four-claim curated note, reviewer-curated/omission disclosure, 0 request calls, no overflow and no console errors. Deployment pending. These remain bounded examples, not general semantic proof or annual delivery analysis. No additional model retry was used and no Gemini key transferred.

Curated-note verification: initial curation was refused because “decorative business” did not preserve the quote’s segment scope, so neither note was written. Wording was corrected to “decorative segment”; all claims now pass the unchanged scope check. Two four-claim notes are written, with unavailable sections retained and explicit reviewer-curated disclosure. Syntax/all 74 tests and phone-width browser verification pass; deployment pending.
