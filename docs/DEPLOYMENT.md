# Vercel + Neon product operations

## November 1 Push rollout (prepared, not activated)

Push now has signed `POST /api/push/worker`, authenticated status/source Refresh, immutable documents and CAS state in separate Neon tables. Worker does at most one collection, two document steps and one model attempt per awaited bounded invocation; leases recover terminated workers. New public-source state must be explicitly initialized without recreating allowance. Read-only opens never generate. Research remains cache-only on Vercel; Push additionally requires `FINN_PUSH_ENABLED=true`, billing-disabled confirmation, key and `FINN_PUSH_HOSTED_APPROVED=true`. No key/worker secret has been transferred or activated.

`scheduler/wrangler.jsonc` prepares a Free Cloudflare dispatcher at minutes 7/22/37/52. It sends an expiring HMAC request and awaits Vercel's response (230s timeout). No Gemini/Neon credentials go to Cloudflare; only a separate worker-auth secret. New service activation/terms and this secret's transfer still require approval. Vercel daily cron is insufficient; no frequent cron is added to vercel.json. Current 15-minute value is a configurable target, not measured freshness.

Runtime model versions/roles/limits are JSON configuration (AI_SETUP.md). Before hosted generation, migrate all local attempt history/cooldowns into the single Neon ledger and have future workers use that ledger. Do not independently grant local and hosted budgets. Keep existing shared reviewer gate, secret exclusions, Recorded replay and three zero-call Research notes. Verify real scheduler ticks, new-event interpretation and cross-deployment persistence before claiming unattended Push completion.

Current production: https://finn-zeta-one.vercel.app. Code 909b988, deployment dpl_3BJwg7CwrYoxHdfiG3eeNMMWgrip, verified October 31, 2026. User authorized Vercel/Neon Free and explicitly approved the reviewer/parser secrets for sriak/finn production. No Gemini key was uploaded, and no paid plan/payment was added. Earlier Railway planning is superseded.

## Runtime and access

`vercel.json` runs Node/Python functions in Singapore. Every UI/asset/API request passes through `api/finn.js` and the shared Node handler; health alone is public. `FINN_ACCESS_TOKEN` exchanges `?key=TOKEN` for a signed 24-hour HttpOnly/Secure/SameSite=Lax cookie and redirects cleanly. Rotating it invalidates sessions. Private reviewer URL is in ignored tmp/reviewer-link.txt; never print/commit it. Live Gemini is always disabled on Vercel.

Three reviewed notes and recorded evidence are baked into the release. GET returns matching validated notes immediately, with 0 new calls/₹0 request model spend. ASIANPAINT/PERSISTENT are explicitly reviewer-curated and disclose omitted/unsupported sections. Original drafts were refused rather than automatically partially published.

`api/parse.py` accepts only short-lived HMAC-signed metadata from Node using `FINN_PARSER_SECRET`. It downloads the source itself, validates/pins public DNS addresses with TLS hostname verification, and bounds redirects/bytes/time/pages/text. Calls use the production alias so per-deployment Vercel authentication does not block the internal parser. No oversized PDF upload body is needed. Local parsing shares scripts/pdf_text.py. No OCR.

## Persistent and disposable state

Neon supplies server-only `DATABASE_URL`. Parameterized queries store collected public research in finn_research_cache and the latest normalized briefing in finn_source_snapshots. Research may stay in process for five minutes/five records; source snapshots for 30 seconds. Durable records survive new processes/deployments; memory and /tmp are disposable. Stored timestamps/freshness are preserved. No user accounts/preferences, credentials or full PDFs are in these tables. Device preferences remain browser-local.

Normal `npm run ingest` is local. Deliberate publication uses `node --env-file=.env.vercel.production src/ingest.js --publish` in the trusted owner checkout. It collects/saves locally, then publishes without overwriting a newer hosted capture. Browser Reload only rereads stored data; no source scheduler exists. Recorded replay stays unchanged unless --record is deliberately used.

October 31 at 20:43 IST: published 15/15 October 30 EOD and 62 portfolio filings, both adapters OK. Hosted Latest 200 and mobile-width browser collection date/coverage verified. Failures/missing/unreadable state remain explicit; never substitute recorded/fictional data as live.

## Verification and limits

Syntax/all 74 tests pass. Real HTTPS checks confirm gate, secure cookie/clean redirect, blocked .env, three zero-call notes, two recorded filing enrichments, fresh Latest and live synthetic refusal. Cold TCS collected a 361-page annual report and 29/25-page transcripts in 47.5 s, then persisted to Neon; optimized repeated retrieval observed 0.5 s. Final recorded note requests observed 0.2–0.8 s. First health request observed about 1.2 s. These are test-machine observations, not after-idle cold-start guarantees.

390 px browser checks: no overflow, source/profile expansion and page hrefs, six/four/four claims, management comparison, curation disclosure, no console errors. User reports smooth physical-phone load/scroll, saved alerts and TCS success. Phone install and PDF page opening are unconfirmed. Docker image unverified; actual Vercel runtimes are verified.

## Publish and local development

Source commits push to the approved private GitHub origin. Automatic GitHub linking failed; deploy via the locally linked `npx vercel deploy --prod --yes`, wait for READY, then verify HTTPS. A push alone is not a web deployment. One earlier transport failure was superseded by successful deployments.

`npm start` uses Node 24.16+. Recorded examples need no key/database. `npm ci` installs the Neon driver for persistent access; new local PDFs need Python 3.12+ and pinned requirements in .venv. All .env files, .vercel/, caches, PDFs, tmp/ and dist/ stay ignored. Do not transfer the local Gemini key or reset quota ledgers. Submission packaging/conversations, reviewer grants, final tagging and email remain deferred by the user until build approval.
