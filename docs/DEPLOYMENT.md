# Railway reviewer deployment

Authorized October 31, 2026. Use only private `SriAswin2005/finn`, branch `master`, and the free trial; no paid plan or payment method. The user is signing in and connecting the repository. No host has been deployed or verified yet.

`railway.toml` uses the existing Dockerfile, one replica and `/api/health`. Docker includes Node/Python/pypdf. Set a random 32+ character `FINN_ACCESS_TOKEN` as a host secret and `FINN_REQUIRE_ACCESS_TOKEN=true`. Railway refuses startup without the token. Never commit/log the credential. Open `https://HOST/?key=TOKEN` once: FINN issues a signed 24-hour HttpOnly/Secure/SameSite=Lax cookie and redirects to the clean URL. All UI/assets and research/generation APIs require access; health alone is public. Rotating the token invalidates sessions. The gate also protects the key-backed endpoint if live AI is enabled later.

No Gemini credential is to be uploaded. The next slice bakes reviewed notes and makes AI cache-only by default for this host. State is disposable: a small volume is optional and missing quota storage must fail closed, never create a fresh reviewer allowance. Recorded briefing/evidence are already included in the image. Do not rely on ignored `data/cache` transferring through Git.

## Local release

`npm run build` creates `dist/finn/` and `dist/finn-prototype.tar.gz` with a SHA-256 manifest. `npm run verify:build` verifies exclusions/checksums and starts the packaged app for briefing/research smoke checks. No command deploys implicitly. Credentials, live caches, downloaded PDFs, Python environments and Git metadata are excluded.

Run `npm start` from a checkout/release with Node 24.16+. Recorded examples need only Node. New PDF collection requires Python 3.12+ and `pip install -r requirements.txt` in `.venv`; `PYTHON_BIN` can override it. Browser defaults to Recorded sources. `npm run ingest` manually collects Latest sources; refresh is not ingestion.

For local Docker verification use `docker build -t finn:prototype .` then `docker run --rm -p 127.0.0.1:3000:3000 finn:prototype`. No key is baked in. The Docker engine/build and hosted HTTPS have not yet been verified.

## Required hosted evidence

Verify image startup, health, rejected anonymous UI/API calls, private-link exchange/clean redirect, all three recorded evidence examples, immediate reviewed INFY note with zero calls, restart without cache state, source-page links, HTTPS/installation and physical-phone smooth scrolling. Measure cold start and state its limits in the covering note. Local 43-test verification covers gate behavior; it does not establish these hosted/mobile results. Browser automation stopped on Edge URL verification, so the user is supplying the hosting connection.

Private source pushes remain authorized. New account terms/broader GitHub permissions, payment, Gemini key transfer, reviewer GitHub grants and email remain outside the current approval. Historical hosting estimates are in [HOSTING_ASSESSMENT.md](HOSTING_ASSESSMENT.md); actual trial eligibility must be checked.

## Disposable-state implementation

Railway automatically defaults to cache-only (`FINN_AI_LIVE_ENABLED` is not set). Optionally set `FINN_AI_CACHE_ONLY=true` explicitly. Reviewed INFY default note is baked under `data/research/notes`; other demos retain evidence but no reviewed synthesis. Notes must match current evidence hash and pass validation. Lost/corrupt quota or a failed reservation keeps process memory and blocks new calls. A fresh ledger is never created implicitly. A volume is optional. Syntax, all 45 tests and 75-file package smoke checks pass. Browser/phone unverified; Docker engine unavailable.
