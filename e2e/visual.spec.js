import { test, expect } from '@playwright/test'

// Mobil uyum raporu roadmap: "Görsel regresyon testi (Percy/Chromatic ya da
// Playwright toHaveScreenshot) ekle - mobil breakpoint'lerde sessiz layout
// kırılmalarını yakalar". Percy/Chromatic yerine BİLİNÇLİ olarak Playwright'ın
// kendi toHaveScreenshot'ı seçildi: harici hesap/ücretli plan gerektirmiyor,
// zaten kurulu olan Playwright'a ek bir bağımlılık eklemiyor. Bedeli:
// baseline PNG'ler repo'da tutuluyor ve BİLİNÇLİ bir görsel değişiklik
// yapıldığında elle güncellenmeleri gerekiyor (bkz. altındaki NOT).
//
// Sadece PUBLIC (auth gerektirmeyen) sayfalar test ediliyor - "pilot" olarak
// bilinçli bir kapsam daraltması: kimlik doğrulamalı sayfalar (Posts,
// Profile...) gerçek backend verisine (avatar baş harfleri, zaman damgaları,
// kullanıcı adları) bağımlı - bunları piksel piksel karşılaştırmak sürekli
// maskeleme gerektirir ve pratikte flaky olur. Bu pilot kanıtlanırsa
// (yanlış pozitif üretmeden gerçek regresyonları yakalıyorsa) authenticated
// sayfalara genişletilebilir.
//
// NOT (baseline'ları güncelleme): Bilinçli bir tasarım değişikliği
// yaptıysan `npx playwright test visual.spec.js --update-snapshots`
// çalıştırıp yeni PNG'leri commit'le. İLK ÇALIŞTIRMADA (bu dosya ilk kez
// eklendiğinde) baseline hiç yok - aynı komutu bir kez çalıştırıp
// e2e/visual.spec.js-snapshots/ klasörünü commit'lemen gerekiyor, aksi
// halde test "no baseline found" ile başarısız olur.
test.describe('Görsel regresyon (mobil)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('Karşılama ekranı', async ({ page }) => {
    await page.goto('/')
    // Sayfa geçiş animasyonu (bkz. App.css) ilk render'ı geçici olarak
    // kaydırıyor/soluklaştırıyor - ekran görüntüsünden önce oturmasını bekle.
    await page.waitForTimeout(400)
    await expect(page).toHaveScreenshot('welcome-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('Giriş sayfası', async ({ page }) => {
    await page.goto('/login')
    await page.waitForTimeout(400)
    await expect(page).toHaveScreenshot('login-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('Kayıt sayfası', async ({ page }) => {
    await page.goto('/register')
    await page.waitForTimeout(400)
    await expect(page).toHaveScreenshot('register-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

test.describe('Görsel regresyon (masaüstü)', () => {
  // Register/Login masaüstünde mobilden yapısal olarak farklı (sol
  // branding paneli görünür oluyor - bkz. Register.jsx isMobile dallanması)
  // - bu yüzden aynı sayfaların masaüstü hâli de ayrı bir pilot senaryosu.
  test('Kayıt sayfası - masaüstü branding paneli', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/register')
    await page.waitForTimeout(400)
    await expect(page).toHaveScreenshot('register-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})
