# Build decisions

## October 28, 2026 — M0 and M1
- Read both supplied challenge PDFs in full; rendered all seven pages for layout/context inspection.
- Verified the user's installed tools; selected Node built-ins and browser modules to avoid installation and framework overhead.
- Established product scope, project instructions, architecture boundaries and milestone gates in an initial Git commit.
- Built one complete push workflow with explicitly fictional data. Separating provider, domain, HTTP and presentation keeps the live-source migration bounded.
- Chose fixed demo timestamps so filtering stays reproducible after the challenge date. Windows retain all announcements; priority determines order and only routine categories are collapsed.
- Kept API responses network-only. The PWA shell can open offline, but a failed data request cannot look like fresh market information.
- Verified domain/HTTP behavior and desktop/mobile UI interactions, including server failure and recovery. See VERIFICATION.md for evidence and limits.
- Next iteration: verify real EOD and exchange-announcement access, then implement one provider-to-UI source path before adding research.

This log records decisions only. Preserve the original AI chat exports/share links separately for the required build-history submission.
