# M1 verification — October 28, 2026

## Automated
`npm run check` passed for the server, domain module, fixture provider, browser application and service worker.

`npm test`: 6 tests passed, 0 failed. The HTTP integration test exercises an actual ephemeral Node server. Coverage includes:
- A deterministic 15-company demo, ranking and material/routine counts.
- Inclusive time-window boundary, future-event exclusion and portfolio scoping.
- Absolute positive/negative price movement, volume OR price triggers and exact threshold equality.
- Missing prices, zero denominators and incomplete volume histories.
- Invalid API parameters, disallowed methods and denied source/secret file paths.
- Manifest semantics, icon PNG signatures/dimensions and no-store API headers.

## Browser checks
Used the local in-app Chromium browser against the real server. Inspected at 390×844 and 1280×900; no horizontal overflow (document widths 375 and 1265 respectively, accounting for scrollbar). No warning/error console messages during the initial online workflow.

Verified:
- Default briefing: 4 material changes, 3 routine disclosures and 3 EOD signals.
- Seven-day window: 6 material changes; older acquisition scenario is available.
- Announcement detail shows the correct symbol, event time, context and explicit absence of primary evidence; closing restores focus.
- Routine disclosures expand and collapse.
- Thresholds of 50% / 20× produce zero signals and a useful empty state.
- Reload preserves selected window and thresholds; defaults restored after testing.
- Stopped the server and reloaded the already visited page. The cached HTML/CSS/JS shell loaded; the API failed and the briefing was hidden with a clear unavailable message. This verifies cache fallback and prevents stale data from appearing current.
- Restarted the server; Refresh briefing recovered the full workflow.

Preview captures are local, ignored QA artifacts: tmp/finn-mobile.jpg and tmp/finn-desktop.jpg.

## Limits
This is a fixture-backed vertical slice, not the completed challenge submission. No live-source access, real financial claims, research synthesis, background notifications, deployed HTTPS origin, physical-phone installation or full accessibility audit has been verified. Actual network-disconnected device behavior remains part of M4; the server-unavailable cache fallback was verified here. Manifest and offline shell readiness do not prove installation on every browser.

The Codex sandbox restricts Git metadata writes and loopback connections. Local commits and HTTP tests succeeded using approved elevated tool execution. No application dependency or Windows development tool installation was needed. The preview remains running for review; stop it with Ctrl+C when running it in your own terminal.

# M2 verification — October 28, 2026

This section supersedes the M1 live-data limitations above. Document analysis, HTTPS deployment and physical-phone installation remain unverified.

## Automated checks
`npm run check` now discovers and checks every JavaScript module under src/, public/, scripts/ and test/. Passed.

`npm test`: 16 tests passed, 0 failed. Added coverage for source deadlines, bounded retries/permanent failures, response size and JSON errors, daily-session completion, missing daily fields, split-affected comparisons, exactly 20 prior volume sessions, explicit IST exchange timestamps, deduplication, conservative classification, trusted attachment URLs, last-good-record retention, atomic replacement on Windows, stale snapshots and a 503 response for missing live data without fictional fallback. The committed replay reproduces calculations for all 15 companies.

## Source access
- Yahoo chart and NSE announcement endpoints returned HTTP 200 using Node's native fetch.
- Captured 15 valid company histories and 43 portfolio announcements from 2,974 exchange rows at 03:14 IST. No API credentials needed.
- Yahoo's newest completed source rows have null closes. Kept the valid October 26 session and paused affected alerts; did not substitute `regularMarketPrice`.
- A bounded request to the LT results attachment returned HTTP 206, `application/pdf` and a `%PDF-` signature.
- Regenerated category/quality annotations from the retained raw payloads after refining rules, without repeating collection.

## Browser checks
Verified the running API/UI at 390×844 and 1280×900 with no horizontal overflow (content widths 375/1265 including scrollbar allowance).

- Latest-source 24-hour view shows 7 priority disclosures and 8 routine disclosures, including the actual LT results filing. Source warnings are explicit; 0/15 price records are currently alert-eligible because the newer rows are incomplete.
- LT detail has the correct exchange description, event/collection times and original attachment URL; it explicitly says the PDF has not yet been analysed.
- RELIANCE market detail shows October 26 close 1,201.80 INR, previous close 1,190 INR, volume 7,490,515 shares, preceding 20-session average 15,259,242.15 shares, 0.99% price change and 0.49× volume, with an incomplete-newer-row warning and Yahoo history link. These are observations from the captured provider response, not investment conclusions.
- Recorded-source seven-day view shows 22 priority and 21 routine disclosures. Mode, window and original capture timestamp survive reload.
- Fictional mode remains isolated and visibly labelled; its default 24-hour briefing still shows 4 changes and 3 synthetic signals.
- Restored Latest sources and 24 hours after testing. Captured tmp/finn-m2-mobile.jpg, tmp/finn-m2-desktop.jpg and tmp/finn-m2-evidence.jpg (ignored QA artifacts).

