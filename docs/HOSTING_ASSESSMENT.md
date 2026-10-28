# Free hosting assessment

Checked October 28, 2026 against official provider documentation. Assessment only: no account created, integration authorized, app published, secret uploaded or payment added.

FINN needs one Node HTTP process plus Python/pypdf, outbound HTTPS for sources/Gemini, and writable storage for document caches and the AI quota ledger. The existing Dockerfile keeps that runtime together. Its image is prepared but not yet built/verified in Docker; the local Node release is verified.

| Option | Current offer and limitations | FINN decision |
| --- | --- | --- |
| Railway trial | $5 credit for up to 30 days, then $1 monthly Free-plan credit. Full outbound access depends on automated account verification; limited trials restrict networking. | Preferred candidate for the complete assessment demo if eligible. Credits are finite; do not assume always-on operation remains free. [Trial documentation](https://docs.railway.com/pricing/free-trial). |
| Railway storage | Free/Trial volumes support 0.5 GB; volume usage is metered. | Can retain the existing file-based quota ledger/cache across deployments, avoiding a new database. Keep cache within capacity and verify mounted-volume write permissions. [Volume reference](https://docs.railway.com/volumes/reference). |
| Render Free | 750 shared instance-hours/month, sleeps after 15 idle minutes, roughly one-minute wake-up. Local files are lost on sleep/restart/deploy; no free persistent disk. | Good fallback for the recorded-source demo. Live AI needs durable quota storage before enabling a hosted key. Private GitHub/Docker deployment is supported. [Free limits](https://render.com/docs/free), [deployment guide](https://render.com/docs/your-first-deploy). |
| Koyeb Free | One 512-MB/0.1-vCPU instance, no volume, scales to zero after one idle hour. Signup documentation describes card verification and paid-plan selection. | Lower priority: weak PDF-processing resources and no durable local ledger, with payment onboarding to examine carefully. [Instance limits](https://www.koyeb.com/docs/reference/instances), [billing FAQ](https://www.koyeb.com/docs/faqs/pricing). |
| Hugging Face Spaces | CPU Basic has no hourly cost, but creating a Docker/Gradio compute Space requires a paid plan; static Spaces remain free. | Not a new-account free backend choice for this app. [Spaces overview](https://huggingface.co/docs/hub/spaces-overview). |

Recommendation is an engineering inference from those constraints: try Railway eligibility first for a reviewer demo with live AI; keep Render as the fallback for an explicitly limited free demo. No paid upgrade is authorized. Actual dashboard eligibility, resource estimates and limits must be checked before deployment.

Proposed deployment, subject to approval:

1. Use only the private `SriAswin2005/finn` repository, master branch. Authorize the selected host for that repository rather than unrelated repositories. Railway can build a repository Dockerfile directly; a private container registry is unnecessary. [Service builds](https://docs.railway.com/services).
2. Deploy one instance with `HOST=0.0.0.0` and the host's `PORT`. Initially omit Gemini secrets. On Railway mount the persistent volume at `/app/data/cache`; verify write access for the container's node user, restart persistence and available space.
3. Verify Docker/Python startup, recorded briefing and all three research examples, then hosted source access and cold document retrieval. Generate the HTTPS URL and test phone installation/offline recovery.
4. Before enabling hosted Gemini, approve and implement reviewer access control and confirm the quota ledger survives restart. A private source repository does not restrict access to the website. Upload the key only as an approved server-side host secret; retain the billing-disabled Gemini project and current call caps.
5. Verify a single source-backed AI note, restart/cache behavior and credit usage. Keep an export of public source data and a local release backup. Trial credits and storage are not indefinite availability guarantees.

No host is selected or approved yet. Next user decision: Railway trial eligibility check versus Render's limited free demo, followed by deployment audience/access approval. Account terms, payment prompts and broader GitHub permissions must be handled explicitly rather than accepted as part of this assessment.
