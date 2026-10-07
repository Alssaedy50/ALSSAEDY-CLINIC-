/* ALSSAEDY Clinic — offline shell service worker.
   Strategy: cache-first for the app shell, network fallback, and a cached
   stale-while-revalidate path so the receipt tool works fully offline. */
const CACHE_NAME = 'alssaedy-clinic-v1.2.1';
const V = '?v=1.2.1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/ui.css' + V,
  './css/receipt.css' + V,
  './css/print.css' + V,
  './css/templates.css' + V,
  './css/polish.css' + V,
  './js/tafqeet.js' + V,
  './js/storage.js' + V,
  './js/export.js' + V,
  './js/templates.js' + V,
  './js/app.js' + V,
  './js/ui.js' + V,
  './js/sync.js' + V,
  './android-app-bridge.js' + V,
  './vendor/html2canvas/html2canvas.min.js' + V,
  './vendor/jspdf/jspdf.umd.min.js' + V,
  './assets/Saedy_Dental_Logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Never cache API traffic: the sync/backup endpoint must always hit the network.
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
