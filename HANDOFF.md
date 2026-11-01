# FINN — start here

Reconciled November 1, 2026 (IST), deadline day. Read AGENTS.md, this file, [PROGRESS.md](PROGRESS.md), [ISSUES.md](docs/ISSUES.md) and [WORKING_AGREEMENT.md](docs/WORKING_AGREEMENT.md) on entry. Read [SPEC.md](docs/SPEC.md)/[MILESTONES.md](docs/MILESTONES.md) before scope changes. The October 30 audit is historical coverage, not completion proof. Avoid full repository scans.

## Current boundary

FINN is a mobile briefing PWA for a 15-company mock NSE portfolio. November 1 scope is the complete automatic Push workflow in [PUSH_WORKFLOW.md](docs/PUSH_WORKFLOW.md). Pull still uses annual reports/transcripts only; Push uses official NSE disclosures/attachments. Preserve physical pages, timestamps, source URLs, periods, units and scope. Missing is unavailable; captures never become live. No investment advice or unsupported price causality.

Local pipeline is implemented and passes syntax/all 108 tests at f214b9c. Real local catch-up collected66 filings. Ten captured disclosures/14 model attempts yielded two partial briefs with substantive quality limits; see [evaluation](docs/PUSH_EVALUATION.md). This is **not complete hosted Push**. Local Latest defaults/Refresh/evidence/error behavior were browser-checked at 390 px; physical-device offline/install/PDF opening unconfirmed.

Production remains October 31 code 909b988 / dpl_3BJwg7CwrYoxHdfiG3eeNMMWgrip, https://finn-zeta-one.vercel.app, Vercel + Neon Free Singapore. Reviewer token gates UI/assets/APIs; private link is ignored tmp/reviewer-link.txt. No Gemini key is hosted. Existing three zero-call Research notes (6/4/4 claims), reviewed L&T results/HDFC profile and saved Latest remain deployed. November 1 changes are pushed source only.

## Targeted implementation map

| Slice | First files |
| --- | --- |
| Push acceptance/quality | docs/PUSH_WORKFLOW.md, PUSH_EVALUATION.md; P-001 in ISSUES.md |
| Durable state/collection | src/push/store.js (SQLite/Neon CAS + separate immutable documents); collection.js (overlap/checkpoint/source lease); src/providers/nse.js; test/push.test.js |
| Document identity/recovery | src/push/jobs.js (content keys, aliases, references, corrections, leases); evidence.js (official attachments, quote bank); scripts/pdf_text.py v2 (original/layout/physical pages) |
| Interpretation/financial rules | src/push/interpretation.js, analysis.js, metrics.js; test/push.test.js, push-metrics.test.js; src/ai/quotes.js/context.js shared guards |
| Shared model policy | src/config/model-policy.json, src/ai/workflows.js; src/push/quota.js; src/ai/gemini.js shared reservations. IDs/limits/roles configurable, assignments disjoint. |
| Worker/cache/UI | src/push/service.js; src/server.js; public/push.js, app.js/index.html/sw.js; test/push-delivery.test.js |
| Operator/host rollout | scripts/push.js, evaluate-push.js, prepare-push-host.js; scheduler/worker.js/wrangler.jsonc (inactive); docs/DEPLOYMENT.md, AI_SETUP.md |
| EOD/snapshots | src/ingest.js; providers/yahoo.js/nse-eod.js/http.js; storage/source-snapshot.js/snapshots.js; providers/snapshot.js. Push does not schedule EOD refresh. |
| Pure briefing/signals | src/domain/briefing.js, announcements.js, results.js; public/styles.css |
| Research | src/research/discovery.js, download.js, service.js, evidence.js, guidance.js, remote-parser.js; storage/research-store.js; public/research.js |
| Access/parser | src/access.js, server.js; api/finn.js/parse.py; vercel.json. Signed bounded parser keeps public DNS pinned. |
| Recorded evidence | data/filings.json; scripts/record-lt-results.py; data/research/notes/INFY.json, ASIANPAINT.json, PERSISTENT.json. Do not convert captures into live fallbacks. |
| Verification/history | docs/VERIFICATION.md (latest summary first), BUILD_LOG.md; test/*.test.js; scripts/check.js/test.js. |

One Node dependency: @neondatabase/serverless 1.2.0. Browser buildless, Node 24.16+, Python 3.12+/pypdf 6.10.0. No framework migration/new dependency required.

## Safe continuation

Inspect Git first; never discard user changes/rewrite history. Every logical change updates progress and affected issue/milestone/verification docs immediately. Run `npm run check` and `npm test` before implementation commits; commit promptly and push private SriAswin2005/finn master, verify upstream. A push is not a Vercel deployment. Temporary loopback/SQLite tests need normal permissions outside Codex's restricted sandbox.

`npm start` loads ignored `.env`. New local Push state is explicitly reconciled with old Research attempts using `node --env-file=.env scripts/push.js init`; **never rerun init to reset quota**. Existing checkout is already initialized. `collect`, `tick`, `status`, `policy`, reviewed `retry` and unchanged-draft `revalidate` are documented in AI_SETUP. Collect/Refresh make no model calls; tick can generate only when all enablement/capacity gates pass. Do not run captured evaluation scripts casually.

Next highest priority is P-001 quality and intended-host acceptance. Approved local work, free-tier calls under persisted caps and private Git pushes continue without reconfirmation. The user now explicitly approved the explained Neon migration/local binding, Vercel original-key transfer and Free dispatcher activation (“okay go ahead”, November1). The earlier review rejection is historical; execute the reviewed command normally with the new authorization. DEPLOYMENT gives activation order. Neon migration/local binding now verified:10 docs,76 events (66 collected/10 captured),all16 attempts preserved; source/backup retained. Other actions pending; generation stays disabled until quality gates pass. No new terms/spending/extra quota approval. Retain one shared ledger; no fresh host allowance.

Submission/conversations, grants, tag/email, OS notifications, voice/native and broad Research work remain deferred. Keep secrets, user data and downloaded caches ignored. Restore temporary browser settings and stop only task-owned processes.
