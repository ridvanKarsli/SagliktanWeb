import { defineConfig, devices } from '@playwright/test'

// Uçtan uca (E2E) testler gerçek bir tarayıcıda, gerçek backend + Postgres'e
// karşı çalışır - bu yüzden çalıştırmadan önce backend'in (SagliktanApi) ve
// veritabanının ayakta olması gerekir. Bu config sadece frontend'i (bu repo)
// kendisi başlatır; backend'i başlatmak CI'da ayrı bir adım (bkz.
// .github/workflows/e2e.yml), lokalde ise elle yapılmalı:
//
//   1. Backend'i çalıştır: cd ../SagliktanApi && ./mvnw spring-boot:run
//      (application-secrets.properties dolu ve app.testing.auto-verify-email=true olmalı,
//      yoksa kayıt testleri e-posta doğrulama kodunu bekleyip takılır kalır)
//   2. cd SagliktanWeb && npx playwright test
//
// "vite dev" değil, kasıtlı olarak "vite build && vite preview" kullanıyoruz:
// dev server soğuk bir ortamda (özellikle CI) ilk açılışta bağımlılıkları
// arka planda pre-bundle ederken sayfa render'ı 30+ saniye gecikip test
// timeout'larını tetikleyebiliyor (canlıda tam olarak bu yaşandı - bkz. E2E
// #2 run'ı, tüm testler getByLabel('İsim') beklerken 30s'de timeout oldu).
// preview modu zaten derlenmiş, optimize edilmiş paketi anında sunuyor.
// preview.proxy da vite.config.js'te ayrıca tanımlı - server.proxy preview
// modunda otomatik uygulanmıyor.
//
// PLAYWRIGHT_BASE_URL verilmezse http://localhost:3000 (vite.config.js'teki
// port) kullanılır.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // GEÇİCİ TEŞHİS MODU: tüm denemeler aynı noktada (register formunun ilk
  // alanı) aynı şekilde takılıyor - bu "soğuk başlangıç" değil, kalıcı bir
  // render sorunu olduğunu gösteriyor (ısınmış sunucuya rağmen retry'lar da
  // aynı şekilde patlıyor). Gerçek bir ekran görüntüsü/rapor elde edip kök
  // nedeni görebilmek için retries=0, tek proje, ilk hatada dur.
  retries: 0,
  maxFailures: process.env.CI ? 3 : undefined,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'html',
  timeout: 30_000,

  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // mobile-safari: 2026-08-05'te teşhis edildi - register sayfası WebKit'te
    // sorunsuz render oluyor, axe-core WCAG taraması geçti (bkz. görüşme
    // geçmişi). CI'da varsayılan olarak KAPALI tutuluyor - bilinçli tercih:
    // WebKit headless CI'da chromium'a göre daha yavaş/flaky, bu proje için
    // ek sinyal/maliyet dengesi şu an chromium-only lehine. Gerekirse
    // aşağıdaki satırı açıp lokalde veya ayrı bir CI job'unda çalıştırılabilir.
    // { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],

  // CI'da backend zaten ayrı bir adımda ayağa kaldırılıyor (bkz. e2e.yml);
  // burada sadece frontend'i build edip preview ile sunuyoruz. Lokalde de
  // PLAYWRIGHT_BASE_URL vermeden çalıştırırsan aynı şekilde otomatik başlar.
  // Build adımı dahil olduğu için timeout'u cömert tuttuk.
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER ? undefined : {
    command: 'npm run build && npm run preview',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
