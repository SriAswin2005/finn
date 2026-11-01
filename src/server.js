import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { buildBriefing } from './domain/briefing.js';
import { getDataset, DatasetUnavailable } from './providers/snapshot.js';
import { getResearch, ResearchUnavailable } from './research/service.js';
import { createGeminiProvider, AiUnavailable } from './ai/gemini.js';
import { createAccessGate } from './access.js';
import { refusalExample } from './ai/refusal.js';
import { createPushService, workerAuthorized } from './push/service.js';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const assets = new Set(['/index.html', '/styles.css', '/app.js', '/research.js', '/push.js', '/sw.js', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png']);
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

export function createRequestHandler({ datasetProvider = getDataset, researchProvider = getResearch, aiProvider = createGeminiProvider(), accessGate = createAccessGate(), pushService = createPushService(), env = process.env } = {}) {
  return async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    let url;
    try { url = new URL(req.url, 'http://localhost'); } catch { return json(res, 400, { error: 'Invalid request URL.' }); }
    if (url.pathname === '/api/push/worker') {
      if (req.method !== 'POST') return json(res, 405, { error: 'Signed POST required.' });
      const chunks = []; let size = 0;
      if (req.body !== undefined) chunks.push(Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body)));
      else for await (const chunk of req) { size += chunk.length; if (size > 1024) return json(res, 413, { error: 'Worker body too large.' }); chunks.push(chunk); }
      if (!workerAuthorized(Buffer.concat(chunks).toString('utf8'), req.headers['x-finn-worker-signature'], env.FINN_PUSH_WORKER_SECRET)) return json(res, 403, { error: 'Worker authorization required.' });
      try { return json(res, 200, await pushService.tick()); } catch { return json(res, 503, { error: 'Push worker failed; durable work is retained for recovery.' }); }
    }
    if (!accessGate(req, res, url)) return;
    const researchPost = req.method === 'POST' && url.pathname === '/api/research/analysis';
    const refreshPost = req.method === 'POST' && url.pathname === '/api/push/refresh';
    if (req.method !== 'GET' && req.method !== 'HEAD' && !researchPost && !refreshPost) {
      res.setHeader('Allow', 'GET, HEAD');
      return json(res, 405, { error: 'Method not allowed.' });
    }
    try {
      if (url.pathname === '/api/push/status' || refreshPost) {
        if (refreshPost && req.headers.origin && ![`http://${req.headers.host}`, `https://${req.headers.host}`].includes(req.headers.origin)) return json(res, 403, { error: 'Cross-origin refresh is not allowed.' });
        try { return json(res, 200, refreshPost ? await pushService.refresh() : await pushService.status()); }
        catch { return json(res, 503, { error: 'Automatic collection is unavailable. Existing saved briefings remain readable.', llmCalls: 0 }); }
      }
      if (url.pathname === '/api/research' || researchPost) {
        try {
          let ticker = url.searchParams.get('ticker'); let question = url.searchParams.get('question') ?? '';
          if (researchPost) {
            if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'Use application/json.' });
            if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) return json(res, 403, { error: 'Cross-origin generation is not allowed.' });
            const chunks = []; let size = 0;
            if (req.body !== undefined) {
              const content = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
              if (Buffer.byteLength(content) > 2048) return json(res, 413, { error: 'Request too large.' });
              chunks.push(Buffer.from(content));
            } else for await (const chunk of req) { size += chunk.length; if (size > 2048) return json(res, 413, { error: 'Request too large.' }); chunks.push(chunk); }
            const payload = Buffer.concat(chunks).toString('utf8');
            try { const body = JSON.parse(payload); ticker = body.ticker; question = body.question ?? ''; }
            catch { return json(res, 400, { error: 'Invalid JSON.' }); }
          }
          const research = await researchProvider(ticker, question);
          if (researchPost) return json(res, 200, await aiProvider.generate(research));
          const analysis = aiProvider.getCached ? await aiProvider.getCached(research) : null;
          return json(res, 200, { ...research, analysis, ai: { ...research.ai, configured: aiProvider.enabled ?? research.ai.configured } });
        } catch (error) {
          if (error instanceof RangeError) return json(res, 400, { error: error.message });
          if (error instanceof ResearchUnavailable || error instanceof AiUnavailable) return json(res, 503, { error: error.message });
          throw error;
        }
      }
      if (url.pathname === '/api/health') return json(res, 200, { ok: true, modes: ['live', 'recorded', 'demo'] });
      if (url.pathname === '/api/validation-example') return json(res, 200, refusalExample());
      if (url.pathname === '/api/briefing') {
        try {
          const options = {
            hours: Number(url.searchParams.get('hours') ?? 24),
            priceThreshold: Number(url.searchParams.get('price') ?? 3),
            volumeThreshold: Number(url.searchParams.get('volume') ?? 2),
          };
          // Validate inexpensive inputs before reading snapshots.
          buildBriefing({ asOf: new Date().toISOString(), portfolio: [], announcements: [] }, options);
          let dataset = await datasetProvider(url.searchParams.get('mode') ?? 'live');
          if (dataset.mode === 'live') dataset = await pushService.decorate(dataset);
          return json(res, 200, buildBriefing(dataset, options));
        } catch (error) {
          if (error instanceof RangeError) return json(res, 400, { error: error.message });
          if (error instanceof DatasetUnavailable) return json(res, 503, { error: error.message });
          throw error;
        }
      }
      const path = url.pathname === '/' ? '/index.html' : url.pathname;
      if (!assets.has(path)) return json(res, 404, { error: 'Not found.' });
      const content = await readFile(resolve(publicDir, `.${path}`));
      res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      console.error('Request failed:', error.message);
      json(res, 500, { error: 'Unable to load FINN. Please retry.' });
    }
  };
}

export function createAppServer(options = {}) { return createServer(createRequestHandler(options)); }

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '127.0.0.1';
  const server = createAppServer();
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE'
      ? `FINN could not start: ${host}:${port} is already in use. Stop the earlier FINN server with Ctrl+C in its terminal, then run npm start. npm restart cannot stop a server running in another terminal.`
      : `FINN could not start: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, host, () => console.log(`FINN ready at http://${host}:${server.address().port} (live snapshot / recorded / demo modes)`));
}
