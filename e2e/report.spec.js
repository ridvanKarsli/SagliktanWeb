import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser, joinSeedGroup, SEED_GROUP, SEED_SUB_GROUP } from './helpers.js'

test.describe('Şikayet (rapor etme)', () => {
  test('bir gönderi şikayet edilebilir', async ({ page }) => {
    const user = uniqueUser('report')
    await registerAndLogin(page, user)
    await joinSeedGroup(page)
    await page.getByText(SEED_GROUP).click()
    await page.getByText(SEED_SUB_GROUP).click()

    const postTitle = `Şikayet test gönderisi ${Date.now()}`
    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(postTitle)
    await page.getByTestId('post-content').fill('Bu gönderi şikayet akışını test etmek için oluşturuldu.')
    await page.getByRole('button', { name: 'Paylaş' }).click()
    await expect(page.getByText('Gönderi oluşturuldu.')).toBeVisible()
    await page.getByText(postTitle).click()

    await page.getByRole('button', { name: 'Şikayet Et' }).click()
    await expect(page.getByText('İçeriği Şikayet Et')).toBeVisible()
    await page.getByPlaceholder(/uygunsuz içerik/).fill('E2E testi tarafından gönderilen otomatik şikayet.')
    await page.getByRole('button', { name: 'Şikayet Et' }).last().click()

    await expect(page.getByText('Şikayetiniz alındı, teşekkür ederiz.')).toBeVisible()
  })

  test('bir yorum şikayet edilebilir', async ({ page }) => {
    const user = uniqueUser('reportcomment')
    await registerAndLogin(page, user)
    await joinSeedGroup(page)
    await page.getByText(SEED_GROUP).click()
    await page.getByText(SEED_SUB_GROUP).click()

    const postTitle = `Yorum şikayet testi ${Date.now()}`
    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(postTitle)
    await page.getByTestId('post-content').fill('İçerik.')
    await page.getByRole('button', { name: 'Paylaş' }).click()
    await expect(page.getByText('Gönderi oluşturuldu.')).toBeVisible()
    await page.getByText(postTitle).click()

    const commentText = `Şikayet edilecek yorum ${Date.now()}`
    await page.getByPlaceholder('Yorumunu yaz...').fill(commentText)
    await page.getByRole('button', { name: 'Yorum Yap' }).click()
    await expect(page.getByText(commentText)).toBeVisible()

    await page.getByRole('button', { name: 'Şikayet Et' }).last().click()
    await expect(page.getByText('İçeriği Şikayet Et')).toBeVisible()
    await page.getByRole('button', { name: 'Şikayet Et' }).last().click()

    await expect(page.getByText('Şikayetiniz alındı, teşekkür ederiz.')).toBeVisible()
  })
})
