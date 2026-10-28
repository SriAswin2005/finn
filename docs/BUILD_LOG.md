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
