const CACHE_NAME = "missaghji-v6";
const urlsToCache = [
  "/",
  "/index.html",
  "/main.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/offline.html",
  "/icon-192.png"
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
      return response || fetch(event.request).catch(() => caches.match("/offline.html"));
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