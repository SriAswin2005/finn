# FINN — start here

Last reconciled: October 31, 2026, Asia/Kolkata. Deadline: November 1, 2026. This is the short handoff for a new person, tool or AI session; do not start with a full repository scan.

## Read order and authority

1. [AGENTS.md](AGENTS.md): working rules, permissions and boundaries.
   The [standing working agreement](docs/WORKING_AGREEMENT.md) preserves the user's style, targeted reading routes, immediate documentation duties and commit/push/message requirements. It applies without another reminder.
2. This file: product, architecture, current state and continuation path.
3. [PROGRESS.md](PROGRESS.md) and [docs/ISSUES.md](docs/ISSUES.md): dated status and unresolved work.
4. Read [docs/SPEC.md](docs/SPEC.md) and [docs/MILESTONES.md](docs/MILESTONES.md) when planning/changing scope. For an exhaustive feature matrix, use [the October 30 audit](docs/REQUIREMENTS_AUDIT_2026-10-30.md).

Latest human instructions take precedence. Original challenge PDFs establish the brief; the agreed specification chooses a focused implementation from its optional menu. Specifications describe intent, not proof that a feature works. Dated verification/audit records establish observed behavior. Old build-log entries and checked milestone boxes do not override a newer open issue. If documents disagree and evidence cannot resolve it, record the conflict rather than inventing a completion claim.

## What we are building

A briefing-first, mobile-first financial intelligence PWA: an investor opens Today to see what changed in a 15-company mock NSE portfolio, opens the original evidence, and requests focused company research. Navigation: Today, Portfolio, Ask FINN, Alerts. Research must generalize beyond demo tickers and use annual reports/earnings-call transcripts only. Price calculations and announcement triage are deterministic; AI synthesizes supplied primary evidence.

P0 is reliable briefing/portfolio/research/in-app alerts plus a verified deliverable. Business/financial context, guidance versus delivery and balanced cases matter, but unsupported analysis must stay unavailable. Voice, OS notifications and further PWA features are P1; native packaging/on-device models are P2. Do not migrate stacks or fill the brief's entire optional menu before the chosen core is reliable.

## Current status at a glance

| Capability | Implemented? | Working / verification limit |
| --- | --- | --- |
| Today digest and Portfolio | Yes | Fresh October 30 HTTP/data checks pass; 15 companies, source links, 24h/3d/7d windows, prioritized/routine filings. |
| EOD prices/volume + NSE filings | Yes | Manual refresh succeeded: October 29 EOD for 15/15, 55 seven-day filings. This is not realtime monitoring. |
| Alert preferences and calculations | Yes | In-app categories, price/volume thresholds and pause; covered by tests. No automatic ingestion or background/OS delivery. |
| Primary-document research | Yes | Three recorded examples; generic cold HCLTECH previously and TCS on October 30. Source failures remain possible and explicit. |
| AI synthesis | Quality check passed for INFY | Q-001 fixed October 30: metric-context validation added; regression test passes. Both INFY cached outputs pass new check. ASIANPAINT quarantined note not regenerated; PERSISTENT not AI-reviewed. New generations require spot-check. |
| Management promise/progress | Thin view verified by 47-test suite | INFY earlier FY guidance / later Q1 actual / revised FY guidance with full quotes/pages. Explicitly no annual delivery verdict; four-quarter history absent. |
| Mobile/offline shell | Yes, local checks | October 28 mobile/keyboard/navigation/offline recovery checked. No physical-phone HTTPS installation or fresh complete browser regression on October 30. |
| Quarterly results, biographies, broader financial analysis | Missing/partial | No standardized Revenue/EBITDA/PBT/PAT QoQ/YoY extraction, incoming-executive bios, dedicated balance-sheet/cash-quality/multi-year analysis. These PDF examples/menu options are not completed features. |
| Delivery | Partial | Private GitHub source and local release verified (70-file archive, .env excluded). Shared-token control passes local HTTP tests; hosting, phone checks, final history exports/email and demo tag remain incomplete. |

October 31: 43 tests pass with local HTTP/temp-file access; sandbox-only run fails on loopback/temp rename restrictions. Syntax checks and build archive verified on October 30. Passing tests do not prove semantic financial correctness. No known Git merge conflict at handoff; always inspect current Git status first.

