import { test, expect } from '@playwright/test'
import { registerAndLogin, uniqueUser, uniqueAdminUser, joinSeedGroup, SEED_GROUP, SEED_SUB_GROUP } from './helpers.js'

// NOT: Admin testleri sadece CI'da (APP_TESTING_AUTO_ADMIN_EMAIL_PREFIX
// set edilmişken) gerçek ADMIN rolüyle çalışır - bkz. helpers.js#uniqueAdminUser.
// Silme aksiyonları artık native window.confirm() değil, temalı bir MUI
// Dialog (ConfirmContext/useConfirm - bkz. src/context/ConfirmContext.jsx)
// kullanıyor. Bu yüzden page.on('dialog', ...) yerine, açılan dialog
// içindeki "Sil" butonuna tıklayarak onaylıyoruz.
test.describe('Admin paneli', () => {
  test('admin olmayan kullanıcı Admin sekmesini göremez ve /admin\'e girince sessizce yönlendirilir', async ({ page }) => {
    const user = uniqueUser('nonadmin')
    await registerAndLogin(page, user)
    await expect(page.getByText('Admin', { exact: true })).not.toBeVisible()

    await page.goto('/admin')
    await expect(page).toHaveURL(/\/home$/)
    await expect(page.getByRole('heading', { name: 'Admin Paneli' })).not.toBeVisible()
  })

  test('admin kullanıcı panele erişip genel bakış istatistiklerini görür', async ({ page }) => {
    const admin = uniqueAdminUser()
    await registerAndLogin(page, admin)

    await expect(page.getByText('Admin', { exact: true })).toBeVisible()
    await page.getByText('Admin', { exact: true }).click()

    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole('heading', { name: 'Admin Paneli' })).toBeVisible()
    await expect(page.getByText('Toplam Kayıtlı Kişi')).toBeVisible()
  })

  test('şikayetler sekmesinde admin içeriği inceleyip kalıcı olarak silebilir', async ({ browser }) => {
    const author = uniqueUser('adminreportauthor')
    const reporter = uniqueUser('adminreportreporter')
    const admin = uniqueAdminUser()

    const authorContext = await browser.newContext()
    const authorPage = await authorContext.newPage()
    await registerAndLogin(authorPage, author)
    await joinSeedGroup(authorPage)
    await authorPage.getByRole('heading', { name: SEED_GROUP }).click()
    await authorPage.getByRole('heading', { name: SEED_SUB_GROUP }).click()

    const postTitle = `Admin şikayet testi ${Date.now()}`
    await authorPage.getByRole('button', { name: 'Yeni gönderi' }).click()
    await authorPage.getByTestId('post-title').fill(postTitle)
    await authorPage.getByTestId('post-content').fill('Admin şikayet akışını test etmek için oluşturuldu.')
    await authorPage.getByRole('button', { name: 'Paylaş' }).click()
    await expect(authorPage.getByText('Gönderi oluşturuldu.')).toBeVisible()
    await authorPage.getByText(postTitle).click()
    const postUrl = authorPage.url()

    const reporterContext = await browser.newContext()
    const reporterPage = await reporterContext.newPage()
    await registerAndLogin(reporterPage, reporter)
    await reporterPage.goto(postUrl)
    const reportReason = `Admin E2E şikayet sebebi ${Date.now()}`
    await reporterPage.getByRole('button', { name: 'Şikayet Et' }).click()
    await expect(reporterPage.getByText('İçeriği Şikayet Et')).toBeVisible()
    await reporterPage.getByPlaceholder(/uygunsuz içerik/).fill(reportReason)
    await reporterPage.getByRole('button', { name: 'Şikayet Et' }).last().click()
    await expect(reporterPage.getByText('Şikayetiniz alındı, teşekkür ederiz.')).toBeVisible()

    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()
    await registerAndLogin(adminPage, admin)
    await adminPage.goto('/admin')
    await adminPage.getByRole('tab', { name: 'Şikayetler' }).click()

    const reportRow = adminPage.getByRole('row').filter({ hasText: reportReason })
    await expect(reportRow).toBeVisible()
    await reportRow.getByRole('button', { name: 'İçeriği Sil' }).click()
    await adminPage.getByRole('dialog').getByRole('button', { name: 'Sil', exact: true }).click()
    await expect(adminPage.getByText('İçerik silindi.')).toBeVisible()

    // İçerik gerçekten silinmiş olmalı - yazar orijinal URL'ye gidince artık erişemiyor.
    await authorPage.goto(postUrl)
    await expect(authorPage.getByText(/bulunamadı/i)).toBeVisible()

    await authorContext.close()
    await reporterContext.close()
    await adminContext.close()
  })

  test('kullanıcılar sekmesinde admin bir kullanıcıyı arayıp düzenleyebilir', async ({ browser }) => {
    const target = uniqueUser('adminedittarget')
    const admin = uniqueAdminUser()

    const targetContext = await browser.newContext()
    const targetPage = await targetContext.newPage()
    await registerAndLogin(targetPage, target)

    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()
    await registerAndLogin(adminPage, admin)
    await adminPage.goto('/admin')
    await adminPage.getByRole('tab', { name: 'Kullanıcılar' }).click()

    await adminPage.getByPlaceholder('Ad, soyad ya da e-posta ara...').fill(target.email)
    const userRow = adminPage.getByRole('row').filter({ hasText: target.email })
    await expect(userRow).toBeVisible()
    await userRow.getByRole('button', { name: 'Düzenle' }).click()

    // Dialog başlığı düzenlenen kullanıcının e-postası - doğru kullanıcı açıldığını doğrular.
    await expect(adminPage.getByRole('heading', { name: target.email })).toBeVisible()
    const newBio = `E2E admin düzenleme ${Date.now()}`
    await adminPage.getByTestId('edit-user-bio').fill(newBio)
    await adminPage.getByRole('button', { name: 'Kaydet' }).click()
    await expect(adminPage.getByText('Kullanıcı güncellendi.')).toBeVisible()

    await targetContext.close()
    await adminContext.close()
  })

  test('içerik sekmesinde admin bir gönderiyi arayıp silebilir', async ({ browser }) => {
    const author = uniqueUser('admincontentauthor')
    const admin = uniqueAdminUser()

    const authorContext = await browser.newContext()
    const authorPage = await authorContext.newPage()
    await registerAndLogin(authorPage, author)
    await joinSeedGroup(authorPage)
    await authorPage.getByRole('heading', { name: SEED_GROUP }).click()
    await authorPage.getByRole('heading', { name: SEED_SUB_GROUP }).click()

    const postTitle = `Admin içerik silme testi ${Date.now()}`
    await authorPage.getByRole('button', { name: 'Yeni gönderi' }).click()
    await authorPage.getByTestId('post-title').fill(postTitle)
    await authorPage.getByTestId('post-content').fill('İçerik.')
    await authorPage.getByRole('button', { name: 'Paylaş' }).click()
    await expect(authorPage.getByText('Gönderi oluşturuldu.')).toBeVisible()

    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()
    await registerAndLogin(adminPage, admin)
    await adminPage.goto('/admin')
    await adminPage.getByRole('tab', { name: 'İçerik' }).click()
    await adminPage.getByPlaceholder('İçerikte ara...').fill(postTitle)

    const contentRow = adminPage.getByRole('row').filter({ hasText: postTitle })
    await expect(contentRow).toBeVisible()
    await contentRow.getByRole('button', { name: 'Sil' }).click()
    const confirmDialog = adminPage.getByRole('dialog')
    await expect(confirmDialog).toBeVisible()
    // NOT: silme sonrası tablo, ContentTab'in kendi reload GET isteği
    // tamamlanınca güncelleniyor - "Silindi." toast'ı bu isteği beklemeden
    // hemen görünür olduğundan, satırın kaybolmasını doğrudan kontrol etmek
    // yerine önce reload isteğinin bitmesini bekliyoruz (bkz. E2E #9 teşhis
    // raporu - bu bekleme olmadan negatif assertion zaman zaman raced).
    const [reloadResponse] = await Promise.all([
      adminPage.waitForResponse(res => res.url().includes('/api/admin/posts') && res.request().method() === 'GET'),
      confirmDialog.getByRole('button', { name: 'Sil', exact: true }).click(),
    ])
    await expect(reloadResponse.ok()).toBeTruthy()
    await expect(adminPage.getByText('Silindi.')).toBeVisible()
    await expect(contentRow).not.toBeVisible()

    await authorContext.close()
    await adminContext.close()
  })

  test('gruplar sekmesinde admin hastalık grubu ve alt grup oluşturup silebilir', async ({ page }) => {
    const admin = uniqueAdminUser()
    await registerAndLogin(page, admin)
    await page.goto('/admin')
    await page.getByRole('tab', { name: 'Gruplar' }).click()

    const groupName = `E2E Test Grubu ${Date.now()}`
    await page.getByRole('button', { name: '+ Yeni Hastalık Grubu' }).click()
    await page.getByTestId('group-name').fill(groupName)
    await page.getByRole('button', { name: 'Kaydet' }).click()
    await expect(page.getByText('Grup oluşturuldu.')).toBeVisible()
    await expect(page.getByText(groupName, { exact: true })).toBeVisible()

    // Accordion'ı genişlet ve alt grup ekle.
    await page.getByText(groupName, { exact: true }).click()
    const subGroupName = `E2E Alt Grup ${Date.now()}`
    await page.getByRole('button', { name: '+ Alt Grup Ekle' }).click()
    await page.getByTestId('group-name').fill(subGroupName)
    await page.getByRole('button', { name: 'Kaydet' }).click()
    await expect(page.getByText('Alt grup oluşturuldu.')).toBeVisible()
    await expect(page.getByText(subGroupName, { exact: true })).toBeVisible()

    // Temizlik: oluşturduğumuz grubu sil (cascade ile alt grup da gider) -
    // test ortamını kirletmeden bırakmamak için. NOT: { exact: true } şart -
    // aksi halde "Grubu Sil" alt string'i hem AccordionSummary'nin tüm
    // içeriği birleştiren erişilebilir adına ("... Grubu Düzenle Grubu Sil")
    // hem de "Alt Grubu Sil" butonuna substring olarak eşleşip strict-mode
    // violation'a düşüyor (bkz. E2E #9 teşhis raporu).
    const groupRow = page.locator('.MuiAccordion-root').filter({ hasText: groupName })
    await groupRow.getByRole('button', { name: 'Grubu Sil', exact: true }).click()
    const confirmDialog = page.getByRole('dialog')
    await expect(confirmDialog).toBeVisible()
    const [reloadResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/disease-groups') && res.request().method() === 'GET'),
      confirmDialog.getByRole('button', { name: 'Sil', exact: true }).click(),
    ])
    await expect(reloadResponse.ok()).toBeTruthy()
    await expect(page.getByText('Grup silindi.')).toBeVisible()
    await expect(page.getByText(groupName, { exact: true })).not.toBeVisible()
  })
})
