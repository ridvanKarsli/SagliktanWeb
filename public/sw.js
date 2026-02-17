const CACHE_NAME = 'sagliktan-pwa-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/sagliktanLogo.png'
];

const API_ORIGIN = 'https://saglikta-7d7a2dbc0cf4.herokuapp.com';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
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
  const { request } = event;
  const url = new URL(request.url);

  // POST ve diğer yazan istekleri hiç ele alma
  if (request.method !== 'GET') return;

  // API isteklerini cache'leme (her zaman ağdan çek)
  if (url.origin === API_ORIGIN) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Sayfa navigasyonlarında network-first (güncel HTML al); offline ise cache'e düş
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          return response;
        })
        .catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  // Aynı origin statik dosyalar: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
