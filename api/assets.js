import { get, put } from '@vercel/blob';
import { Readable } from 'node:stream';

const ALLOWED = new Set(['logo', 'background']);
const MAX_BYTES = 5000000;
const MIME = new Set(['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']);

function keyFrom(req){return new URL(req.url, `https://${req.headers?.host || 'localhost'}`).searchParams.get('key') || ''}

export default async function handler(req, res) {
  try {
    const key = keyFrom(req);
    if (!ALLOWED.has(key)) return res.status(400).json({error:'Invalid asset key'});
    const path = 'assets/' + key;
    if (req.method === 'GET') {
      try {
        const result = await get(path, { access:'private', token:process.env.BLOB_READ_WRITE_TOKEN, useCache:false });
        if (!result?.stream) return res.status(404).end();
        res.statusCode=200;res.setHeader('Content-Type',result.blob?.contentType || 'application/octet-stream');res.setHeader('Cache-Control','no-store');return Readable.fromWeb(result.stream).pipe(res);
      } catch (error) {
        if (error?.status === 404 || /not found|404/i.test(String(error?.message || ''))) return res.status(404).end();
        throw error;
      }
    }
    if (req.method !== 'PUT') { res.setHeader('Allow','GET, PUT'); return res.status(405).json({error:'Method not allowed'}); }
    const contentType = String(req.headers['content-type'] || '').split(';')[0].toLowerCase();
    if (!MIME.has(contentType)) return res.status(415).json({error:'Unsupported image type'});
    const chunks=[]; let total=0;
    for await (const chunk of req) { total += chunk.length; if(total>MAX_BYTES) return res.status(413).json({error:'Asset too large'}); chunks.push(chunk); }
    const body=Buffer.concat(chunks);
    await put(path, body, { access:'private', token:process.env.BLOB_READ_WRITE_TOKEN, addRandomSuffix:false, allowOverwrite:true, contentType });
    return res.status(200).json({ok:true,key});
  } catch (error) {
    console.error('asset error', error);
    return res.status(500).json({error:'asset_failed',message:error?.message || 'Unknown error'});
  }
}
