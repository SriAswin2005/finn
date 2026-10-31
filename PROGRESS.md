# FINN current progress

Reconciled October 31, 2026 (IST). Deadline November 1. Read [HANDOFF.md](HANDOFF.md) and [WORKING_AGREEMENT.md](docs/WORKING_AGREEMENT.md).

## Verified product

- HTTPS reviewer demo: https://finn-zeta-one.vercel.app, Vercel Node/Python functions and Neon Free (Singapore). Shared-token link exchanges for a signed 24-hour HttpOnly/Secure/SameSite=Lax cookie, then redirects cleanly. UI/assets/APIs gated; health public. No Gemini key on host; live generation disabled.
- Today/Portfolio/configurable in-app Alerts: 15 NSE companies, recorded/live/fictional modes kept distinct. Source/fetch times and stale/error states retained. Reload reads saved data; no automatic collection or OS push.
- Three recorded annual-report/transcript examples, generic hosted TCS retrieval. TCS cold collection: 47.5 s, 3 documents/10 evidence chunks/no source errors. Neon storage survives deployments and separate processes. After region/cache optimization: first persisted read 1.6 s, immediate repeat 0.5 s (observations).
- Reviewed INFY note baked into release, displayed immediately with 0 new model calls. Other two examples have evidence only. INFY earlier FY guidance, later Q1 growth and revised forecast shown side by side with full quotes/pages; annual delivery remains unverified.
- One recorded L&T consolidated results card: Revenue/PBT/PAT and explicitly limited derived EBITDA proxy, QoQ/YoY, reporting basis and physical PDF p.11. One HDFC Bank succession with bank-attributed profile from the referenced disclosure, p.3. Narrow page-reviewed adapters, not a general automatic table/biography engine.
- Fifteen adversarial citation attacks rejected; full-sentence quote bank, context guards, unreadable-PDF errors. About includes request latency/model-cost ledger and a live synthetic refusal.
- All **72 tests** and syntax pass. HTTP verifies gate, all recorded examples, results/profile enrichment and refusal. 390×844 browser checks show no horizontal overflow, six cached INFY claims, full comparison quotes, expanded profile/source href, corrected filing context and no console errors.
- User reports smooth physical-phone load/scroll, saved alerts and successful TCS research. Device/browser unspecified; installation and phone citation opening not confirmed.

## Current slice — persistent Latest sources

Implemented `src/storage/source-snapshot.js` and explicit `src/ingest.js --publish`. Publication preserves newer snapshots and uses separate Neon storage; requests read stored data, never collect sources. Missing/corrupt/unavailable data remains an explicit failure.

October 31 at 20:43 IST: published capture `2026-10-31T15:13:09.876Z`, **15/15 October 30 EOD records, 62 filings, both adapters OK**. Fresh-process read verified; recorded October 28 replay unchanged. Syntax/72 tests pass. Next: commit/push, retry deployment and verify hosted Latest mode/browser.

Last attempted deployment of the filing-context fix failed with a transport error; Git push succeeded. Latest confirmed production before this retry is the management-profile build (`5d0f1f4`, deployment `dpl_93nzuXroPUVxxNf5KGrEzC2TCP3U`). Do not call the local Latest adapter deployed yet.

## Remaining product limits

Annual/four-quarter delivery verdict, general table/profile extraction, OCR, automatic ingestion, background notifications, voice and native packaging remain unavailable/deferred. Citation guards cover known attacks, not general semantic proof. Only INFY has a reviewed baked AI note. Docker image, after-idle cold-start behavior, HTTPS installation and phone PDF opening remain unverified.

## Work boundary

The user explicitly deferred conversations and all submission details until they decide the build is solid. Local ignored message snapshots exist, but no history has been shared. Do not continue covering-note packaging, reviewer grants, tagging or email now. Continue product reliability. Source commits/pushes, free hosting/Neon, the two host secrets and billing-disabled local Gemini under existing caps are authorized; no paid use, Gemini secret transfer or email.
