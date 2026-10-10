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
// v7: sadece BAŞARILI (response.ok) yanıtlar cache'leniyor. Önceden 5xx ya da
// eksik bir hash'li chunk için Vercel'in SPA rewrite'ından dönen index.html,
// o asset URL'si altında cache-first olarak SONSUZA KADAR servis ediliyor;
// navigasyon dalı da 4xx/5xx HTML'i "/" olarak saklıyordu. Ayrıca /api/
// dalında caches.match hep undefined döndüğü için offline'da respondWith
// (undefined) TypeError'ı oluşuyordu - artık düzgün bir 503 JSON dönüyor.
// v8: precache listesi ikiye ayrıldı. CRITICAL_ASSETS (kabuk + index.html'in
// referans verdiği giriş JS/CSS - build script'i dist/index.html'den okur,
// böylece Sentry gibi dinamik import chunk'ları artık yanlışlıkla
// precache'e girmiyor) biri bile indirilemezse install başarısız olur.
// OPTIONAL_ASSETS (manifest + küçük marka görseli) toleranslı: biri 404
// dönse bile SW kurulur (Promise.allSettled) - eskiden tek bir eksik ikon
// tüm offline desteğini sessizce devre dışı bırakıyordu.
const CACHE_NAME = 'sagliktan-pwa-v8';
const CRITICAL_ASSETS = [
  '/',
  '/index.html'
];
const OPTIONAL_ASSETS = [
  '/manifest.webmanifest',
  '/sagliktanLogo-96.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all([
        cache.addAll(CRITICAL_ASSETS),
        Promise.allSettled(OPTIONAL_ASSETS.map((url) => cache.add(url)))
      ]))
      .then(() => self.skipWaiting())
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
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ status: 503, error: 'Service Unavailable', message: 'İnternet bağlantını kontrol edip tekrar dene.' }),
          { status: 503, headers: { 'Content-Type': 'application/json;charset=UTF-8' } }
        )
      )
    );
    return;
  }

  // Sayfa navigasyonlarında network-first (güncel HTML al); offline ise cache'e düş.
  // { cache: 'no-store' } KRİTİK: sade fetch(request) tarayıcının kendi HTTP
  // cache'ini (SW cache'inden AYRI, Safari'de özellikle agresif) atlamayı
  // garanti ETMEZ - "network-first" dediğimiz dal, index.html tarayıcı disk
  // cache'inde varsa sessizce ESKİ bir kopyayı "ağdan" gelmiş gibi
  // dönebiliyordu. Bu da yeni deploy sonrası eski hash'li chunk referansları
  // taşıyan index.html'in sonsuza kadar servis edilmesine (ve dolayısıyla
  // "Importing a module script failed" hatasının reload'lara rağmen
  // tekrarlanmasına) yol açıyordu - bkz. ErrorBoundary.jsx'teki chunk hatası
  // notu, bu satır o notun kök nedenlerinden biri.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(() => caches.match('/').then((hit) => hit || caches.match('/index.html')))
    );
    return;
  }

  // Aynı origin statik dosyalar: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          // Sadece gerçek, başarılı, aynı-origin yanıtlar; HTML dönen bir
          // "asset" (SPA fallback) hash'li URL altında asla saklanmamalı.
          const contentType = response.headers.get('content-type') || '';
          const looksLikeSpaFallback = /\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)
            && contentType.includes('text/html');
          if (response.ok && response.type === 'basic' && !looksLikeSpaFallback) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
    })
  );
});
