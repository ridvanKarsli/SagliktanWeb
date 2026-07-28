import { expect } from '@playwright/test'

// Her test kendi benzersiz kullanıcısını oluşturur ki testler birbirinin
// verisiyle çakışmasın (paralel/aynı DB üzerinde çalışsalar bile). Soyisim de
// benzersiz - aksi halde aynı ad-soyada sahip birden fazla test kullanıcısı
// aynı ekranda (ör. grup üye listesi) görününce "Test Kullanıcı" metni
// birden fazla elemanla eşleşir ve testler flaky/strict-mode-violation olur.
export function uniqueUser(prefix = 'e2e') {
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  return {
    firstName: 'Test',
    lastName: `Kullanici${stamp.slice(-6)}`,
    email: `${prefix}.${stamp}@example.com`,
    password: 'TestSifre123!',
  }
}

// Kayıt ol -> backend'in SADECE test ortamında açık olan
// app.testing.auto-verify-email bayrağı sayesinde e-posta zaten otomatik
// doğrulanmış oluyor -> giriş yap. Bu bayrak kapalıyken (ör. lokalde elle
// çalıştırırken unutulursa) "Giriş sayfasına dön" adımından sonra login
// "E-posta adresi doğrulanmamış" hatasıyla patlar - bu durumda backend'i
// app.testing.auto-verify-email=true ile başlattığından emin ol.
export async function registerAndLogin(page, user) {
  // TEŞHİS: getByLabel('İsim') CI'da deterministik olarak 30s timeout'a
  // takılıyor (bkz. E2E #4). Kök nedeni görmek için burada erken ve kısa
  // süreli (8s) bir deneme yapıp başarısız olursa konsol/sayfa hatalarını,
  // spinner durumunu ve body metnini hata mesajına gömüyoruz - böylece
  // artifact indirmeden, sadece GitHub Actions annotation'ından teşhis
  // koyabiliyoruz. Kalıcı değil, kök neden bulununca kaldırılacak.
  const consoleErrors = []
  const pageErrors = []
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', err => { pageErrors.push(err.stack || err.message) })
  page.on('requestfailed', req => { consoleErrors.push(`REQUEST FAILED: ${req.method()} ${req.url()} - ${req.failure()?.errorText}`) })

  await page.goto('/register')
  try {
    await page.getByLabel('İsim', { exact: true }).fill(user.firstName, { timeout: 8000 })
  } catch (e) {
    const spinnerVisible = await page.locator('.MuiCircularProgress-root').isVisible().catch(() => 'bilinmiyor')
    const bodyText = await page.locator('body').innerText().catch(() => '(okunamadı)')
    const title = await page.title().catch(() => '(okunamadı)')
    throw new Error(
      `TEŞHİS BİLGİSİ ---\n` +
      `URL: ${page.url()}\n` +
      `Başlık: ${title}\n` +
      `Spinner görünür mü: ${spinnerVisible}\n` +
      `Console hataları (${consoleErrors.length}): ${JSON.stringify(consoleErrors).slice(0, 1500)}\n` +
      `Sayfa (JS) hataları (${pageErrors.length}): ${JSON.stringify(pageErrors).slice(0, 1500)}\n` +
      `Body metni ilk 400 karakter: ${JSON.stringify(bodyText.slice(0, 400))}\n` +
      `--- orijinal hata: ${e.message}`
    )
  }
  await page.getByLabel('Soyisim', { exact: true }).fill(user.lastName)
  await page.getByLabel('E-posta adresi', { exact: true }).fill(user.email)
  await page.getByLabel('Şifre', { exact: true }).fill(user.password)
  await page.getByLabel('Şifre (tekrar)', { exact: true }).fill(user.password)
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Kayıt Ol' }).click()

  await expect(page.getByText('E-postanı kontrol et')).toBeVisible()
  await page.getByRole('button', { name: 'Giriş sayfasına dön' }).click()

  await login(page, user)
}

// Zaten kayıtlı (ve doğrulanmış) bir kullanıcıyla sadece giriş yapar - aynı
// kullanıcıyla ikinci kez registerAndLogin çağırmak "Bu e-posta zaten
// kayıtlı" hatasına düşer, o yüzden ikinci oturum açma ihtiyacında bu
// kullanılmalı (bkz. groups-posts.spec.js - üye olmayan kullanıcı senaryosu).
export async function login(page, user) {
  await page.goto('/login')
  await page.getByLabel('E-posta adresi', { exact: true }).fill(user.email)
  await page.getByLabel('Şifre', { exact: true }).fill(user.password)
  await page.getByRole('button', { name: 'Giriş Yap' }).click()
  await page.waitForURL('**/groups')
}

// V3 migration ile her ortamda seed edilen sabit grup/alt gruplar - testler
// admin panelinden içerik oluşturmak zorunda kalmadan bunlara güvenebilir.
export const SEED_GROUP = 'Retinitis Pigmentosa'
export const SEED_SUB_GROUP = 'Sohbet & Sosyalleşme'

// Not: V3 migration ile veritabanına tam olarak TEK bir hastalık grubu seed
// ediliyor. E2E ortamı sadece migration'larla kurulduğu ve testler başka
// admin grubu oluşturmadığı için "Katıl" butonu sayfada her zaman tekil -
// bu yüzden kart bazlı karmaşık bir seçiciye gerek yok.
export async function joinSeedGroup(page) {
  await page.goto('/groups')
  await expect(page.getByText(SEED_GROUP)).toBeVisible()
  const joinButton = page.getByRole('button', { name: 'Katıl' })
  if (await joinButton.isVisible().catch(() => false)) {
    await joinButton.click()
    await expect(page.getByText('Gruba katıldınız.')).toBeVisible()
  }
}
