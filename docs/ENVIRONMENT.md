# Environment verification — October 28, 2026

Windows / PowerShell. Workspace: C:\E drive\Enam Holdings Assessment.

| Tool | Verified | Location |
| --- | --- | --- |
| Node | 24.16.0 | C:\Program Files\nodejs\node.exe |
| npm | 11.13.0 | C:\Program Files\nodejs\npm.ps1 |
| Python | 3.12.10 | C:\Users\aswin\AppData\Local\Programs\Python\Python312\python.exe |
| Git | 2.53.0.windows.2 | C:\Program Files\Git\cmd\git.exe |

The initial folder held the two challenge PDFs, with no source tree or Git repository. Git author name/email are already configured. Node built-ins are sufficient for M1; no npm install, Python environment or API key is needed to run it. Python/Poppler supplied by the Codex runtime are used only to inspect the PDFs and generate icon assets. Browser QA tooling is also supplied by the runtime and is not an application dependency.

M2 verified public Yahoo chart and NSE corporate-announcement HTTPS access, plus a real NSE filing PDF. Codex requires approved execution outside the sandbox for outbound DNS/HTTPS and loopback HTTP; the user's normal terminal is not subject to that Codex sandbox policy. No application dependency or API credential was required.

Model credentials, deployment account, GitHub remote and physical-phone installation are not yet verified. These are later integration gates, not evidence of blockers. Localhost is a secure context for PWA development; opening a plain HTTP LAN address on a phone does not provide the same installation/service-worker support.
