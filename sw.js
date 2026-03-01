
const CACHE_NAME='missaghji-cache-v5_2_6';
const CORE=['index.html','styles.css','app.js','offline.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request; if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.open(CACHE_NAME).then(c=>c.match('offline.html'))));return} e.respondWith(caches.match(r,{ignoreSearch:true}).then(c=>c||fetch(r).then(res=>{caches.open(CACHE_NAME).then(cache=>cache.put(r,res.clone()));return res}).catch(()=>null)));});
