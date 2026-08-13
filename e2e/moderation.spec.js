import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser, joinSeedGroup, SEED_GROUP, SEED_SUB_GROUP } from './helpers.js'

// Rapor: basit içerik moderasyonu (bkz. ContentModerationService). İki
// davranış kasıtlı olarak farklı: küfür/spam gönderimi REDDEDER (post hiç
// oluşmaz, dialog açık kalır), kriz sinyali (intihar/kendine zarar vb.) ise
// ASLA engellemez - sadece gönderiyi flaggedSensitive=true işaretleyip
// destekleyici bir bilgi kutusu (182 ALO Yaşam Hattı) gösterir.
test.describe('İçerik moderasyonu', () => {
  test('küfürlü içerik içeren gönderi reddedilir, oluşturulmaz', async ({ page }) => {
    const user = uniqueUser('modblock')
    await registerAndLogin(page, user)
    await joinSeedGroup(page)
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await page.getByRole('heading', { name: SEED_SUB_GROUP }).click()
    await expect(page).toHaveURL(/\/sub-groups\/\d+$/)

    const postTitle = `Moderasyon red testi ${Date.now()}`
    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(postTitle)
    // "salak" backend'in moderation/banned-words-tr.txt listesinde tam
    // kelime olarak yer alıyor (bkz. ContentModerationServiceImpl).
    await page.getByTestId('post-content').fill('Bu konu hakkında gerçekten salak yorumlar var.')
    await page.getByRole('button', { name: 'Paylaş' }).click()

    // Backend'in BadRequestException mesajı toast olarak görünmeli, "Gönderi
    // oluşturuldu." ASLA görünmemeli - dialog kapanmadan kalır.
    await expect(page.getByText(/uygunsuz veya istenmeyen/)).toBeVisible()
    await expect(page.getByText('Gönderi oluşturuldu.')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Yeni Gönderi' })).toBeVisible()
  })

  test('kriz sinyali içeren gönderi ENGELLENMEZ, sadece destek banner\'ı gösterilir', async ({ page }) => {
    const user = uniqueUser('modsensitive')
    await registerAndLogin(page, user)
    await joinSeedGroup(page)
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await page.getByRole('heading', { name: SEED_SUB_GROUP }).click()
    await expect(page).toHaveURL(/\/sub-groups\/\d+$/)

    const postTitle = `Moderasyon hassas içerik testi ${Date.now()}`
    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(postTitle)
    // "kendime zarar" backend'in moderation/crisis-phrases-tr.txt
    // listesinde yer alıyor - bloklamaz, sadece işaretler.
    await page.getByTestId('post-content').fill(
      'Bugünlerde çok zorlanıyorum ve bazen kendime zarar vermeyi düşünüyorum, biriyle konuşmam lazım.'
    )
    await page.getByRole('button', { name: 'Paylaş' }).click()

    // Engellenmedi: normal başarı akışı işliyor.
    await expect(page.getByText('Gönderi oluşturuldu.')).toBeVisible()

    await page.getByText(postTitle).click()
    await expect(page).toHaveURL(/\/post\/\d+$/)

    // Destek banner'ı görünür ve 182 ALO Yaşam Hattı'na referans veriyor.
    await expect(page.getByText(/182 ALO Yaşam Hattı/)).toBeVisible()
    // İçerik gizlenmedi/kısaltılmadı - hâlâ tam olarak okunabilir.
    await expect(page.getByText(/kendime zarar vermeyi düşünüyorum/)).toBeVisible()
  })
})
