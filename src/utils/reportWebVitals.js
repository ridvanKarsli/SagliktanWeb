import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'
import * as Sentry from '@sentry/react'

// Mobil uyum raporu roadmap: "Üretimde gerçek kullanıcı Core Web Vitals
// verisi topla (web-vitals kütüphanesi -> Sentry/analytics) - laboratuvar
// ölçümü yerine gerçek kullanıcı deneyimini gör". Şu ana kadar Lighthouse
// gibi laboratuvar araçlarıyla ölçülüyordu; bu, gerçek kullanıcıların gerçek
// cihaz/ağ koşullarındaki (özellikle mobil) deneyimini yakalayan RUM
// (Real User Monitoring) tarafı.
//
// Bilinçli tasarım kararları:
// 1) Sentry'de performans/tracing (browserTracingIntegration, tracesSampleRate)
//    AÇMIYORUZ - bu, event hacmini ciddi artırıp mevcut Sentry kotasını/planını
//    etkileyebilecek ayrı bir ürün kararı (bkz. rapor: "gerçek Web Push,
//    VAPID anahtarları" gibi diğer altyapı kararları). Onun yerine her metrik
//    raporlandığında hafif bir Sentry mesajı (captureMessage, level='info')
//    gönderiyoruz - mevcut hata izleme planına ek maliyet çıkarmaz.
// 2) Hacmi kontrol altında tutmak için SADECE "needs-improvement" veya
//    "poor" olarak derecelendirilen ölçümleri gönderiyoruz; "good" olanlar
//    (asıl beklenen/istenen durum) gönderilmez - aksi halde her sayfa
//    yüklemesinde 5 event, yüksek trafikte kotayı hızla tüketir.
// 3) Sadece prod build'de VE Sentry DSN varsa çalışır (main.jsx'teki
//    Sentry.init ile aynı kapı) - lokal geliştirme verisi karışmasın.
function sendToSentry(metric) {
  if (metric.rating === 'good') return

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
}

export function reportWebVitals() {
  onCLS(sendToSentry)
  onINP(sendToSentry)
  onLCP(sendToSentry)
  onFCP(sendToSentry)
  onTTFB(sendToSentry)
}
