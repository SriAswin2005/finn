import { createHmac } from 'node:crypto';

export async function collectRemoteDocument(source, fetchedAt, { env = process.env, fetchImpl = fetch, now = Date.now } = {}) {
  if (!env.FINN_PARSER_SECRET || !env.VERCEL_URL) throw new Error('Hosted PDF extraction is not configured. Recorded evidence remains available.');
  const body = JSON.stringify({ url: source.url, expires: Math.floor(now() / 1000) + 90, maxBytes: source.kind === 'annual_report' ? 50_000_000 : 25_000_000 });
  const signature = createHmac('sha256', env.FINN_PARSER_SECRET).update(body).digest('hex');
  // Deployment URLs can require Vercel login; the production alias uses our own gate.
  const hostname = env.VERCEL_PROJECT_PRODUCTION_URL ?? env.VERCEL_URL;
  const response = await fetchImpl(`https://${hostname}/api/parse`, {
    method: 'POST', signal: AbortSignal.timeout(65000),
    headers: { 'Content-Type': 'application/json', 'x-finn-parser-signature': signature,
      ...(env.VERCEL_AUTOMATION_BYPASS_SECRET ? { 'x-vercel-protection-bypass': env.VERCEL_AUTOMATION_BYPASS_SECRET } : {}) }, body,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error ?? 'Hosted PDF extraction is unavailable.');
  if (!/^[a-f0-9]{64}$/.test(result?.sha256 ?? '') || !Array.isArray(result.pages) || !result.pages.length || result.pages.some((page, index) => page.page !== index + 1 || typeof page.text !== 'string')) throw new Error('Hosted PDF extraction returned invalid page data.');
  return { ...source, url: result.url, discoveredUrl: source.url, fetchedAt, id: result.sha256.slice(0, 16), sha256: result.sha256, parser: result.parser, pages: result.pages, pageCount: result.pages.length };
}