## Implementation map: inspect only the slice you need

| Area / flow | Files and boundaries |
| --- | --- |
| Browser UI, preferences, offline | `public/app.js`, `public/research.js`, `public/index.html`, `public/styles.css`, `public/sw.js`. Browser storage holds preferences; service worker caches shell, never API data. |
| HTTP contracts | `src/access.js` shared-token gate; `src/server.js`: `/api/health`, `/api/briefing`, `/api/research`, POST `/api/research/analysis`; built-in Node HTTP. |
| Briefing rules | `src/domain/briefing.js`, `src/domain/announcements.js`: windows/ranking/classification/EOD thresholds, pure and independently testable. |
| Source collection | `src/ingest.js`, `src/providers/yahoo.js`, `nse.js`, `nse-eod.js`, `http.js`: normalize public data, bound requests, retain provenance/errors. No external scrape during a briefing request. |
| Stored briefing | `src/providers/snapshot.js`, `src/storage/snapshots.js`: live ignored snapshot versus committed recorded replay; separate fictional demo. Stale/incomplete data pauses applicable signals. |
| Research retrieval | `src/research/discovery.js`, `download.js`, `service.js`, `evidence.js`; `scripts/parse_pdf.py`. Discover issuer documents, bounded public PDF download, Python page text, keyword chunks. Up to one annual report/two transcripts; no four-quarter comparison engine. |
| AI | `src/ai/models.js`, `quotes.js`, `gemini.js`: eligible text routing, exact quote IDs, server-resolved references, numeric/quote/metric-context checks, one active generation, persistent file quotas/cache and bounded fallback. |
| Packaging/tests | `scripts/build.js`, `smoke-build.js`, `test/briefing.test.js`, `sources.test.js`, `research.test.js`, `server.test.js`. No framework/build-system migration needed. |

Browser code remains buildless; Neon persistence adds one Node dependency, `@neondatabase/serverless@1.2.0`, for durable serverless PostgreSQL. Python parsing dependency: pinned `pypdf==6.10.0`. Keep UI/routes/domain/providers separate. New financial features need normalized metric, value, period, currency, units, consolidation basis, source URL/page and evidence; matching numbers alone do not establish matching metrics or comparable periods. Unknown/missing values are unavailable, never zero.

## First safe actions on a new checkout/session

```powershell
git status --short
git log -3 --oneline
node --version
python --version
npm run check
npm test
npm start
```

Open http://127.0.0.1:3000. A fresh checkout's recorded briefing/research needs Node only. For new PDFs, create `.venv` and install `requirements.txt` as described in [README.md](README.md). `npm run` only lists scripts. If port 3000 is busy, check whether FINN is already running; Ctrl+C its own terminal before restarting. Never kill all Node processes.

`npm run ingest` refreshes only ignored live data. Browser Refresh rereads saved data. `--record` deliberately replaces committed replay: do not use it casually. `npm run build` and `npm run verify:build` create/check `dist/finn-prototype.tar.gz`. Dockerfile is prepared, but Docker image verification has not been completed; a passing Node archive is not proof the container works.

## Credentials, caches and authorization

- `.env`, `.venv`, `data/cache/`, `tmp/` and `dist/` are ignored and absent from a fresh clone. Do not expect cached AI notes, full PDFs, current live snapshots, local audit captures or credentials to transfer with Git.
- One server-side Gemini key only. Billing-disabled Gemini free quota is authorized; no paid/provider fallback. User manually corrected `.env` and Google accepted it. A wizard save proves persistence, not provider validity; check the actual saved value through metadata without printing it if troubleshooting. Never overwrite a working key or request it in chat.
- Inventory includes six supported configured text candidates and deferred speech/embedding IDs. Specialists are excluded from research. General concise notes prefer Flash-Lite. Narrow business tasks try Gemma 26B then Flash-Lite; both Gemma candidates previously timed out. Do not assume model availability means low latency or adequate output.
- Defaults: 20 total reserved attempts/rolling 24h, 20/model/day, 5/model/hour; attempts include failures. Three distinct attempts/request, 20 seconds/attempt inside a shared 45-second network budget. No rotation around shared-project quota errors. Inspect actual configuration/ledger without exposing keys; never reset ledgers to bypass limits.
- Approved: local work, free-tier Gemini, and ongoing source publication to private https://github.com/SriAswin2005/finn, branch `master`. No rewriting history. New branches use `codex/`.
- October 31 authorization: Railway deployment (Render fallback), shared-token gate, disposable host state and baked demo notes. Gate implemented in `src/access.js`; `railway.toml` selects Docker/health check/one replica. User is connecting Railway; deployment remains incomplete. Do not transfer the Gemini key; the demo will be cache-only. New account terms/broader integrations, paid use, reviewer repository grants, public repository visibility and email remain outside approval.

