// Tiny dispatcher only. No Gemini/Neon credentials leave Vercel.
export default {
  async scheduled(controller, env) {
    const target = new URL(env.FINN_ORIGIN);
    if (target.protocol !== 'https:' || target.hostname !== 'finn-zeta-one.vercel.app') throw new Error('Configure the approved FINN origin.');
    const body = JSON.stringify({ expires: Math.floor(Date.now() / 1000) + 90, runId: crypto.randomUUID() });
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.FINN_PUSH_WORKER_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`push-worker\n${body}`));
    const signature = [...new Uint8Array(bytes)].map(n => n.toString(16).padStart(2, '0')).join('');
    const response = await fetch(new URL('/api/push/worker', target), { method: 'POST', headers: { 'content-type': 'application/json', 'x-finn-worker-signature': signature }, body, signal: AbortSignal.timeout(230000) });
    if (!response.ok) throw new Error(`FINN worker HTTP ${response.status}; next scheduled tick resumes durable work.`);
    await response.arrayBuffer(); // Await the entire bounded invocation, never fire-and-forget.
  },
};
