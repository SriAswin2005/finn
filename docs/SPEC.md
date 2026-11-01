# FINN specification

This file describes the agreed product and architecture, including historical milestone explanations. It is not the current completion report. Start with [HANDOFF.md](../HANDOFF.md), [PROGRESS.md](../PROGRESS.md) and [ISSUES.md](ISSUES.md) for verified, partial, missing and failing behavior. The original PDFs contain an optional menu; unfinished items must not be inferred as completed from this specification.

## Product decision
An investor opens FINN to answer: what changed in my portfolio, why does it matter, and what should I read next? A concise briefing leads; evidence and research are one step deeper. Mobile-first installable PWA now; native packaging later only if needed. Target a complete, reliable demo by October 31, before the November 1, 2026 deadline (IST).

## Challenge requirements and chosen scope
The main brief asks for push and pull interactions, 15–20 mock portfolio companies, 3–5 research examples, EOD prices/volume, exchange announcements, and annual-report/transcript fundamentals. Research should work on any NSE ticker with available data. Thin working workflows are explicitly preferred to broad coverage. The companion reference supplies announcement categories and definitions; neither a price move nor a summary should become investment advice.

Core experience:
1. Briefing: choose 24h / 3d / 7d, rank material portfolio announcements, collapse routine filings, open evidence, and inspect configurable EOD price/volume signals.
2. Research: submit an NSE ticker; discover primary documents and return a compact business snapshot plus a focused, cited analysis. Show unavailable evidence explicitly. Three to five document-backed demo examples, with graceful unsupported-ticker behavior.
3. Trust: show source, event time, fetch time and data mode; distinguish observations, computed values and inference. Never invent numbers, executive biographies or citations.
4. Navigation: Today, Portfolio, Research (Ask FINN) and Alerts. Portfolio includes EOD prices/changes, volume signals and a research entry point. Alerts include announcement-category and price/volume preferences; background notifications are P1, clearly distinguished from in-app alerts.

M1 is a deterministic fixture-backed push slice. It deliberately does not claim live prices, actual company events, LLM analysis or completed research. All scenarios are fictional; public company names are used solely for the mock portfolio. The demo clock is fixed at October 28, 2026, 18:00 IST, independent of the system clock.

## Architecture
- public/: semantic HTML, CSS and browser JS modules. Same-origin /api contract; local preferences stored only in the browser. Web manifest, generated PNG icons and service worker.
- src/server.js: built-in Node HTTP server, validated API inputs, bounded static routing and explicit errors.
- src/domain/: pure prioritization, windowing and signal calculations, independent of providers and presentation.
- src/providers/: normalized fixture provider first; live source adapters next. Provider boundary is the later storage/cache integration point.
- src/ingest.js and src/storage/: bounded public-source collection, raw-response archive and atomic JSON snapshots. No external fetch during a briefing request. A single manual ingestion process is sufficient for the prototype.
- src/research/: generic discovery, bounded public PDF retrieval, a page-preserving Python parser and keyword evidence retrieval. Three recorded examples run without downloading sources. src/ai/: replaceable Gemini adapter, structured cited claims, evidence/prompt/model cache and persisted local quota caps. Actual synthesis remains gated on free-tier credentials/verification.
- test/: Node test runner for behavior and HTTP integration. No build tool required.

Later source contracts must carry stable IDs, NSE symbol, category, event/fetch timestamps, source URL, evidence locator, currency/unit and data mode. EOD volume compares with the preceding 20 valid sessions, excluding the current session. Partial history is explicitly marked. Source adapters must use timeouts, caching, bounded retries and stale/error states. Never silently fall back from failed live data to fixtures.

M2 implements live snapshot, recorded-source replay and fictional demo as separate selectable modes. Live windows advance with the current clock; recorded windows stay fixed at capture time. Exchange titles/descriptions are displayed as metadata, with original filing links and rule-based category labels. Document analysis and page citations remain M3. A results meeting notice is not an actual results release; unknown categories remain visible. Data fetches older than 24 hours, sessions over four calendar days old, failed updates, newer incomplete source rows and split-affected comparisons pause applicable alerts. This conservative freshness rule is explicit and does not pretend to be a full exchange-holiday calendar.

