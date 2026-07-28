import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser, joinSeedGroup, SEED_GROUP, SEED_SUB_GROUP } from './helpers.js'

// NOT: Uygulama kendi içeriğini şikayet etmeyi engelliyor (PostDetail.jsx
// - "!isOwnPost"/"!isOwnComment" kontrolü, şikayet butonunu yazarına hiç
// göstermiyor). Bu doğru ve kasıtlı bir davranış - testin de bunu
// yansıtması gerekiyor: içeriği bir kullanıcı oluşturuyor, şikayeti farklı
// (ikinci) bir kullanıcı yapıyor. Eskiden aynı kullanıcı hem oluşturup hem
// şikayet etmeye çalışıyordu, buton hiç render olmadığı için testler
// 30s'de timeout'a düşüyordu (bkz. E2E #7).
test.describe('Şikayet (rapor etme)', () => {
  test('bir gönderi şikayet edilebilir', async ({ page }) => {
    const author = uniqueUser('report')
    const reporter = uniqueUser('reporter')

    await registerAndLogin(page, author)
    await joinSeedGroup(page)
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await page.getByRole('heading', { name: SEED_SUB_GROUP }).click()

    const postTitle = `Şikayet test gönderisi ${Date.now()}`
    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(postTitle)
    await page.getByTestId('post-content').fill('Bu gönderi şikayet akışını test etmek için oluşturuldu.')
    await page.getByRole('button', { name: 'Paylaş' }).click()
    await expect(page.getByText('Gönderi oluşturuldu.')).toBeVisible()
    await page.getByText(postTitle).click()
    const postUrl = page.url()

    // Kendi gönderini şikayet edemezsin - ikinci bir kullanıcıyla dene.
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    await registerAndLogin(page, reporter)
    await page.goto(postUrl)

    await page.getByRole('button', { name: 'Şikayet Et' }).click()
    await expect(page.getByText('İçeriği Şikayet Et')).toBeVisible()
    await page.getByPlaceholder(/uygunsuz içerik/).fill('E2E testi tarafından gönderilen otomatik şikayet.')
    await page.getByRole('button', { name: 'Şikayet Et' }).last().click()

    await expect(page.getByText('Şikayetiniz alındı, teşekkür ederiz.')).toBeVisible()
  })

  test('bir yorum şikayet edilebilir', async ({ page }) => {
    const author = uniqueUser('reportcomment')
    const reporter = uniqueUser('reportcomment2')

    await registerAndLogin(page, author)
    await joinSeedGroup(page)
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await page.getByRole('heading', { name: SEED_SUB_GROUP }).click()

    const postTitle = `Yorum şikayet testi ${Date.now()}`
    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(postTitle)
    await page.getByTestId('post-content').fill('İçerik.')
    await page.getByRole('button', { name: 'Paylaş' }).click()
    await expect(page.getByText('Gönderi oluşturuldu.')).toBeVisible()
    await page.getByText(postTitle).click()
    const postUrl = page.url()

    const commentText = `Şikayet edilecek yorum ${Date.now()}`
    await page.getByPlaceholder('Yorumunu yaz...').fill(commentText)
    await page.getByRole('button', { name: 'Yorum Yap' }).click()
    await expect(page.getByText(commentText)).toBeVisible()

    // Kendi yorumunu şikayet edemezsin - ikinci bir kullanıcıyla dene.
    // Reporter ne postun ne yorumun sahibi, bu yüzden hem postun hem
    // yorumun "Şikayet Et" butonu görünür oluyor - .last() yorumunkini
    // hedefliyor (DOM sırasına göre post bölümünden sonra geliyor).
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    await registerAndLogin(page, reporter)
    await page.goto(postUrl)

    await page.getByRole('button', { name: 'Şikayet Et' }).last().click()
    await expect(page.getByText('İçeriği Şikayet Et')).toBeVisible()
    await page.getByPlaceholder(/uygunsuz içerik/).fill('E2E testi tarafından gönderilen otomatik şikayet - yorum.')
    await page.getByRole('button', { name: 'Şikayet Et' }).last().click()

    await expect(page.getByText('Şikayetiniz alındı, teşekkür ederiz.')).toBeVisible()
  })
})
