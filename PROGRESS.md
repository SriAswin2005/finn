# FINN progress

Deadline: November 1, 2026. Aim to finish the reliable core by October 31 (IST).

- M0–M2 complete: local responsive PWA, 15-company briefing, Yahoo/NSE ingestion, recorded source replay, price/volume alert rules and 16 passing tests. Git checkpoint: 44bcd81.
- M3A verified: generic NSE document discovery, page citations, three recorded examples and cold HCLTECH lookup. Guidance now includes both available calls; financial retrieval balances call/annual context. 34 tests pass.
- P0 navigation verified: Today / Portfolio / Ask FINN / Alerts, portfolio research links, category/threshold preferences and pause control. Narrow phone, portrait/landscape and desktop checks completed.
- M3B live example verified: Flash-Lite produced a reviewed six-claim INFY note in about 6.5 seconds. Browser displays exact server-resolved quotes, physical-page citations, conditional bull/bear labels and cache reuse. Source quote IDs, thinking controls and truncated-output rejection are implemented. The suite now has 40 tests. See docs/AI_REVIEW.md; arbitrary future output is not certified by this one example.
- Latest data: October 27 EOD complete for all 15 companies; official NSE fallback filled two missing Yahoo rows. Current replay contains 44 filings and two default market signals, with no source warnings.
- AI credentials resolved: after the user edited `.env` manually, Google's model-list API accepted the saved key and listed all six configured text candidates. Only free-tier use is authorized. Earlier invalid-key attempts produced no note. Both Gemma models timed out during live checks; their availability is confirmed, inference quality/latency is not.
- Resolved EADDRINUSE by identifying and replacing only the earlier FINN server. The current server at http://127.0.0.1:3000 loads the corrected key and verified implementation. Clear Ctrl+C / npm start guidance is documented.
- Corrected setup's three-model restriction. Up to 40 inventory IDs are preserved, excluding specialist/unverified candidates from research. Small business questions try Gemma 26B then Flash-Lite; concise general research prefers Flash-Lite. Fallback retains three-attempt/45-second network bounds and never bypasses a shared project limit. Guidance revisions are supported; comparable full-year delivery remains explicitly unverified.
- Release archive and checksum/secret-exclusion/packaged HTTP checks pass. Private source repository created and pushed with user approval: https://github.com/SriAswin2005/finn (master). Container recipe prepared but Docker engine stopped; no image verification claimed. HTTPS hosting and physical-phone verification remain pending.
- Local offline recovery verified: updated shell opens with the server stopped and clearly reports unavailable research; restarting restores evidence and the reviewed cached note. API responses are never silently replaced by fixtures or offline cache. Phone HTTPS installation remains pending.
- Preserve the current modular Node/browser implementation. Add only a PDF parsing dependency with a concrete purpose. Suggested React/FastAPI stack is optional in the user's briefing, not a migration requirement.
- GitHub private publication is authorized and complete. External application deployment and email still require user approval. Keep original AI chat exports/share links for submission; private repository access must be arranged for reviewers before final delivery.

Details: docs/SPEC.md, docs/MILESTONES.md, docs/VERIFICATION.md and docs/BUILD_LOG.md.
