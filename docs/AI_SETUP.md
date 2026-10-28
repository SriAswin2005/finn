# Gemini: free-quota-only setup

FINN currently needs ONE Gemini API key only. ChatGPT and Sarvam are not used by this implementation. Create/manage the key through Google's official guide: https://ai.google.dev/gemini-api/docs/api-key

Recommended local setup:

```powershell
cd "C:\E drive\Enam Holdings Assessment"
npm run configure:ai
```

Run in your own normal PowerShell terminal. It confirms billing-disabled-project use, asks which supported models are available, and accepts the key without echo. It writes ignored `.env`, preserving unrelated settings, and makes no network/model call. If secure console input is blocked, the command stops before asking for a key. Never pass the key as a command argument or paste it into chat. Restart FINN after saving. A dummy-key smoke test confirmed hidden input outside Codex's restricted Windows console; the test credential was removed.

Manual alternative:

No live model call is made unless a backend key exists AND `FINN_AI_FREE_TIER_CONFIRMED=true`. Use a Gemini API project with billing disabled; FINN cannot inspect or change the project's billing tier. Local limits reduce calls but do not make a billing-enabled project free. Do not enable billing or a paid fallback for this prototype.

1. Copy `.env.example` to `.env` in the project folder.
2. Enter `GEMINI_API_KEY` locally. Never paste it into chat or commit it.
3. Check free access and the active model limits in your AI Studio project.
4. Set `FINN_AI_FREE_TIER_CONFIRMED=true` only after confirming billing is disabled.
5. Set `FINN_GEMINI_MODELS` to your supported model order, then restart `npm start`.

The current configurable allowlist is `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, and `gemini-2.5-flash-lite`. Defaults use the first two. Google's current 2.5 model page limits access to existing active users, so a new project should not assume 2.5 availability. Check before changing the list. No keys or prompts are returned in errors or logged by FINN.

## Cost and quota behavior
- No LLM for prices, thresholds, metadata triage, PDF extraction or passage retrieval.
- Only an explicit **Generate cited AI note** action makes a model request.
- Evidence is bounded to 14 short chunks; output is capped at 2,200 tokens. Tools, search grounding and file uploads are disabled.
- Cache key includes evidence/document hashes, question, prompt version and ordered model list. Identical requests reuse the result, including across restarts.
- A single model generation is active at once; identical concurrent requests share it.
- Durable local ledger reserves allowance before each call, including failures. Defaults: 20 total attempts in a rolling 24 hours; per model 20/day, 5/hour and no repeat within one minute. These are conservative LOCAL caps, not a claim about your actual quota.
- Try the next configured model only on model-specific 429 quota errors, missing model or server unavailability. Respect numeric/date Retry-After and structured RetryInfo delays. A project-level/ambiguous 429 persists a project-wide cooldown across requests and server restarts. Never rotate around that cooldown or an authentication failure. Never retry malformed output or failed citations automatically.
- No cross-provider or paid fallback. When allowance is unavailable, primary evidence stays usable.
- Only public company excerpts are sent to Google. User-entered research questions are also included; do not put private portfolio/account information in them.

## Grounding limits
Structured output requires claims, evidence IDs and exact supporting quotes. The backend checks cited IDs, quote membership and that claim numbers appear in the quoted evidence; unsupported numeric claims are rejected. This does not prove semantic entailment, currency correctness or a fair comparison. UI labels AI interpretation and links physical PDF pages for verification. Never market a verified JSON/citation shape as a verified investment conclusion.

## Official references checked October 28, 2026
- Rate limits, including project-level limits and midnight-Pacific daily resets: https://ai.google.dev/gemini-api/docs/rate-limits
- Free-tier availability/pricing: https://ai.google.dev/gemini-api/docs/pricing
- Model access caveat: https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-lite
- REST structured output: https://ai.google.dev/gemini-api/docs/generate-content/structured-output

Actual model access/quotas must be confirmed in your project. Do not assume the example counts are current provider allowances.
