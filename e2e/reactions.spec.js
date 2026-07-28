import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser, joinSeedGroup, SEED_GROUP, SEED_SUB_GROUP } from './helpers.js'

// NOT: ReactionButtons.jsx sayaçları data-testid ile işaretliyor
// ("reaction-helpful-count" / "reaction-not-helpful-count") - MUI
// Typography'nin erişilebilir bir adı olmadığı için (bkz. report.spec.js'te
// aynı sınıf sorunlar). Sayfada post + her yorum için ayrı bir reaksiyon
// satırı olduğundan DOM sırasına güveniyoruz: gönderinin satırı yorumlardan
// önce render olduğu için .first() her zaman gönderiye, .last() en son
// eklenen yoruma karşılık gelir (bkz. report.spec.js'teki aynı .last() deseni).
test.describe('Reaksiyonlar (Faydalı / Faydalı Değil)', () => {
  test('bir gönderiye Faydalı / Faydalı Değil verilip kaldırılabilir', async ({ page }) => {
    const user = uniqueUser('reaction')
    await registerAndLogin(page, user)
    await joinSeedGroup(page)
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await page.getByRole('heading', { name: SEED_SUB_GROUP }).click()

    const postTitle = `Reaksiyon test gönderisi ${Date.now()}`
    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(postTitle)
    await page.getByTestId('post-content').fill('Reaksiyon akışını test etmek için oluşturuldu.')
    await page.getByRole('button', { name: 'Paylaş' }).click()
    await expect(page.getByText('Gönderi oluşturuldu.')).toBeVisible()
    await page.getByText(postTitle).click()

    const helpfulBtn = page.getByRole('button', { name: 'Faydalı', exact: true }).first()
    const notHelpfulBtn = page.getByRole('button', { name: 'Faydalı Değil' }).first()
    const helpfulCount = page.getByTestId('reaction-helpful-count').first()
    const notHelpfulCount = page.getByTestId('reaction-not-helpful-count').first()

    await expect(helpfulCount).toHaveText('0')
    await expect(notHelpfulCount).toHaveText('0')

    // Faydalı ver -> sayaç 1'e çıkar.
    await helpfulBtn.click()
    await expect(helpfulCount).toHaveText('1')
    await expect(notHelpfulCount).toHaveText('0')

    // Faydalı Değil'e geçiş -> Faydalı geri 0'a düşer, Faydalı Değil 1 olur.
    await notHelpfulBtn.click()
    await expect(helpfulCount).toHaveText('0')
    await expect(notHelpfulCount).toHaveText('1')

    // Aynı butona tekrar basmak reaksiyonu kaldırır.
    await notHelpfulBtn.click()
    await expect(helpfulCount).toHaveText('0')
    await expect(notHelpfulCount).toHaveText('0')

    // Sayfayı yenileyince backend'den gelen değer de tutarlı olmalı (0/0).
    await page.reload()
    await expect(page.getByTestId('reaction-helpful-count').first()).toHaveText('0')
    await expect(page.getByTestId('reaction-not-helpful-count').first()).toHaveText('0')
  })

  test('bir yoruma Faydalı verilebilir ve gönderinin reaksiyonundan bağımsızdır', async ({ page }) => {
    const user = uniqueUser('reactioncomment')
    await registerAndLogin(page, user)
    await joinSeedGroup(page)
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await page.getByRole('heading', { name: SEED_SUB_GROUP }).click()

    const postTitle = `Yorum reaksiyon testi ${Date.now()}`
    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(postTitle)
    await page.getByTestId('post-content').fill('İçerik.')
    await page.getByRole('button', { name: 'Paylaş' }).click()
    await expect(page.getByText('Gönderi oluşturuldu.')).toBeVisible()
    await page.getByText(postTitle).click()

    // Gönderiye Faydalı ver.
    await page.getByRole('button', { name: 'Faydalı', exact: true }).first().click()
    await expect(page.getByTestId('reaction-helpful-count').first()).toHaveText('1')

    const commentText = `Reaksiyon verilecek yorum ${Date.now()}`
    await page.getByPlaceholder('Yorumunu yaz...').fill(commentText)
    await page.getByRole('button', { name: 'Yorum Yap' }).click()
    await expect(page.getByText(commentText)).toBeVisible()

    // Yorumun kendi reaksiyon satırı en sonda (.last()) - gönderinin
    // sayacını etkilememeli.
    await page.getByRole('button', { name: 'Faydalı', exact: true }).last().click()
    await expect(page.getByTestId('reaction-helpful-count').last()).toHaveText('1')
    await expect(page.getByTestId('reaction-helpful-count').first()).toHaveText('1') // gönderi değişmedi
  })
})
