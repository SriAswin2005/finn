# FINN

A briefing-first, mobile-first financial intelligence PWA for the ENAM AI Engineer challenge.

**New maintainer or AI session:** start with [HANDOFF.md](HANDOFF.md), then [PROGRESS.md](PROGRESS.md) and [current issues](docs/ISSUES.md). They cover intent, implementation map, verified/partial/missing behavior, open failures, permissions and next steps. Use the [copyable continuation prompt](docs/CONTINUATION_PROMPT.md) for tools that do not automatically read AGENTS.md. The [October 30 audit](docs/REQUIREMENTS_AUDIT_2026-10-30.md) contains the full PDF feature matrix. Passing tests cover known citation attacks, not general semantic correctness.

The user's workflow is preserved in the [standing working agreement](docs/WORKING_AGREEMENT.md) and [contributor entry point](CONTRIBUTING.md): every small logical change updates its documentation immediately, is verified, and is committed/pushed with a clear one- or two-sentence message. Do not wait for another reminder or repeat settled instructions.

## Run

Requires Node 24.16.0 or newer. The recorded briefing and three research examples run without installation or an API key. New PDF collection also needs Python 3.12+ and one dependency:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

```powershell
npm start
```

Open http://localhost:3000. `npm run dev` restarts the server when source changes. Set `$env:PORT=3001` to use a different port. The server binds to 127.0.0.1 by default; a hosted environment can set `HOST=0.0.0.0`.

```powershell
npm run check
npm test
```

## Current milestone

Prototype 0.3 is hosted on Vercel + Neon with Today, Portfolio, Ask FINN, Alerts and About, three reviewed recorded notes, a cited management-progress view and two captured filing details. Broader automatic analysis remains incomplete. Public data travels through normalized snapshots and deterministic ranking/signals to the briefing. Generic research discovers annual reports and earnings-call transcripts, extracts physical PDF pages and returns cited excerpts. Captured examples: INFY, ASIANPAINT and PERSISTENT. HCLTECH and TCS were verified through cold on-demand lookups outside that set. See current handoff/issues rather than treating this milestone label as full completion.

Neon persistence uses the official `@neondatabase/serverless` driver (run `npm ci` for database access); browser code remains buildless. PDF parsing uses `pypdf==6.10.0`. Three public-evidence notes are reviewed and deliberately baked into the demo; ASIANPAINT/PERSISTENT are reviewer-curated after refused drafts and disclose omissions. Recorded notes need no key or new model calls; ignored runtime caches are not shipped. Vercel disables live generation and holds no Gemini key. Guidance revision is supported; comparable full-year delivery remains unverified. See docs/AI_REVIEW.md.

Choose a data mode and briefing window, expand routine filings, open original NSE filings, inspect company market records, and change alert thresholds. Preferences remain in this browser.

- **Latest sources** reads the persisted Neon snapshot on the host, or the local ingestion snapshot in development. It never falls back to fictional data. A fresh clone needs an ingestion run before using this mode.
- **Recorded sources** is the first-run default. It replays the committed real-data capture at its original timestamp; it is not current information. This works without contacting Yahoo/NSE.
- **Fictional demo** uses the original deterministic scenarios and fixed demo clock, clearly labelled throughout.

## Collect public data

```powershell
npm run ingest
```

This fetches Yahoo NSE daily histories (3 months) and seven calendar days of NSE announcements, with timeouts, one bounded retry and three price requests at a time. An incomplete latest Yahoo row can be completed from NSE's official closing report, preserving separate price and historical-volume source links. The API only reads the saved snapshot; Refresh briefing does not scrape external sites. Collection is manual for now.

```powershell
npm run ingest -- --record
```

Also replaces the committed replay snapshot when all configured histories and NSE metadata are available. Inspect and commit that file deliberately. Exit code 1 indicates source errors or comparison warnings; the usable local snapshot is still saved. Raw responses are retained in ignored `data/cache/raw/`, and the live snapshot is atomically replaced in `data/cache/snapshot.json`. Do not run simultaneous ingesters.

The recorded replay capture has 15 complete October 27 EOD records and 44 NSE portfolio announcements, collected October 28, 2026, 11:54 IST. NSE's official report completed two missing Yahoo rows; all 15 records are eligible for alert evaluation and two cross the default thresholds. The original incomplete capture was replaced with validated source records, not an intraday quote. Source failures still retain warnings and pause affected alerts.

## Research and free-quota AI

Enter an NSE symbol in Ask FINN; the discovery code does not require the company to be in the portfolio or examples. Optional questions retrieve matching source passages. Annual reports and transcripts are the only research corpus; Screener supplies document links, not financial evidence or AI summaries. PDFs that are unavailable, scanned, oversized or fail issuer checks produce explicit coverage errors.

```powershell
npm run research:collect -- INFY ASIANPAINT PERSISTENT
```

This refreshes document discovery, reuses recent immutable document URLs, and saves selected page evidence for an offline-source replay. Downloaded PDFs/full extracted text stay in ignored `data/cache/research/`. The committed selected pages are served through the research API, not as static files. Citations use physical PDF pages; printed page numbers can differ.

Use `npm run research:collect -- --cached INFY ASIANPAINT PERSISTENT` to rebuild selected evidence from existing local documents without downloading them again. Guidance retrieval includes both available calls; financial context includes a call and annual evidence when available. A quarterly actual is not automatically treated as a full-year guidance result.

Gemini is free quota only, opt-in, and called only on **Generate cited AI note**. Configure a billing-disabled project using [AI setup](docs/AI_SETUP.md). Backend-only key, bounded excerpts/output, evidence/prompt/model cache, durable local quotas and limited model-specific fallback conserve allowance. No actual model requests were used in automated tests.

Run `npm run configure:ai` in your own PowerShell to enter the one required Gemini key with hidden input. No ChatGPT or voice-service key is required.

## Build and release

```powershell
npm run build
npm run verify:build
```

Produces `dist/finn-prototype.tar.gz` plus a runnable `dist/finn/` directory and checksum manifest. The packaged app is smoke-tested without source-network access. Secrets, live caches, downloaded PDFs and local environments are excluded. [Deployment preparation](docs/DEPLOYMENT.md) includes a container option; no external deployment happens automatically.

The PWA caches its application shell; a failed API request shows offline/unavailable status. Source failures preserve older evidence with warnings. Physical-phone installation still requires HTTPS verification. See [data source contracts](docs/DATA_SOURCES.md), [milestones](docs/MILESTONES.md), [progress](PROGRESS.md) and [verification](docs/VERIFICATION.md).

See [specification](docs/SPEC.md), [milestones](docs/MILESTONES.md), [environment](docs/ENVIRONMENT.md) and [project instructions](AGENTS.md). Keep AI conversation exports/share links for the challenge submission; Git records code checkpoints, not the full build history.

To deliberately publish a fresh source snapshot to the configured Neon host, run `node --env-file=.env.vercel.production src/ingest.js --publish` from the trusted owner checkout. The environment file is ignored and server-only. `npm run ingest` continues to collect locally. The browser Reload control rereads saved data; it never initiates collection.

Current hosted Latest capture: October 31, 2026, 20:43 IST; all 15 October 30 EOD records and 62 filings, both source adapters OK. Recorded replay remains October 28. Hosting/access/persistence details are in docs/DEPLOYMENT.md. The user deferred conversations and submission details until the build is solid.
