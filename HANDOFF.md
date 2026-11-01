# FINN — start here

Reconciled October 31, 2026, Asia/Kolkata. Deadline November 1. Read AGENTS.md, this file, PROGRESS.md, docs/ISSUES.md and docs/WORKING_AGREEMENT.md before implementation. Read docs/SPEC.md and docs/MILESTONES.md before scope changes; the October 30 requirements audit is historical coverage, not completion proof.

## Product and current boundary

Mobile briefing PWA for a 15-company mock NSE portfolio: Today, Portfolio, Ask FINN, Alerts and About. Briefing rules/calculations are deterministic. Pull evidence is annual reports and transcripts only; selected push details use original exchange filings. Preserve URLs, physical pages, periods, currency/units and source/fetch times. Missing is unavailable, never zero; recorded and fictional data never become live.

User's latest steering: **continue product work; defer conversations and all submission details until the user decides the build is solid.** No covering-note/history sharing, reviewer grants, final tag or email now. Existing ignored local message snapshots are not externally shared.

## Current verified state

- Hosted at https://finn-zeta-one.vercel.app on Vercel + Neon Free (Singapore). CLI upload is used; automatic private GitHub integration failed. Source pushes still go to private SriAswin2005/finn, master.
- Shared reviewer token gates UI/assets/APIs, signs an expiring secure cookie and removes key from URL. Only health public. Two generated secrets are explicitly approved in Vercel production. Never print/commit them. Private reviewer URL is in ignored `tmp/reviewer-link.txt`.
- No Gemini key transferred; Vercel disables live generation. Reviewed INFY note is deliberately baked public research, served immediately with matching evidence hash and validation. ASIANPAINT/PERSISTENT now have four-claim reviewer-curated notes with unsupported sections omitted; local tests/browser pass, deployed and HTTPS verified.
- INFY promise/later Q1 observation/revised forecast shown with full quotes/pages, explicitly no annual delivery verdict. L&T recorded consolidated results show Revenue/PBT/PAT and a limited derived EBITDA proxy with QoQ/YoY and p.11. HDFC Bank recorded succession includes the referenced appointment profile on p.3, attributed to the bank.
- All 74 tests and syntax pass. Hosted gate/evidence/refusal and generic TCS collection/persistence verified. Mobile-width browser checks: no horizontal overflow, six cached INFY claims, comparison, expanded profile/page href and no console errors. User reports smooth phone scrolling, saved alerts and TCS success. Installation/phone PDF opening unconfirmed.
- Latest source snapshot just published to Neon: October 31, 20:43 IST; 15/15 October 30 EOD and 62 filings, both adapters OK, fresh-process read passes. Recorded October 28 replay unchanged. **Latest adapter is deployed and verified.** Current production is 909b988 / dpl_3BJwg7CwrYoxHdfiG3eeNMMWgrip, including three reviewed notes, persistent Latest and clearer focused mobile research results. Hosted APIs and served-script hash match verified source.

## Targeted implementation map

