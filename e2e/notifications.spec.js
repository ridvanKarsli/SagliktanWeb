import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser, joinSeedGroup, SEED_GROUP, SEED_SUB_GROUP } from './helpers.js'

// NOT: Bildirimler gerçek zamanlı WebSocket (STOMP) üzerinden geliyor ve
// çapraz kullanıcı bir olay - tek bir page/context ile test edilemez. İki
// ayrı browser context açıyoruz (ikisi de kendi localStorage/token'ına
// sahip, birbirinden bağımsız oturumlar) ki gerçek "kullanıcı A postuna
// kullanıcı B yorum yapınca A'ya bildirim düşer" senaryosunu birebir
// yansıtabilelim. WS teslimatı ağ/zamanlama bağımlı olduğundan
// expect(...).toBeVisible() otomatik retry'ına (varsayılan timeout) güveniyoruz;
// ayrıca sayfa yenilendikten sonra da bildirimin durduğunu doğrulayarak
// (REST GET /api/notifications) sadece anlık bir toast olmadığını, kalıcı
// olarak kaydedildiğini de kanıtlıyoruz.
test.describe('Bildirimler (WebSocket)', () => {
  test('gönderiye yorum yapılınca yazara gerçek zamanlı bildirim gider', async ({ browser }) => {
    const author = uniqueUser('notifauthor')
    const commenter = uniqueUser('notifcommenter')

    const authorContext = await browser.newContext()
    const authorPage = await authorContext.newPage()
    await registerAndLogin(authorPage, author)
    await joinSeedGroup(authorPage)
    await authorPage.getByRole('heading', { name: SEED_GROUP }).click()
    await authorPage.getByRole('heading', { name: SEED_SUB_GROUP }).click()

    const postTitle = `Bildirim test gönderisi ${Date.now()}`
    await authorPage.getByRole('button', { name: 'Yeni gönderi' }).click()
    await authorPage.getByTestId('post-title').fill(postTitle)
    await authorPage.getByTestId('post-content').fill('Bildirim akışını test etmek için oluşturuldu.')
    await authorPage.getByRole('button', { name: 'Paylaş' }).click()
    await expect(authorPage.getByText('Gönderi oluşturuldu.')).toBeVisible()
    await authorPage.getByText(postTitle).click()
    const postUrl = authorPage.url()

    // Bildirim geldiğinde henüz okunmadı rozeti 0 olmalı.
    await expect(authorPage.getByLabel('Bildirimler')).toBeVisible()

    // İkinci kullanıcı ayrı bir context'te (ayrı oturum) aynı posta gidip yorum yapar.
    const commenterContext = await browser.newContext()
    const commenterPage = await commenterContext.newPage()
    await registerAndLogin(commenterPage, commenter)
    await joinSeedGroup(commenterPage)
    await commenterPage.goto(postUrl)
    const commentText = `Bildirim tetikleyen yorum ${Date.now()}`
    await commenterPage.getByPlaceholder('Yorumunu yaz...').fill(commentText)
    await commenterPage.getByRole('button', { name: 'Yorum Yap' }).click()
    await expect(commenterPage.getByText(commentText)).toBeVisible()

    // Yazarın sayfasında (herhangi bir sayfada olabilirdi - bildirim
    // sağlayıcısı global) rozet WebSocket üzerinden 1'e çıkmalı.
    const bellBadge = authorPage.getByLabel('Bildirimler').locator('.MuiBadge-badge')
    await expect(bellBadge).toHaveText('1', { timeout: 10000 })

    await authorPage.getByLabel('Bildirimler').click()
    const expectedText = `${commenter.firstName} ${commenter.lastName} gönderine yorum yaptı`
    await expect(authorPage.getByText(expectedText)).toBeVisible()

    // Bildirime tıklayınca posta gidip okundu işaretlenmeli, rozet sıfırlanmalı.
    await authorPage.getByText(expectedText).click()
    await expect(authorPage).toHaveURL(/\/post\/\d+$/)
    // MUI Badge, içerik 0 olduğunda görsel olarak scale/opacity ile
    // gizleniyor (display:none değil) - bu yüzden toBeHidden() yerine metnin
    // artık "1" olmadığını doğruluyoruz, MUI'nin iç implementasyon detayına
    // bağımlı kalmadan.
    await expect(bellBadge).not.toHaveText('1')

    // Sayfa yenilensin - bildirim geçmişte kalıcı olarak kaydedilmiş olmalı
    // (sadece anlık bir WS push/toast değil), ama artık okunmuş durumda.
    await authorPage.reload()
    await authorPage.getByLabel('Bildirimler').click()
    await expect(authorPage.getByText(expectedText)).toBeVisible()

    await authorContext.close()
    await commenterContext.close()
  })

  test('yoruma yanıt verilince yorum sahibine bildirim gider', async ({ browser }) => {
    const author = uniqueUser('replynotifauthor')
    const replier = uniqueUser('replynotifreplier')

    const authorContext = await browser.newContext()
    const authorPage = await authorContext.newPage()
    await registerAndLogin(authorPage, author)
    await joinSeedGroup(authorPage)
    await authorPage.getByRole('heading', { name: SEED_GROUP }).click()
    await authorPage.getByRole('heading', { name: SEED_SUB_GROUP }).click()

    const postTitle = `Yanıt bildirim testi ${Date.now()}`
    await authorPage.getByRole('button', { name: 'Yeni gönderi' }).click()
    await authorPage.getByTestId('post-title').fill(postTitle)
    await authorPage.getByTestId('post-content').fill('İçerik.')
    await authorPage.getByRole('button', { name: 'Paylaş' }).click()
    await expect(authorPage.getByText('Gönderi oluşturuldu.')).toBeVisible()
    await authorPage.getByText(postTitle).click()
    const postUrl = authorPage.url()

    const commentText = `Yanıt alacak yorum ${Date.now()}`
    await authorPage.getByPlaceholder('Yorumunu yaz...').fill(commentText)
    await authorPage.getByRole('button', { name: 'Yorum Yap' }).click()
    await expect(authorPage.getByText(commentText)).toBeVisible()

    const replierContext = await browser.newContext()
    const replierPage = await replierContext.newPage()
    await registerAndLogin(replierPage, replier)
    await joinSeedGroup(replierPage)
    await replierPage.goto(postUrl)
    await replierPage.getByRole('button', { name: 'Yanıtla' }).click()
    const replyText = `Bildirim tetikleyen yanıt ${Date.now()}`
    await replierPage.getByPlaceholder(/kişisine yanıt yaz/).fill(replyText)
    await replierPage.getByRole('button', { name: 'Yanıtla' }).last().click()
    await expect(replierPage.getByText(replyText)).toBeVisible()

    const bellBadge = authorPage.getByLabel('Bildirimler').locator('.MuiBadge-badge')
    await expect(bellBadge).toHaveText('1', { timeout: 10000 })

    await authorPage.getByLabel('Bildirimler').click()
    const expectedText = `${replier.firstName} ${replier.lastName} yorumuna yanıt verdi`
    await expect(authorPage.getByText(expectedText)).toBeVisible()

    await authorContext.close()
    await replierContext.close()
  })
})
