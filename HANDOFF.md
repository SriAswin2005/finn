MDA follow-up gates passed: syntax and151/151Node tests including6Python parser cases. Ready to commit/deploy; hosted refined MDA timing still pending.

Quality follow-up: allfour initialfixes privately pushed/deployed705c0f6 READY dpl_37RtKmd4DinrAabsNJiygsBk4CXL. HCL485pages5.35s/TCS361pages4.59s succeeded with40physicalpages/partial. MDA refinement local uncommitted scripts/pdf_text.py + test/hosted_parser_test.py handlescontentsp25/precedingnumbers/verifiedoffsets, reuses overview text. LocalTCSfindsMDA4.09s; next gates/commit/deploy. Existing ignored .env.deployment contains parser signature; never bulk-pull production env.

CURRENT quality checkpoint November2: all four requested fixes implemented; syntax/151full tests pass. Parser/Push privately pushed2d0fe70/f22b8f8. Guidance/display ready for combined Research checkpoint after transient approval service failure recovered. Browser verified matched realINFYp4 exact sentence, no-match prompt, edit clearing, focus and390px overflow; viewport restored. Existing approved Vercel deployment/cold parser verification next. No new permissions or sign-in required. See newest status/issues; historical blocked entries below are superseded.

Current quality handoff: parser/Push committed/pushed as2d0fe70/f22b8f8;12live routine jobs completed0calls,56attempts retained. Guidance and question display are UNCOMMITTED local code+docs.149full tests passed after guidance; final display slice syntax/29targeted tests pass, full151run144passed/7sandbox access failures. Local browser port3181 timed out. Automatic approval review cannot run due account usage limit; do not bypass it or claim final upload/deployment. Next concrete actions after approvals restored: npm run check/npm test outside restricted loopback, browser query match/no-match/edit/mobile checks, commit/push guidance and display, deploy existing approved Vercel project and verify cold parser timing. No new manual account/sign-in/model permission otherwise needed.

Quality slice3: guidance.js supports generic growth/margin ranges with metric/basis/period checks and no fabricated actuals.149tests pass; generic UI labels. UNCOMMITTED: automatic approval review hit account usage limit, so docs/code remain locally pending after f22b8f8. Do not claim guidance uploaded/deployed. Continue question source display locally.

Quality slice2 adds src/push/triage.js (routine source excerpts, material promotions, bounded legacy queue reconciliation), integrated with jobs/service/analysis and public/push.js.146tests pass. No model policy/limits changed and failed lifetime-capped jobs were not reset.

Current new quality slice1: bounded annual parser implemented and locally verified;141tests pass. Annual worker watchdog7.2s; overview plus located MDA/targeted physical pages, partial coverage shown. Real361-page TCS2.3s/40pages (MDA not located), old >8s. Hosted cold timing pending. Remaining requested slices: Push routine triage, generic guidance, question source banner. See newest quality entries in progress/issues.

# FINN — start here

Current November2 wrap-up: read PROGRESS.md, docs/ISSUES.md and docs/WORKING_AGREEMENT.md. Production 845b165 / dpl_2AGTPb8jsYyLhrMmAPfg8okrKfYD READY;141 tests pass; private source pushed. Pull works for verified live/cached paths. Push collection/dispatch/model calls run, but accepted unattended publication remains OPEN after provider503s and legitimate citation rejections.53 attempts retained at16:39UTC. No sign-in/account action needed. User requested quick wrap-up; do not restart broad experiments without fresh steering.

Current models: Research3.5Lite; Push3.1Lite ordinary/3.6Flash preferred complex/3.8 alternative. Provider ceilings500/500/20/20, aggregate1040, workflow500/540, local retries250/Lite and10/Flash/shared520 inside totals. All history/holds and lifetime3 retained. Do not reset capped ITC/Marico/Eicher/LT jobs or label manual recoveries automatic.

Gemma4 26B/31B now user-reported30RPM/16k inputTPM/14.4kRPD; not activated. Fixed Research30000-token estimate exceeds16k; future focused capability/estimate check needed. No more calls or assignment in this wrap-up.

## Targeted implementation map

| Slice | First files |
| --- | --- |
| Push acceptance/quality | docs/PUSH_WORKFLOW.md, PUSH_EVALUATION.md; P-001 in ISSUES.md |
| Durable state/collection | src/push/store.js (SQLite/Neon CAS + separate immutable documents); collection.js (overlap/checkpoint/source lease); src/providers/nse.js; test/push.test.js |
| Document identity/recovery | src/push/jobs.js (content keys, aliases, references, corrections, leases); evidence.js (official attachments, quote bank); scripts/pdf_text.py v2 (original/layout/physical pages) |
| Interpretation/financial rules | src/push/interpretation.js, analysis.js, metrics.js; test/push.test.js, push-metrics.test.js; src/ai/quotes.js/context.js/numbers.js shared guards |
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

User-confirmed Gemma4 26B/31B limits:30RPM,16000 inputTPM,14400RPD. Recorded, not activated in this rollout. Fixed Research token estimate30000 exceeds16k TPM; evaluate request-size/capability handling before any future assignment. User asked to wrap up quickly.
