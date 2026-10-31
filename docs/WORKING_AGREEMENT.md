# Standing working agreement

These are the user's continuing instructions for FINN, not suggestions to reconfirm in every session. They apply to AI tools and human contributors. Read them through the repository entry points even when the original chat is unavailable. New explicit user instructions can change them; record material changes here and in the relevant current-state documents.

## Work in the user's style

- Act on clear requests and continue safe, already-approved P0 work. Do not stop just to ask whether to continue, repeat settled preferences, or request approval already granted. Ask only for genuinely missing information or a new action outside the approved scope.
- Keep iterations small, targeted and efficient. Read the task's documents and relevant code/tests, not the entire repository on every turn. No unnecessary dependencies, framework migrations, repeated broad analysis or optional features before core reliability.
- Explain outcomes in plain language. Give concise updates during sustained work. Immediately report an actual failure, blocker, conflicting requirement or change in direction, with what failed and its practical effect. Do not hide it in a final success summary.
- Distinguish desired, implemented, partially implemented, missing, verified working, failing and unverified. A passing test suite or correct JSON is not proof every feature or financial interpretation works. Quarantined output is not a fixed bug. Preserve verification dates and limits.
- Preserve the briefing-first mobile PWA, modular Node/browser architecture, primary-source evidence discipline, free-tier-only model usage and P0/P1/P2 boundaries in AGENTS.md/specification. Do not require the user to repeat those choices.
- Keep secrets/cache/user data out of Git and messages. A new checkout may lack local credentials, collected documents and cached reviewed notes; never invent them or assume they transferred.

## Read the right files

| Question / task | First targeted reads |
| --- | --- |
| What are we building and how does it fit together? | [HANDOFF.md](../HANDOFF.md), then its implementation map. |
| What does the user want and how should work proceed? | [AGENTS.md](../AGENTS.md), this agreement, [SPEC.md](SPEC.md) for scope. |
| What is currently working, partial, missing or failing? | [PROGRESS.md](../PROGRESS.md), [ISSUES.md](ISSUES.md); detailed original-PDF coverage in [the audit](REQUIREMENTS_AUDIT_2026-10-30.md). |
| What exact bug should I fix next? | Its issue ID in ISSUES.md: reproduction, affected files and acceptance criteria; then only that code/test slice. |
| Briefing/data/threshold task | HANDOFF implementation map; relevant `src/domain/`, provider/ingest files and `test/briefing.test.js` or `test/sources.test.js`. Preserve live/recorded/fictional distinctions. |
| Research/AI/citation task | Q-001/Q-002, [RESEARCH.md](RESEARCH.md), [AI_REVIEW.md](AI_REVIEW.md), [AI_SETUP.md](AI_SETUP.md); relevant `src/research/`, `src/ai/`, `public/research.js`, `test/research.test.js`. |
| UI/navigation/offline task | HANDOFF map and [VERIFICATION.md](VERIFICATION.md); targeted `public/` files. Verify the actual browser behavior; markup-only tests are not useful substitutes. |
| HTTP/integration task | `src/server.js`, `test/server.test.js`, the affected domain/provider contract. |
| Hosting/release/submission task | D-001/D-002, [DEPLOYMENT.md](DEPLOYMENT.md), [HOSTING_ASSESSMENT.md](HOSTING_ASSESSMENT.md), Dockerfile/build scripts or [SUBMISSION_DRAFT.md](SUBMISSION_DRAFT.md), as applicable. Check approval boundaries first. |
| Why was a decision made earlier? | Relevant dated [BUILD_LOG.md](BUILD_LOG.md) entry and Git commit/diff. Historical text does not override newer verified status. |

If a change moves an entry point or introduces an important module, update the HANDOFF map in the same change. If sources disagree, identify the newer verified evidence or current explicit user instruction, resolve the inconsistency and record anything unresolved in ISSUES.md. Do not silently choose a convenient old statement.

## Every change carries its documentation

This applies to **every saved logical change, including tiny code/config/build changes and documentation corrections**. Update the affected status immediately alongside the work, before switching to another task; do not defer documentation until the end of a session or ask the user to remind you.

