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
