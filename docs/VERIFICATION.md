# M1 verification — October 28, 2026

## Automated
`npm run check` passed for the server, domain module, fixture provider, browser application and service worker.

`npm test`: 6 tests passed, 0 failed. The HTTP integration test exercises an actual ephemeral Node server. Coverage includes:
- A deterministic 15-company demo, ranking and material/routine counts.
- Inclusive time-window boundary, future-event exclusion and portfolio scoping.
- Absolute positive/negative price movement, volume OR price triggers and exact threshold equality.
- Missing prices, zero denominators and incomplete volume histories.
- Invalid API parameters, disallowed methods and denied source/secret file paths.
- Manifest semantics, icon PNG signatures/dimensions and no-store API headers.

## Browser checks
Used the local in-app Chromium browser against the real server. Inspected at 390×844 and 1280×900; no horizontal overflow (document widths 375 and 1265 respectively, accounting for scrollbar). No warning/error console messages during the initial online workflow.

Verified:
- Default briefing: 4 material changes, 3 routine disclosures and 3 EOD signals.
- Seven-day window: 6 material changes; older acquisition scenario is available.
- Announcement detail shows the correct symbol, event time, context and explicit absence of primary evidence; closing restores focus.
- Routine disclosures expand and collapse.
- Thresholds of 50% / 20× produce zero signals and a useful empty state.
- Reload preserves selected window and thresholds; defaults restored after testing.
- Stopped the server and reloaded the already visited page. The cached HTML/CSS/JS shell loaded; the API failed and the briefing was hidden with a clear unavailable message. This verifies cache fallback and prevents stale data from appearing current.
- Restarted the server; Refresh briefing recovered the full workflow.

Preview captures are local, ignored QA artifacts: tmp/finn-mobile.jpg and tmp/finn-desktop.jpg.

## Limits
This is a fixture-backed vertical slice, not the completed challenge submission. No live-source access, real financial claims, research synthesis, background notifications, deployed HTTPS origin, physical-phone installation or full accessibility audit has been verified. Actual network-disconnected device behavior remains part of M4; the server-unavailable cache fallback was verified here. Manifest and offline shell readiness do not prove installation on every browser.

The Codex sandbox restricts Git metadata writes and loopback connections. Local commits and HTTP tests succeeded using approved elevated tool execution. No application dependency or Windows development tool installation was needed. The preview remains running for review; stop it with Ctrl+C when running it in your own terminal.

# M2 verification — October 28, 2026

This section supersedes the M1 live-data limitations above. Document analysis, HTTPS deployment and physical-phone installation remain unverified.

## Automated checks
`npm run check` now discovers and checks every JavaScript module under src/, public/, scripts/ and test/. Passed.

`npm test`: 16 tests passed, 0 failed. Added coverage for source deadlines, bounded retries/permanent failures, response size and JSON errors, daily-session completion, missing daily fields, split-affected comparisons, exactly 20 prior volume sessions, explicit IST exchange timestamps, deduplication, conservative classification, trusted attachment URLs, last-good-record retention, atomic replacement on Windows, stale snapshots and a 503 response for missing live data without fictional fallback. The committed replay reproduces calculations for all 15 companies.

## Source access
- Yahoo chart and NSE announcement endpoints returned HTTP 200 using Node's native fetch.
- Captured 15 valid company histories and 43 portfolio announcements from 2,974 exchange rows at 03:14 IST. No API credentials needed.
- Yahoo's newest completed source rows have null closes. Kept the valid October 26 session and paused affected alerts; did not substitute `regularMarketPrice`.
- A bounded request to the LT results attachment returned HTTP 206, `application/pdf` and a `%PDF-` signature.
- Regenerated category/quality annotations from the retained raw payloads after refining rules, without repeating collection.

## Browser checks
Verified the running API/UI at 390×844 and 1280×900 with no horizontal overflow (content widths 375/1265 including scrollbar allowance).

- Latest-source 24-hour view shows 7 priority disclosures and 8 routine disclosures, including the actual LT results filing. Source warnings are explicit; 0/15 price records are currently alert-eligible because the newer rows are incomplete.
- LT detail has the correct exchange description, event/collection times and original attachment URL; it explicitly says the PDF has not yet been analysed.
- RELIANCE market detail shows October 26 close 1,201.80 INR, previous close 1,190 INR, volume 7,490,515 shares, preceding 20-session average 15,259,242.15 shares, 0.99% price change and 0.49× volume, with an incomplete-newer-row warning and Yahoo history link. These are observations from the captured provider response, not investment conclusions.
- Recorded-source seven-day view shows 22 priority and 21 routine disclosures. Mode, window and original capture timestamp survive reload.
- Fictional mode remains isolated and visibly labelled; its default 24-hour briefing still shows 4 changes and 3 synthetic signals.
- Restored Latest sources and 24 hours after testing. Captured tmp/finn-m2-mobile.jpg, tmp/finn-m2-desktop.jpg and tmp/finn-m2-evidence.jpg (ignored QA artifacts).

## Remaining limitations
Collection is a manual command, not a scheduled job or a phone-side action. A committed replay is available without network access; a fresh clone needs `npm run ingest` for Latest sources. Public endpoints can change, throttle or be incomplete. Snapshot persistence is intended for one local collector. The freshness rule is conservative and calendar-day-based, not an NSE holiday calendar. Metadata classification is not semantic document analysis. Results extraction and primary-document research remain M3.
