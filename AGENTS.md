# FINN project instructions

Build a reliable mobile-first briefing PWA for the ENAM AI Engineer challenge, due November 1, 2026. Read docs/SPEC.md and docs/MILESTONES.md before changing scope. Work locally unless deployment is requested.

- Finish one small vertical slice at a time. Verify its acceptance criteria, update the milestone checklist and commit a useful checkpoint.
- Keep the runtime dependency-free while the core fits Node and browser APIs. Justify new dependencies by a concrete need. Do not migrate frameworks for polish.
- Keep UI, HTTP routes, domain rules and data providers separate. Providers must return normalized records; domain rules must be independently testable.
- Never present fixture data as live, or a model-generated assertion as a primary-source fact. Preserve timestamps, document URLs, page/section citations and units as ingestion is added. Missing data is unavailable, never zero.
- Pull research uses annual reports and earnings-call transcripts only. Secondary sources may discover documents, but are not evidence for the analysis. Generalize ticker lookup rather than hard-code research answers.
- Keep credentials server-side and ignored by Git. Never commit secrets, user data or downloaded caches.
- Prefer targeted file reads and tests. Test domain edge cases and HTTP contracts; do not add tests that merely mirror markup.
- Mobile layout, keyboard access, loading/error/empty states and honest offline behavior are core quality. Local HTTP supports development; installation on a phone requires HTTPS hosting.
- Run npm run check and npm test before each implementation checkpoint. Record browser verification or any verification limit. Preserve progress in Git; never rewrite user history.
- Do not add native packaging, notifications infrastructure, voice, trading, authentication or broad dashboards before the core workflow passes.
