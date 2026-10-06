import { get, put } from '@vercel/blob';

const PATH = 'sync/latest-receipt.json';
const MAX_BODY = 1200000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

async function readLatest() {
  try {
    const result = await get(PATH, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      useCache: false
    });
    if (!result?.stream) return null;
    const raw = await new Response(result.stream).text();
    return JSON.parse(raw);
  } catch (error) {
    if (error?.status === 404 || /not found|404/i.test(String(error?.message || ''))) return null;
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const current = await readLatest();
      return res.status(200).json({ found: Boolean(current), record: current || null });
    }

    if (req.method !== 'PUT') {
      res.setHeader('Allow', 'GET, PUT');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || !body.state || typeof body.state !== 'object') {
      return res.status(400).json({ error: 'Invalid sync payload' });
    }

    const payloadSize = JSON.stringify(body.state).length;
    if (payloadSize > MAX_BODY) return res.status(413).json({ error: 'Receipt state is too large' });

    const current = await readLatest();
    const baseVersion = Number.isInteger(body.baseVersion) ? body.baseVersion : 0;
    const currentVersion = Number(current?.version || 0);

    if (current && baseVersion !== currentVersion) {
      return res.status(409).json({ error: 'sync_conflict', record: current });
    }

    const record = {
      version: currentVersion + 1,
      updatedAt: new Date().toISOString(),
      clientId: String(body.clientId || 'unknown').slice(0, 120),
      state: body.state
    };

    await put(PATH, JSON.stringify(record), {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json'
    });

    return res.status(200).json({ ok: true, record });
  } catch (error) {
    console.error('sync error', error);
    return res.status(500).json({ error: 'sync_failed', message: error?.message || 'Unknown error' });
  }
}
