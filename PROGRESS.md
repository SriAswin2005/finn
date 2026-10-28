# FINN progress

Deadline: November 1, 2026. Aim to finish the reliable core by October 31 (IST).

- M0–M2 complete: local responsive PWA, 15-company briefing, Yahoo/NSE ingestion, recorded source replay, price/volume alert rules and 16 passing tests. Git checkpoint: 44bcd81.
- M3A verified: generic NSE document discovery, page citations, three recorded examples and cold HCLTECH lookup. Guidance now includes both available calls; financial retrieval balances call/annual context. 34 tests pass.
- P0 navigation verified: Today / Portfolio / Ask FINN / Alerts, portfolio research links, category/threshold preferences and pause control. Narrow phone, portrait/landscape and desktop checks completed.
- Gemini adapter implemented with free-tier opt-in, cached structured claims, exact quote/numeric guards, durable quotas and bounded model-specific fallback. Simulated responses tested; live synthesis remains UNVERIFIED without a configured key.
- Latest data: October 27 EOD complete for all 15 companies; official NSE fallback filled two missing Yahoo rows. Current replay contains 44 filings and two default market signals, with no source warnings.
- Remaining AI dependency: user approved Gemini free quota ONLY; local setup is saved, but Google rejected the key as invalid on the first live research attempt and a separate model-list metadata check. No generated note was returned. Replace the key using `npm run configure:ai` and restart FINN. Project quota cooldowns persist across requests/restarts.
- Resolved the reported EADDRINUSE by identifying the earlier FINN process on port 3000, confirming it served this app with AI unconfigured, and replacing it with a server loading `.env`. The restarted API reports AI configured; Google still rejects the saved credential on a metadata-only check. Added clear port-conflict guidance. No unrelated process was stopped and no additional generation was attempted.
- Corrected setup's three-model restriction after the user's full list was rejected. Up to 40 inventory IDs are preserved; text candidates are separated from specialist/unverified IDs before key input. Gemma handles narrow business questions first, Flash handles broader research first; fallback has three-attempt/45-second network bounds. All 38 tests pass, including actionable invalid-key handling without leaking provider text or rotating. Actual model latency and research quality remain unverified.
- Release archive and checksum/secret-exclusion/packaged HTTP checks pass. Container recipe prepared but Docker engine stopped; no image verification claimed. External deployment/GitHub and physical-phone HTTPS verification remain pending approval.
- Preserve the current modular Node/browser implementation. Add only a PDF parsing dependency with a concrete purpose. Suggested React/FastAPI stack is optional in the user's briefing, not a migration requirement.
- External deployment, GitHub publishing and email require user approval. Build local release artifacts and covering note first. Keep original AI chat exports/share links for submission.

Details: docs/SPEC.md, docs/MILESTONES.md, docs/VERIFICATION.md and docs/BUILD_LOG.md.
