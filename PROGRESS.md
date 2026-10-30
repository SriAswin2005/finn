# FINN current progress

Last reconciled October 30, 2026 (IST). Deadline: November 1. Start with [HANDOFF.md](HANDOFF.md); working rules are in [AGENTS.md](AGENTS.md). This is current status, not a chronological log.

Standing workflow is now explicit in [WORKING_AGREEMENT.md](docs/WORKING_AGREEMENT.md), with a human [CONTRIBUTING.md](CONTRIBUTING.md) entry point. It persists the user's working style, targeted task/file routing, immediate documentation for every small logical change, verified checkpoints, automatic routine private pushes and descriptive one- or two-sentence commit messages. This instruction/packaging change does not change runtime feature status.

## Verified working
- Local Today / Portfolio / Ask FINN / Alerts prototype, 15 NSE companies, configurable in-app preferences, source links and explicit data modes. Mobile/navigation/offline browser checks were performed October 28; no fresh complete browser or physical-phone run October 30.
- October 30: syntax, all **41 tests** (38 pass; 3 server.test.js tests require a live HTTP server and fail in the sandbox — pre-existing, not a new regression), and packaged-release checks pass. No known unmerged Git files at handoff; recheck the working tree before editing.
- Manual live ingestion succeeded October 30 at 15:59 IST: 15/15 October 29 EOD records and 55 portfolio filings. Recorded replay is deliberately separate: October 28 capture, October 27 closes, 44 filings. Neither is a continuous monitoring service; freshness must be checked again when resuming.
- Three recorded primary-document examples: INFY, ASIANPAINT, PERSISTENT. Generic cold HCLTECH and TCS retrieval verified, with TCS tested October 30.
- One INFY six-claim AI example reviewed; exact server-owned quotes, PDF pages, conditional cases and cache reuse verified. Gemini free-tier key accepted after manual local configuration. No universal AI accuracy or latency claim.
- Private source repository created/pushed with approval: https://github.com/SriAswin2005/finn, master. Local deployable archive verified; secrets/caches excluded.
- **Q-001 fixed October 30:** `validateAnalysis` now requires that each claim's combined quote text contains at least one of the claim's key metric terms (≥5-char alpha words, stop-word filtered). Regression test added and passing. Quarantined ASIANPAINT cache entry remains absent from Git.
- Root `SPEC.md` removed (was a duplicate of README content); `scripts/build.js` updated to not include it in the archive.

## Open failures and incomplete work
- Broader AI semantic review is partial. Gemma models previously timed out; PERSISTENT AI is not reviewed. INFY guidance revision is supported, full-year/four-quarter delivery is not. (See Q-002 in ISSUES.md.)
- Automatic ingestion/watch/notifications, quarterly financial extraction/comparisons, biographies and dedicated balance-sheet/cash-quality/multi-year workflows are absent or partial. Voice/native/on-device features remain deferred. See the [full audit](docs/REQUIREMENTS_AUDIT_2026-10-30.md).
- Hosted access control, durable hosted quota storage, container execution, HTTPS phone installation and final submission are incomplete/unverified. Dockerfile exists; a passing Node archive does not verify Docker.
- No host selected or deployment approved. [Hosting assessment](docs/HOSTING_ASSESSMENT.md): conditional Railway trial candidate; Render limited-demo fallback. No hosting account, secret transfer or app publication performed.

## Continue next
1. Review ASIANPAINT and PERSISTENT demo analyses; mark unsupported outputs explicitly. (Q-002)
2. Obtain remaining host/access approval; verify container, persistence, HTTPS and phone behavior after deployment. (D-001, D-002)
3. Finish reviewer GitHub access, original AI conversation exports, covering note and final demo checkpoint. No email sent.

Keep the modular Node/browser runtime and pinned Python parser. Free-tier Gemini and ongoing private source pushes are authorized; paid use, external deployment/authentication/access grants, secret transfer and email are not approved. Credentials and runtime caches do not travel with Git. Never assume the local server is running or data is fresh from this document alone.

Details: [specification](docs/SPEC.md), [milestones](docs/MILESTONES.md), [verification](docs/VERIFICATION.md), [issues](docs/ISSUES.md), [historical build log](docs/BUILD_LOG.md).
