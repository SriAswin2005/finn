# FINN

A briefing-first, mobile-first financial intelligence PWA for the ENAM AI Engineer challenge.

## Run

Requires Node 24.16.0 or newer. No install step and no API key required.

```powershell
npm start
```

Open http://localhost:3000. `npm run dev` restarts the server when source changes. Set `$env:PORT=3001` to use a different port. The server binds to 127.0.0.1 by default; a hosted environment can set `HOST=0.0.0.0`.

```powershell
npm run check
npm test
```

## Current milestone

M1: a fixture provider → domain ranking/signals → HTTP API → interactive briefing. The mock portfolio contains 15 NSE symbols across sectors. All financial events and numbers are fictional, visibly labelled demo scenarios, using a fixed clock. Nothing in this version is a live market claim or source-grounded research result.

Choose a briefing window, expand routine filings, open a scenario's evidence status, change alert thresholds and refresh. Preferences remain in this browser. The PWA caches its application shell; a failed API request shows offline/unavailable status rather than presenting an old briefing as current. Phone installation will be verified after HTTPS deployment. Research is scheduled for M3.

See [specification](docs/SPEC.md), [milestones](docs/MILESTONES.md), [environment](docs/ENVIRONMENT.md) and [project instructions](AGENTS.md). Keep AI conversation exports/share links for the challenge submission; Git records code checkpoints, not the full build history.
