import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser } from './helpers.js'

test.describe('Kayıt ve giriş', () => {
  test('kayıt ol, giriş yap ve /home sayfasına düş', async ({ page }) => {
    const user = uniqueUser('auth')
    await registerAndLogin(page, user)
    await expect(page).toHaveURL(/\/home$/)
    // Yeni kayıt olan kullanıcı henüz hiçbir gruba katılmadığı için Home,
    // akış yerine "grup keşfet" boş durumunu gösterir (bkz. Home.jsx
    // hasJoinedGroups dalı) - bu, /home'a düştüğümüzü doğrulayan güvenilir
    // bir işaret.
    await expect(page.getByText('Henüz hiçbir gruba katılmadın')).toBeVisible()
  })

  test('yanlış şifreyle giriş reddedilir', async ({ page }) => {
    const user = uniqueUser('badpw')
    await registerAndLogin(page, user)

    // PublicOnlyRoute girişli kullanıcıyı /login'den /home'a atıyor - bu
    // yüzden önce (hâlâ /home sayfasındayken) oturum storage'ını temizleyip
    // öyle /login'e gidiyoruz.
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    await page.goto('/login')

    await page.getByTestId('login-email').fill(user.email)
    await page.getByTestId('login-password').fill('yanlis-sifre-123')
    await page.getByRole('button', { name: 'Giriş Yap' }).click()

    await expect(page.getByText(/E-posta veya şifre hatalı/)).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('oturum kalıcı: sayfa yenilenince tekrar giriş istenmez', async ({ page }) => {
    // Bu senaryo, oturum kalıcılığı bug'ının (PublicOnlyRoute eklenmeden
    // önceki hali) tekrar canlanmadığını doğrulayan regresyon testidir.
    const user = uniqueUser('persist')
    await registerAndLogin(page, user)
    await expect(page).toHaveURL(/\/home$/)

    await page.reload()
    await expect(page).toHaveURL(/\/home$/)
    await expect(page.getByText('Henüz hiçbir gruba katılmadın')).toBeVisible()

    // "/" adresine gitmeyi dene - girişli kullanıcı karşılama ekranına değil
    // doğrudan /home'a yönlenmeli (PublicOnlyRoute).
    await page.goto('/')
    await expect(page).toHaveURL(/\/home$/)
  })
})
