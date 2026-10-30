# Milestones and acceptance gates

Dates are targets in IST; finish the core before November 1, 2026.

Start new sessions with [HANDOFF.md](../HANDOFF.md). This checklist records bounded milestones, not universal feature correctness. [ISSUES.md](ISSUES.md) owns unresolved failures and acceptance criteria; newer audit findings can reopen quality work even when an earlier example's gate is checked. In particular, Q-001 remains open despite the reviewed INFY example.

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
- [ ] October 30 audit follow-up: correct/reject missing metric context in ASIANPAINT's generated guidance citation and broaden demo semantic review. The new failed-review cache entry was quarantined; existing quote/numeric guards do not fix this gap. See REQUIREMENTS_AUDIT_2026-10-30.md.

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
- [ ] Deploy with user approval, verify hosted API and phone workflow; push repository to GitHub with approval.
- [ ] Finalize covering note, architecture/tradeoffs, original AI build history and demo steps. Draft prepared locally.
- [ ] Final reproducible checks and tagged demo checkpoint. Keep November 1 as buffer.

## Decisions needed later
Gemini free quota ONLY is approved; the manually corrected local `.env` key is accepted by Google and all six configured text models are listed. One INFY AI note is reviewed and cached. Gemma inference remains unverified because both hosted candidates timed out; no low-latency guarantee is claimed. The user authorized private GitHub creation/publication; https://github.com/SriAswin2005/finn now contains the preserved source history. A hosting target and deployment approval are still needed. Docker CLI exists but its engine is not running; the container image is prepared but unbuilt. This does not block the tested Node release archive. No email has been sent and no app has been deployed externally.
