
const VERSION = 'v1';
const CACHE = `missaghji-static-${VERSION}`;
const OFFLINE_URL = './offline.html';
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;
        return await fetch(req);
      } catch (e) {
        const cache = await caches.open(CACHE);
        return await cache.match(OFFLINE_URL);
      }
    })());
    return;
  }

  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (/\.(css|js)$/.test(url.pathname)) {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(req);
        const network = fetch(req).then(res => { cache.put(req, res.clone()); return res; }).catch(() => cached);
        return cached || network;
      })());
      return;
    }
    if (/\.(png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)) {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
      })());
      return;
    }
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
