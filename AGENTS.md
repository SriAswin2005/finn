# FINN project instructions

Build a reliable mobile-first briefing PWA for the ENAM AI Engineer challenge, due November 1, 2026. Read docs/SPEC.md and docs/MILESTONES.md before changing scope. Work locally unless deployment is requested.

Start a new session with HANDOFF.md, PROGRESS.md and docs/ISSUES.md before opening implementation files. HANDOFF.md maps the relevant slice to its files; avoid a full repository scan. Read docs/REQUIREMENTS_AUDIT_2026-10-30.md for exhaustive coverage, not as proof every item is complete. Update current status/issue evidence at handoff; historical logs never override a newer open finding. Private GitHub publication and billing-disabled Gemini free-tier use are already authorized; other external actions still need approval.

The user's standing work style is binding in docs/WORKING_AGREEMENT.md. Read it on entry; do not require the user to repeat instructions or reconfirm already-approved work. Every saved logical change, however small, must immediately update PROGRESS.md and the affected issues/verification/milestones/architecture documents before moving on. Keep code and its documents in the same coherent checkpoint. Verify, commit promptly and push to the approved private origin; report an unsuccessful push instead of claiming upload. Commit messages must be one or two short concrete sentences explaining the actual change, with a useful subject visible in git log --oneline. No vague, numbered-only or paragraph-long messages. Use the agreement's document/task ownership tables; do not churn unrelated docs or commit every keystroke.

- Finish one small vertical slice at a time. Verify it, update PROGRESS.md and the milestone checklist, and commit. Continue to the next approved P0 milestone when safe; do not stop solely at a checkpoint.
- Keep the runtime dependency-free while the core fits Node and browser APIs. Justify new dependencies by a concrete need. Do not migrate frameworks for polish.
- Keep UI, HTTP routes, domain rules and data providers separate. Providers must return normalized records; domain rules must be independently testable.
- Never present fixture data as live, or a model-generated assertion as a primary-source fact. Preserve timestamps, document URLs, page/section citations and units as ingestion is added. Missing data is unavailable, never zero.
- Pull research uses annual reports and earnings-call transcripts only. Secondary sources may discover documents, but are not evidence for the analysis. Generalize ticker lookup rather than hard-code research answers.
- Keep credentials server-side and ignored by Git. Never commit secrets, user data or downloaded caches.
- Prefer targeted file reads and tests. Test domain edge cases and HTTP contracts; do not add tests that merely mirror markup.
- Mobile layout, keyboard access, loading/error/empty states and honest offline behavior are core quality. Local HTTP supports development; installation on a phone requires HTTPS hosting.
- Run npm run check and npm test before each implementation checkpoint. Record browser verification or any verification limit. Preserve progress in Git; never rewrite user history.
- P0: Today digest, Portfolio, source-backed Research, configurable in-app Alerts and deployable verified application. Prioritize business/financial evidence, guidance vs delivery and balanced cases; never invent unsupported analysis.
- P1 voice, notifications and further PWA work wait for P0. P2 native packaging and on-device models are deferred. No external publishing, email, authentication or spending without user approval. Keep model calls disabled until credentials and budget are authorized.