| Slice | Files |
| --- | --- |
| Automatic Push (November 1 active work) | docs/PUSH_WORKFLOW.md; src/push/store.js (SQLite/Neon CAS + documents), collection.js (overlap/checkpoint/lease); test/push.test.js. Not deployed/complete. |
| UI/navigation/offline | public/app.js, research.js, index.html, styles.css, sw.js; browser preferences local, shell cache excludes APIs. Editorial theme, no blur. |
| HTTP/access | src/server.js exports shared handler; src/access.js signs/computes token comparisons; api/finn.js and vercel.json route every asset/API through it. |
| Briefing/domain | src/domain/briefing.js, announcements.js, results.js. Pure rules and comparison arithmetic. |
| Source ingestion | src/ingest.js; src/providers/yahoo.js, nse.js, nse-eod.js, http.js. Manual bounded collection, normalized provenance/errors. |
| Snapshots | src/storage/snapshots.js validates files; source-snapshot.js persists Latest in Neon. src/providers/snapshot.js chooses explicit mode; filings.js enriches exact known URLs from data/filings.json. |
| Recorded filing adapter | data/filings.json; scripts/record-lt-results.py reproduces six rows from the reviewed PDF hash/page. Source PDFs ignored. PAT anchored to net-profit ownership row, not comprehensive income. |
| Research | src/research/discovery.js, download.js, service.js, evidence.js, guidance.js, remote-parser.js. Generic discovery, primary evidence/pages and narrow guidance comparison. |
| Python PDF boundary | scripts/pdf_text.py shared by local parse_pdf.py and signed/bounded api/parse.py. Hosted public DNS is pinned with TLS verification. No OCR. |
| Durable research | src/storage/research-store.js: parameterized Neon queries, five records/five minutes in process; retained across restarts in Neon. |
| AI/citation | src/ai/gemini.js, models.js, quotes.js, context.js, quota.js, refusal.js. Baked data/research/notes/INFY.json; quote/numeric/context guards; fail-closed lost quota; cached notes first. |
| Verification | test/*.test.js plus Python hosted parser unittest; scripts/check.js, test.js, build.js, smoke-build.js. |

One Node dependency, @neondatabase/serverless@1.2.0, supports durable serverless PostgreSQL; browser remains buildless. Python dependency is pypdf==6.10.0. Node 24.16+, Python 3.12+ for new PDFs. Keep UI/routes/domain/providers separate; do not migrate frameworks.

## Commands and safe continuation

Inspect git status/log first. Per small slice: npm run check, npm test, affected HTTP/browser checks; update current status/issues/milestones/verification/build log immediately, commit promptly and push; verify the push. Never rewrite history or discard user work.

`npm start` starts local mode; recorded examples need no key/database. `npm ci` installs the Neon driver. `npm run ingest` refreshes ignored local data; explicit `node --env-file=.env.vercel.production src/ingest.js --publish` publishes Latest to configured Neon. Browser reload only rereads saved data. Do not casually use --record. No scheduler exists.

`npx vercel deploy --prod --yes` deploys the linked sriak/finn project. .vercel/, .env*, data/cache/, tmp/, .venv/ and dist/ are ignored. Do not bake secrets/downloaded caches into releases. The original .env Gemini key remains local and must not be overwritten. Never reset quota state to bypass caps.

Next: continue only product work or user-reported failures; do not redo completed Latest deployment. The user will decide when the build is solid before submission work resumes. P0 product reliability comes first; voice/native/notifications remain deferred. Do not claim annual delivery, broad automatic financial extraction, Docker verification, after-idle cold start or phone install from existing checks.

D-004 completed October 31: deployment dpl_EiSGNFY8vqXz9zgcKqRamye8bQ6A (2b617c3) is READY at https://finn-zeta-one.vercel.app. HTTPS Latest returns 200; fresh saved capture, source status and 15-company coverage verified. Phone-width browser connected to the same Neon source store shows collected 31 Oct, 8:43 pm IST, Saturday Oct31, 15/15 alert coverage and no console errors. Prior failed filing-context upload is superseded; both that fix and persistent Latest are now deployed. Recorded mode remains unchanged. Next product quality gap: other two demo companies have no reviewed baked AI note.

## October 31 — additional demo AI review

Two authorized local free-tier calls attempted ASIANPAINT/PERSISTENT; both drafts were rejected and not published. Asian Paints repeated the unsupported-volume citation; Persistent exposed conservative false refusals for margin/margins and a unit shared by a numeric range. Context normalization now recognizes ordinary plurals and unambiguous adjacent shared range units while retaining currency/scale/direction/scope guards. Positive regression cases added; original 15 attacks must still fail. Syntax and all 73 tests pass, including all 15 original refusals and supported plural/range cases. Drafts remain ignored; no Gemini key transferred and no extra retry bypassed validation.

## October 31 — reviewed cached notes for all recorded examples

Two local free-tier drafts were rejected as whole outputs. They were not automatically partially published. An explicit source review omitted unsupported claims and narrowed wording before revalidation: ASIANPAINT now has four curated claims (decorative business, international-segment revenue, PBDIT guidance, conditional inflation risk scoped to affected international markets); unsupported 8–10% volume guidance and APPPG figure omitted. PERSISTENT has four claims (business, revenue, EBIT margin decline, headcount); formal guidance/aspiration and bull/bear claims omitted. Original models: Flash-Lite 3.5 and 3.1, one call each, observed draft latency 2.6/6.0 s. Each quote/document/page/period/unit was checked against recorded primary evidence.

Public notes are deliberately baked under data/research/notes, hash-matched and validated at read time, with reviewer-curated wording/omission disclosure in UI. All demo notes need zero new model calls/keys after restart. Syntax and all 74 tests pass. Phone-width browser shows each four-claim curated note, reviewer-curated/omission disclosure, 0 request calls, no overflow and no console errors. Deployed and HTTPS verified. These remain bounded examples, not general semantic proof or annual delivery analysis. No additional model retry was used and no Gemini key transferred.

Curated-note verification: initial curation was refused because “decorative business” did not preserve the quote’s segment scope, so neither note was written. Wording was corrected to “decorative segment”; all claims now pass the unchanged scope check. Two four-claim notes are written, with unavailable sections retained and explicit reviewer-curated disclosure. Syntax/all 74 tests and phone-width browser verification pass; deployed and HTTPS verified.

October 31 final product verification for 6703e85 / dpl_CKCMPqaNGYwHhXvrT9gthu3njPQu: HTTPS all three notes 200 with 6/4/4 claims, 0 request calls, host generation disabled, curation disclosure retained; observed requests 755/220/699 ms. Latest is fresh with saved October31 capture and 15 October30 EOD records. Recorded two filing enrichments and live refusal pass. No additional model call was made. Submission work remains deferred.

## October 31 — research result clarity

U-002: raw document details pushed reviewed notes down the phone screen, and a generic cache-resting message implied an uncached company had a saved note. Source metadata is now a labelled collapsible list (including warning count), unavailable generation is hidden, and no-note requests explicitly say source excerpts only. Completed requests bring the result into view/focus only if the user is still on Research and has not moved focus elsewhere. Notes/comparison keep direct physical-page links. Syntax/all 74 tests pass. 390 px browser verifies result focus at 74 px below navigation, collapsed source details, four cached claims, explicit TCS no-note state with generation hidden, no overflow and no console errors. Native PDF opening could not be confirmed by the browser tool; page hrefs remain verified.

Latest product checkpoint: 909b988 / dpl_3BJwg7CwrYoxHdfiG3eeNMMWgrip verified at21:36 IST. All74 tests pass, hosted research script equals browser-tested source, notes6/4/4 allzero request calls, fresh Latest and two filing details/refusal pass. Local verifier stopped and temporary viewport reset. Phone installation/PDF opening and after-idle cold-start remain unconfirmed; general semantic/model correctness is not certified.