## Remaining limitations
Collection is a manual command, not a scheduled job or a phone-side action. A committed replay is available without network access; a fresh clone needs `npm run ingest` for Latest sources. Public endpoints can change, throttle or be incomplete. Snapshot persistence is intended for one local collector. The freshness rule is conservative and calendar-day-based, not an NSE holiday calendar. Metadata classification is not semantic document analysis. Results extraction and primary-document research remain M3.

# M3A and core navigation — October 28, 2026

Reconciled the two challenge PDFs with the user's implementation briefing. Retained the working stack; added pypdf 6.10.0 in a local .venv.

## Source and automated verification
- Captured annual report plus two earnings-call transcripts for INFY, ASIANPAINT and PERSISTENT, preserving hashes and physical PDF pages. Cold HCLTECH research through the UI retrieved a 485-page report and 26-/29-page transcripts without ticker mappings. Issuer checks and primary attachment links were present.
- `npm run check` passed. `npm test`: 26 tests passed, zero failed. New checks cover actual Python PDF extraction, discovery, private-address/redirect/size guards, missing research, page citations, exact quote/numeric rejection, quota/cache/fallback behavior and research HTTP/POST safeguards.
- All Gemini responses in tests are simulated. Zero live model calls made. Model availability, generated note quality and guidance comparison are UNVERIFIED pending a billing-disabled project's key.
- `npm run build` and `npm run verify:build` passed: release checksums, secret/cache exclusions, packaged HTTP briefing and recorded research. No external source call is needed for packaged replay.
- Docker CLI exists, but the Linux engine is stopped. Dockerfile is prepared; no container build claimed. The tested Node archive is independent of Docker.

## Browser verification
- Today / Portfolio / Ask FINN / Alerts navigation and 15 portfolio cards work; a portfolio research button loads the selected company.
- All three captured examples load documents/page links. Cold HCLTECH succeeds. Invalid ticker input returns a clear error and recovers on choosing an example.
- AI button is disabled with a truthful message when the key is absent; no placeholder AI conclusions are shown.
- Default fictional rules show four category matches and three market signals. Deselecting categories and raising thresholds yields an empty state; pause/threshold preferences survive reload. Defaults restored after testing.
- Inspected 320×740 and 390×844 portrait, 844×390 landscape and desktop. No horizontal overflow (305/829 content widths at narrow/landscape sizes reflect scrollbar allowance).
- New browsers default to labelled Recorded sources. Existing preferences remain. Research is independently labelled primary evidence regardless of Today data mode.

## Remaining gates
Keyword excerpts are not verified financial conclusions or a comparable-period promise-versus-delivery analysis. Live Gemini output and semantic review remain necessary. Hosting approval, HTTPS physical-phone/PWA verification, GitHub publication and original AI-history exports remain pending. No external deployment, paid call or email occurred.

# Continued hardening — October 28, 2026

- `npm run check` and all 34 tests passed after adding source-balanced guidance, forward-range ranking, hidden-input setup validation and persisted quota cooldown checks.
- Guidance now selects both available transcripts for each captured example; financial retrieval includes call plus annual context. Recorded pages were regenerated from the local PDF cache without downloads or AI calls.
- Missing AI sections are derived from validated claim coverage. Bull/bear statements require the interpretation flag. Project-level/ambiguous 429 errors block further model requests across different questions and process restarts; numeric/date Retry-After and structured delays are tested.
- The Windows setup wizard was tested in an isolated ignored folder with a dummy key. Codex's sandbox blocked raw console mode; unrestricted local execution saved the dummy key without echo and with zero network calls. The dummy file was deleted. The command now stops before requesting a key if secure input cannot be enabled.
- Live collection refreshed at 11:54 IST: all 15 October 27 market records valid, 44 portfolio announcements from 3,028 source rows, no source warnings. Two incomplete Yahoo rows were completed from the official NSE report with separate baseline provenance. The current recorded default view has six priority filings, seven routine disclosures and two EOD signals.
- Browser verified 15/15 alert coverage and real signal rendering. SUNPHARMA's detail opens the official closing-report link and the separate Yahoo volume-history link with the correct methodology explanation. Research displays earlier/later call evidence. This does not verify generated analysis; a real Gemini key is still absent.

