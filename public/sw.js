const CACHE = 'leptonpad-v2.3.35';
const PRECACHE = [
  '/',
  '/main.js',
  '/main.css',
  '/solver.wasm',
  '/config.js',
  '/manifest.webmanifest',
  '/LeptonPadLogo.png',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' bypasses the browser HTTP cache. The host sends no Cache-Control, so a
  // plain addAll() can be answered from a heuristically-fresh HTTP cache entry — filling the
  // new versioned cache with the PREVIOUS release's main.js.
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((cached) => cached ?? fetch(e.request)));
});
