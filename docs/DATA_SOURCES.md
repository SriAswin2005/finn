# Data source contracts and operational limits

## Collection
`npm run ingest` runs the single-process collector. Three workers fetch the configured Yahoo symbols; one concurrent NSE request covers the last seven calendar days. Each request has a 10-second deadline and 5 MB cap. Retry once on connection failures, HTTP 429 or 5xx; do not retry permanent 4xx or malformed JSON. No external credentials or application packages are required. These are public website endpoints, not a contracted stable API; schema and access can change.

Public source pages:
- Yahoo history: https://finance.yahoo.com/quote/RELIANCE.NS/history/
- NSE announcements: https://www.nseindia.com/companies-listing/corporate-filings-announcements

The collector constructs fixed-origin request URLs; user-provided URLs are not fetched. In-app filing links accept HTTPS on the NSE archive hosts only. Yahoo record links point to the symbol's public history page. The server never proxies arbitrary URLs.

## Prices
Yahoo chart endpoint: `/v8/finance/chart/{SYMBOL}.NS?interval=1d&range=3mo&events=splits` on query1.finance.yahoo.com. Match the requested symbol and INR currency. Use raw closes and share volume, not adjusted-close total returns or the metadata's intraday quote. Accept a current-day daily bar only after 16:00 IST. Skip null/invalid closes and volumes; retain 21 valid sessions to reproduce the latest close, preceding close and prior 20-session volume mean. A shorter baseline cannot trigger a volume alert.

Preserve session dates, fetch timestamp, previous session, history, source URL and request URL. A newer completed source row with missing fields pauses alerts and discloses the valid session being shown. Split events in the baseline window pause comparisons; do not treat a share-count change as an investment signal. This is conservative suppression, not a fully adjusted corporate-action engine.

Price change = `(close / previousClose - 1) * 100`. Volume ratio = `currentVolume / mean(prior 20 valid volumes)`. A valid absolute move at or above the configured threshold OR a valid volume ratio at or above its threshold triggers an in-app signal. Latest source records are inspectable even when alerting is suppressed.

## Announcements
NSE endpoint: `/api/corporate-announcements?index=equities&from_date=DD-MM-YYYY&to_date=DD-MM-YYYY`. Keep only configured portfolio symbols. Parse `an_dt` explicitly as IST; do not rely on Windows locale parsing. Retain exact exchange `desc` and `attchmntText`, fetch timestamp and archive attachment link. Deduplicate stable IDs derived from symbol, exchange sequence, event time and attachment. Count invalid portfolio rows and mark source coverage partial instead of calling them an empty feed.

Classification uses readable metadata rules, with original metadata always available. Meeting notices are distinct from actual result submissions. Ordinary certificates, meeting notices and ESOP filings may be collapsed, but remain accessible. Unknown categories stay in the main feed. Context prompts are generic things to verify, not claims extracted from the filing or model-generated investment conclusions. PDF parsing, financial extraction and executive enrichment are not implemented in M2.

## Persistence and mode boundaries
- `data/cache/snapshot.json`: current local snapshot, ignored by Git.
- `data/cache/raw/{hash}.json`: source payload bundle, ignored by Git. `rawSha256` is SHA-256 of the compact JSON representation of the parsed payload bundle, not HTTP response bytes.
- `data/recorded-snapshot.json`: committed replay with 21-session histories, exact announcement metadata, timestamps and evidence URLs. It reproduces calculations without external network access, and is visibly labelled historical replay.

Writes use a temporary sibling followed by atomic replacement. One ingester only; no database or scheduler yet. Price failures retain the previous good symbol record with its original timestamp and a new error; announcement failure retains prior announcements and source timestamp. No failure invokes the fictional provider. The API's missing-live-snapshot response is HTTP 503. The raw cache is not exposed by static routing.

Source fetch age over 24 hours and session age over four calendar days are conservatively stale. Live briefing windows use current time, while recorded/demo windows use the capture/demo clock. The four-day rule is not holiday-calendar-aware. The browser's API path stays network-only; cache fallback applies to the PWA shell.

## Captured evidence and limitations
Capture: October 28, 2026, 03:14 IST. 15 valid histories and 43 portfolio announcements, normalized from 2,974 NSE rows. Replaced the original mock TATAMOTORS holding after its source endpoint returned 404; EICHERMOT returned a valid history. No claim is made here about the reason for the old symbol's failure.

Yahoo's October 27 rows had null closes. The recorded market records therefore show October 26 with warnings; no intraday price was substituted and all affected alerts are paused. This does not require a user credential or manual intervention; it remains an upstream completeness limitation to recheck during hardening.

Verified LT results attachment: https://nsearchives.nseindia.com/corporate/PAM_27102026171156_LTSep2026.pdf returned HTTP 206, `application/pdf`, and `%PDF-` for a bounded range request. This verifies the link, not the numerical contents of the document.
