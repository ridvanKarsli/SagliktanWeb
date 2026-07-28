import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser, joinSeedGroup, SEED_GROUP, SEED_SUB_GROUP } from './helpers.js'

test.describe('Gelişmiş arama', () => {
  test('gönderi başlığına göre arar ve sonuca tıklayınca posta gider', async ({ page }) => {
    const user = uniqueUser('search')
    await registerAndLogin(page, user)
    await joinSeedGroup(page)
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await page.getByRole('heading', { name: SEED_SUB_GROUP }).click()

    const uniqueWord = `AramaTest${Date.now()}`
    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(`${uniqueWord} başlığı`)
    await page.getByTestId('post-content').fill('Arama testi için oluşturulan gönderi içeriği.')
    await page.getByRole('button', { name: 'Paylaş' }).click()
    await expect(page.getByText('Gönderi oluşturuldu.')).toBeVisible()

    await page.goto('/search')
    await page.getByPlaceholder('Ara...').fill(uniqueWord)
    await page.getByPlaceholder('Ara...').press('Enter')

    await expect(page.getByRole('tab', { name: 'Gönderiler' })).toBeVisible()
    await expect(page.getByText(`${uniqueWord} başlığı`)).toBeVisible()

    await page.getByText(`${uniqueWord} başlığı`).click()
    await expect(page).toHaveURL(/\/post\/\d+$/)
  })

  test('kişi sekmesinde kendi adını arayınca kendi profiline gider', async ({ page }) => {
    const user = uniqueUser('searchperson')
    await registerAndLogin(page, user)

    await page.goto('/search')
    await page.getByPlaceholder('Ara...').fill(user.lastName)
    await page.getByPlaceholder('Ara...').press('Enter')

    await page.getByRole('tab', { name: 'Kişiler' }).click()
    await expect(page.getByText(`${user.firstName} ${user.lastName}`)).toBeVisible()

    await page.getByText(`${user.firstName} ${user.lastName}`).click()
    await expect(page).toHaveURL(/\/profile$/)
  })

  test('yazarken hızlı arama önerileri açılır', async ({ page }) => {
    const user = uniqueUser('quicksearch')
    await registerAndLogin(page, user)

    await page.goto('/search')
    await page.getByPlaceholder('Ara...').fill(user.lastName)

    // Debounce'lu quickSearch en az 2 karakterden sonra tetikleniyor -
    // öneri kutusunda kendi adımızı görmeliyiz.
    await expect(page.getByText(`${user.firstName} ${user.lastName}`)).toBeVisible({ timeout: 5000 })
  })
})
