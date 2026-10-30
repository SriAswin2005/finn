# Original-document functionality audit — October 30, 2026

Verdict: **the selected local prototype works, but not every capability described in the PDFs is implemented or fully verified.** No failing automated tests were found. One fresh AI citation-context issue was found and its new cache entry was quarantined. Deployment/submission remain incomplete.

Scope: reread all four pages of `1. ENAM_AI_Engineer_Build_Challenge_Main.pdf` and all three pages of `2. ENAM_AI_Engineer_Build_Challenge_Reference.pdf`, inspect the relevant provider/domain/UI paths, and run current checks. The main brief explicitly makes the frontend suggestions illustrations, the eight research outputs a menu, and completeness secondary to a focused working prototype. The reference supplies definitions and optional category guidance; it does not require every glossary term to become an app feature.

## Fresh verification

- `npm run check`: passed. `npm test`: 40 passed, zero failed. `npm run verify:build`: packaged checksums, secret exclusions, HTTP briefing and recorded-research smoke checks passed.
- Live snapshot initially dated October 28 and was correctly stale, with zero eligible market alerts. Ran `npm run ingest` without `--record`: successful October 30 capture at 15:59 IST, 15/15 valid October 29 EOD records, 55 seven-day portfolio announcements, both source adapters OK. Committed recorded replay was preserved.
- Fresh HTTP checks: health, live briefing, configured 72-hour/5%/3x recorded briefing and all three demo research responses returned 200. Live data was not stale; 15 market records were alert-eligible. Default live window had four priority filings, four routine filings and two market signals at capture time. This remains a snapshot, not an automated watch service.
- TCS was absent from local research cache before the check. Cold generic lookup retrieved a 361-page annual report and two transcripts (October and July 2026), selected ten passages, and reported no source errors in approximately 32 seconds. This is evidence of generalization, not proof every NSE issuer/document will be accessible.
- INFY's previously reviewed six-claim note was served from cache. A new ASIANPAINT Flash-Lite note completed in approximately 3.1 seconds and passed structural, quote and numeric validation, but manual review found incomplete support in one attached citation. PERSISTENT source retrieval passed; its AI synthesis was not freshly tested. All configured models were not individually retested.
- GitHub origin was reachable and master matched local source checkpoint `41cbb22` before this audit record. Repository reviewer access remains a separate delivery step.

## Requirement-by-requirement status

