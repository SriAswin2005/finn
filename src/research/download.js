import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { SourceError } from '../providers/http.js';

export function isPublicAddress(ip) {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19)));
  }
  // Reject mapped IPv4, loopback, link-local, unique-local and special IPv6 ranges.
  return isIP(ip) === 6 && /^[23][0-9a-f]{3}:/i.test(ip) && !ip.toLowerCase().startsWith('2001:db8:');
}
export async function publicUrl(value, resolveHost = lookup) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || (url.port && url.port !== '443') || url.username || url.password || isIP(url.hostname) || !url.hostname.includes('.')) throw new SourceError('Only public HTTPS document URLs are allowed.');
  const addresses = await resolveHost(url.hostname, { all: true });
  if (!addresses.length || addresses.some(record => !isPublicAddress(record.address))) throw new SourceError('The document host is not a public address.');
  return url;
}

export async function downloadPublic(value, { maxBytes = 25_000_000, timeoutMs = 20000, fetchImpl = fetch, resolveHost = lookup } = {}) {
  let url = await publicUrl(value, resolveHost);
  const signal = AbortSignal.timeout(timeoutMs);
  for (let redirect = 0; redirect <= 3; redirect++) {
    const response = await fetchImpl(url, { signal, redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FINNPrototype/0.3)', Accept: 'application/pdf,text/html;q=0.9' } });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get('location');
      if (!location || redirect === 3) throw new SourceError('Document redirect limit exceeded.');
      url = await publicUrl(new URL(location, url).href, resolveHost); continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw new SourceError(`Document source returned HTTP ${response.status}.`); }
    const reader = response.body.getReader(); const chunks = []; let size = 0;
    try {
      if (Number(response.headers.get('content-length')) > maxBytes) { await reader.cancel(); throw new SourceError('Document exceeds the size limit.'); }
      for (;;) {
        const { done, value: chunk } = await reader.read(); if (done) break;
        size += chunk.byteLength;
        if (size > maxBytes) { await reader.cancel(); throw new SourceError('Document exceeds the size limit.'); }
        chunks.push(chunk);
      }
    } finally { reader.releaseLock(); }
    return { bytes: Buffer.concat(chunks), url: url.href };
  }
}