## Scope boundaries
November 1 superseding scope: [PUSH_WORKFLOW.md](PUSH_WORKFLOW.md) defines automatic NSE collection, generic attachment interpretation and durable cached Push delivery. The older manual-only/deferred-scheduling descriptions below are historical. OS notifications and Research expansion remain deferred. Hosted Gemini transfer/new scheduler activation still need applicable approval.

Push means an in-app briefing and refresh initially; OS push and background scheduling are deferred. Pull may use a model behind a replaceable server-side adapter after document retrieval and citations work. Results extraction (Revenue, EBITDA, PBT, PAT with QoQ/YoY) and promised-vs-delivered analysis are candidates for one strong demonstration, not a commitment to all eight research outputs. No authentication, trading, portfolio accounting, native app, voice or elaborate chat shell for this prototype.

## October 28 briefing reconciliation
The user prioritizes business/financial snapshots, historical trends, guidance vs delivery and bull/bear research. The PDFs offer these as a menu; build supported evidence first and clearly mark unavailable comparisons rather than generate template conclusions. React/TypeScript/Vite/Tailwind and Python/FastAPI are suggested technologies; preserving the working simpler modular monolith is explicitly allowed. BSE symbols may be supported where applicable; the current mock portfolio and generic research flow target NSE, satisfying the PDF's any-NSE-ticker requirement. Voice, OS notifications and native packaging remain secondary. Maintain current handoff/status/issues; verify and commit each milestone, then continue approved P0 work. Private GitHub publication and free-tier Gemini have since been approved. Deployment, external authentication/access, secret transfer, email and paid API use still need approval; the current AI quality blocker is citation context, not missing credentials.

## Submission
User approved Gemini free quota only. Credentials stay in an ignored backend .env and require billing-disabled-project confirmation. Model selection is configurable within a checked free-tier allowlist; local caps are conservative, not provider quota claims. No paid fallback. Exact citation checks do not substitute for semantic review. PWA/voice/native work stays behind the remaining AI quality and delivery gates.

Current hardening adds explicit NSE official-close fallback for incomplete Yahoo rows, with Yahoo retained for preceding-session volume context. A source change is recorded and inspectable; failures preserve warnings. Research retrieval preserves both available call periods and labels unmatched coverage. `npm run configure:ai` accepts the one needed Gemini key through hidden local input; it makes no model request. Global quota errors persist a project-wide cooldown across questions and restarts.

Live synthesis acceptance now includes one reviewed INFY example. Models select short IDs from a server-built exact quote bank; the backend resolves original text and PDF-page provenance before numeric/citation validation. Low/minimal thinking and a 3,200-token cap preserve visible output; truncated notes are rejected. Flash-Lite is preferred for concise general notes after observed larger-model overload. Gemma remains a small-task first candidate with Flash-Lite fallback; successful Gemma inference is not yet verified. Guidance revisions may be summarized, but comparable full-year delivery remains explicitly unverified. See AI_REVIEW.md for the reviewed example and its limits.

Phone-accessible deployed prototype, GitHub repository, AI build-history exports/share links, and short covering note with decisions, omissions and next steps. Email destination in the brief: assessment@enam.com; subject: ENAM - IIT screening - 2027. Sending and public deployment are later user actions, not part of M1.

## October 31 delivery priority

The user now authorizes Railway deployment and one shared reviewer token, superseding the earlier no-auth/deployment boundary. Keep the editorial theme. Hosting state is disposable: bake recorded evidence and reviewed AI notes, keep the main demo free of model calls, and fail closed when quota state is lost. Priorities after deployment are one cited guidance/delivery comparison, then deterministic results, management-profile evidence, adversarial citation checks and submission packaging. Do not label forecast revisions as achieved delivery.
