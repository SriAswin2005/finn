# Gemini: free-quota-only setup

## November 1 superseding model/allowance configuration

Runtime assignments are in `src/config/model-policy.json`, overridable server-side with `FINN_MODEL_POLICY_JSON`. IDs/roles/thinking levels/provider-reported RPM/TPM/RPD and separate application allocations are data; upgrading a model requires configuration and evaluation, never code edits or archive regeneration. Defaults: Research 3.5 Lite only; ordinary Push 3.1 Lite; complex Push 3.8 Flash. Optional 3.6 can be configured after evaluation. One model cannot belong to both workflows. Research's former 3.1/Flash fallbacks now belong to Push; Gemma default fallback is deliberately disabled pending quality/capacity evaluation. Existing baked notes survive unchanged. Legacy inventory is retained and intersects the Research assignments.

User reported AI Studio November 1: Lite 15 RPM/250k input TPM/500 RPD; Flash 5 RPM/250k input TPM/20 RPD. These are project-reported limits, not invented public allowances. The existing approved local total remains 20 attempts/day, split 10 Research/10 Push (ordinary 6, complex 4), with 4 retries/day; uncertain attempts count. Shared SQLite/Neon ledger must be explicitly initialized/import old local attempts before new calls. Both workflows atomically reserve from it. Missing/corrupt state fails closed. Hosted Research remains disabled; Push hosted activation/credential transfer needs approval.

FINN currently needs ONE Gemini API key only. ChatGPT and Sarvam are not used by this implementation. Create/manage the key through Google's official guide: https://ai.google.dev/gemini-api/docs/api-key

Recommended local setup:

```powershell
cd "C:\E drive\Enam Holdings Assessment"
npm run configure:ai
```

Run in your own normal PowerShell terminal. It confirms billing-disabled-project use, validates the model inventory before requesting a key, and accepts the key without echo. You can paste the full comma-separated list including speech/embedding IDs: these are saved for later workflows and excluded from research. It writes ignored `.env`, preserving unrelated settings, and makes no network/model call. If secure console input is blocked, the command stops before asking for a key. Never pass the key as a command argument or paste it into chat. Restart FINN after saving. A dummy-key smoke test confirmed hidden input outside Codex's restricted Windows console; the test credential was removed.

Manual alternative:

No live model call is made unless a backend key exists AND `FINN_AI_FREE_TIER_CONFIRMED=true`. Use a Gemini API project with billing disabled; FINN cannot inspect or change the project's billing tier. Local limits reduce calls but do not make a billing-enabled project free. Do not enable billing or a paid fallback for this prototype.

1. Copy `.env.example` to `.env` in the project folder.
2. Enter `GEMINI_API_KEY` locally. Never paste it into chat or commit it.
3. Check free access and the active model limits in your AI Studio project.
4. Set `FINN_AI_FREE_TIER_CONFIRMED=true` only after confirming billing is disabled.
5. Set `FINN_GEMINI_MODELS` to your supported model order, then restart `npm start`.

Text candidates are `gemini-3.8-flash`, `gemini-3.6-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-2.5-flash-lite`, `gemma-4-26b-a4b-it` and `gemma-4-31b-it`. Defaults remain the two Flash-Lite models. Inventory accepts up to 40 unique Gemini/Gemma IDs; unverified IDs are saved but disabled, and at least one supported text model is required. Google's 2.5 access caveat still applies. Saving a model does not prove availability in your project. No keys or prompts are returned in errors or logged by FINN.

Narrow business/product/service-description questions try configured Gemma 26B, then configured Flash-Lite models, then Gemma 31B and larger Flash models. General concise research prefers configured Flash-Lite models, then larger Flash, then Gemma. Relative order within each group is preserved. Live checks saw both Gemma models time out and larger Flash return busy/timeout errors; this is not a low-latency guarantee. Gemma uses minimal thinking and prompt JSON rather than assuming native structured-output support. Flash 3.8 uses low thinking; Flash 3.6/3.5 Flash-Lite use minimal. Invalid JSON, truncated finish reasons or failed evidence validation stop without automatic regeneration. One reviewed Flash-Lite INFY note completed in about 6.5 seconds; see AI_REVIEW.md.