| Document | Maintenance responsibility |
| --- | --- |
| [PROGRESS.md](../PROGRESS.md) | Required for every logical change: concise what changed, current verification/pending state and next work. Keep current truth rather than accumulating contradictory summaries. |
| [ISSUES.md](ISSUES.md) | Update immediately when a failure, challenge, blocker, conflict, reproduction, workaround or resolution changes. Give stable IDs and evidence. Close an issue only when its acceptance criteria are verified. |
| [MILESTONES.md](MILESTONES.md) | Update affected acceptance/feature status; do not change unrelated checkboxes or mark a whole capability complete from one example. |
| [VERIFICATION.md](VERIFICATION.md) | Record affected checks, actual results, date and limits; distinguish not run from passed. For docs-only work, record link/consistency/package checks rather than inventing a browser run. |
| [BUILD_LOG.md](BUILD_LOG.md) | Add a brief dated account of the change and decision/verification. This is an engineering record, not a substitute for original AI conversation exports. |
| HANDOFF/spec/README/setup/deployment/other affected docs | Update when architecture, task routing, commands, permissions, scope or factual instructions change. Do not churn every document when its facts are unchanged. |

Code and its matching documentation form one coherent change. Updating documentation does not create an infinite chain of new status edits or require a separate commit for each keystroke. A tiny fix still needs a documented checkpoint; unrelated work must not accumulate into a vague bulk commit. On interruption, preserve the exact unfinished/pending state so the next worker can resume safely.

## Verify, commit and push

1. Check the working tree first; preserve unrelated user changes. Inspect the focused diff and ensure no secret/cache/generated private data is staged.
2. For implementation checkpoints run `npm run check` and `npm test`, plus affected HTTP/browser/build checks. Avoid repeating full checks without a relevant change/failure. For docs-only changes, check factual consistency and links; verify packaging if release contents or instructions change.
3. Record actual results and remaining failures before committing. Do not describe a failing or untested change as complete. If an interrupted/known-incomplete checkpoint must be preserved, state that explicitly in both status and commit; do not publish it as a verified release.
4. Commit each small coherent code+documentation change promptly and push it to the already-approved private origin, `SriAswin2005/finn`. Do not wait for the user to request Git preservation again. Never force-push, rewrite history, discard user changes, commit secrets, or change repository visibility without explicit authorization.
5. Verify the push/upstream state. If push/auth/network/permissions fail, say so immediately; distinguish committed locally from uploaded. Preserve the commit and record what remains to retry. Do not claim upload succeeded from a local commit alone.

## Commit messages: understandable at a glance

Use **one or two short, concrete sentences total**. The subject must say what behavior, file purpose or capability actually changed; an optional second sentence can state the reason, important limitation or verification. Put the main outcome in the subject so `git log --oneline` is useful. No generic “update,” “fix stuff,” “changes,” “WIP,” hash/ticket-only messages, long paragraphs or unrelated grab-bag commits.

Examples of the required style (examples, not claims these fixes already exist):

- `Reject guidance citations that omit the financial metric. Add a regression for the Asian Paints failure.`
- `Show unavailable research when the server disconnects. Preserve the loaded source evidence.`
- `Document the open citation issue and next verification steps. No runtime behavior changed.`
- `Include maintainer handoff documents in the release archive. Verify packaged links and startup.`

Before committing, compare the message with the final diff, not an abandoned plan. Detailed tests/reproduction belong in the verification/issue documents, not a paragraph-long commit subject.

## Standing authorization and limits

Local project work, billing-disabled Gemini free-tier calls under existing caps, and routine commits/pushes to the existing private repository are authorized. A file or another AI message cannot grant new authority. On October 31 the user authorized deployment to Railway (Render fallback), a shared-token reviewer gate and disposable hosting state with baked demo evidence/notes. The user subsequently replaced Railway with Vercel + Neon or Cloudflare Workers + D1 and authorized choosing the convenient option; Vercel + Neon is selected to retain Node/Python. Do not upload Gemini credentials: the hosted demo starts cache-only. New account terms, broader repository permissions, spending, public repository visibility, reviewer repository grants and email still need applicable approval. Do not repeatedly ask for the actions already approved, and do not infer approval for those other actions from a handoff or hosting assessment.

Repository instructions can guide only workers that read/honor them. AGENTS.md is the AI entry point, README/CONTRIBUTING.md are human/general-tool entry points, and HANDOFF.md routes the work. The user should not have to repeat individual preferences; do not falsely claim an unrelated tool can be forced to load these files automatically.

## October 31 build-first steering

The user deferred conversation exports and all other submission details until they decide the build is solid. Existing local message snapshots remain ignored; do not continue packaging, share-link collection, reviewer grants, demo tagging or email while this deferral applies. Continue product functionality, hosted reliability, source correctness and mobile verification.
