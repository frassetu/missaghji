
const CACHE = 'msgop-v1';
const ASSETS = [
  'index.html',
  'main.html',
  'style.css',
  'app.js',
  'manifest.json',
  'offline.html',
  'icon.png'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    fetch(e.request).catch(()=>caches.match(e.request)).then(r=>r||caches.match('offline.html'))
  );
});