## Larger model inventory correction — October 28
- Reproduced the user's 14-model list in automated configuration coverage; all entries now save with six supported research candidates and eight deferred specialist IDs. Unknown syntactically valid IDs are retained but disabled. Injection, specialist-only and oversized lists fail validation before the wizard asks for the secret.
- Simulated Gemma transport timeout falls back to the other configured Gemma; minimal thinking and prompt JSON are used without assuming schema-mode support. Thought parts are excluded. Citation/numeric failures still stop with one call; six text candidates cannot expand the three-attempt limit. Existing project-wide cooldown/authentication tests pass.
- All 37 tests pass outside the Windows sandbox. Initial sandbox execution was blocked by temporary-file rename and loopback restrictions; rerunning with those permissions passed. No real provider request or quota consumption occurred.
- This change has no browser markup or client behavior changes. Earlier responsive browser checks stand; live AI rendering, quality and latency await successful local key setup.

## First live credential check — October 28
- Verified only key presence, free-tier confirmation and non-secret inventory: six supported text candidates and eight deferred specialist IDs. The credential itself was never printed.
- First INFY generation attempt was rejected in approximately 402 ms; this measures rejection latency, not model inference. Google returned HTTP 400 / INVALID_ARGUMENT / `API key not valid. Please pass a valid API key.` The independent model-list metadata endpoint returned the same error. No note was generated and no model fallback occurred.
- Added an actionable invalid-key message with a simulated regression ensuring arbitrary provider text/credentials are not echoed and only one model is attempted. Live quality, inference latency, model availability and AI browser rendering remain unverified until a valid key is saved.

## Server restart recovery — October 28
- Port 3000 belonged to Node PID 16780 running `node --env-file-if-exists=.env src/server.js`; its HTTP research response identified FINN/Infosys and AI unconfigured. Verified the listener and command line again before stopping that specific process.
- Restarted this workspace with `npm start`; `/api/research?ticker=INFY` returns HTTP 200 and `ai.configured=true`. Google's model-list metadata still returns HTTP 400 / INVALID_ARGUMENT / invalid API key. No generation call was made during this recovery.
- Non-secret shape checks did not establish an incomplete paste or an accidentally prepended environment-variable name. The cause of the invalid credential remains unknown. No secret was printed or changed.
- Improved EADDRINUSE startup guidance: stop the existing FINN terminal with Ctrl+C, then use `npm start`; npm's default restart cannot stop another terminal's process.

## Live synthesis acceptance and local recovery — October 28
- User's manually edited `.env` was accepted by Google (HTTP 200 model metadata); all six configured text candidates support generateContent. Earlier key rejection is resolved. No secret was printed, committed or packaged.
- Live iteration caught Flash timeout/server-busy responses, MAX_TOKENS with incomplete JSON, numeric claims absent from selected quotes, and model-written quotes exceeding 220 characters. Rejected notes were not published. Known non-STOP finish reasons are now rejected even when a JSON prefix parses.
- Added deterministic 20–220-character source quote IDs; the model selects IDs and the backend restores exact evidence text/page linkage before existing validation. Grouped short IDs reduced the observed prompt from 10,235 to 5,325 tokens for the same evidence. Output cap is 3,200 tokens with model-specific low/minimal thinking.
- Reviewed all six claims of the successful default INFY v6 note against their selected primary passages. Flash-Lite completed this request in approximately 6.5 seconds, with 533 visible output tokens. This is one observation, not a latency guarantee. Both Gemma candidates timed out; no successful Gemma inference is claimed. Details: AI_REVIEW.md.
- Browser verified six claims, annual/transcript physical-page links, conditional labels, explicit unverified guidance delivery, generated timestamp in IST and repeated cache reuse. At 390×844: no horizontal overflow (375-pixel content width), no console errors during the successful online flow. Screenshots: tmp/finn-reviewed-ai-mobile.png and tmp/finn-guidance-mobile.png (ignored local proof).
- Offline/server-unavailable check: updated shell v4 loaded; stopped only the confirmed FINN server, reloaded Research successfully from the cached shell, and selected INFY. The UI clearly stated that FINN could not be reached and the shell does not include research data. Restarted, loaded primary evidence and recovered the cached note without generation. The offline error was expected; no fixture or stale API response was substituted.
- `npm run check` and all 40 tests pass. HTTPS installation and physical-phone testing remain unverified; nothing has been deployed or published.