## Continue from here

1. Verify/push gate, bake reviewed notes and fail-closed disposable quota handling, then deploy to authorized Railway using user-supplied connection. Verify container, HTTPS, cold start and phone workflow; record limits honestly.
2. Arrange reviewer GitHub access to https://github.com/SriAswin2005/finn (currently private).
3. Export original AI coding-agent conversation history; add share links to [docs/SUBMISSION_DRAFT.md](docs/SUBMISSION_DRAFT.md).
4. `git tag demo-v1` after hosted verification and all submission gates pass.
5. Send email to assessment@enam.com only after all above are done.

Per slice: run relevant checks, record verification limits, update status/issues/milestones, commit and push to the approved private origin. Keep `PROGRESS.md` current rather than appending contradictory status forever. Read historical logs/original PDFs or code only where the next slice needs them.

October 31 cache slice: `src/ai/quota.js` retains best-effort memory and closes generation when ledger is lost/corrupt/unwritable. `data/research/notes/INFY.json` is explicitly curated public research, included by existing Docker/build data copy. GET attaches matching validated notes for immediate UI display. Railway cache-only by default; no Gemini secret transfer. Syntax and all 45 tests pass; 75-file packaged startup/secret exclusions/recorded-note smoke check pass. Browser/phone and Docker image remain unverified.

## October 31 — management promise and observed progress

`src/research/guidance.js` deterministically pairs complete earlier/later transcript prose with source pages. INFY: FY2027 CC revenue-growth promise 1.5–3.5%, later Q1 actual 2.4% YoY/1% QoQ, later forecast 1.5–3.0%. UI shows all three side by side, labels quarter versus full year non-comparable and gives no met/missed verdict. This is a thin management-progress view; completed annual/four-quarter delivery remains unavailable. Narrow generic extraction returns unavailable for unsupported formats; different explicit years/segment/qualified statements rejected. Added research loading skeleton and removed the remaining dialog blur; editorial theme is the only theme. Syntax and all 47 tests pass, including quote/page membership, unsupported chronology, different fiscal years and qualified/segment refusals. Browser and physical-phone checks remain unavailable.

## October 31 — adversarial citation context

Added `test/citation-adversarial.test.js`: 15 synthetic bad claims cover currency/scale, percent/pp/bps, quarter/full-year, segment/subsidiary/peer, sliced negation/conditions, bounds, direction and guidance-as-actual. Extra checks reject ambiguous flattened tables/empty text. `src/ai/context.js` applies conservative deterministic context guards; this is not general semantic proof. Quote bank skips overlong sentences rather than slicing off conditions. PDF parse failures now say Unreadable PDF. Syntax and all 64 tests pass, including all 15 adversarial refusals, qualified positive controls and compatibility of the baked INFY note. Browser verification unavailable.

October 31 hosting steering: the user replaced Railway with Vercel + Neon or Cloudflare Workers + D1 and asked the agent to choose. Vercel + Neon selected to preserve the existing Node/Python research flow; serverless adapter and persistent collected-research storage are next. Railway login cancelled; no Railway deployment occurred. Deployment/phone verification remain incomplete.

## October 31 — Vercel + Neon adapter (in progress)

