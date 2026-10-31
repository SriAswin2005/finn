# Current issues and verification limits

Reconciled October 31, 2026 (IST). Current findings override historical logs. The user deferred conversations/submission until the build is solid.

## D-004 — Hosted Latest sources persistence

**Resolved: implementation, source publication, hosted HTTP and mobile-width browser verified.** `src/storage/source-snapshot.js` persists normalized sources separately in Neon with a 30-second process cache and conditional publication protecting newer captures. `src/ingest.js --publish` is explicit; normal ingestion remains local. `getDataset` preserves source/fetch time, staleness and explicit errors, never substitutes recorded/fictional data.

Syntax/all 72 tests pass, including separate adapters, mutation isolation, older-write rejection, invalid schema and unavailable storage. Real publication October 31 at 20:43 IST: 15/15 October 30 EOD, 62 filings, both adapters OK. A fresh process confirms the saved snapshot is not stale; recorded replay unchanged. Acceptance passed: deployment dpl_EiSGNFY8vqXz9zgcKqRamye8bQ6A, HTTPS Latest 200, fresh saved timestamps/coverage, browser mode switch and explicit failure behavior tests.

## Q-002 — Reviewed AI coverage remains bounded

**Partial.** INFY has one six-claim reviewed note baked in the release; it passes current validation and displays immediately without a call/key. ASIANPAINT/PERSISTENT have three primary documents each but no reviewed baked note. All future generations require semantic/source review. Hosted live generation remains disabled; no Gemini key uploaded. Fifteen adversarial refusals are evidence for known cases, not general semantic correctness.

## S-001 — Deliberate depth limits

**Partial coverage, clearly labelled.** INFY promise/later Q1/revised forecast is a management-progress view, not completed annual/four-quarter delivery. One L&T results adapter and one HDFC Bank profile are page-reviewed captured examples, not a universal extraction engine. EBITDA is a derived proxy with finance-service and impairment/obsolescence caveats; PAT is attributable to owners. General table/profile extraction, balance-sheet/cash-quality/multi-year analysis, OCR, automatic ingestion/background delivery, voice and native packaging remain unavailable/deferred.

## D-002 — Remaining product/device and deferred submission gates

**Partial verification.** User reports smooth phone load/scroll, saved alerts and successful TCS research; device/browser unspecified. Physical-phone installation, citation opening and after-idle cold start are unconfirmed. Browser 390×844 checks verify no horizontal overflow, profile expansion/page href, six cached INFY claims, guidance comparison, live refusal and no console errors. Docker engine/image unverified; Vercel actual runtimes verified instead.

Submission details are explicitly deferred: do not finalize covering note, history sharing, reviewer repository access, demo tag or email. Private local message snapshots exist but tool outputs/attachments/other-app histories are not included and nothing has been shared externally.

## Resolved with evidence

- **Q-001:** unrelated metric-number citation rejected. October 30 metric guard plus October 31 currency/scale/period/scope/qualifier/direction/forward guards. `test/citation-adversarial.test.js`: 15 synthetic attacks, positive controls; long sentences are skipped rather than sliced.
- **D-001:** Vercel + Neon Free selected/authorized; reviewer token and private parser secret explicitly approved and stored in sriak/finn production. Signed 24-hour secure cookie/clean redirect protects assets/APIs; only health public. Gemini absent/disabled. Real research storage survives deployment and fresh processes. No paid plan/payment added.
- **D-003:** per-deployment parser URL was protected by Vercel authentication. Using the production alias fixes generic hosted collection: TCS 361-page annual report plus 29/25-page transcripts, ten chunks/no errors in 47.5 seconds. After restart/deployment it reads Neon; optimized repeat observed 0.5 seconds.
- **U-001:** enriched results/profile cards retained obsolete “not extracted/no biography verified” context. Provider now supplies accurate source-attributed context; local mobile-width browser verifies it and live refusal. That attempted deployment failed with a transport error, so the fix remains pending the D-004 deployment retry.
- **Results adapter pre-release finding:** standalone negative parentheses were misread by the PDF text layer; that page was rejected. Consolidated p.11 was visually checked. A duplicate ownership label initially selected comprehensive income; a test caught it before commit/deployment. The reproducer now anchors PAT to net-profit row 9 and verifies reviewed PDF hash/six columns. All source values and arithmetic tests pass.

## Operations

Latest confirmed production before the pending retry: 5d0f1f4 / dpl_93nzuXroPUVxxNf5KGrEzC2TCP3U at https://finn-zeta-one.vercel.app. f600c15 is pushed but its upload failed with a network fetch error; no successful upload was claimed. Private GitHub auto-link failed; CLI source upload works. Source pushes continue to the approved private origin. Never reset quota state, print/commit secrets, or force-push history.

D-004 completed October 31: deployment dpl_EiSGNFY8vqXz9zgcKqRamye8bQ6A (2b617c3) is READY at https://finn-zeta-one.vercel.app. HTTPS Latest returns 200; fresh saved capture, source status and 15-company coverage verified. Phone-width browser connected to the same Neon source store shows collected 31 Oct, 8:43 pm IST, Saturday Oct31, 15/15 alert coverage and no console errors. Prior failed filing-context upload is superseded; both that fix and persistent Latest are now deployed. Recorded mode remains unchanged. Next product quality gap: other two demo companies have no reviewed baked AI note.
