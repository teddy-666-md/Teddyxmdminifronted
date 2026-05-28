// frontend/api/index.js — Vercel serverless proxy
module.exports = async (req, res) => {
  const BACKEND = process.env.BACKEND_URL || 'http://localhost:3000';
  const url = BACKEND + req.url.replace('/api', '');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const fetch = (await import('node-fetch')).default;
    const body = req.method !== 'GET' ? JSON.stringify(req.body) : undefined;
    const r = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(60000)
    });
    const text = await r.text();
    res.status(r.status);
    try { res.json(JSON.parse(text)); } catch { res.send(text); }
  } catch (e) {
    res.status(500).json({ error: 'Proxy error: ' + e.message });
  }
};
