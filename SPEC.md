# FINN

Briefing-first investment intelligence for a 15–20-company mock NSE portfolio. Deadline November 1, 2026. The challenge PDFs are authoritative; docs/SPEC.md holds the detailed specification and PROGRESS.md the current state.

New maintainers/tools should start with [HANDOFF.md](HANDOFF.md). [Current issues](docs/ISSUES.md) distinguish failures, partial verification, blocked delivery and deliberate omissions. This specification describes desired scope, not a claim that all features are implemented. A copyable startup instruction is in [docs/CONTINUATION_PROMPT.md](docs/CONTINUATION_PROMPT.md).

P0: mobile-responsive Today briefing; Portfolio with EOD changes and source links; Research for arbitrary supported NSE tickers using annual reports and earnings-call transcripts; configurable in-app announcement/price/volume alerts; verified frontend/backend integration and a deployable build.

Research priorities: business snapshot, financial evidence/trends, guidance versus delivery and balanced bull/bear arguments. Missing evidence must be explicit. Approximately 3–5 source-backed examples, including companies outside the portfolio. No broker/news/model-knowledge evidence. Deterministic calculations and triage; model use only for synthesis/reasoning, with cited primary evidence, backend-only credentials and content/version caching.

Keep the existing modular Node/browser stack; React/FastAPI were suggestions, not mandatory. PWA shell is already implemented. Voice, OS push, native packaging and on-device models must not delay P0. Do not publish, send email or incur costs without user approval.