## Cost and quota behavior
- No LLM for prices, thresholds, metadata triage, PDF extraction or passage retrieval.
- Only an explicit **Generate cited AI note** action makes a model request.
- Evidence is bounded to 14 short chunks. The backend builds an exact quote bank; the model selects short quote IDs, and the server resolves original text/page references. Output, including internal thinking, is capped at 3,200 tokens. Tools, search grounding and file uploads are disabled.
- Cache key includes evidence/document hashes, question, prompt version and ordered model list. Identical requests reuse the result, including across restarts.
- A single model generation is active at once; identical concurrent requests share it.
- Durable local ledger reserves allowance before each call, including failures. Defaults: 20 total attempts in a rolling 24 hours; per model 20/day, 5/hour and no repeat within one minute. These are conservative LOCAL caps, not a claim about your actual quota.
- At most three distinct text attempts per request; each network/body attempt times out within 20 seconds and the shared network budget is 45 seconds. Busy servers, transport failures/timeouts, missing models and model-specific 429 errors can fall back. Transport failures also reserve quota and cool that model for one minute. Respect numeric/date Retry-After and structured RetryInfo delays. A project-level/ambiguous 429 persists a project-wide cooldown across requests and server restarts. Never rotate around that cooldown or an authentication/configuration failure. Never retry malformed output or failed citations automatically.
- No cross-provider or paid fallback. When allowance is unavailable, primary evidence stays usable.
- Only public company excerpts are sent to Google. User-entered research questions are also included; do not put private portfolio/account information in them.

## Grounding limits
Structured output requires claims and source quote IDs. The backend resolves those IDs to preselected exact quotes, then checks evidence membership and that claim numbers appear in the selected quotes. Unknown IDs, unsupported numbers and truncated output are rejected. This does not prove semantic entailment, currency correctness or a fair comparison. UI labels AI interpretation, links physical PDF pages and explicitly says guidance delivery is not verified. Never market a verified JSON/citation shape as a verified investment conclusion.

## Official references checked October 28, 2026
- Rate limits, including project-level limits and midnight-Pacific daily resets: https://ai.google.dev/gemini-api/docs/rate-limits
- Free-tier availability/pricing: https://ai.google.dev/gemini-api/docs/pricing
- Model access caveat: https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-lite
- REST structured output: https://ai.google.dev/gemini-api/docs/generate-content/structured-output
- Gemma hosted model IDs and minimal thinking: https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api
- Model-specific thinking levels: https://ai.google.dev/gemini-api/docs/thinking

Actual model access/quotas must be confirmed in your project. Do not assume the example counts are current provider allowances.

## If Google rejects the key
Successful local setup confirms that settings were saved, not that Google accepted them. On October 28, the saved key was rejected with HTTP 400 and `API key not valid` by both generation and model-list metadata. Rerun `npm run configure:ai`, preserve your model list, confirm the existing settings update, and enter a valid Gemini API key from your billing-disabled AI Studio project. Restart FINN afterward. Do not paste the key into chat. FINN stops on credential errors rather than rotating models.

To load changed settings, press Ctrl+C in the terminal running FINN, then run `npm start`. `npm restart` does not stop a server started in another terminal; attempting it while that server owns port 3000 produces EADDRINUSE. Do not stop unrelated Node processes. The stale FINN server was identified and replaced locally after the user's port conflict; the new process reports AI configured, but Google's metadata endpoint still rejects the saved key. No additional generation was attempted.

Resolved later October 28: after manual `.env` editing, Google's metadata endpoint returned HTTP 200 and listed all configured models. A real INFY note and its browser cache reuse are now verified. The original invalid-key cause was not established; do not assume the original key copied by the user was invalid.
