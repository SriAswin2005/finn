# FINN progress

Deadline: November 1, 2026. Aim to finish the reliable core by October 31 (IST).

- M0–M2 complete: local responsive PWA, 15-company briefing, Yahoo/NSE ingestion, recorded source replay, price/volume alert rules and 16 passing tests. Git checkpoint: 44bcd81.
- M3A verified: generic NSE document discovery, PDF parsing/page citations, content cache and three recorded examples (INFY, ASIANPAINT, PERSISTENT). Cold HCLTECH lookup retrieved three primary documents through the UI. 26 tests pass.
- P0 navigation verified: Today / Portfolio / Ask FINN / Alerts, portfolio research links, category/threshold preferences and pause control. Narrow phone, portrait/landscape and desktop checks completed.
- Gemini adapter implemented with free-tier opt-in, cached structured claims, exact quote/numeric guards, durable quotas and bounded model-specific fallback. Simulated responses tested; live synthesis remains UNVERIFIED without a configured key.
- Constraints: latest captured Yahoo rows have null closes; valid prior session shown and alerts paused. User approved Gemini free quota ONLY. Local `.env` setup is pending; no live model quota has been consumed.
- Release archive and checksum/secret-exclusion/packaged HTTP checks pass. Container recipe prepared but Docker engine stopped; no image verification claimed. External deployment/GitHub and physical-phone HTTPS verification remain pending approval.
- Preserve the current modular Node/browser implementation. Add only a PDF parsing dependency with a concrete purpose. Suggested React/FastAPI stack is optional in the user's briefing, not a migration requirement.
- External deployment, GitHub publishing and email require user approval. Build local release artifacts and covering note first. Keep original AI chat exports/share links for submission.

Details: docs/SPEC.md, docs/MILESTONES.md, docs/VERIFICATION.md and docs/BUILD_LOG.md.
