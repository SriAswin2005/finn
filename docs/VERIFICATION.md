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
