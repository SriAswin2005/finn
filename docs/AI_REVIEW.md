# Reviewed AI example — INFY

Reviewed October 28, 2026. This is a bounded acceptance example, not a general accuracy certification. Company evidence is public; no credential or generation cache is included here.

The default INFY research request generated six claims with `gemini-3.5-flash-lite`, prompt `cited-primary-research-v6`, at 18:45 IST. Generation took about 6.5 seconds (5,325 input and 533 visible output tokens). These are one-request observations, not a latency or quota promise. Repeating it in the browser reused the cached result without generation.

| Claim reviewed | Primary support and assessment |
| --- | --- |
| Business provides end-to-end solutions to improve client business performance. | [Annual report, PDF p. 356](https://www.bseindia.com/xml-data/corpfiling/AttachHis/19dd605c-2b6b-4084-8dca-9d578a3eb7a0.pdf#page=356). Operations description directly supports the narrow summary. |
| Fiscal 2026 revenue crossed US$20 billion. | [Annual report, PDF p. 17](https://www.bseindia.com/xml-data/corpfiling/AttachHis/19dd605c-2b6b-4084-8dca-9d578a3eb7a0.pdf#page=17). Source headline explicitly gives the dollar threshold and fiscal period. |
| Earlier FY2027 constant-currency revenue-growth guidance was 1.5%–3.5%. | [April call, PDF p. 4](https://www.bseindia.com/xml-data/corpfiling/AttachHis/2ab7badf-388c-4dab-bfcc-3e128677734c.pdf#page=4). Explicit management forecast, not an achieved result. |
| Later constant-currency revenue-growth guidance changed to 1.5%–3%. | [July call, PDF p. 6](https://www.bseindia.com/xml-data/corpfiling/AttachHis/95f8af86-dc92-49dc-a7cf-ecce287f8cce.pdf#page=6). Explicit revised range; the displayed source title distinguishes the later call. |
| Bull case: continued AI investment could support transformation work. | April call p. 4 plus annual report p. 76 discuss transformation objectives and expected AI investment. Conditional interpretation is reasonable; it does not assert future returns or certain growth. |
| Bear case: competitive intensity and AI productivity could pressure traditional services. | April call p. 4 names those factors; annual report p. 76 describes pressure on traditional services. Conditional interpretation, not a forecast of loss. |

All selected quote IDs resolve to exact server-held primary text, 20–220 characters each. Existing quote-membership, evidence-ID, numeric and interpretation checks pass. Browser rendering was checked at 390×844, with six claims, correct physical-page links, no horizontal overflow and no console errors. The explicit guidance-delivery limitation is displayed.

Full-year guidance versus delivery is **not verified**: the selected evidence does not establish a comparable completed outcome. Forecast revision and one-quarter growth must not be treated as proof of annual delivery. Source PDFs may themselves contain reporting errors; extracted text and exact quotes do not independently audit company accounts. Future model outputs still require source review.

Live hardening rejected incomplete JSON after thinking exhausted the output cap, unsupported numbers, and overly long model-written quotes. Citation selection now uses short deterministic quote IDs; quote text is inserted by the server. Known truncated finish reasons are rejected even if a JSON prefix parses. Busy-server/timeout fallback remains capped at three distinct attempts and a shared 45-second network budget. Both Gemma models timed out during the focused-task check; only Flash-Lite synthesis has a reviewed successful output in this milestone.