| PDF capability / delivery item | Status | Exact coverage or gap |
| --- | --- | --- |
| Mobile-first working prototype | Local implementation verified previously; phone delivery incomplete | Responsive browser PWA exists. October 28 checks covered narrow screens, citations, navigation and offline recovery. No fresh physical-phone/HTTPS install check today. |
| Mock portfolio of 15–20 NSE/BSE companies | Implemented | Fifteen NSE companies across sectors. BSE-specific research is not offered; the brief permits NSE portfolio companies and requires generic NSE research. |
| Three to five ad-hoc research examples | Retrieval implemented; AI review partial | INFY, ASIANPAINT and PERSISTENT each expose three primary documents and selected page references. Only INFY has a fully reviewed successful AI note; new ASIANPAINT note has the issue below. |
| Generic NSE research beyond demo set | Verified example, bounded support | Fresh TCS cold lookup succeeds; earlier HCLTECH cold lookup also succeeded. No hard-coded company answers. Private, missing, scanned, oversized or unparseable documents can fail explicitly. |
| Portfolio EOD price and volume sources | Working in fresh audit | Yahoo plus official NSE fallback; October 30 refresh succeeded for all 15. No intraday/realtime claim. |
| Corporate filings source | Working in fresh audit | NSE feed refreshed successfully; original filing URLs/timestamps retained. No separate BSE adapter. |
| Annual reports + transcripts only for pull evidence | Implemented | Screener discovers links; company/exchange PDF text supplies evidence. No broker/news/model outside-knowledge source is admitted by the retrieval path. Semantic compliance of arbitrary generated text still needs review. |
| Default 24-hour configurable digest | Implemented | Last 24 hours, three days or seven days; prioritized filings and collapsed routine items. No arbitrary custom dates. |
| Category, price and volume threshold preferences | Implemented | In-app preferences, pause and browser persistence. Tests cover calculation boundaries, missing/stale data and the preceding 20-session volume baseline. |
| Proactive continuous watch / alerts at the moment a new event arrives | Not implemented | No scheduler, background ingestion, polling loop or OS notification delivery. Alerts evaluate saved data when the app reads it. `npm run ingest` must update sources manually; browser Refresh does not ingest. |
| Filing categories from companion | Adapted as permitted | Rule-based metadata triage with unknowns visible. Board-meeting notices are separated from actual results. Not a semantic materiality engine. |
| Management-change professional biography | Not implemented | Filing/context only. No LinkedIn/background enrichment or verified incoming-person profile. Optional illustrative feature in main PDF p. 2. |
| Quarterly Revenue/EBITDA/PBT/PAT with QoQ/YoY | Not implemented | Results filings are surfaced, but figures are not systematically extracted/normalized/compared. Optional illustrative feature in main PDF p. 2. |
| Business snapshot | Partial AI/evidence implementation | Narrow description/segments may be summarized with sources. No guaranteed complete segment revenue-mix breakdown. |
| Financial snapshot | Partial AI/evidence implementation | Source passages and supported headlines. No complete standardized dashboard of revenue, margins, PAT and ratios for every company. |
| Multi-year trajectory | Partial source coverage; dedicated analysis absent | Annual tables may be retrieved, but no normalized multi-year series/chart or independently validated trend engine. |
| Balance-sheet analysis | Not implemented as a dedicated workflow | No structured debt/leverage/working-capital/funding analysis. |
| Cash quality / conversion | Not implemented as a dedicated workflow | No normalized cash-flow trend or profit-to-cash conversion calculations. |
| Narrative versus numbers | Not implemented as a verified comparison | No structured disagreement/consistency analysis with matching reporting basis. |
| Four-quarter promised versus delivered worked example | Not implemented | Only up to two call transcripts are discovered by the current collector. No four-quarter guidance/outcome dataset or comparison engine. |
| Management guidance | Partial, one reviewed example | INFY earlier/later revenue forecasts are quoted. Forecast revision is explicitly not verified delivery. New ASIANPAINT citation needs correction. |
| Bull and bear cases | Partial, one reviewed pair | INFY conditional cases reviewed. The new ASIANPAINT response omitted bull explicitly; balanced cases are not guaranteed for every company. |
| Chat/voice/other interaction experiments | Dashboard + focused research form | Open-ended chat, voice, transcription, native packaging and on-device inference absent; these are choices/examples rather than mandatory features. |
| Efficient routing/caching/chunking | Implemented with limits | Server-only credentials, bounded evidence/output/attempts, exact quote bank, cached notes and durable local caps. Gemma previously timed out; successful Gemma inference is not verified. |
| Phone-accessible deployed link | Missing | Localhost only; no external host approved/deployed. |
| GitHub repository | Created and source pushed | Private `SriAswin2005/finn`; reviewers need approved access. |
| Original AI build-history exports/share links | Missing from submission package | Build log is available but does not replace original conversations. |
| Covering note and final email | Draft only | Host URL/history links/reviewer access/final omissions need completing. Nothing emailed. |

## Specific failure and immediate containment

The newly generated ASIANPAINT note says management guided **8–10% volume growth**. Its attached August transcript quote only says a band of 8–10% for FY27; it does not identify volume. Other retrieved material contains discussion of volume ambition, but that context was not attached to this claim. The number may be correct, yet the displayed citation alone does not establish the asserted metric.

The current guards validate IDs, literal quotations, numeric membership and interpretation flags. They do **not** verify that every metric, currency, consolidation basis or causal interpretation is established by those selected quotations. This is an actual citation/semantic-coverage gap, not an automated-test failure or evidence that all model facts are false. Its scope cannot be bounded to one company without broader review.

Quarantined only the cache entry freshly generated by this audit (renamed to an ignored `.review-rejected.json` file after confirming its generation timestamp). Full review evidence is preserved in ignored `tmp/audit-ASIANPAINT-2026-10-30.json`. No source code or validation rules were changed. Another generation can still reproduce the issue until citation-context coverage is improved; quarantine is containment, not a fix.

## Remaining blockers and verification limits

- Hosted AI has no reviewer authentication/access control. Current local quotas assume one process and persistent storage; an ephemeral host could reset the ledger. Do not call hosted AI deployment-ready yet.
- Docker image remains unbuilt/unverified because the local engine was not running at the earlier check; packaged Node startup passes. No new Docker or physical-phone test was attempted in this audit.
- Automatic source refresh, the listed financial analysis workflows and submission tasks remain absent. They are not hidden behind passing unit tests.
- No fresh full browser regression or every-model/every-ticker test was performed today. Current tests and HTTP calls passing cannot certify every UI action or arbitrary AI interpretation.
- No deployment, account creation, access grants, paid usage or email was performed. Only approved free-tier model use, local ignored-cache updates, and a source-refresh verification occurred.

Priority before a claim of readiness: correct/reject citation-context gaps, validate at least the selected demo analyses, then complete hosting/access controls and phone/submission gates. The optional menu omissions should be stated clearly in the covering note rather than described as completed features.
