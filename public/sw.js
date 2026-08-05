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
// v5: fetch handler artık farklı origin'e giden istekleri (staging/dev'de
// doğrudan ayrı bir backend'e giden istekler gibi) hiç yakalamıyor - bkz.
// aşağıdaki origin kontrolü.
// v6: BU DOSYA sadece kabuğu (/, index.html) precache eden bir ŞABLONdur.
// `npm run build` çalıştığında scripts/generate-sw-precache.js, vite'ın
// oluşturduğu hash'li ana bundle dosyalarını (index-HASH.js/.css) bu listeye
// ekleyip CACHE_NAME'i build hash'ine göre otomatik günceller - bkz.
// dist/sw.js (build çıktısı, git'e girmez). Lazy route chunk'ları (Admin,
// Chat, PostDetail...) BİLEREK precache edilmiyor; code splitting'in amacı
// tam da bunları ilk yüklemede indirmemek (bkz. App.jsx yorumları) - onlar
// aşağıdaki fetch handler'ın cache-first dalıyla ziyaret edildiklerinde
// fırsatçı olarak önbelleğe giriyor.
const CACHE_NAME = 'sagliktan-pwa-v5';
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

  // Farklı origin'e giden istekler (örn. staging/dev ortamında VITE_API_BASE
  // ile doğrudan ayrı bir Railway servisine yapılan istekler) SW'ye hiç
  // takılmasın, tarayıcı normal şekilde yönetsin. Bunu yakalamaya çalışmak
  // "FetchEvent.respondWith received an error: Returned response is null"
  // hatasına yol açıyordu çünkü cache hiçbir zaman bu farklı origin'i içermiyor.
  if (url.origin !== self.location.origin) return;

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
