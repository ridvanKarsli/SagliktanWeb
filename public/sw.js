// v3: eski Heroku backend'ine göre yazılmış API_ORIGIN kontrolü artık geçersizdi
// (frontend artık /api/* isteklerini vercel.json rewrite ile SAME-ORIGIN olarak
// atıyor, ayrı bir origin'e değil). Bu yüzden API istekleri hiçbir zaman
// "farklı origin" dalına düşmüyor, "aynı origin statik dosya" dalına düşüp
// cache-first ile SONSUZA KADAR eski veri döndürüyordu - gruba katılma/gönderi
// paylaşma gibi işlemler DB'de başarılı oluyor ama arayüz güncellenmiyordu.
// Düzeltme: API isteklerini origin yerine /api/ path'ine göre tanı.
// v4: favicon/ikon seti eklendi ve sagliktanLogo.png değişti (4096x4096 ->
// 512x512). Statik dosyalar cache-first olduğu için, daha önce siteyi ziyaret
// etmiş kullanıcıların tarayıcısında eski büyük dosya/eski favicon sonsuza
// kadar cache'den servis edilmeye devam ederdi - cache adını değiştirmek eski
// cache'i geçersiz kılıp (activate handler'daki temizlik) yeni dosyaların
// çekilmesini garantiliyor.
const CACHE_NAME = 'sagliktan-pwa-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/sagliktanLogo.png'
];

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

  // API isteklerini cache'leme (her zaman ağdan çek). Same-origin proxy
  // (vercel.json rewrite) kullanıldığı için origin değil, path kontrol edilir.
  if (url.pathname.startsWith('/api/')) {
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
