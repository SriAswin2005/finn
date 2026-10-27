import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { buildBriefing } from './domain/briefing.js';
import { getDemoDataset } from './providers/demo.js';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const assets = new Set(['/index.html', '/styles.css', '/app.js', '/sw.js', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png']);
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

export function createAppServer() {
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      return json(res, 405, { error: 'Method not allowed.' });
    }
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api/health') return json(res, 200, { ok: true, mode: 'demo' });
      if (url.pathname === '/api/briefing') {
        try {
          const options = {
            hours: Number(url.searchParams.get('hours') ?? 24),
            priceThreshold: Number(url.searchParams.get('price') ?? 3),
            volumeThreshold: Number(url.searchParams.get('volume') ?? 2),
          };
          return json(res, 200, buildBriefing(getDemoDataset(), options));
        } catch (error) {
          if (error instanceof RangeError) return json(res, 400, { error: error.message });
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
  server.on('error', error => { console.error(`FINN could not start: ${error.message}`); process.exitCode = 1; });
  server.listen(port, host, () => console.log(`FINN ready at http://${host}:${server.address().port} (demo data)`));
}
