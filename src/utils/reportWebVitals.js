import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'

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
// 3) Sentry'ye NASIL gönderileceğini bu dosya artık bilmiyor - @sentry/react'i
//    burada import etmek, LCP'yi bozan aynı "SDK ana pakete kalıcı giriyor"
//    sorununu tekrar ederdi (bkz. ErrorBoundary.jsx'teki uzun gerekçe).
//    Çağıran taraf (main.jsx) DSN varsa Sentry'yi dinamik yükleyip bir
//    "reporter" callback'i buraya veriyor - bu dosya sadece metriği ölçüyor.
export function reportWebVitals(onMetric) {
  function handle(metric) {
    if (metric.rating === 'good') return
    onMetric(metric)
  }
  onCLS(handle)
  onINP(handle)
  onLCP(handle)
  onFCP(handle)
  onTTFB(handle)
}
