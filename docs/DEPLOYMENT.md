# Vercel + Neon operations and Push rollout

Reconciled November 1,2026 (IST). **Approved November1, execution pending.** Current website remains https://finn-zeta-one.vercel.app, code 909b988 / dpl_3BJwg7CwrYoxHdfiG3eeNMMWgrip (October 31). November 1 source pushes are not deployments.

## Exact actions explicitly approved November1

| Action | Destination/data and effect | Status |
| --- | --- | --- |
| Push state migration + local shared-ledger binding | Existing FINN Neon database in ignored `.env.vercel.production`: public filing metadata, extracted pages, jobs/results and every quota attempt/cooldown into `finn_push_state`/`finn_push_documents`; add that same server-only DATABASE_URL to ignored local `.env`, preserving original Gemini key | Explicitly approved by the user after explanation (“okay go ahead”). Earlier automatic-review rejection occurred before execution; migration/binding completed and fresh-process verified:10 documents,76 events,16 preserved attempts; future local workers use the same Neon ledger. |
| Hosted Gemini transfer/enablement | Original local Gemini key to server-only production environment of Vercel project `sriak/finn`, to analyse public NSE evidence with billing disabled and unchanged shared caps | Transfer approved, pending execution. Keep generation disabled until source-review gates pass. Research stays cache-only. |
| Frequent Free dispatcher | Cloudflare Workers Free `finn-push-dispatcher`, only approved FINN origin and a separate worker-auth secret; recurring signed HTTPS calls to Vercel | Free service activation/separate-secret transfer approved, pending authentication/execution. User still handles any new binding terms. No Gemini/Neon credential goes to Cloudflare. No paid plan. |

Migration source is explicit local data/cache/push.sqlite (optional FINN_PUSH_MIGRATION_SOURCE), independent of VERCEL runtime cache. The first newly approved attempt stopped locally before Neon because the old source selection inherited production VERCEL; source/backup remain intact. Source-path correction passes all108 tests; actual migration completed and deep structural equality passed for documents/events/jobs/collection/quota. One early saved-snapshot evaluation received an explicit capture tag with its original ID/job/attempt preserved (66 collected/10 captured).

The migration command previously rejected before this explicit approval was `node --env-file=.env.vercel.production scripts/prepare-push-host.js`. Its reviewed script refuses existing initialized hosted state, preserves every attempt/document/job and refuses a conflicting local DATABASE_URL. If migration partly succeeds later, inspect durable state rather than resetting/retrying initialization. No independent hosted allowance is permitted.

## Prepared runtime

`scheduler/wrangler.jsonc` dispatches at minutes 7/22/37/52 hourly. `scheduler/worker.js` signs a 90s HMAC payload, awaits the full Vercel response with a 290s timeout, and does no parsing/model work. `POST /api/push/worker` independently verifies the separate worker secret before the reviewer gate; ordinary UI/assets/APIs remain gated. Bad/expired signatures fail. Normal workers exclude captured evaluation events.

`src/push/service.js` awaits at most one source window, two document steps and one model attempt. Durable worker lease 300s, document lease 120s, analysis lease 180s; document starts stop after 120s and analysis starts stop after 90s, reserving persistence time within configured Vercel 300s. Actual database/CPU/cold-start duration still needs host measurement; a killed invocation resumes only after leases expire, with unknown attempts still counted. No fire-and-forget work.

Server configuration:

| Variable | Prepared value/purpose |
| --- | --- |
| DATABASE_URL | Existing shared Neon only; never browser/Cloudflare |
| FINN_PUSH_WORKER_SECRET | New independent random 32+ character secret, same value on Vercel/dispatcher; never print/commit |
| FINN_PUSH_COLLECTION_MINUTES |15 initial target, integer1–1440 |
| FINN_PUSH_ANALYSIS_MINUTES |15 independent target, integer1–1440 |
| FINN_PUSH_ENABLED |false until approved quality/activation |
| FINN_PUSH_HOSTED_APPROVED |false until explicit approval |
| FINN_AI_FREE_TIER_CONFIRMED |true only for the user's billing-disabled project |
| GEMINI_API_KEY |Server-only, only after explicit transfer approval |
| FINN_MODEL_POLICY_JSON |Optional validated JSON; persisted ledger policy must also be applied without resetting attempts |

Changing the collection cadence also requires changing the dispatch cron if a faster target is wanted. Browser Refresh may request bounded catch-up after a 60s per-source cooldown; it never generates. Normal opens read cached state only. A 15-minute target is not a freshness guarantee. Push covers NSE disclosures, not automatic EOD-price ingestion.

## Approval-gated activation sequence

