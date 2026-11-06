# Current issues — November 6, 2026

## N-001 — Neon monthly transfer exhausted

Resolved by independent free storage, not an allowance reset. All120 records deep-matched before promoting dpl_Ah5Cb9FGRYFDefeDePPSitHLxR8N to the existing URL. All174attempts/holds preserved. Cloudflare SQLite Durable Object is canonical for local and hosted clients; the old four Neon tables are retained/read-only. Initial production HTTP and browser checks passed; scheduled writes continued through19:31IST. New backend has its own free limits and no unlimited-availability claim. Details: [DEPLOYMENT.md](DEPLOYMENT.md), [VERIFICATION.md](VERIFICATION.md).

## N-003 — Intermittent large Research read

Resolved with bounded transient-read recovery, deployed as source 4e0668c / dpl_AwN9qvjhYLqm6kujo2sE5Lj6ELvS. Research uses a 15-second deadline and at most one network/502/503/504 read retry. Authentication/corrupt JSON and uncertain writes never retry. Syntax/all 159 tests pass. Fresh TCS/HCL requests returned 200 in 2.51/1.19 seconds; repeat requests returned 200 in 2.01/2.04 seconds. TCS retained four cached claims and zero model calls. These checks do not promise universal source/network availability.

## N-002 — Existing Google generation authorization/configuration stop

Open, predates migration. The last model attempt returned403 and canonical credentials_or_model_configuration blocks new generation. All174attempts/holds retained. Metadata for allfour configured models returns200; generation access and the original403 cause are unverified. Saved notes/source retrieval work. Do not clear the hold or create fresh allowance based on metadata alone.

## R-001 — Hosted Pull

Working for previously demonstrated primary-source generation/cache/lease paths. New source-only HTTP match/no-match and recovered HCL annual reads200. HCL annual error cleared with the verified partial source; two transcripts and historical notes preserved. Adding the annual source changes evidence identity; older HCL notes may need a fresh explicit generation rather than reuse against a changed corpus. No model call was made for this repair.

## R-002 — Annual PDF extraction

Resolved for measured HCL/TCS paths. Old361-page full scan exceeded8s. Hosted download/parser worker now has7.2s watchdog, complete-page recovery, physical1–40 plus bounded located MDA, targeted-page option and honest partial metadata. Final HCL485pages/64scanned/MDA105–128:6.48s; TCS361pages/58scanned/MDA54–71:5.60s. Strict physical-heading verification rejects governance cross-references and handles negative offsets. Source/network/cold-start variability can still yield partial/unavailable; no universal8s SLA or OCR claim.

## P-002 — Routine queue quota use

Resolved/tested: board_meeting, postal_ballot, investor_meetings, agm_egm and unclassified complete from exact cited excerpts without model reservation. Results, management_change, M&A, contract and litigation sort first; substantive board documents are promoted. Other categories retain model review.18rule notices complete; last reconciliation0calls,49waiting,58attempts unchanged. Active leases/captured work/capped failures are not reset. No70% saving or causal quota explanation for503s is claimed.

## R-003 — Guidance formats

Resolved/tested: standard revenue/volume/sales growth guidance/outlook/target and four distinct margin guidance/band/expectation metrics. Exact quotes and physical pages retained; signed ranges supported. Known metric/currency/fiscal-period/scope/qualifier mismatches refused; missing periods remain unstated, actuals absent unless supported. Original INFY case passes. Completed annual delivery remains not_comparable.

## R-004 — Question evidence presentation

Resolved/tested in local browser and production HTTP: prominent exact source sentence, title and physical-page link below question; AI/artificial-intelligence matching, helpful zero-match prompt, stale-input clearing and focus.390px layout has no horizontal overflow. Source reference is not a generated answer; partial scans disclose searched coverage.

## P-001 — Automatic AI publication and semantic quality

Unattended publication demonstrated on November 3. Scheduled Polycab and Infosys cards passed validation and their quotes matched the original physical pages. Two production reads served the Polycab card with the attempt count unchanged at 123. See [verification](VERIFICATION.md).

Broader semantic quality and sustained provider capacity remain open. Provider 503s still delay jobs, and unsupported output is withheld.

## Q-003 — Quotas and model routing

Existing configured disjoint pools and per-model500/500/20/20 ceilings remain; aggregate1040, Research500/Push540, local retries250/Lite/10Flash/shared520 inside totals, lifetime3. No history/hold reset. Gemma4 26B/31B user limits30RPM/16k inputTPM/14400RPD remain recorded/unassigned; Research's30000-token estimate still prevents safe assignment without separate work.

## Q-004 — Source comparison safeguards

Existing clipping, identity, dated-year, source-condition and financial-absence regressions remain passing, including15adversarial refusals. No-new-shares does not establish zero cash.

## Q-002 / S-001 / D-004 / D-002 — Remaining breadth/device/submission

Broad multi-year/balance-sheet/cash-quality/OCR and annual delivery remain unverified. EOD was manually refreshed, not scheduled. Physical-phone install/offline/native PDF, sustained timing/load and general unseen semantic quality remain open. The source bundle and covering draft are prepared locally. Complete AI history and reviewer access remain pending. Voice, OS notifications and native packaging remain deferred. No new account action needed.
