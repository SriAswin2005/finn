# FINN current progress

Last reconciled October 31, 2026 (IST). Deadline: November 1. Start with [HANDOFF.md](HANDOFF.md); working rules are in [AGENTS.md](AGENTS.md). This is current status, not a chronological log.

Standing workflow is explicit in [WORKING_AGREEMENT.md](docs/WORKING_AGREEMENT.md), with a human [CONTRIBUTING.md](CONTRIBUTING.md) entry point.

## Verified working
- Local Today / Portfolio / Ask FINN / Alerts prototype, 15 NSE companies, configurable in-app preferences, source links and explicit data modes. Mobile/navigation/offline browser checks were performed October 28; no fresh complete browser or physical-phone run October 30.
- October 31: syntax and all **47 tests** pass with local HTTP/temp-file access. Build archive: 75 files, credentials excluded; packaged research includes the immediate reviewed INFY note without runtime cache or credentials.
- Manual live ingestion succeeded October 30 at 15:59 IST: 15/15 October 29 EOD records and 55 portfolio filings. Recorded replay is deliberately separate: October 28 capture, October 27 closes, 44 filings.
- Three recorded primary-document examples: INFY, ASIANPAINT, PERSISTENT. Generic cold HCLTECH and TCS retrieval verified.
- One INFY six-claim AI example reviewed; exact server-owned quotes, PDF pages, conditional cases and cache reuse verified.
- Private source repository: https://github.com/SriAswin2005/finn, master.
- **Q-001 fixed October 30:** `validateAnalysis` now requires that each claim's combined quote text contains at least one key metric term from the claim text. Regression test passes.
- **Q-002 partially resolved October 30:** Both INFY cached AI outputs pass the new metric check. ASIANPAINT (3 docs, 10 evidence chunks) and PERSISTENT (3 docs, 10 evidence chunks) evidence confirmed. No active cached AI output for those two — live generation requires running server + key.
- **Build verified October 30:** `npm run build` produces 70-file archive; `.env` excluded; `docs/SPEC.md` correctly included; root `SPEC.md` duplicate removed.
- Submission draft updated: [docs/SUBMISSION_DRAFT.md](docs/SUBMISSION_DRAFT.md).

## Open / incomplete
- **Deployment (D-001/D-002):** Railway deployment and shared-token gate authorized October 31. Gate verified: signed 24-hour HttpOnly/Secure/SameSite cookie, clean redirect, protected UI/APIs; public health check only. Railway CLI installed; waiting for user browserless login. Railway account connection pending; browser tool stopped because it could not verify Edge URL. Docker/HTTPS/physical-phone verification remain open. Reviewer GitHub access not granted. AI conversation exports, covering note links and final demo tag are incomplete.
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

October 31 cache slice: reviewed INFY note is now a deliberate public-evidence fixture in `data/research/notes/INFY.json`; matching hashes and validation required. GET research includes saved notes immediately. Railway defaults to cache-only, no key transfer; missing/corrupt/unwritable quota state retains in-memory ledger and closes new calls. Syntax and all 45 tests pass; 75-file packaged startup/secret exclusions/recorded-note smoke check pass. Browser/phone and Docker image remain unverified.

## October 31 — management promise and observed progress

`src/research/guidance.js` deterministically pairs complete earlier/later transcript prose with source pages. INFY: FY2027 CC revenue-growth promise 1.5–3.5%, later Q1 actual 2.4% YoY/1% QoQ, later forecast 1.5–3.0%. UI shows all three side by side, labels quarter versus full year non-comparable and gives no met/missed verdict. This is a thin management-progress view; completed annual/four-quarter delivery remains unavailable. Narrow generic extraction returns unavailable for unsupported formats; different explicit years/segment/qualified statements rejected. Added research loading skeleton and removed the remaining dialog blur; editorial theme is the only theme. Syntax and all 47 tests pass, including quote/page membership, unsupported chronology, different fiscal years and qualified/segment refusals. Browser and physical-phone checks remain unavailable.

## October 31 — adversarial citation context

Added `test/citation-adversarial.test.js`: 15 synthetic bad claims cover currency/scale, percent/pp/bps, quarter/full-year, segment/subsidiary/peer, sliced negation/conditions, bounds, direction and guidance-as-actual. Extra checks reject ambiguous flattened tables/empty text. `src/ai/context.js` applies conservative deterministic context guards; this is not general semantic proof. Quote bank skips overlong sentences rather than slicing off conditions. PDF parse failures now say Unreadable PDF. Syntax and all 64 tests pass, including all 15 adversarial refusals, qualified positive controls and compatibility of the baked INFY note. Browser verification unavailable.

October 31 hosting steering: the user replaced Railway with Vercel + Neon or Cloudflare Workers + D1 and asked the agent to choose. Vercel + Neon selected to preserve the existing Node/Python research flow; serverless adapter and persistent collected-research storage are next. Railway login cancelled; no Railway deployment occurred. Deployment/phone verification remain incomplete.
