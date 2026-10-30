# Copy into a new AI chat/tool

Open this FINN repository and read `AGENTS.md`, `HANDOFF.md`, `PROGRESS.md` and `docs/ISSUES.md` first. Do not scan the entire codebase. Then read only the specification/milestones and files needed for the next small slice.

The user's standing style and instructions are in `docs/WORKING_AGREEMENT.md`; follow them without asking the user to repeat them. For every tiny logical change, immediately update progress and the affected issues/challenges/verification/other documents, verify, and commit/push to the approved private origin. Keep code and documentation together. Use one or two concrete sentences describing the actual change as the commit message, with a useful subject; no vague labels or long paragraphs. Report any failure or unsuccessful upload immediately.

We are building a briefing-first, mobile-first financial intelligence PWA for the ENAM AI Engineer challenge, due November 1, 2026. Preserve the modular dependency-free Node/browser runtime plus pinned Python PDF parser. Original PDFs are authoritative; optional examples are not completed requirements. Use current dated audit/verification rather than old milestone summaries to judge what works.

Start by reporting Git status and the current highest-priority open issue. Unless the user redirects, address Q-001: an AI guidance citation passed quote/numeric checks without establishing its claimed metric. It is not fixed by quarantine. Preserve primary-source provenance and reject ambiguity; do not loosen validation to make the demo pass.

Gemini billing-disabled free tier only is authorized, with existing caps. Credentials/caches are ignored and may be absent from this checkout; never request secrets in chat, print them or assume local reviewed notes shipped with Git. Private source publication to `SriAswin2005/finn` is authorized. Deployment, external authentication/access grants, secret transfer, spending and email are not approved by this handoff.

Finish one verified slice, update progress/issues/milestones and preserve work in Git. Do not claim every feature or every AI output is correct because tests pass. Tell the user promptly about genuine failures and missing information needed to continue.
