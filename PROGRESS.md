# FINN current progress

Last reconciled October 30, 2026 (IST). Deadline: November 1. Start with [HANDOFF.md](HANDOFF.md); working rules are in [AGENTS.md](AGENTS.md). This is current status, not a chronological log.

Standing workflow is explicit in [WORKING_AGREEMENT.md](docs/WORKING_AGREEMENT.md), with a human [CONTRIBUTING.md](CONTRIBUTING.md) entry point.

## Verified working
- Local Today / Portfolio / Ask FINN / Alerts prototype, 15 NSE companies, configurable in-app preferences, source links and explicit data modes. Mobile/navigation/offline browser checks were performed October 28; no fresh complete browser or physical-phone run October 30.
- **Apple System Glass UI implemented October 30:** High-clarity Apple VisionOS / macOS Sonoma / iOS frosted acrylic design system in `public/styles-glass.css`. Solves the visual blending and reading focus issues:
  - Floating frosted pill navigation bar (segmented control style) with crisp active indicators.
  - Distinct elevated frosted glass cards (`backdrop-filter: blur(20px)`) with specular borders and depth.
  - High-contrast company symbol badges and color-coded category pills.
  - High-visibility "What to check" / "Why it matters" callout boxes with dedicated accent indicators.
  - Apple Stocks/Health style stat tiles and signals panel with bold tabular numbers and green/red pills.
  - **1-line UI switch:** Change `<link id="app-style" rel="stylesheet" href="/styles-glass.css">` to `/styles.css` in `public/index.html` before deployment.
  - **In-browser live switcher:** Discreet masthead toggle button (`Glass UI` / `Classic UI`) and `?ui=glass`/`?ui=classic` query parameter.
  - Service worker shell cache updated (`finn-shell-v5`) caching both stylesheets for complete offline support.
- October 30: syntax, all **41 tests** (41 pass, 0 fail when run in standard environment outside Windows loopback sandbox restrictions). Build archive: 71 files, `.env` excluded, checksums verified.
- Manual live ingestion succeeded October 30 at 15:59 IST: 15/15 October 29 EOD records and 55 portfolio filings. Recorded replay is deliberately separate: October 28 capture, October 27 closes, 44 filings.
- Three recorded primary-document examples: INFY, ASIANPAINT, PERSISTENT. Generic cold HCLTECH and TCS retrieval verified.
- One INFY six-claim AI example reviewed; exact server-owned quotes, PDF pages, conditional cases and cache reuse verified.
- Private source repository: https://github.com/SriAswin2005/finn, master.
- **Q-001 fixed October 30:** `validateAnalysis` now requires that each claim's combined quote text contains at least one key metric term from the claim text. Regression test passes.
- **Q-002 partially resolved October 30:** Both INFY cached AI outputs pass the new metric check. ASIANPAINT (3 docs, 10 evidence chunks) and PERSISTENT (3 docs, 10 evidence chunks) evidence confirmed.
- **Build verified October 30:** `npm run build` produces 71-file archive (`dist/finn-prototype.tar.gz`); `.env` excluded; `scripts/smoke-build.js` passes all checksums, secret exclusions, and HTTP smoke checks.
- Submission draft updated: [docs/SUBMISSION_DRAFT.md](docs/SUBMISSION_DRAFT.md).

## Open / incomplete
- **Deployment (D-001/D-002):** No host approved. Dockerfile exists but container is unbuilt/unverified. HTTPS phone install unverified. Reviewer GitHub access not granted. AI conversation exports, covering note links and final demo tag are incomplete.
- **Q-002 live demo review:** If ASIANPAINT or PERSISTENT AI is generated before submission, spot-check claims against metric-context criteria.
- **S-001 deliberate scope gaps:** Quarterly P&L extraction, executive bios, 4-quarter guidance delivery, balance-sheet analysis — absent by design for this P0 milestone. See [full audit](docs/REQUIREMENTS_AUDIT_2026-10-30.md).

## Continue next
1. User tests and chooses between Apple Glass UI and Classic Paper UI (toggle with button or 1-line in `index.html`).
2. Get deployment approval → Railway or Render → verify container, HTTPS, phone install.
3. Arrange reviewer GitHub access.
4. Export AI coding-agent conversation history; finalize SUBMISSION_DRAFT.md links.
5. `git tag demo-v1` after hosted verification and all submission gates pass.
6. Send email only after all gates pass.

Free-tier Gemini and ongoing private source pushes are authorized. Paid use, external deployment/authentication/access grants, secret transfer and email are not approved without user sign-off.

Details: [specification](docs/SPEC.md), [milestones](docs/MILESTONES.md), [verification](docs/VERIFICATION.md), [issues](docs/ISSUES.md), [submission draft](docs/SUBMISSION_DRAFT.md).
