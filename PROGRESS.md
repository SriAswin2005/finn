# FINN current progress

Last reconciled October 30, 2026 (IST). Deadline: November 1. Start with [HANDOFF.md](HANDOFF.md); working rules are in [AGENTS.md](AGENTS.md). This is current status, not a chronological log.

## Verified working
- Local Today / Portfolio / Ask FINN / Alerts prototype, 15 NSE companies, configurable in-app preferences, source links and explicit data modes. Mobile/navigation/offline browser checks were performed October 28; no fresh complete browser or physical-phone run October 30.
- October 30: syntax, all **40 tests**, and packaged-release checks pass. No known unmerged Git files at handoff; recheck the working tree before editing.
- Manual live ingestion succeeded October 30 at 15:59 IST: 15/15 October 29 EOD records and 55 portfolio filings. Recorded replay is deliberately separate: October 28 capture, October 27 closes, 44 filings. Neither is a continuous monitoring service; freshness must be checked again when resuming.
- Three recorded primary-document examples: INFY, ASIANPAINT, PERSISTENT. Generic cold HCLTECH and TCS retrieval verified, with TCS tested October 30.
- One INFY six-claim AI example reviewed; exact server-owned quotes, PDF pages, conditional cases and cache reuse verified. Gemini free-tier key accepted after manual local configuration. No universal AI accuracy or latency claim.
- Private source repository created/pushed with approval: https://github.com/SriAswin2005/finn, master. Local deployable archive verified; secrets/caches excluded.

## Open failures and incomplete work
- **Q-001:** new ASIANPAINT guidance note passed numeric/quote guards without its attached quote establishing the claimed volume metric. Only that audit-generated cache entry is quarantined. The validation gap is **not fixed**. See [ISSUES.md](docs/ISSUES.md) for reproduction, files and acceptance criteria.
- Broader AI semantic review is partial. Gemma models previously timed out; PERSISTENT AI is not reviewed. INFY guidance revision is supported, full-year/four-quarter delivery is not.
- Automatic ingestion/watch/notifications, quarterly financial extraction/comparisons, biographies and dedicated balance-sheet/cash-quality/multi-year workflows are absent or partial. Voice/native/on-device features remain deferred. See the [full audit](docs/REQUIREMENTS_AUDIT_2026-10-30.md).
- Hosted access control, durable hosted quota storage, container execution, HTTPS phone installation and final submission are incomplete/unverified. Dockerfile exists; a passing Node archive does not verify Docker.
- No host selected or deployment approved. [Hosting assessment](docs/HOSTING_ASSESSMENT.md): conditional Railway trial candidate; Render limited-demo fallback. No hosting account, secret transfer or app publication performed.

## Continue next
1. Fix/reject Q-001 with a meaningful regression and source review, without loosening evidence checks.
2. Review the chosen demo analyses and preserve unsupported outputs explicitly.
3. Obtain remaining host/access approval; verify container, persistence, HTTPS and phone behavior after deployment.
4. Finish reviewer GitHub access, original AI conversation exports, covering note and final demo checkpoint. No email sent.

Keep the modular Node/browser runtime and pinned Python parser. Free-tier Gemini and ongoing private source pushes are authorized; paid use, external deployment/authentication/access grants, secret transfer and email are not approved. Credentials and runtime caches do not travel with Git. Never assume the local server is running or data is fresh from this document alone.

Details: [specification](docs/SPEC.md), [milestones](docs/MILESTONES.md), [verification](docs/VERIFICATION.md), [issues](docs/ISSUES.md), [historical build log](docs/BUILD_LOG.md).
