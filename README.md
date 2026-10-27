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

M2: public sources → normalized on-disk snapshot → domain ranking/signals → HTTP API → interactive briefing. The mock portfolio contains 15 NSE symbols across sectors. Runtime dependencies remain zero. Document-grounded research is next.

Choose a data mode and briefing window, expand routine filings, open original NSE filings, inspect company market records, and change alert thresholds. Preferences remain in this browser.

- **Latest sources** reads the local ingestion snapshot. It never falls back to fictional data. A fresh clone needs an ingestion run before using this mode.
- **Recorded sources** replays the committed real-data capture at its original timestamp; it is not current information. This works without contacting Yahoo/NSE.
- **Fictional demo** uses the original deterministic scenarios and fixed demo clock, clearly labelled throughout.

## Collect public data

```powershell
npm run ingest
```

This fetches Yahoo NSE daily histories (3 months) and seven calendar days of NSE announcements, with timeouts, one bounded retry and three price requests at a time. The API only reads the saved snapshot; Refresh briefing does not scrape external sites. Collection is manual for now.

```powershell
npm run ingest -- --record
```

Also replaces the committed replay snapshot when all configured histories and NSE metadata are available. Inspect and commit that file deliberately. Exit code 1 indicates source errors or comparison warnings; the usable local snapshot is still saved. Raw responses are retained in ignored `data/cache/raw/`, and the live snapshot is atomically replaced in `data/cache/snapshot.json`. Do not run simultaneous ingesters.

The initial capture has 15 histories and 43 NSE portfolio announcements, collected October 28, 2026, 03:14 IST. Yahoo's latest daily row (October 27) had no close, so the app shows the valid October 26 session with a warning and pauses those alerts. It does not substitute the provider's intraday quote. Fresh source collection may resolve upstream gaps; no user intervention is required for the recorded workflow.

The PWA caches its application shell; a failed API request shows offline/unavailable status. Source failures preserve older evidence with warnings. Phone installation will be verified after HTTPS deployment. See [data source contracts](docs/DATA_SOURCES.md) and [verification](docs/VERIFICATION.md).

See [specification](docs/SPEC.md), [milestones](docs/MILESTONES.md), [environment](docs/ENVIRONMENT.md) and [project instructions](AGENTS.md). Keep AI conversation exports/share links for the challenge submission; Git records code checkpoints, not the full build history.
