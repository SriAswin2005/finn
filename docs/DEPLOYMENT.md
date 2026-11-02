# FINN Vercel, Neon and dispatcher operations

Current November2,2026. Production0c134a0 / dpl_9JLfhWd8v5zuhhQsi6SGrtg782pr READY at https://finn-zeta-one.vercel.app. Latest local model-configuration/Push-rotation slice passes syntax/all137 tests; its commit/deploy remains pending. A private Git push is separate from a Vercel deployment.

## Approved and active

The user approved the explained Neon evidence/history migration, original Gemini key transfer to existing sriak/finn and Cloudflare Workers Free dispatcher (November1), then explicitly requested both workflows fixed/activated (November2). Their later model-rotation instruction replaces artificial20/day allocations with their reported per-model ceilings. No new terms, billing, paid plan, account, broad permission, public repo or email action is authorized/needed.

- Vercel Node/Python in Singapore and existing Neon Free Singapore retain normalized sources, separate immutable PDF pages and canonical CAS jobs/quota/Research notes. Local `.env` binds the same ledger. Original migration10documents/76events/16attempts was structurally verified; subsequent history grows without reset. No new host allowance.
- Original Gemini key is a production Secret, never a browser value. Independent Push worker HMAC is a separate Secret. Reviewer/parser access stays gated. Non-secret generation flags are enabled as documented in [AI_SETUP.md](AI_SETUP.md).
- Cloudflare dispatcher version52a351bd-14c2-48fa-ae14-fdcac285c606 runs `*/15 * * * *`. HTTP/previews disabled; only FINN_ORIGIN and separate HMAC secret are present, never Gemini/Neon credentials. Its scheduled fetch awaits Vercel; configured bound290seconds, Vercel300seconds, worker lease300seconds. Source/parser/analysis work remains on Vercel.
- Actual scheduled collection/PDF/model invocation is observed. Quarter-hour windows tolerate jitter/processing duration; one model call/tick and max5 zero-call skips. No manual worker is used during genuine scheduled observations. Accepted unattended publication is still a separate pending gate; see [ISSUES.md](ISSUES.md).

## Deployment and verification

Run required `npm run check` and `npm test`, inspect the focused diff/secret exclusions, update current docs, commit/push approved private master and verify upstream. Current local CLI is Vercel65.9.0. Deploy linked existing project with `npx --no-install vercel deploy --prod --yes`; verify READY and production alias. `vercel.json` retains the signed Python parser and300second Node limit; the new src JSON catalog is traced through static imports.

Non-secret inventory is FINN_GEMINI_MODELS with four approved policy IDs. Future model upgrades change JSON configuration/confirmed limits/order, then deliberately apply `node --env-file=.env scripts/push.js policy` and deploy; every historical attempt/provider hold stays. Do not infer quotas from listing a model or reset known429/project holds.1040 aggregate and520/workflow ceilings do not guarantee availability; actual500/500/20/20 model limits and provider pauses still apply.

Use hidden/piped stdin for secrets, never command-line values/output. Existing reviewer link is ignored `tmp/reviewer-link.txt`; it exchanges for a24-hour signed HttpOnly/Secure/SameSite cookie and clean redirect. Never print the link/token. UI/assets/APIs are reviewer-gated; health and independently signed internal routes are the intended exceptions. Do not change reviewer access while verifying ordinary functionality.

After each deployment verify HTTPS access gate, non-secret generation flags, saved Research/Latest0-call reuse, old source hashes/citations, source-only availability and current queue state from a fresh process. Record exact real scheduled time/version/outcome and saved-note model/attempts/pages; do not label an operator-revalidated draft automatic. Cached views and a model metadata200 are insufficient end-to-end proof. Keep rejected drafts unpublished and history unchanged.

Existing dispatcher updates, if needed, use `npx --no-install wrangler deploy --config scheduler/wrangler.jsonc --secrets-file tmp/cloudflare-worker-secrets.json`. That ignored JSON contains only HMAC secret. Existing OAuth scopes are account/user read, Workers write/Scripts write and read-only tails; no fresh sign-in/permission request needed. Read-only tail verifies scheduled outcomes. Never pass `.env` to Cloudflare or enable HTTP/previews.

## Capacity and remaining limits

Vercel Hobby cron's once-daily timing is unsuitable; existing Cloudflare scheduler supplies the approved15-minute target. Free CPU/wall/dispatch capacity is measured per event, not assumed as an SLA. NSE/public PDF availability, provider503s, bounded parsing/calls and old pending backlog can delay delivery. UI exposes pending age/delayed state and no freshness guarantee. Source failures retain evidence; unreadable/ambiguous tables remain unavailable. General semantic quality and sustained-load/device acceptance remain open.

EOD snapshots are separate: manual `node --env-file=.env.vercel.production src/ingest.js --publish` was explicitly used November2 for15/15 EOD/66NSE records, not scheduled by Push. Do not run stale capture/evaluation migration/`init` to overwrite canonical state. Submission archives, reviewer grants/tag/email, new terms/spending and further platform work remain deferred.

Official infrastructure references: [Vercel cron](https://vercel.com/docs/cron-jobs/usage-and-pricing), [function limits](https://vercel.com/docs/functions/limitations), [Cloudflare cron](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Neon plans](https://neon.com/docs/introduction/plans).
