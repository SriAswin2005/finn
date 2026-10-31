import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const cookieName = '__Host-finn';
const digest = value => createHash('sha256').update(value).digest();
const equal = (left, right) => timingSafeEqual(digest(left), digest(right));

// One shared reviewer credential; no user accounts or durable session database.
export function createAccessGate({ token = process.env.FINN_ACCESS_TOKEN, required = process.env.FINN_REQUIRE_ACCESS_TOKEN === 'true' || Boolean(process.env.RAILWAY_ENVIRONMENT), now = Date.now } = {}) {
  if (!token && required) throw new Error('Set FINN_ACCESS_TOKEN before starting the hosted reviewer demo.');
  if (token && token.length < 32) throw new Error('FINN_ACCESS_TOKEN must contain at least 32 characters.');
  const signature = expiry => createHmac('sha256', token).update(`finn-reviewer:${expiry}`).digest('base64url');
  return (req, res, url) => {
    if (!token || url.pathname === '/api/health') return true;
    res.setHeader('Cache-Control', 'no-store');
    if (url.searchParams.has('key')) {
      const supplied = url.searchParams.get('key');
      url.searchParams.delete('key');
      if (!equal(supplied, token)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Reviewer link is invalid. Ask the owner for a current FINN link.'); return false;
      }
      const expiry = String(Math.floor(now() / 1000) + 86400);
      res.writeHead(303, {
        'Set-Cookie': `${cookieName}=${expiry}.${signature(expiry)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
        Location: `${url.pathname}${url.search}${url.hash}`,
      });
      res.end(); return false;
    }
    const cookie = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    const [expiry, signed, extra] = (cookie ?? '').split('.');
    if (!extra && /^\d{10}$/.test(expiry ?? '') && Number(expiry) > Math.floor(now() / 1000) && Number(expiry) <= Math.floor(now() / 1000) + 86400 && signed && equal(signed, signature(expiry))) return true;
    res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('FINN reviewer access is required. Open the private reviewer link supplied by the owner.');
    return false;
  };
}
