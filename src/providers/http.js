import { setTimeout as delay } from 'node:timers/promises';

export class SourceError extends Error {
  constructor(message, { status, retryable = false } = {}) {
    super(message); this.name = 'SourceError'; this.status = status; this.retryable = retryable;
  }
}

// Public read-only sources only. Callers construct URLs, never accept user URLs.
async function fetchSource(url, { fetchImpl = fetch, timeoutMs = 10000, maxBytes = 5_000_000, retries = 1, wait = delay, accept = 'application/json' } = {}, parse = JSON.parse) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetchImpl(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FINNPrototype/0.3)', Accept: accept, Referer: new URL(url).origin + '/' },
        signal: AbortSignal.timeout(timeoutMs), redirect: 'error',
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw new SourceError(`Source returned HTTP ${response.status}.`, { status: response.status, retryable: response.status === 429 || response.status >= 500 });
      }
      if (Number(response.headers.get('content-length')) > maxBytes) {
        await response.body?.cancel(); throw new SourceError('Source response exceeded the size limit.');
      }
      const reader = response.body.getReader();
      const chunks = []; let bytes = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > maxBytes) { await reader.cancel(); throw new SourceError('Source response exceeded the size limit.'); }
          chunks.push(value);
        }
      } finally { reader.releaseLock(); }
      try { return parse(Buffer.concat(chunks).toString('utf8')); }
      catch { throw new SourceError('Source did not return valid JSON.'); }
    } catch (error) {
      const problem = error instanceof SourceError ? error : new SourceError(`Source connection failed (${error.cause?.code ?? error.name}).`, { retryable: true });
      if (attempt >= retries || !problem.retryable) throw problem;
      await wait(500 * (attempt + 1));
    }
  }
}
export const fetchJson = (url, options) => fetchSource(url, options);
export const fetchText = (url, options = {}) => fetchSource(url, { ...options, accept: 'text/csv' }, text => text);