User selected Vercel/Neon or Workers/D1; Vercel/Neon preserves native Node and Python PDF parsing as two functions. `api/finn.js` reuses the HTTP handler and gate; all assets route through it. `api/parse.py` validates a short-lived HMAC-signed source request, pins public DNS addresses with TLS hostname verification, bounds downloads/redirects/pages/text and returns page-preserving pypdf output. It shares `scripts/pdf_text.py` with the local parser. `src/storage/research-store.js` uses parameterized Neon queries for collected public research; recorded examples load first without database/network/model calls. Official Neon driver 1.2.0 is the first Node runtime dependency, justified by durable serverless PostgreSQL access. Local parser remains subprocess-based; Vercel scratch files move to /tmp. Live Gemini is disabled on Vercel regardless of key. Syntax and all 67 tests pass; deployment/real persistence/phone checks pending; no hosted URL yet. Railway configuration removed, login cancelled.

Vercel adapter verification passed (67 tests): parameterized cross-instance Neon adapter test, signed metadata-only Python request test, real Python HMAC expiry/private-DNS/blank-PDF checks. Build/archive and Docker include the lockfile/runtime dependency. Host accounts and Neon database are not yet connected; no persistence claim is made from simulated queries.

Vercel project `sriak/finn` is linked locally. Automatic private GitHub integration failed; deployment will use CLI source upload without expanding GitHub permissions. Source commits still push to the private origin. Neon Free (Singapore, app auth disabled) provisioning started; host secrets remain server-only. No hosted success/phone test claimed yet.

October 31 Vercel checkpoint: syntax, all 67 tests and 92-file archive smoke/secret exclusions pass. Neon Free provisioned/connected successfully; real cross-process persistence verification pending. Automatic approval review rejected uploading locally generated FINN_ACCESS_TOKEN/FINN_PARSER_SECRET to Vercel; the user explicitly approved both secrets for sriak/finn production; upload is proceeding before a gated deployment. No Gemini key transferred.

User explicitly approved the reviewer token and parser secret for sriak/finn production. Neon persistence verified with a public INFY record written by one Node process and read by a fresh process (3 documents); no credentials displayed. Host deployment and phone checks still pending.

## October 31 — first hosted verification and cold-research finding

Production ready: https://finn-zeta-one.vercel.app (deployment `dpl_2PE1UQ9ruymL8yXpmpkfWZqkY9SZ`). Hosted gate/clean 303 redirect/Secure HttpOnly cookie, protected assets, blocked .env, 15-company recorded briefing, all three recorded research examples, immediate six-claim INFY note (0 request model calls), guidance progress and private Python 403 verified. Warm request observations 300–411 ms; first observed health 1,162 ms. No after-idle cold-start or physical-phone result. One transient transport failure on app.js passed on a fresh full run.

D-003: cold hosted TCS returned 503 after 2.8 s. Parser was calling the per-deployment URL, which has Vercel authentication; switch to VERCEL_PROJECT_PRODUCTION_URL alias (our private HMAC endpoint) and retain source failure details. Regression test updated; syntax and all 67 tests pass. Hosted cold retry pending after deployment. Reviewer phone-test request remains pending. Private reviewer URL is only in ignored tmp/reviewer-link.txt.

## October 31 — reviewer path, ledger and refusal

Added About navigation with three-step reviewer path, exact scope/omissions, historical measured timings and free-tier/cache behavior. Current digest/research request latency is measured in the browser with 0 retrieval model calls/₹0 model spend. Live synthetic refusal endpoint runs the actual direction validator; no fake cached success. Mobile hero spacing reduced so priority content appears earlier. Syntax and all 67 tests pass, including live refusal HTTP contract. Browser/device verification pending; results/profile extraction still absent.

## October 31 — physical-phone report and research latency

User reports the hosted app loads/scrolls smoothly, alert preferences save, recorded examples become quick after the first load, and non-demo TCS returns in about 2–3 seconds. Device/browser unspecified; installation and PDF citation opening not confirmed. Recorded October 27–28 dates are expected, not a loading failure; button now says Reload saved snapshot and fixed capture date is explicit. Vercel region is moved to sin1 beside Neon; five public research records may be cached in process for five minutes, with persistent storage on expiry/restart. Syntax and all 67 tests pass, including repeat-read reuse and expiry back to durable storage. Hosted timings pending for this optimization.

D-003 resolved: hosted TCS cold retrieval succeeded with annual report (361 pages), October/July transcripts (29/25 pages), ten evidence chunks, no source errors in 47.5 s. After a new deployment, TCS reloaded from Neon in 3.3 s; another fresh Node process confirmed three persisted documents. No model call made.
