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

Completed October 28: 15 valid histories, 43 portfolio announcements, recorded replay and 16 passing tests. The latest Yahoo row lacks its close; records show the preceding valid session and explicitly pause alerts. This upstream data limitation is visible, not a blocker for continuing M3.

## M3 — Primary-source pull (October 29–30)
- [ ] Generic NSE ticker input, discovery and document retrieval with bounded failures.
- [ ] Parse/chunk annual reports and transcripts; preserve page/section provenance.
- [ ] Focused cited analysis; cache by document hash and prompt/model version.
- [ ] Three to five research examples; test an unseen ticker and missing evidence.
- [ ] Gate: every factual research claim can be traced to a primary document.

## M4 — Demo hardening and delivery (October 31)
- [ ] Verify mobile installation on HTTPS, offline/stale behavior and clean startup.
- [ ] Prioritize one strong analysis example if time allows (results or guidance delivery).
- [ ] Deploy, verify hosted API and phone workflow; push repository to GitHub.
- [ ] Prepare covering note, architecture/tradeoffs, AI build history and demo steps.
- [ ] Final reproducible checks and tagged demo checkpoint. Keep November 1 as buffer.

## Decisions needed later
Verify public-source access before choosing ingestion dependencies. Select a deployment target and, if synthesis needs one, an available model credential. Neither is required for M1. Do not block local development on these choices.
