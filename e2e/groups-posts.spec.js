import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser, joinSeedGroup, SEED_GROUP, SEED_SUB_GROUP } from './helpers.js'

test.describe('Gruplar, üyelik ve gönderi/yorum akışı', () => {
  test('üye olunca gruplar listesinde "Katıldın" rozeti görünür ve üye listesine düşer', async ({ page }) => {
    const user = uniqueUser('member')
    await registerAndLogin(page, user)

    await joinSeedGroup(page)

    // Sayfa "Katıldın" rozetini göstermeli, "Katıl" butonu "Ayrıl" olmalı.
    // NOT: exact:true olmadan "Gruba katıldınız." bildirim toast'ı ile de
    // eşleşip strict-mode violation'a düşüyordu (bkz. E2E #7).
    await expect(page.getByText('Katıldın', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ayrıl' })).toBeVisible()

    // Grup detayına gir, üye listesinde kendi adını gör.
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await expect(page).toHaveURL(/\/groups\/\d+$/)
    await page.getByRole('button', { name: /Üyeleri Gör/ }).click()
    await expect(page.getByText(`${user.firstName} ${user.lastName}`)).toBeVisible()

    // Kendi adına tıklayınca /profile'a düşmeli (başkasının profiline değil).
    await page.getByText(`${user.firstName} ${user.lastName}`).click()
    await expect(page).toHaveURL(/\/profile$/)
  })

  test('üye olan yorum yazıp yanıtlayabilir, üye olmayan göremez yazamaz', async ({ page }) => {
    // İki ayrı kullanıcı: biri gruba katılıp postu/yorumu oluşturacak,
    // diğeri hiç katılmadan aynı posta bakacak (gating'in gerçekten
    // ondan bağımsız çalıştığını görmek için).
    const member = uniqueUser('member2')
    const outsider = uniqueUser('outsider')

    await registerAndLogin(page, member)
    await joinSeedGroup(page)
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await page.getByRole('heading', { name: SEED_SUB_GROUP }).click()
    await expect(page).toHaveURL(/\/sub-groups\/\d+$/)

    const postTitle = `E2E test gönderisi ${Date.now()}`
    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(postTitle)
    await page.getByTestId('post-content').fill('Playwright tarafından oluşturulan test içeriği.')
    await page.getByRole('button', { name: 'Paylaş' }).click()
    await expect(page.getByText('Gönderi oluşturuldu.')).toBeVisible()

    await page.getByText(postTitle).click()
    await expect(page).toHaveURL(/\/post\/\d+$/)
    const postUrl = page.url()

    // Üye olarak yorum kutusu görünür ve çalışır olmalı.
    await expect(page.getByPlaceholder('Yorumunu yaz...')).toBeVisible()
    const commentText = `Test yorumu ${Date.now()}`
    await page.getByPlaceholder('Yorumunu yaz...').fill(commentText)
    await page.getByRole('button', { name: 'Yorum Yap' }).click()
    await expect(page.getByText(commentText)).toBeVisible()

    // Yoruma yanıt ver (sınırsız derinlik özelliğinin temel doğrulaması).
    // Yanıt kutusu açılınca hem "aç" butonu hem "gönder" butonu aynı anda
    // "Yanıtla" yazıyor - ilki toggle, ikincisi submit (DOM sırasına göre first/last).
    await page.getByRole('button', { name: 'Yanıtla' }).first().click()
    const replyText = `Test yanıtı ${Date.now()}`
    await page.getByPlaceholder(/kişisine yanıt yaz/).fill(replyText)
    await page.getByRole('button', { name: 'Yanıtla' }).last().click()
    await expect(page.getByText(replyText)).toBeVisible()

    // Şimdi hiç üye olmamış ikinci kullanıcıyla aynı posta git - yorum
    // kutusu görünmemeli, bunun yerine üyelik uyarısı çıkmalı. page.goto
    // gerçek bir tam sayfa navigasyonu olduğu için storage temizliği
    // AuthContext'i sıfırdan bootstrap ettiriyor.
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    await registerAndLogin(page, outsider)
    await page.goto(postUrl)

    await expect(page.getByText('Yorum yapabilmek için bu hastalık grubuna üye olmalısın.')).toBeVisible()
    await expect(page.getByPlaceholder('Yorumunu yaz...')).toHaveCount(0)
    // Daha önce eklenen yorum/yanıt yine de herkese görünür olmalı (okuma serbest).
    await expect(page.getByText(commentText)).toBeVisible()
    await expect(page.getByText(replyText)).toBeVisible()
  })

  test('alt grup listesinde sohbet sayısı chip\'i gönderi eklendikten sonra görünür', async ({ page }) => {
    const user = uniqueUser('subcount')
    await registerAndLogin(page, user)
    await joinSeedGroup(page)
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await expect(page).toHaveURL(/\/groups\/\d+$/)
    const groupUrl = page.url()

    await page.getByRole('heading', { name: SEED_SUB_GROUP }).click()
    await expect(page).toHaveURL(/\/sub-groups\/\d+$/)

    await page.getByRole('button', { name: 'Yeni gönderi' }).click()
    await page.getByTestId('post-title').fill(`Sayaç testi ${Date.now()}`)
    await page.getByTestId('post-content').fill('Sohbet sayacını artırmak için oluşturuldu.')
    await page.getByRole('button', { name: 'Paylaş' }).click()
    await expect(page.getByText('Gönderi oluşturuldu.')).toBeVisible()

    // Geri butonunun erişilebilir adı yok (sadece ikon) - grup detayına
    // URL üzerinden dönüp orada chip'i doğrudan doğruluyoruz.
    // NOT: getByText(/\d+\s*sohbet/) sayfadaki DİĞER alt grupların "0
    // sohbet" chip'leriyle de eşleşip strict-mode violation'a düşüyordu
    // (bkz. E2E #7) - artık SEED_SUB_GROUP'a özel data-testid ile hedefliyoruz.
    await page.goto(groupUrl)
    await expect(page.getByTestId(`subgroup-chat-count-${SEED_SUB_GROUP}`)).toHaveText(/[1-9]\d*\s*sohbet/)
  })
})
