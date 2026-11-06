# FINN hosting and recovery operations — November6,2026

Current public URL: https://finn-zeta-one.vercel.app. Reviewer token/cookie gate unchanged. Production dpl_Ah5Cb9FGRYFDefeDePPSitHLxR8N uses source4802d3b; source c310e5a adds operational import recovery. Research read-resilience rollout is pending. All159tests pass.

## Active architecture

Vercel Hobby Singapore retains Node/Python/PDF parsing and server-only Gemini credentials. All active Push state/quota/documents, Research cache and source snapshots now use a separate authenticated Cloudflare Workers Free SQLite Durable Object. Neon is a retained read-only recovery copy, not a runtime dependency.

Storage Worker: https://finn-durable-storage.finn-briefings-12ed6cd6.workers.dev, version bf43cc9a-db49-4b14-83fd-d6d91e626043, configured by scheduler/storage-wrangler.jsonc. FINN_STORAGE_URL and FINN_STORAGE_SECRET are server-only Vercel settings and ignored local .env settings. No Gemini/Neon key is in this Worker. It accepts only HMAC-signed bounded POSTs, permitted keys/operations, and revision-conditional writes. Source documents are immutable. Records are compressed; payloads above1.9MB fail explicitly. It never falls back to Neon or resets an absent quota.

The existing finn-push-dispatcher remains separate, with HTTP/previews disabled and */15 * * * * scheduling. It signs and awaits the same production /api/push/worker route,290s bound vs Vercel300s. Scheduled collection/writes were verified through19:31IST after migration. Model generation remains blocked by the prior Google403 configuration stop (N-002); do not clear it from metadata access alone.

## Deployment

Run npm run check and npm test, inspect secrets/exclusions and focused diff, update affected docs, commit/push the approved private origin. Source push and deployment are separate. Existing CLI paths are cached locally; npx --no-install may fail if the registry resolves a newer uncached CLI.

Vercel: deploy --prod --yes for a verified fix, or deploy --prod --skip-domain to stage before promote <deployment>. Keep the existing project sriak/finn; never create a new public URL for reviewers. Secrets use piped stdin and ignored files, never command-line values. .vercelignore excludes .env*,tmp,data/cache and private build artifacts.

Storage Worker: wrangler deploy --config scheduler/storage-wrangler.jsonc --secrets-file tmp/storage-worker-secrets.json. Dispatcher: existing scheduler/wrangler.jsonc and tmp/cloudflare-worker-secrets.json. These are separate secrets and configurations. Do not send the full .env to Cloudflare.

## Completed migration and rollback constraints

User explicitly approved no-upgrade recovery, exact Cloudflare login scopes, and permanent read-only fencing of finn_push_state,finn_push_documents,finn_research_cache,finn_source_snapshots. scripts/freeze-neon.js applied/verified all four triggers without deleting rows. scripts/backup-neon.js exported a repeatable-read snapshot to ignored tmp/neon-recovery. Final backup SHA-256: d705d824636ef0d6778046671983407fbb8ffdce9cb64d433e304518ea9a27df.

scripts/migrate-storage.js import <backup> verified all120decoded records exactly:113documents,5Research records,1snapshot,1canonical state,174attempts. It only creates missing target keys; an existing mismatch refuses cutover. Its30s requests/four-record batches safely resumed a timed-out initial run. Do not rerun an old backup against the active target and expect equality after legitimate writes.

The old Neon tables must remain fenced. Never roll back to a stale ledger or delete/reinitialize quota. A backend rollback requires pausing/reconciling newer state first. Routine code rollback must retain the current FINN_STORAGE_URL/SECRET authority. Keep all original attempt history/provider holds and lifetime caps.

## Verification and free limits

Verify access gate, authenticated health/Latest/status, saved source/AI-note reuse, canonical concurrent writes, timestamps/physical citations and scheduled progress separately. Browser and HTTP checks are recorded in VERIFICATION.md. Recovery did not regenerate notes or spend model calls. Cold/large Research failure is tracked as N-003; authenticated reads may retry once, uncertain writes must never replay automatically.

Cloudflare Free SQLite Durable Objects have daily request/row limits and5GB total storage, not an unlimited SLA. Actual free plan/provider limits still apply; no plan upgraded. Official references: [Durable Object pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/), [limits](https://developers.cloudflare.com/durable-objects/platform/limits/), [Vercel function limits](https://vercel.com/docs/functions/limitations), [Neon plans](https://neon.com/docs/introduction/plans).

EOD remains manual: node --env-file=.env src/ingest.js --publish uses the canonical remote binding. Source Refresh is bounded NSE collection, not model generation. Do not use the older .env.vercel.production alone for writes; it predates the new binding. Do not label stale prices live/current. Original private reviewer link remains ignored; never print or commit it. New terms/spending/public sharing/email need user approval.
