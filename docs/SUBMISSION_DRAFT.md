# Covering email draft — not sent

To: assessment@enam.com

Subject: ENAM - IIT screening - 2027

Hello ENAM team,

I built FINN around the investor's daily briefing: a prioritized portfolio digest with original exchange filings, inspectable end-of-day signals, and on-demand primary-document research. The mobile interface includes Today, Portfolio, Ask FINN and configurable in-app Alerts.

**Architecture:** Zero-runtime-dependency Node/browser application with a small Python PDF parser (pypdf). All calculations and triage are deterministic and independently tested. A replaceable Gemini adapter provides on-demand synthesis with free-tier quotas and bounded fallback. The source pipeline preserves document URLs, physical PDF page numbers and fetch timestamps throughout.

**Research quality:** Evidence is cached with document hashes and page citations. Models select server-held quote IDs — preventing fabricated quotes in responses. Numeric and metric-context validation ensures claims cannot be supported by unrelated citations (e.g. a "volume growth" claim whose only reference never mentions volume). One live Infosys example has been reviewed against primary evidence in the mobile browser: six claims covering business context, financial highlight, earlier/later guidance revision, and conditional bull/bear cases. Comparable full-year guidance delivery remains explicitly unverified.

**Scope decisions:** Voice, background push and native packaging were deferred to keep the evidence pipeline reliable. Data gaps are always visible — the recorded source replay is clearly labelled and distinguished from current data and fictional scenarios. The demo covers INFY, ASIANPAINT, and PERSISTENT with full document retrieval; cold lookups (HCLTECH, TCS) were verified using the same generic path.

**Test coverage:** 41 tests across briefing logic, research pipeline, HTTP contracts, AI validation, quota management and source normalization. 38 pass in an offline environment; 3 server integration tests require a running local server.

What I would do next: semantic retrieval improvements, comparable-period guidance analysis (four-quarter promised vs delivered), and stable hosted deployment with a durable quota store.

- Prototype: [add verified HTTPS link after deployment approval]
- Repository: https://github.com/SriAswin2005/finn (private; arrange reviewer access before sending)
- AI build history: [add original conversation exports/share links]

Regards,
Aswin

---

## Submission gates (complete before sending)
- [ ] Deploy with user approval; verify HTTPS phone workflow and restart persistence.
- [ ] Add verified hosted link above.
- [ ] Arrange reviewer GitHub access (currently private).
- [ ] Export original AI coding-agent conversation history; add share links above.
- [ ] Final `git tag demo-v1` checkpoint after all above.
- [ ] Send email only after all gates pass; do not send automatically.

## What is verified (as of October 30, 2026)
- 41 tests; 38 pass offline; 3 require a live HTTP server (pre-existing sandbox restriction).
- Build archive: 70 files, `.env` excluded, checksums verified.
- Q-001 fix: metric-context validation added to `validateAnalysis`; regression test passes.
- Both INFY cached AI outputs pass the updated validation.
- ASIANPAINT and PERSISTENT: 3 documents + 10 evidence chunks each; no active AI cache (live generation needs running server + valid key).
- Private repo pushed: https://github.com/SriAswin2005/finn master.
- Root `SPEC.md` duplicate removed; build script updated.
- Mobile/offline shell: browser-verified October 28. No fresh physical-phone or HTTPS install verified.
- Recorded briefing: October 28 capture, October 27 closes, 44 filings.
- Live ingestion last succeeded October 30 at 15:59 IST: 15/15 October 29 EOD, 55 filings.
