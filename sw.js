const CACHE_NAME = "missaghji-v2";
const urlsToCache = [
  "/missaghji/",
  "/missaghji/index.html",
  "/missaghji/main.html",
  "/missaghji/style.css",
  "/missaghji/app.js",
  "/missaghji/manifest.json",
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
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});