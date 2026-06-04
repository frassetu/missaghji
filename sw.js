const CACHE_NAME = "missaghji-v1";
const urlsToCache = [
  "/missaghji/",
  "/missaghji/index.html",
  "/missaghji/style.css",
  "/missaghji/app.js",
  "/missaghji/offline.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => caches.match("/missaghji/offline.html"));
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
