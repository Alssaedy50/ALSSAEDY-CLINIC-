import { createHash } from 'node:crypto';
import { get, put } from '@vercel/blob';

/* Multi-receipt cloud backup for the ALSSAEDY CLINIC app.
   Keyed by an arbitrary "clinic key" so devices sharing the key share data.
   Uses optimistic concurrency (baseVersion) to surface conflicts. */

const MAX_BODY = 25 * 1024 * 1024;

function legacyKeyHash(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
function pathFor(key) { return 'sync/clinic-' + createHash('sha256').update(key, 'utf8').digest('hex') + '.json'; }
function legacyPathFor(key) { return 'sync/clinic-' + legacyKeyHash(key) + '.json'; }

function keyFrom(req) {
  const auth = String(req.headers?.authorization || '').trim();
  if (/^Bearer\\s+/i.test(auth)) return auth.replace(/^Bearer\\s+/i, '').trim();
  return String(req.headers?.['x-clinic-key'] || '').trim();
}

async function readPath(path) {
  try {
    const result = await get(path, { access: 'private', token: process.env.BLOB_READ_WRITE_TOKEN, useCache: false });
    if (!result?.stream) return null;
    return JSON.parse(await new Response(result.stream).text());
  } catch (error) {
    if (error?.status === 404 || /not found|404/i.test(String(error?.message || ''))) return null;
    throw error;
  }
}
async function readRecord(key) {
  return await readPath(pathFor(key)) || await readPath(legacyPathFor(key));
}

export default async function handler(req, res) {
  try {
    const origin = String(req.headers?.origin || '').trim();
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Clinic-Key');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();
    const key = keyFrom(req);
    if (key.length < 6 || key.length > 200) return res.status(400).json({ error: 'invalid_key' });
    const path = pathFor(key);

    if (req.method === 'GET') {
      const record = await readRecord(key);
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
    if (body.payload.app !== 'ALSSAEDY_CLINIC' ||
        !Array.isArray(body.payload.receipts) ||
        !Array.isArray(body.payload.patients) ||
        (body.payload.tombstones !== undefined && !Array.isArray(body.payload.tombstones)) ||
        (body.payload.settingsRecords !== undefined && !Array.isArray(body.payload.settingsRecords))) {
      return res.status(400).json({ error: 'invalid_snapshot_schema' });
    }
    if (JSON.stringify(body.payload).length > MAX_BODY) return res.status(413).json({ error: 'payload_too_large' });

    const current = await readRecord(key);
    const currentVersion = Number(current?.version || 0);
    const baseVersion = Number(body.baseVersion ?? 0);
    if (!Number.isSafeInteger(baseVersion) || baseVersion < 0) return res.status(400).json({ error: 'invalid_base_version' });
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
    return res.status(500).json({ error: 'sync_failed' });
  }
}
