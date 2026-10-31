# Vercel + Neon deployment

Selected and authorized October 31, 2026, replacing Railway. Vercel project: `sriak/finn`. Neon Free: `finn-research`, Singapore, application authentication disabled. Provisioning/connection succeeded and terms were accepted in the user's browser. No payment or Gemini key is involved. CLI source upload is used because automatic private GitHub integration failed; private source pushes still use the approved origin.

## Runtime and access

`vercel.json` routes every UI/asset/API request through `api/finn.js`, reusing the local Node handler. Only `/api/health` is public. `FINN_ACCESS_TOKEN` (random 32+ chars) exchanges `?key=TOKEN` for a signed 24-hour HttpOnly, Secure, SameSite=Lax cookie and redirects to a clean URL. Rotate it to invalidate sessions. Vercel refuses startup without a token and always disables live Gemini calls. The baked reviewed INFY note appears immediately; all three recorded evidence examples work without Neon/model calls. A revised forecast or Q1 actual is never an annual delivery verdict.

`api/parse.py` is a private Python/pypdf function. `FINN_PARSER_SECRET` signs short-lived metadata-only calls from Node. Python downloads from a DNS-validated, TLS-verified public host with address pinning; bounds redirects, bytes, time, pages and extracted text. No PDF upload body crosses Vercel's request-size limit. Scanned/unreadable documents fail explicitly. The local app still uses the same parser in a subprocess.

`DATABASE_URL` is supplied server-side by Neon. Only collected public research is stored in the `finn_research_cache` table using parameterized queries. Records survive process restarts; real database verification remains pending. `/tmp` holds disposable scratch files. No user accounts, preferences, credentials or downloaded PDFs are persisted to the database. Browser preferences remain on the device.

## Deployment state and secrets

Local syntax/all 67 tests and the 92-file package smoke pass. They do not prove hosted routing, source networking, database persistence, cold start or physical-phone behavior. Those checks remain open until a deployment URL exists.

The locally generated reviewer token and parser secret are in ignored `.env.deployment`. Automatic approval review rejected their first upload because hosting authorization was not considered specific enough; the user subsequently explicitly approved both secrets for sriak/finn production. Upload is authorized; no unprotected deployment is permitted. No secret value has been printed or committed. `.env.vercel.production`, `.env.local`, `.vercel/`, caches and PDFs remain ignored and excluded from upload/archive.

After approval: upload only these two host secrets plus `FINN_AI_CACHE_ONLY=true`; deploy using `npx vercel deploy --prod`; verify anonymous rejection, key exchange/clean redirect/secure cookie, all recorded examples, INFY note with zero model calls, Python authorization/unreadable cases and one cold non-demo ticker. Verify a Neon record from another process/request. Record warm/cold timings separately. A physical-phone HTTPS installation and smooth scroll check must be performed by a person with the device; browser emulation is not a substitute.

## Local release

`npm start` runs on Node 24.16+. Recorded examples need no API key or database. Use `npm ci` for Neon database access. New local PDF collection needs Python 3.12+ and `.venv` with `pip install -r requirements.txt`. `PYTHON_BIN` overrides the interpreter.

`npm run build` writes `dist/finn-prototype.tar.gz` and per-file SHA-256 manifest; `npm run verify:build` checks secret exclusions, startup, briefing and baked research. Docker remains a local alternative; its engine/image has not been verified. Hosting source credentials, payment, public repository visibility, reviewer repository grants and email are separate from a working web link. No email has been sent.

User explicitly approved the reviewer token and parser secret for sriak/finn production. Neon persistence verified with a public INFY record written by one Node process and read by a fresh process (3 documents); no credentials displayed. Host deployment and phone checks still pending.

## October 31 — first hosted verification and cold-research finding

Production ready: https://finn-zeta-one.vercel.app (deployment `dpl_2PE1UQ9ruymL8yXpmpkfWZqkY9SZ`). Hosted gate/clean 303 redirect/Secure HttpOnly cookie, protected assets, blocked .env, 15-company recorded briefing, all three recorded research examples, immediate six-claim INFY note (0 request model calls), guidance progress and private Python 403 verified. Warm request observations 300–411 ms; first observed health 1,162 ms. No after-idle cold-start or physical-phone result. One transient transport failure on app.js passed on a fresh full run.

D-003: cold hosted TCS returned 503 after 2.8 s. Parser was calling the per-deployment URL, which has Vercel authentication; switch to VERCEL_PROJECT_PRODUCTION_URL alias (our private HMAC endpoint) and retain source failure details. Regression test updated; syntax and all 67 tests pass. Hosted cold retry pending after deployment. Reviewer phone-test request remains pending. Private reviewer URL is only in ignored tmp/reviewer-link.txt.

## October 31 — physical-phone report and research latency

User reports the hosted app loads/scrolls smoothly, alert preferences save, recorded examples become quick after the first load, and non-demo TCS returns in about 2–3 seconds. Device/browser unspecified; installation and PDF citation opening not confirmed. Recorded October 27–28 dates are expected, not a loading failure; button now says Reload saved snapshot and fixed capture date is explicit. Vercel region is moved to sin1 beside Neon; five public research records may be cached in process for five minutes, with persistent storage on expiry/restart. Syntax and all 67 tests pass, including repeat-read reuse and expiry back to durable storage. Hosted timings pending for this optimization.

D-003 resolved: hosted TCS cold retrieval succeeded with annual report (361 pages), October/July transcripts (29/25 pages), ten evidence chunks, no source errors in 47.5 s. After a new deployment, TCS reloaded from Neon in 3.3 s; another fresh Node process confirmed three persisted documents. No model call made.

## October 31 — persistent Latest sources (in progress)

`src/storage/source-snapshot.js` stores the normalized source snapshot in Neon separately from research, with bound values, schema validation, a 30-second in-process read cache and conditional publication that preserves a newer snapshot. `src/ingest.js --publish` explicitly collects/saves locally then publishes to configured Neon; normal ingestion remains local. Hosted Latest mode reads this stored snapshot and preserves collection/source timestamps and staleness. Database failure/missing/unreadable data is explicit and never becomes recorded/fictional data. No collection is added to the briefing request. Tests, real source refresh/publication and hosted/browser checks pending. Submission work remains deferred.

Source-storage check initially 71/72: an old synthetic fixture lacked announcement-source metadata now required by the schema. Fixture corrected without weakening the schema; syntax and all 72 tests pass. The attempted f600c15 deployment failed with a transport fetch error; Git push succeeded, but production remains the preceding successful deployment until retry.

Latest sources publication verified October 31 at 20:43 IST: capture 2026-10-31T15:13:09.876Z, 15/15 October 30 EOD records, 62 portfolio filings, both source adapters OK. A fresh Node process reads the persisted snapshot with original times and no staleness. Recorded replay is unchanged. Local syntax/all 72 tests pass; hosted deployment/browser check pending. No model call made.
