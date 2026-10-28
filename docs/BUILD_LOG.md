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
