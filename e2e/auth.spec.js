import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser } from './helpers.js'

test.describe('Kayıt ve giriş', () => {
  test('kayıt ol, giriş yap ve /groups sayfasına düş', async ({ page }) => {
    const user = uniqueUser('auth')
    await registerAndLogin(page, user)
    await expect(page).toHaveURL(/\/groups$/)
    await expect(page.getByText('Hastalık Grupları')).toBeVisible()
  })

  test('yanlış şifreyle giriş reddedilir', async ({ page }) => {
    const user = uniqueUser('badpw')
    await registerAndLogin(page, user)

    // PublicOnlyRoute girişli kullanıcıyı /login'den /groups'a atıyor - bu
    // yüzden önce (hâlâ /groups sayfasındayken) oturum storage'ını temizleyip
    // öyle /login'e gidiyoruz.
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    await page.goto('/login')

    await page.getByLabel('E-posta adresi', { exact: true }).fill(user.email)
    await page.getByLabel('Şifre', { exact: true }).fill('yanlis-sifre-123')
    await page.getByRole('button', { name: 'Giriş Yap' }).click()

    await expect(page.getByText(/E-posta veya şifre hatalı/)).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('oturum kalıcı: sayfa yenilenince tekrar giriş istenmez', async ({ page }) => {
    // Bu senaryo, oturum kalıcılığı bug'ının (PublicOnlyRoute eklenmeden
    // önceki hali) tekrar canlanmadığını doğrulayan regresyon testidir.
    const user = uniqueUser('persist')
    await registerAndLogin(page, user)
    await expect(page).toHaveURL(/\/groups$/)

    await page.reload()
    await expect(page).toHaveURL(/\/groups$/)
    await expect(page.getByText('Hastalık Grupları')).toBeVisible()

    // "/" adresine gitmeyi dene - girişli kullanıcı karşılama ekranına değil
    // doğrudan /groups'a yönlenmeli (PublicOnlyRoute).
    await page.goto('/')
    await expect(page).toHaveURL(/\/groups$/)
  })
})
