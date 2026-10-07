import { get, put } from '@vercel/blob';

/* Multi-receipt cloud backup for the ALSSAEDY CLINIC app.
   Keyed by an arbitrary "clinic key" so devices sharing the key share data.
   Uses optimistic concurrency (baseVersion) to surface conflicts. */

const MAX_BODY = 25 * 1024 * 1024;

function keyHash(key) {
  // Non-cryptographic hash is enough to derive a stable blob path.
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function keyFrom(req) {
  return (new URL(req.url, `https://${req.headers?.host || 'localhost'}`).searchParams.get('key') || '').trim();
}

function pathFor(key) {
  return 'sync/clinic-' + keyHash(key) + '.json';
}

async function readRecord(path) {
  try {
    const result = await get(path, { access: 'private', token: process.env.BLOB_READ_WRITE_TOKEN, useCache: false });
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
    const key = keyFrom(req);
    if (key.length < 6 || key.length > 200) return res.status(400).json({ error: 'invalid_key' });
    const path = pathFor(key);

    if (req.method === 'GET') {
      const record = await readRecord(path);
      return res.status(200).json({ found: Boolean(record), record: record || null });
    }

    if (req.method !== 'PUT') {
      res.setHeader('Allow', 'GET, PUT');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || !body.payload || typeof body.payload !== 'object') {
      return res.status(400).json({ error: 'invalid_payload' });
    }
    if (JSON.stringify(body.payload).length > MAX_BODY) return res.status(413).json({ error: 'payload_too_large' });

    const current = await readRecord(path);
    const currentVersion = Number(current?.version || 0);
    const baseVersion = Number(body.baseVersion || 0);
    if (current && baseVersion !== currentVersion) {
      return res.status(409).json({ error: 'sync_conflict', record: current });
    }

    const record = {
      version: currentVersion + 1,
      updatedAt: body.updatedAt || new Date().toISOString(),
      clientId: String(body.clientId || 'unknown').slice(0, 120),
      payload: body.payload
    };
    await put(path, JSON.stringify(record), {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json'
    });
    return res.status(200).json({ ok: true, record });
  } catch (error) {
    console.error('clinic sync error', error);
    return res.status(500).json({ error: 'sync_failed', message: error?.message || 'Unknown error' });
  }
}
