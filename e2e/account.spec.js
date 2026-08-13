import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser } from './helpers.js'

// Rapor: KVKK veri taşınabilirliği (veri dışa aktarma) ve hesap silme
// (anonimleştirme) self-servis akışları - bkz. Profile.jsx "Ayarlar"
// bölümündeki "Verilerimi İndir" / "Hesabımı Sil" satırları.
test.describe('Hesap: veri dışa aktarma ve hesap silme', () => {
  test('Verilerimi İndir kendi verisini JSON dosyası olarak indirir', async ({ page }) => {
    const user = uniqueUser('export')
    await registerAndLogin(page, user)
    await page.goto('/profile')

    const downloadPromise = page.waitForEvent('download')
    await page.getByText('Verilerimi İndir').click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('sagliktan-verilerim.json')
    await expect(page.getByText('Verileriniz indirildi.')).toBeVisible()
  })

  test('Hesabımı Sil hesabı anonimleştirir, oturumu kapatır ve eski bilgilerle giriş engellenir', async ({ page }) => {
    const user = uniqueUser('delacc')
    await registerAndLogin(page, user)
    await page.goto('/profile')

    await page.getByText('Hesabımı Sil').click()
    await page.getByTestId('delete-account-password').fill(user.password)
    await page.getByRole('button', { name: 'Evet, Hesabımı Sil' }).click()

    await expect(page.getByText('Hesabınız silindi.')).toBeVisible()
    // logout() + navigate('/') sonrası ana sayfaya (WelcomeScreen) dönmeli.
    await expect(page).toHaveURL('/')

    // Silinen hesabın eski e-posta/şifresiyle artık giriş yapılamamalı -
    // e-posta anonimleştirildi (silinmis-{id}@sagliktan.local) ve şifre
    // rastgele bir değere çevrildi (bkz. UserServiceImpl.deleteAccount).
    await page.goto('/login')
    await page.getByTestId('login-email').fill(user.email)
    await page.getByTestId('login-password').fill(user.password)
    await page.getByRole('button', { name: 'Giriş Yap' }).click()
    await expect(page.getByText(/hatalı|bulunamadı|geçersiz/i)).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })
})
