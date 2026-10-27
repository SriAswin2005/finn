# Local release and deployment preparation

`npm run build` creates `dist/finn/` and `dist/finn-prototype.tar.gz`. Only selected application files, documentation and recorded public evidence are included. Credentials, live caches, downloaded PDFs, Python environments and Git metadata are excluded. BUILD_MANIFEST.json contains per-file SHA-256 checksums.

Run `npm run verify:build` after building. It verifies checksums/exclusions and launches the packaged application on an ephemeral local port to test the briefing and recorded research without source-network calls. The frontend uses browser modules directly, so no compilation/bundler is needed.

## Run from a fresh checkout or extracted release
Node 24.16+ and Python 3.12+ are required for new PDF collection. Reading the captured briefing/research examples only needs Node.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm start
```

On Linux use `.venv/bin/python`. `PYTHON_BIN` can override the executable. A new browser defaults to visibly labelled Recorded sources, giving a working first run without scraping. Select Latest sources after running `npm run ingest`.

## Container option
The Dockerfile packages Node plus the single Python dependency. No API key is baked into the image. A local example:

```powershell
docker build -t finn:prototype .
docker run --rm -p 127.0.0.1:3000:3000 --env-file .env finn:prototype
```

Omit `--env-file .env` if AI is disabled. For a hosted deployment, configure server-side secrets and a persistent volume for `/app/data/cache` owned by UID 1000. One instance/collector is assumed; local quotas and atomic JSON storage are not a multi-instance coordination system.

Public release needs HTTPS, a chosen hosting account, approved audience and a protected method for AI generation. Same-origin JSON checks and local budgets are present, but anonymous internet access must not expose an unprotected Gemini key-backed generation endpoint. Decide access control or keep AI disabled for the public demo before deployment. Source collection is manual, not a scheduler.

Nothing is published by the build command. External deployment, GitHub push and email require the user's approval. Verify HTTPS installation and a physical-phone workflow after choosing the host. Do not claim these are complete based on the local smoke test.