## October 30 original-requirements audit
- Reread all original PDF pages; recorded a complete implemented/partial/missing matrix in REQUIREMENTS_AUDIT_2026-10-30.md. Menu examples are distinguished from mandatory source/generalization/delivery requirements.
- Fresh syntax, all 40 tests and packaged-release checks passed. Live snapshot was stale; manual ingestion refreshed all 15 October 29 EOD records and 55 portfolio announcements successfully without changing committed replay. Fresh live/recorded HTTP checks and three research example endpoints returned 200.
- Cold TCS retrieval (previously uncached) succeeded with one annual report and two transcripts, no errors, about 32 seconds. This verifies another generic ticker, not universal issuer availability.
- INFY cached AI note passed existing guards. New ASIANPAINT generation passed mechanical guards but attached a quote that did not establish the metric labelled volume growth. Quarantined only that new cache entry and preserved audit evidence. Semantic/citation-context coverage remains an open quality issue; no code fix or comprehensive AI correctness claim.
- No fresh full browser, physical-phone, hosted or Docker-image verification. Original AI-history exports, final covering note/access and deployment remain unfinished.

## October 30 standing-workflow instructions
- Added the standing user agreement, human contributor entry point and task/document maintenance routes; linked AI/human startup files and continuation prompt. PROGRESS.md records this instruction change without claiming an AI/runtime fix.
- Added CONTRIBUTING.md to release packaging. Syntax checks and all 40 tests pass; packaged checksums, secret exclusions and HTTP/research smoke checks pass with 71 files. Source and packaged documentation links are checked before the private push.
- No browser/UI behavior changed, so no new browser, phone or live-model verification is claimed. These files guide readers; no automatic enforcement by unrelated tools is claimed.

## October 30 Q-001 fix, AI cache audit and release verification
- Fixed Q-001 in `src/ai/gemini.js`: `validateAnalysis` now extracts meaningful metric-identifying terms (alpha words ≥5 chars, stop-word filtered) from claim text and verifies that the claim's combined quote text contains at least one of those terms. A claim asserting "volume growth" whose citation never mentions "volume" is rejected. Numeric and exact-quote guards are preserved.
- Added regression test in `test/research.test.js` reproducing the ASIANPAINT citation-context failure; regression test passes.
- Programmatic cache audit: verified both active INFY cache files (12 claims total across two generations) against the updated `validateAnalysis`. All 12 claims pass. The Q-001 fix introduces zero false rejections on existing verified notes.
- Primary evidence verified: ASIANPAINT and PERSISTENT each have 3 primary documents (1 annual report, 2 concall transcripts) and 10 multi-section evidence chunks.
- Test suite: `npm test` runs 41 tests. All 41 pass (0 failures) in standard environment outside Windows sandbox loopback restrictions. Inside standard sandbox mode, 38 pass while 3 `test/server.test.js` tests fail with `connect EACCES 127.0.0.1` due to sandbox socket policy.
- Build packaging: removed redundant root `SPEC.md` duplicate (`docs/SPEC.md` is the canonical specification) and updated `scripts/build.js`. `npm run build` creates `dist/finn-prototype.tar.gz` with 70 files; verified `.env`, `.venv`, and `data/cache` are strictly excluded.
- Packaged release verification: `node scripts/smoke-build.js` passes all file checksums, verifies secret exclusion, and verifies HTTP briefing and recorded research smoke endpoints.
- Current limits: Docker daemon is stopped on host; container image remains prepared but unbuilt. Physical-phone HTTPS installation, hosted deployment, reviewer GitHub access and AI export links remain pending user approval.

## October 31 — shared-token deployment slice

Implemented signed reviewer cookie, clean key redirect, protected assets/APIs, fail-closed Railway token configuration and Docker health-check settings. Syntax check and all 43 tests pass. Computer Use stopped on Edge URL verification; no hosted or physical-phone test completed.

## October 31 — cache-backed disposable demo

Recorded INFY note hash matches recorded evidence; immediate GET notes, no-key reuse, cache-only host and quota loss/write failure syntax, all 45 tests and packaged smoke checks pass. No model call made.

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
