import { defineConfig, devices } from '@playwright/test'

// Uçtan uca (E2E) testler gerçek bir tarayıcıda, gerçek backend + Postgres'e
// karşı çalışır - bu yüzden çalıştırmadan önce backend'in (SagliktanApi) ve
// veritabanının ayakta olması gerekir. Bu config sadece frontend dev server'ı
// (Vite) kendisi başlatır; backend'i başlatmak CI'da ayrı bir adım
// (bkz. .github/workflows/e2e.yml), lokalde ise elle yapılmalı:
//
//   1. Backend'i çalıştır: cd ../SagliktanApi && ./mvnw spring-boot:run
//      (application-secrets.properties dolu ve app.testing.auto-verify-email=true olmalı,
//      yoksa kayıt testleri e-posta doğrulama kodunu bekleyip takılır kalır)
//   2. cd SagliktanWeb && npx playwright test
//
// PLAYWRIGHT_BASE_URL verilmezse http://localhost:3000 (vite.config.js'teki
// port) kullanılır.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
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
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],

  // CI'da backend zaten ayrı bir adımda ayağa kaldırılıyor (bkz. e2e.yml);
  // burada sadece Vite dev server'ı başlatıyoruz. Lokalde de PLAYWRIGHT_BASE_URL
  // vermeden çalıştırırsan aynı şekilde otomatik başlar.
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER ? undefined : {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
