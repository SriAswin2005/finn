import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { buildBriefing } from './domain/briefing.js';
import { getDataset, DatasetUnavailable } from './providers/snapshot.js';
import { getResearch, ResearchUnavailable } from './research/service.js';
import { createGeminiProvider, AiUnavailable } from './ai/gemini.js';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const assets = new Set(['/index.html', '/styles.css', '/app.js', '/research.js', '/sw.js', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png']);
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

export function createAppServer({ datasetProvider = getDataset, researchProvider = getResearch, aiProvider = createGeminiProvider() } = {}) {
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    const researchPost = req.method === 'POST' && req.url === '/api/research/analysis';
    if (req.method !== 'GET' && req.method !== 'HEAD' && !researchPost) {
      res.setHeader('Allow', 'GET, HEAD');
      return json(res, 405, { error: 'Method not allowed.' });
    }
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api/research' || researchPost) {
        try {
          let ticker = url.searchParams.get('ticker'); let question = url.searchParams.get('question') ?? '';
          if (researchPost) {
            if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'Use application/json.' });
            if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) return json(res, 403, { error: 'Cross-origin generation is not allowed.' });
            const chunks = []; let size = 0;
            for await (const chunk of req) { size += chunk.length; if (size > 2048) return json(res, 413, { error: 'Request too large.' }); chunks.push(chunk); }
            const payload = Buffer.concat(chunks).toString('utf8');
            try { const body = JSON.parse(payload); ticker = body.ticker; question = body.question ?? ''; }
            catch { return json(res, 400, { error: 'Invalid JSON.' }); }
          }
          const research = await researchProvider(ticker, question);
          return json(res, 200, researchPost ? await aiProvider.generate(research) : research);
        } catch (error) {
          if (error instanceof RangeError) return json(res, 400, { error: error.message });
          if (error instanceof ResearchUnavailable || error instanceof AiUnavailable) return json(res, 503, { error: error.message });
          throw error;
        }
      }
      if (url.pathname === '/api/health') return json(res, 200, { ok: true, modes: ['live', 'recorded', 'demo'] });
      if (url.pathname === '/api/briefing') {
        try {
          const options = {
            hours: Number(url.searchParams.get('hours') ?? 24),
            priceThreshold: Number(url.searchParams.get('price') ?? 3),
            volumeThreshold: Number(url.searchParams.get('volume') ?? 2),
          };
          // Validate inexpensive inputs before reading snapshots.
          buildBriefing({ asOf: new Date().toISOString(), portfolio: [], announcements: [] }, options);
          const dataset = await datasetProvider(url.searchParams.get('mode') ?? 'live');
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
  });
}

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
