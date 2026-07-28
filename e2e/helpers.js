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

// E-postası "e2e-admin." ile başlıyor - backend'de SADECE
// APP_TESTING_AUTO_ADMIN_EMAIL_PREFIX seçiliyken (yalnızca CI'da) bu önekle
// kayıt olan kullanıcı otomatik ADMIN rolüyle oluşturulur (bkz.
// AuthServiceImpl.register). Lokalde bu bayrak kapalıysa admin testleri
// normal USER olarak login olur ve /admin'e AdminRoute tarafından
// yönlendirilmeden erişemez - bu durumda testler kendi hata mesajıyla
// (görünür "Admin" nav öğesi yok) anlaşılır biçimde başarısız olur.
export function uniqueAdminUser() {
  return uniqueUser('e2e-admin')
}

// Kayıt ol -> backend'in SADECE test ortamında açık olan
// app.testing.auto-verify-email bayrağı sayesinde e-posta zaten otomatik
// doğrulanmış oluyor -> giriş yap. Bu bayrak kapalıyken (ör. lokalde elle
// çalıştırırken unutulursa) "Giriş sayfasına dön" adımından sonra login
// "E-posta adresi doğrulanmamış" hatasıyla patlar - bu durumda backend'i
// app.testing.auto-verify-email=true ile başlattığından emin ol.
export async function registerAndLogin(page, user) {
  await page.goto('/register')
  // NOT: getByLabel yerine data-testid kullanıyoruz. MUI'nin outlined
  // TextField'ı erişilebilirlik ağacında etikette (notch/legend) bir
  // kopya oluşturuyor ve bu, CI'da (build+preview modunda, yerel dev'de
  // değil) getByLabel('İsim', {exact:true}) locator'ının doğru elemente
  // deterministik biçimde bağlanmasını engelleyip testlerin 30s'de
  // timeout'a düşmesine sebep oluyordu (bkz. E2E #4/#5 teşhis raporları).
  // data-testid, erişilebilirlik ağacı hesaplamasından tamamen bağımsız
  // ve tek anlamlı olduğu için bu sınıf soruna kapalı.
  await page.getByTestId('register-firstName').fill(user.firstName)
  await page.getByTestId('register-lastName').fill(user.lastName)
  await page.getByTestId('register-email').fill(user.email)
  await page.getByTestId('register-password').fill(user.password)
  await page.getByTestId('register-confirmPassword').fill(user.password)
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
  await page.getByTestId('login-email').fill(user.email)
  await page.getByTestId('login-password').fill(user.password)
  await page.getByRole('button', { name: 'Giriş Yap' }).click()
  await page.waitForURL('**/groups')
}

// V3 migration ile her ortamda seed edilen sabit grup/alt gruplar - testler
// admin panelinden içerik oluşturmak zorunda kalmadan bunlara güvenebilir.
export const SEED_GROUP = 'Retinitis Pigmentosa'
export const SEED_SUB_GROUP = 'Sohbet & Sosyalleşme'

// NOT: Artık sayfada TEK bir grup olduğu garanti değil - admin.spec.js'teki
// grup CRUD testi kendi grubunu oluşturuyor (ve normalde temizliyor, ama
// paralel çalışan/başarısız olan bir test geçici olarak ek grup bırakabilir,
// bkz. E2E #9 teşhis raporu). Bu yüzden "Katıl" butonunu sayfa genelinde
// değil, SEED_GROUP başlığını içeren KART içinde arıyoruz - .tap-scale,
// DiseaseGroups.jsx'teki her grup kartının kök elemanına ait sabit bir
// class, kart sınırını güvenilir şekilde belirliyor.
export async function joinSeedGroup(page) {
  await page.goto('/groups')
  const card = page.locator('.tap-scale').filter({ has: page.getByRole('heading', { name: SEED_GROUP }) })
  await expect(card).toBeVisible()
  const joinButton = card.getByRole('button', { name: 'Katıl' })
  if (await joinButton.isVisible().catch(() => false)) {
    await joinButton.click()
    await expect(page.getByText('Gruba katıldınız.')).toBeVisible()
  }
}

// Bildirim rozeti WebSocket üzerinden gerçek zamanlı güncelleniyor
// (notificationSocket.js). STOMP CONNECT + SUBSCRIBE, sayfa login olduktan
// hemen sonra ASENKRON olarak tamamlanıyor - eğer ikinci kullanıcının
// yorum/yanıt aksiyonu bu abonelik kurulmadan ÖNCE backend'e ulaşırsa mesaj
// broker tarafında sessizce kaybolur (alıcı o an "bağlı" değildir, kuyruğa
// alınmaz) ve rozet asla "1" olmaz - bu, testin gerçek bir bug değil bir race
// condition yüzünden flaky olmasına yol açıyordu (bkz. 2026-07-28 E2E #14
// analizi). NotificationBell, abonelik tamamlandığında data-ws-connected
// attribute'unu "true" yapıyor (sadece test amaçlı, kullanıcıya görünmez) -
// bu fonksiyon ikinci kullanıcının aksiyonundan ÖNCE bunu bekleyerek race'i
// kökten ortadan kaldırıyor.
export async function waitForNotificationSocket(page) {
  await page.waitForSelector('[aria-label="Bildirimler"][data-ws-connected="true"]', { timeout: 15000 })
}

// Backend loglarına (nohup ile ayrı bir dosyaya yönlendirildiği ve CI
// artifact indirme süreci defalarca yanlış/eski dosya vermesi yüzünden
// pratikte ulaşılamaz olduğu için, bkz. 2026-07-28 teşhis geçmişi) alternatif
// bir teşhis kanalı: tarayıcı konsolunu doğrudan Node stdout'una yönlendirir.
// notificationSocket.js'teki onStompError/onWebSocketError zaten
// console.error çağırıyor - bu fonksiyon çağrılan her sayfada varsa bu
// hataları (ve genel olarak yakalanmamış exception'ları) [label] etiketiyle
// GitHub Actions'ın "E2E testlerini çalıştır" step logunda görünür kılar -
// backend.log'a hiç ihtiyaç kalmadan.
export function logBrowserConsole(page, label) {
  page.on('console', msg => {
    console.log(`[${label} console:${msg.type()}] ${msg.text()}`)
  })
  page.on('pageerror', err => {
    console.log(`[${label} pageerror] ${err.message}`)
  })
}
