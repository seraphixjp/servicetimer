// 電波が無くても開けるようにキャッシュする（ネット優先・だめならキャッシュ）。更新時は VERSION を上げる
const VERSION = 'servicetimer-web-0.7.7';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './seraphix-logo.png',
  './fonts/BarlowCondensed-700.woff2', './fonts/BarlowCondensed-800.woff2', './voice/packs.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;   // Firebase などはそのまま
  // 画面と一覧（.json）はブラウザのキャッシュも確かめ直す（古い声の一覧が残らないように）
  const fresh = e.request.mode === 'navigate' || /\.(json|html)(\?|$)/.test(e.request.url) || e.request.url.endsWith('/');
  e.respondWith((fresh ? fetch(e.request.url, { cache: 'no-cache' }) : fetch(e.request)).then(r => {
    const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
