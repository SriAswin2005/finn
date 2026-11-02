import { createHmac } from 'node:crypto';

export async function collectRemoteDocument(source, fetchedAt, { env = process.env, fetchImpl = fetch, now = Date.now } = {}) {
  if (!env.FINN_PARSER_SECRET || !env.VERCEL_URL) throw new Error('Hosted PDF extraction is not configured. Recorded evidence remains available.');
  const body = JSON.stringify({ url: source.url, kind: source.kind, ...(source.targetPages ? { targetPages: source.targetPages } : {}), expires: Math.floor(now() / 1000) + 90, maxBytes: source.kind === 'annual_report' ? 50_000_000 : 25_000_000 });
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
  const total = result?.pageCount ?? result?.pages?.length;
  if (!/^[a-f0-9]{64}$/.test(result?.sha256 ?? '') || !Number.isInteger(total) || total < 1 || total > 800 || !Array.isArray(result.pages) || !result.pages.length
    || result.pages.some((page, index) => !Number.isInteger(page.page) || page.page < 1 || page.page > total || typeof page.text !== 'string'
      || (result.partialScan === true ? index > 0 && page.page <= result.pages[index - 1].page : page.page !== index + 1))
    || result.partialScan !== true && result.pages.length !== total
    || result.scannedPageCount !== undefined && result.scannedPageCount !== result.pages.length) throw new Error('Hosted PDF extraction returned invalid page data.');
  return { ...source, url: result.url, discoveredUrl: source.url, fetchedAt, id: result.sha256.slice(0, 16), sha256: result.sha256, parser: result.parser, pages: result.pages, pageCount: total,
    partialScan: result.partialScan === true, scannedPageCount: result.pages.length, scanSelection: result.scanSelection ?? null, scanLimitedByTime: result.scanLimitedByTime === true };
}
