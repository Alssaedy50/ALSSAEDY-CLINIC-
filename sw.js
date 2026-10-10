/* ALSSAEDY Clinic — offline shell service worker.
   Strategy: cache-first for the app shell, network fallback, and a cached
   stale-while-revalidate path so the receipt tool works fully offline. */
const CACHE_NAME = 'alssaedy-clinic-v1.2.7-core';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/ui.css?v=1.2.6',
  './css/receipt.css?v=1.2.7',
  './css/print.css?v=1.2.7',
  './css/templates.css?v=1.2.1',
  './css/polish.css?v=1.2.2',
  './js/tafqeet.js?v=1.2.1',
  './js/capabilities.js?v=1.0.0',
  './js/ai.js?v=1.0.0',
  './js/integrations.js?v=1.0.0',
  './js/product.js?v=1.0.0',
  './js/repository.js?v=1.2.6',
  './js/storage.js?v=1.2.7',
  './js/backup.js?v=1.0.0',
  './js/backup-provider.js?v=1.0.0',
  './js/backup-provider-runtime.js?v=1.0.0',
  './js/google-drive-auth.js?v=1.0.0',
  './js/google-drive-provider.js?v=1.0.0',
  './js/cloud-recovery.js?v=1.0.0',
  './js/restore-migration.js?v=1.0.0',
  './js/backup-ux.js?v=1.0.0',
  './js/backup-scheduling.js?v=1.0.0',
  './js/export.js?v=1.2.7',
  './js/templates.js?v=1.2.1',
  './js/app.js?v=1.2.7',
  './js/ui.js?v=1.2.6',
  './js/sync.js?v=1.2.1',
  './android-app-bridge.js?v=1.2.1',
  './vendor/html2canvas/html2canvas.min.js?v=1.2.1',
  './assets/logo.png'
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
  // The service worker script itself must never be served from its own cache.
  // Navigation documents are network-first so a new app shell can activate promptly.
  if (url.pathname.endsWith('/sw.js') || req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((response) => {
        if (response && response.status === 200 && req.mode === 'navigate') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
        }
        return response;
      }).catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

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
