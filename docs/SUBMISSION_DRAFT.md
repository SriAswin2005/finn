# Covering email draft — not sent

To: assessment@enam.com

Subject: ENAM - IIT screening - 2027

Hello ENAM team,

I built FINN, a mobile-first briefing PWA for a 15-company mock NSE portfolio. Today prioritizes official disclosures, Portfolio shows inspectable EOD price/volume calculations, Ask FINN provides primary-document research, and Alerts offers configurable in-app preferences.

The prototype runs on Vercel with Neon persistence and a Cloudflare15-minute dispatcher. The modular Node/browser ESM architecture uses the existing Neon driver and Python/pypdf for PDF extraction. Research uses annual reports and earnings-call transcripts only; model claims retain exact source quotations, document URLs and physical page citations. Gemini is server-side, billing-disabled/free-tier only, with separate Push/Research model pools, cached answers and all-attempt quota accounting.

Push now demonstrates accepted unattended publication: a Polycab disclosure was validated on November3 at14:31 IST and served by repeated production reads with zero new model calls. Routine notices use cited rule excerpts with zero LLM calls. Research includes three recorded primary-source examples (INFY, ASIANPAINT, PERSISTENT), generic NSE discovery and verified HCL/TCS collection. Bounded annual scans explicitly disclose partial coverage; observed HCL/TCS requests took6.48s/5.60s. Questions show a direct source sentence and page link, or a helpful no-match message.

Validation:151/151 automated tests, JavaScript syntax checks, physical-source citation checks, 390 px mobile browser checks and production HTTP checks. The source bundle includes tests, setup instructions and a checksum manifest; credentials, live caches and Python bytecode caches are excluded. Final packaged smoke-check evidence is recorded in docs/VERIFICATION.md.

Limits are explicit: free-provider503s and source availability can delay work; unsupported model output is withheld. Data is EOD, not live trading data, and EOD refresh is manual. Partial annual scans, missing metrics and unknown evidence stay visible. Comparable annual guidance delivery, comprehensive multi-year/OCR research, physical-phone install/offline testing, voice and OS notifications/native packaging remain outside verified scope. The next priorities are sustained-load reliability and broader source/semantic evaluation.

- Prototype: https://finn-zeta-one.vercel.app
- Private reviewer access: [insert existing private reviewer link from the local submission email; never publish its token in Git]
- Source repository: https://github.com/SriAswin2005/finn (private; confirm reviewer access or attach the supplied source archive)
- Source archive: finn-submission.zip, with SHA-256 checksum
- Original AI build history: [insert complete original conversation exports/share links; the existing October 31 snapshot is incomplete for the final build]

Regards,
Aswin

---

## Final handoff checklist

- [x] Working HTTPS deployment and private access gate verified.
- [x] Current151-test/source/production evidence and honest limits reflected above.
- [x] Source build, checksums and packaged smoke verification passed.
- [ ] Complete original AI conversation exports/share links through November3. Existing ignored snapshot stops October31 and is labelled incomplete.
- [ ] Private GitHub reviewer usernames/access if repository browsing is required. No invitations sent.
- [ ] Owner reviews private access/history links and sends the email. Nothing sent automatically.

The current user request authorizes preparation/packaging. It does not authorize sending email, publishing credentials, changing repository visibility or inviting unspecified reviewers. No final demo tag is required to reproduce the provided immutable Git checkpoint.
