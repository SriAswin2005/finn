# Milestones and acceptance gates

Dates are targets in IST; finish the core before November 1, 2026.

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

## M3B — AI synthesis (saved key rejected by Google)
- [x] Gemini free-tier-only opt-in, backend secrets, bounded context/output, structured claims and evidence/prompt/model cache.
- [x] Test quote/citation/numeric guards, quota ledger, concurrency and conservative model-specific fallback with simulated responses.
- [x] Include guidance from both available calls, prefer explicit forward ranges, and retain financial context from both call/annual evidence. Add hidden-input local key setup and persisted project-level cooldowns.
- [x] Fix setup rejection of larger inventories: validate before secret input, preserve specialist IDs, route supported Gemma/Flash text models and bound timeout/server fallback. Verify with simulated responses; live model quality remains below.
- [ ] Verify actual Gemini output using the user's billing-disabled project; validate quality and failure behavior.
- [ ] Verify a supported business/financial snapshot, conditional bull/bear interpretation and guidance-vs-delivery analysis where comparable evidence exists. Mark unsupported outputs unavailable.
- [ ] Gate: every displayed AI claim has inspected primary support. Exact quotes and numeric checks alone do not prove semantic correctness.

## P0 navigation and alert preferences
- [x] Today / Portfolio / Ask FINN / Alerts with portfolio-to-research links.
- [x] In-app announcement-category, price/volume and pause preferences survive reload.
- [x] Missing-source and empty states; no claim of OS push support.

## M4 — Demo hardening and delivery (October 31)
- [ ] Verify mobile installation on HTTPS, offline/stale behavior and clean startup.
- [ ] Prioritize one strong analysis example if time allows (results or guidance delivery).
- [x] Build local deployable archive with checksum/secret-exclusion checks and packaged HTTP/research smoke test.
- [ ] Deploy with user approval, verify hosted API and phone workflow; push repository to GitHub with approval.
- [ ] Finalize covering note, architecture/tradeoffs, original AI build history and demo steps. Draft prepared locally.
- [ ] Final reproducible checks and tagged demo checkpoint. Keep November 1 as buffer.

## Decisions needed later
Gemini free quota ONLY is approved; local `.env` and free-tier confirmation are saved. Google rejected the saved API key as invalid on the first research attempt and a model-list metadata check; replace the key through `npm run configure:ai` before live AI verification. A hosting target, GitHub destination and external publication approval are needed after local verification. Docker CLI exists but its engine is not running; the container image is prepared but unbuilt. This does not block the tested Node release archive. No email has been sent and no site/repository published.
