import React from 'react'
import ReactDOM from 'react-dom/client'
import ThemedApp from './ThemedApp.jsx'
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'
import { reportWebVitals } from './utils/reportWebVitals.js'
import { hasAttemptedChunkReload, reloadOnceForChunkError } from './utils/chunkReloadGuard.js'
// Inter fontu artık Google Fonts'tan değil, yerelden (bkz. index.html'deki not).
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import './index.css'

// Hata izleme (Sentry, LAUNCH_ROADMAP.md #1). VITE_SENTRY_DSN sadece
// Vercel'in prod build ortamında set edilecek - lokalde/preview'de bu
// değişken yoksa Sentry hiç başlatılmıyor, geliştirme sırasındaki hatalar
// prod projesine karışmıyor. userInfo/httpBodies bilerek kapalı - backend
// tarafındaki send-default-pii=false kararıyla tutarlı, KVKK incelemesi
// tamamlanana kadar kullanıcı verisi üçüncü tarafa gitmiyor.
//
// @sentry/react artık dinamik import() ile yükleniyor (bkz. ErrorBoundary.jsx
// üstündeki gerekçe - Lighthouse CI'ın yakaladığı LCP ihlali). SDK ayrı bir
// chunk'a düşüyor, ilk render'ı bloke eden ana pakete hiç girmiyor.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      dataCollection: {
        userInfo: false,
        httpBodies: [],
      },
    })
    // Gerçek kullanıcı Core Web Vitals'ı (RUM) - bkz. utils/reportWebVitals.js
    // üstündeki gerekçe. Sentry burada zaten yüklü olduğu için reporter'ı
    // doğrudan ona bağlıyoruz.
    reportWebVitals((metric) => {
      Sentry.captureMessage(`web-vital: ${metric.name} ${metric.rating}`, {
        level: metric.rating === 'poor' ? 'warning' : 'info',
        tags: {
          webVitalName: metric.name,
          webVitalRating: metric.rating,
          page: window.location.pathname,
        },
        extra: {
          value: metric.value,
          id: metric.id,
          navigationType: metric.navigationType,
        },
      })
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <ThemedApp />
    </AccessibilityProvider>
  </React.StrictMode>
)

// Service Worker sadece production'da aktif olsun
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = '/sw.js'
    // updateViaCache: 'none' KRİTİK - varsayılan ('imports') tarayıcının
    // sw.js'in kendisini (ve import ettiklerini) normal HTTP cache
    // kurallarına göre önbellekleyebilmesine izin veriyor. Bu da "yeni bir
    // deploy oldu, sw.js değişti" kontrolünün Safari gibi agresif disk
    // cache'i olan tarayıcılarda geç (ya da hiç) tetiklenmemesine yol
    // açıyordu - reload() bile eski sw.js'i "taze" sanıp yeniden
    // kaydediyordu. 'none' ile her registration.update() çağrısı sw.js'i
    // gerçekten ağdan çeker.
    // KRİTİK: 'controllerchange' event'i SADECE "eski bir SW yerini yeni
    // birine bıraktı" durumunda değil, bu sayfanın HİÇ SW kontrolü olmadığı
    // ilk ziyarette de (install + clients.claim() sonrası "kontrolsüz ->
    // kontrollü" geçişinde) ateşleniyor - yani her ilk ziyarette de fırlıyor.
    // İlk ziyarette reload etmenin hiçbir anlamı yok (sayfa zaten bu SW'nin
    // sunduğu güncel assetlerle yüklendi) - üstelik E2E/Playwright gibi her
    // testte taze (SW'siz) bir tarayıcı bağlamı kullanan ortamlarda gereksiz
    // bir reload'a, dolayısıyla testin ortasında sayfa navigasyonuna
    // (axe-core'un "Execution context was destroyed" hatasına) yol açtı.
    // Bu yüzden register() ÇAĞRILMADAN ÖNCEKİ controller durumunu saklayıp
    // sadece "zaten bir SW bu sayfayı kontrol ediyordu, şimdi BAŞKA biri
    // devraldı" (= gerçek bir deploy güncellemesi) durumunda reload ediyoruz.
    const hadControllerBeforeRegister = !!navigator.serviceWorker.controller

    navigator.serviceWorker.register(swUrl, { updateViaCache: 'none' }).catch(console.error)

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadControllerBeforeRegister || hasAttemptedChunkReload()) return
      reloadOnceForChunkError()
    })
  })
}
