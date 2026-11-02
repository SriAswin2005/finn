# FINN — start here

Current November2,2026. Read this, [PROGRESS.md](PROGRESS.md), [ISSUES.md](docs/ISSUES.md) and [WORKING_AGREEMENT.md](docs/WORKING_AGREEMENT.md) on entry. Read [SPEC.md](docs/SPEC.md)/[MILESTONES.md](docs/MILESTONES.md) before scope changes; the October30 audit is coverage history, not completion proof. Use the targeted map below.

Both hosted workflows are enabled. Productione81e795 / dpl_DRPHxYjdS1mVwvqvdufoTjDm5dB9 READY, https://finn-zeta-one.vercel.app. Vercel + canonical Neon Free Singapore; Cloudflare Free dispatcher version52a351bd-14c2-48fa-ae14-fdcac285c606, cron `*/15 * * * *`, HTTP/previews disabled. No further account action currently required. Original Gemini key/reviewer access/worker HMAC stay server-only. Never print ignored reviewer-link/secret/environment files.

Latest local model-configuration/Push-rotation slice passes syntax/all139 tests: all model IDs/catalog/order are configuration, future configured IDs accepted without runtime edits, unknown entries remain unverified. The slice is committed, privately pushed, audited/applied and deployed READY. Current source-boundary/audit/stronger-correction fixes are deployed. Actual fresh HCL financial UI answer14:40:52UTC is correct against originalp12; six saved HTTP Research cases return0 calls. Recent clipped TCS answer was wholly withheld/audited, not partially edited.

User's November2 instruction replaces artificial20/day with reported per-model ceilings: two Lite500RPD each and two Flash20RPD each;1040 aggregate/Research500/Push540, all retries inside totals. RPM/TPM, Pacific and rolling24h caps, provider holds, circuits and lifetime3 remain. Research uses3.5Lite; Push3.1Lite ordinary/preferred3.6Flash complex/3.8Flash alternative, disjoint. Previous3.6 Research attempts remain labeled and counted.3.6 passed source-reviewed exact financial case; a separate rejected request remains blocked. Never reset `init`, history, failed lifetime jobs or provider holds.

Push automatic source/PDF/model processing is observed; accepted unattended publication remains open pending genuine scheduled proof. One correction escalates ordinary validation failure to complex Push capacity with original evidence/diagnostic; never downgrade or loop. Latest source-reviewed L&T recovery is not unattended acceptance. Marico appointment ran on the genuine14:45:47.925UTC scheduler, received503 and exhausted lifetime3; never reset/requeue it. No manual worker during scheduled observations.

## Targeted implementation map

| Slice | First files |
| --- | --- |
| Push acceptance/quality | docs/PUSH_WORKFLOW.md, PUSH_EVALUATION.md; P-001 in ISSUES.md |
| Durable state/collection | src/push/store.js (SQLite/Neon CAS + separate immutable documents); collection.js (overlap/checkpoint/source lease); src/providers/nse.js; test/push.test.js |
| Document identity/recovery | src/push/jobs.js (content keys, aliases, references, corrections, leases); evidence.js (official attachments, quote bank); scripts/pdf_text.py v2 (original/layout/physical pages) |
| Interpretation/financial rules | src/push/interpretation.js, analysis.js, metrics.js; test/push.test.js, push-metrics.test.js; src/ai/quotes.js/context.js shared guards |
| Shared model policy | src/config/model-policy.json, text-model-catalog.json, src/ai/workflows.js; src/push/quota.js/policy.js; src/ai/gemini.js shared reservations. IDs/limits/roles configurable, assignments disjoint. |
| Worker/cache/UI | src/push/service.js; src/server.js; public/push.js, app.js/index.html/sw.js; test/push-delivery.test.js |
| Operator/host rollout | scripts/push.js, evaluate-push.js, prepare-push-host.js; scheduler/worker.js/wrangler.jsonc (active, HTTP/previews disabled); docs/DEPLOYMENT.md, AI_SETUP.md |
| EOD/snapshots | src/ingest.js; providers/yahoo.js/nse-eod.js/http.js; storage/source-snapshot.js/snapshots.js; providers/snapshot.js. Push does not schedule EOD refresh. |
| Pure briefing/signals | src/domain/briefing.js, announcements.js, results.js; public/styles.css |
| Research | src/research/discovery.js, download.js, service.js, evidence.js, guidance.js, remote-parser.js; storage/research-store.js; public/research.js |
| Access/parser | src/access.js, server.js; api/finn.js/parse.py; vercel.json. Signed bounded parser keeps public DNS pinned. |
| Recorded evidence | data/filings.json; scripts/record-lt-results.py; data/research/notes/INFY.json, ASIANPAINT.json, PERSISTENT.json. Do not convert captures into live fallbacks. |
| Verification/history | docs/VERIFICATION.md (latest summary first), BUILD_LOG.md; test/*.test.js; scripts/check.js/test.js. |

One Node dependency: @neondatabase/serverless 1.2.0. Browser buildless, Node 24.16+, Python 3.12+/pypdf 6.10.0. No framework migration/new dependency required.

## Continuation and boundaries

FINN is a mobile briefing PWA for15 mock NSE companies. Pull uses annual reports/transcripts only; Push uses official NSE disclosures/attachments. Preserve URLs, physical PDF pages, dates/periods/units/scope and explicit missing/unreadable data. Captured evaluations never become live Latest. No unsupported investment advice or price causality.

Inspect Git first. Every saved logical slice updates progress and affected issues/milestones/verification/build records immediately, then runs `npm run check` and `npm test`, commits promptly and pushes approved private `SriAswin2005/finn` master. Verify upstream; a Git push is not deployment. Never rewrite history. Current new config file is copied automatically with src; no dependency added. Runtime remains Node/browser APIs plus existing Neon driver; pypdf remains the existing PDF dependency.

Use `node --env-file=.env scripts/push.js status` for0-call shared state. `policy` audits approved role/limit changes and releases only local-budget waits; every attempt/provider hold remains. `collect` does not generate; `tick` can. Existing quota is initialized and canonical Neon is bound locally; NEVER rerun init or delete quota. Reviewed retry cannot bypass lifetime3; unchanged-draft revalidation is explicit whole-output recovery with0 calls, not automatic acceptance.

Finish actual scheduled publication/HTTP cache evidence and reconcile current runbooks. Physical-device install/offline/native PDF and general unseen-company/model semantics remain unverified. EOD was manually refreshed November2; Push does not schedule EOD. Submission exports/grants/tag/email, voice, OS notifications/native/on-device work remain deferred. No paid plan/new terms/new permission/public repo action. Restore temporary browser viewport and stop only task-owned bootstrap/log observers at finish; recurring dispatcher continues.

Final deployed verification14:57UTC: seven saved Research requests return0 model calls, including the new HCL financial answer and the reviewed3.6 fallback sample. Four configured Google metadata endpoints return200 (access only, not proof of quota independence/capacity). Browser shows cached0calls/₹0 with exact original quote; temporary viewport restored and task-owned log/bootstrap sessions stopped. Shared44 attempts retained at last full observation. Next genuine15:00 scheduled outcome still under observation; no manual worker/capped-job retry.

November2 availability reallocation verified locally139 tests, pending commit/deploy/apply: Research500/Push540 from unchanged500/500/20/20 model ceilings. Prefer available3.6 complex Push after repeated3.8 overload, retaining all46 attempts. ITC final15:15 correction503/lifetime3 failed; no reset. Real3.6 Push source-case and next genuine scheduled publication still require verification.
