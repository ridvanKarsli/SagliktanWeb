import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { registerAndLogin, uniqueUser, joinSeedGroup, SEED_GROUP, SEED_SUB_GROUP } from './helpers.js'

// Mobil uyum raporu roadmap: "WCAG 2.2 AA odaklı bağımsız erişilebilirlik
// denetimi yaptır (otomatik axe-core taraması + manuel klavye/screen-reader
// testi)". Bu dosya OTOMATİK taramayı kapsıyor - axe-core, WCAG ihlallerinin
// tahmini %30-40'ını (kontrast, eksik alt metin, form etiketleme, ARIA
// kullanım hataları vb.) güvenilir biçimde yakalayabiliyor. Klavye
// navigasyonu ve gerçek ekran okuyucu (VoiceOver/TalkBack) testi otomatikleş-
// tirilemiyor - bu kısım manuel kalıyor (bkz. rapor).
//
// wcag2a/wcag2aa/wcag21aa/wcag22aa etiketleriyle sınırlandırıyoruz - axe-
// core'un "best-practice" kuralları (WCAG'ın bir parçası olmayan, daha
// öznel öneriler) dahil değil, aksi halde denetim gerçek uyumluluk
// eşiğinden daha katı/gürültülü olurdu.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

async function expectNoViolations(page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  if (results.violations.length > 0) {
    const summary = results.violations
      .map(v => `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} öğe) - ${v.helpUrl}`)
      .join('\n')
    // Playwright'ın kendi diff'i yerine okunabilir bir özet fırlatıyoruz -
    // CI log'unda "hangi kural, ne kadar ciddi, nereden okunur" direkt görünsün.
    throw new Error(`axe-core WCAG ihlalleri bulundu:\n${summary}`)
  }
  expect(results.violations).toEqual([])
}

test.describe('Erişilebilirlik (axe-core, WCAG 2.2 AA) - public sayfalar', () => {
  test('Karşılama ekranı', async ({ page }) => {
    await page.goto('/')
    await expectNoViolations(page)
  })

  test('Giriş sayfası', async ({ page }) => {
    await page.goto('/login')
    await expectNoViolations(page)
  })

  test('Kayıt sayfası', async ({ page }) => {
    await page.goto('/register')
    await expectNoViolations(page)
  })

  test('KVKK Aydınlatma Metni', async ({ page }) => {
    await page.goto('/gizlilik-politikasi')
    await expectNoViolations(page)
  })
})

test.describe('Erişilebilirlik (axe-core, WCAG 2.2 AA) - kimlik doğrulamalı temel akış', () => {
  // Rapor özellikle "hedef kitle (yaşlı, motor/görme kısıtlı kullanıcılar)
  // düşünüldüğünde bu proje için özellikle kritik" diyor - bu yüzden sadece
  // public sayfalarla yetinmeyip asıl kullanılan grup/gönderi akışını da
  // kapsıyoruz, üye olmayan kullanıcı akışına ek yük bindirmeden.
  test('Hastalık grupları listesi', async ({ page }) => {
    const user = uniqueUser('a11y')
    await registerAndLogin(page, user)
    await expectNoViolations(page)
  })

  test('Gönderi akışı (feed)', async ({ page }) => {
    const user = uniqueUser('a11y-feed')
    await registerAndLogin(page, user)
    await joinSeedGroup(page)
    await page.getByRole('heading', { name: SEED_GROUP }).click()
    await page.getByRole('heading', { name: SEED_SUB_GROUP }).click()
    await expectNoViolations(page)
  })
})
