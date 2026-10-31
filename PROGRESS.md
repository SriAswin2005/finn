# FINN current progress

Last reconciled October 31, 2026 (IST). Deadline: November 1. Start with [HANDOFF.md](HANDOFF.md); working rules are in [AGENTS.md](AGENTS.md). This is current status, not a chronological log.

Standing workflow is explicit in [WORKING_AGREEMENT.md](docs/WORKING_AGREEMENT.md), with a human [CONTRIBUTING.md](CONTRIBUTING.md) entry point.

## Verified working
- Local Today / Portfolio / Ask FINN / Alerts prototype, 15 NSE companies, configurable in-app preferences, source links and explicit data modes. Mobile/navigation/offline browser checks were performed October 28; no fresh complete browser or physical-phone run October 30.
- October 30: syntax, all **41 tests** (38 pass; 3 server.test.js tests require a live HTTP server and fail in the sandbox — pre-existing, not a new regression). Build archive: 70 files, `.env` excluded, checksums verified.
- Manual live ingestion succeeded October 30 at 15:59 IST: 15/15 October 29 EOD records and 55 portfolio filings. Recorded replay is deliberately separate: October 28 capture, October 27 closes, 44 filings.
- Three recorded primary-document examples: INFY, ASIANPAINT, PERSISTENT. Generic cold HCLTECH and TCS retrieval verified.
- One INFY six-claim AI example reviewed; exact server-owned quotes, PDF pages, conditional cases and cache reuse verified.
- Private source repository: https://github.com/SriAswin2005/finn, master.
- **Q-001 fixed October 30:** `validateAnalysis` now requires that each claim's combined quote text contains at least one key metric term from the claim text. Regression test passes.
- **Q-002 partially resolved October 30:** Both INFY cached AI outputs pass the new metric check. ASIANPAINT (3 docs, 10 evidence chunks) and PERSISTENT (3 docs, 10 evidence chunks) evidence confirmed. No active cached AI output for those two — live generation requires running server + key.
- **Build verified October 30:** `npm run build` produces 70-file archive; `.env` excluded; `docs/SPEC.md` correctly included; root `SPEC.md` duplicate removed.
- Submission draft updated: [docs/SUBMISSION_DRAFT.md](docs/SUBMISSION_DRAFT.md).

## Open / incomplete
- **Deployment (D-001/D-002):** Railway deployment and shared-token gate authorized October 31. Gate implemented: signed 24-hour HttpOnly/Secure/SameSite cookie, clean redirect, protected UI/APIs; public health check only. Syntax check and all 43 tests pass (elevated rerun after sandbox restrictions). Railway CLI/account connection pending; browser tool stopped because it could not verify Edge URL. Docker/HTTPS/physical-phone verification remain open. Reviewer GitHub access not granted. AI conversation exports, covering note links and final demo tag are incomplete.
- **Q-002 live demo review:** If ASIANPAINT or PERSISTENT AI is generated before submission, spot-check claims against metric-context criteria.
- **S-001 deliberate scope gaps:** Quarterly P&L extraction, executive bios, 4-quarter guidance delivery, balance-sheet analysis — absent by design for this P0 milestone. See [full audit](docs/REQUIREMENTS_AUDIT_2026-10-30.md).

## Continue next
1. Verify/push token gate, finish baked-note cache-only release, then deploy using the user-supplied Railway connection; verify HTTPS and phone workflow.
2. Arrange reviewer GitHub access.
3. Export AI coding-agent conversation history; finalize SUBMISSION_DRAFT.md links.
4. `git tag demo-v1` after hosted verification and all submission gates pass.
5. Send email only after all gates pass.

Free-tier Gemini and ongoing private source pushes are authorized. Railway deployment and shared-token gating are now authorized. Paid use, new account terms/broader repository permissions, Gemini secret transfer and email remain unapproved.

Details: [specification](docs/SPEC.md), [milestones](docs/MILESTONES.md), [verification](docs/VERIFICATION.md), [issues](docs/ISSUES.md), [submission draft](docs/SUBMISSION_DRAFT.md).