1. Stop task-owned local workers/evaluation processes so migration cannot fork state. Inspect initialized local ledger, current counts and durable pending work without displaying credentials. Preserve a private local backup; do not reset anything.
2. **After explicit migration approval**, run the reviewed command above. Verify source/doc/job/attempt counts/hashes from a fresh Neon-backed process; confirm future local workers bind to the same ledger. Never run init against existing allowance.
3. Deploy the source to existing `sriak/finn` using the linked Vercel CLI with Push generation disabled. Keep existing reviewer/parser secrets and recorded/Research evidence. Confirm READY and HTTPS reviewer gate, saved reads, signed worker rejection/acceptance, collection/parser behavior and capture isolation. A Git push alone is insufficient.
4. **After dispatcher approval**, configure only FINN_ORIGIN and the separate worker-auth secret in Cloudflare Free; use `wrangler secret put FINN_PUSH_WORKER_SECRET --config scheduler/wrangler.jsonc` via hidden/piped secret input, then `wrangler deploy --config scheduler/wrangler.jsonc`. Do not echo secrets or accept new terms for the user. Measure scheduled collection with generation still disabled.
5. Complete source-reviewed unseen quality gates in [PUSH_EVALUATION.md](PUSH_EVALUATION.md) within actually available shared allowance. The3.6 alternative remains capture-only; two partial outputs do not authorize it as a production fallback. Choose/evaluate explicit configuration before promotion.
6. **After Gemini transfer approval and quality acceptance**, put the original key server-side on Vercel, set explicit free-tier/Push approval gates, deploy and observe a genuinely new event through scheduled collection→analysis→saved card. No browser/manual call may substitute for unattended acceptance. Confirm unchanged opens make 0 calls, duplicate workers reserve once, and accepted results survive restart/deployment.
7. Measure source/model failure recovery, delayed backlog, retries/cooldowns, cold runtime and actual account usage. Keep pending work, publish honest limitations. Only then close P-001. Roll back generation by disabling the Push gate; preserve state/attempts/results. Disable dispatcher if repeated failures need operator attention.

User authorization is now present for all three explained actions. Neon migration/local binding is complete; Vercel secret/deployment and Cloudflare authentication/activation remain pending. Approval does not waive model-quality/host-verification gates or authorize new terms/spending.

## Free infrastructure evidence and capacity

Official documentation checked November 1: [Vercel Hobby cron](https://vercel.com/docs/cron-jobs/usage-and-pricing) is daily/hour-level, insufficient for frequent collection; [function limits](https://vercel.com/docs/functions/limitations) support the configured 300s bound. [Cloudflare Free limits](https://developers.cloudflare.com/workers/platform/limits/) list 100,000 requests/day,10ms CPU/invocation and 5 cron triggers; scheduled wall time15minutes. Waiting for network is not CPU, but HMAC/dispatch CPU must be measured. [Cron configuration](https://developers.cloudflare.com/workers/configuration/cron-triggers/) supports the prepared schedule.

[Neon Free](https://neon.com/docs/introduction/plans) lists100 CU-hours/project,1GB storage/project,5GB public transfer and5-minute idle suspension. Actual account remaining usage is **not verified**. Current local extracted documents are roughly 0.73 MB and mutable queue/quota state 0.12 MB; these are a small sample, not a90-day capacity forecast. CAS rewrites the mutable JSON state, so growth, transfer, contention and suspension latency need measurement. No automatic deletion currently ages pending work out; retention duration/free-tier headroom remains unverified at scale.

App allowance 20 is deliberately far below quoted provider RPD; overload is possible even if the hosting cron can dispatch 96 times/day. Default allocation 14 Push includes 4 capture-only complex evaluation slots; production-eligible per-model allocations total 10 until reviewed reconfiguration. UI indicates delayed/pending/overload; do not promise all filings will be interpreted within 15 minutes.

## Existing hosted product and local commands

Existing reviewer token exchanges `?key=TOKEN` for a signed24-hour HttpOnly/Secure/SameSite=Lax cookie and clean redirect. Only health and independently signed internal routes bypass reviewer access. Never print ignored tmp/reviewer-link.txt or commit environment files. Vercel Research remains cache-only with three baked validated notes (6/4/4 claims), two curator-labelled.

`api/parse.py` accepts expiring HMAC metadata using existing FINN_PARSER_SECRET, downloads public sources with DNS pinning/TLS verification and bounds redirects/bytes/time/pages/text. Node uses the production alias. Python/pypdf 6.10.0 is shared with local extraction; no OCR. Research persists in `finn_research_cache`; saved Latest in `finn_source_snapshots`. Push adds separate state/document tables only after approved initialization/migration.

`npm start` uses Node 24.16+ and ignored `.env`; `npm ci` installs the sole Neon driver; new local PDFs require Python 3.12+/pinned requirements. `npm run ingest` is manual local EOD/source snapshot collection. Deliberate old snapshot publication is `node --env-file=.env.vercel.production src/ingest.js --publish`; it is separate from Push. Recorded capture changes require deliberate `--record`.

October 31 hosted checks: access/refusal/evidence and source persistence, cold TCS 47.5s then saved retrieval 0.5s. November 1 local syntax/all 108 tests and390px Push browser checks pass; no hosted Push inference/cold recovery/free-usage measurement. Physical install/PDF opening unconfirmed. Current submission archive/Docker work remains deferred, as do conversations/grants/tag/email.
