// Görsel inceleme harness'i: backend olmadan, /api/* isteklerini sahte
// verilerle yanıtlayıp giriş yapılmış sayfaların ekran görüntüsünü alır.
// Kullanım: node scripts/visual-harness.mjs [outDir] (vite preview 4173'te açık olmalı)
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const OUT = process.argv[2] || 'visual-out'
mkdirSync(OUT, { recursive: true })

const now = new Date()
const iso = (minsAgo) => new Date(now.getTime() - minsAgo * 60000).toISOString().replace('Z', '')
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = (type) => `${b64({ alg: 'HS256' })}.${b64({ sub: 'ayse@example.com', type, sid: 's1', exp: Math.floor(Date.now() / 1000) + 86400 })}.sig`

const me = { id: 1, email: 'ayse@example.com', firstName: 'Ayşe', lastName: 'Demir', bio: 'RP tanısı 2021. Kızım için buradayım.', role: process.env.ROLE || 'ADMIN', emailVerified: true, createdAt: iso(99999), postCount: 12, commentCount: 48, likesReceived: 130, dislikesReceived: 3 }
const names = ['Mehmet Kaya', 'Zeynep Arslan', 'Ali Yılmaz', 'Fatma Çelik', 'Deniz Koç', 'Elif Şahin']
const post = (i) => ({
  id: i, subGroupId: 2, diseaseGroupId: 1, subGroupName: ['Soru-Cevap', 'Deneyim Paylaşımları', 'Tedavi & Araştırmalar'][i % 3], diseaseGroupName: 'Retinitis Pigmentosa',
  authorId: 10 + i, authorName: names[i % names.length],
  title: ['Gece görüşü için hangi uygulamaları kullanıyorsunuz?', 'Genetik test sonucu geldi, sırada ne var?', 'İş yerinde durumumu nasıl anlatmalıyım', 'Luxturna hakkında bilgisi olan var mı?', 'Yeni tanı aldım, çok korkuyorum'][i % 5],
  content: 'Merhaba, ben 34 yaşındayım ve 2 yıl önce tanı aldım. Son zamanlarda akşamları dışarı çıkmak giderek zorlaşıyor. Telefonda kullandığınız, gerçekten işe yarayan bir uygulama var mı? Özellikle kaldırım kenarlarını ve merdivenleri fark etmekte zorlanıyorum. Deneyimlerinizi paylaşırsanız çok sevinirim.'.repeat(i % 2 ? 2 : 1),
  helpfulCount: 7 + i * 3, notHelpfulCount: i % 4, myReaction: i % 3 === 0 ? 'HELPFUL' : null, saved: i % 2 === 0, savedCount: 2 + i,
  attachments: i % 4 === 1 ? [{ id: 1, url: 'https://picsum.photos/seed/rp' + i + '/900/600', sortOrder: 0 }, { id: 2, url: 'https://picsum.photos/seed/rq' + i + '/900/600', sortOrder: 1 }] : [],
  flaggedSensitive: i === 4, pinned: i === 1, createdAt: iso(30 * (i + 1)), updatedAt: iso(30 * (i + 1)),
})
const comment = (id, parentCommentId, depthText, replyCount = 0, minsAgo = 20) => ({
  id, postId: 1, authorId: 20 + id, authorName: names[id % names.length],
  content: depthText, deleted: false, parentCommentId, helpfulCount: id % 5, notHelpfulCount: 0, myReaction: null, flaggedSensitive: false, createdAt: iso(minsAgo), replyCount,
})
const topComments = [
  comment(1, null, 'Ben "Seeing AI" ve telefonun feneri + "Be My Eyes" kombinasyonunu kullanıyorum. Akşam yürüyüşlerinde fener modunu sürekli açık tutmak çok fark yarattı. Bir de kaldırım kenarları için kontrastlı baston ucu aldım, onu da öneririm.', 3, 50),
  comment(5, null, 'Ben de aynı dönemden geçtim. Korkunun geçmesi zaman alıyor ama geçiyor; burada çok iyi insanlar var.', 1, 40),
  comment(7, null, 'Doktorum düşük ışıkta "night vision" gözlük denememi önerdi, pahalı ama deneme süresi veren firmalar varmış.', 0, 10),
  { ...comment(8, null, '', 0, 5), deleted: true, content: null },
]
const replies = {
  1: [comment(2, 1, 'Be My Eyes gerçekten hayat kurtarıyor, gönüllüler çok hızlı yanıt veriyor.', 1, 45), comment(3, 1, 'Baston ucu markası hangisi? Linkini atabilir misin?', 0, 44), comment(4, 1, 'Ben de fener modunu öneriyorum, kızım için de aynı şeyi yapıyoruz.', 0, 30)],
  2: [comment(9, 2, 'Katılıyorum, hem de ücretsiz. Yalnız bazen gece saatlerinde bekleme uzuyor; o zaman Seeing AI yetişiyor.', 0, 42)],
  5: [comment(6, 5, 'Teşekkür ederim, bunu okumak bile iyi geldi.', 0, 38)],
}
const page = (content, extra = {}) => ({ content, last: true, totalElements: content.length, ...extra })
const groups = [{ id: 1, name: 'Retinitis Pigmentosa', description: 'Retinitis pigmentosa hastaları ve yakınları için deneyim paylaşımı, dayanışma ve bilgi alışverişi topluluğu.', memberCount: 184, createdAt: iso(99999) }, { id: 2, name: 'Multipl Skleroz', description: 'MS ile yaşayanlar ve yakınları.', memberCount: 92, createdAt: iso(9999) }]
const subGroups = [{ id: 1, diseaseGroupId: 1, name: 'Sohbet & Sosyalleşme', description: 'Günlük sohbet ve tanışma.', postCount: 34, createdAt: iso(9999) }, { id: 2, diseaseGroupId: 1, name: 'Soru-Cevap', description: 'Sorularınızı sorun, deneyimi olanlar yanıtlasın.', postCount: 58, createdAt: iso(9999) }, { id: 3, diseaseGroupId: 1, name: 'Tedavi & Araştırmalar', description: 'Klinik araştırmalar, tedavi haberleri.', postCount: 12, createdAt: iso(9999) }]
const conversations = [1, 2, 3].map((i) => ({ id: i, otherUserId: 10 + i, otherUserName: names[i], lastMessagePreview: ['Teşekkürler, çok yardımcı oldun 🙏', 'Yarın randevum var, sonra yazarım', 'Fotoğrafı gördün mü?'][i - 1], lastMessageHasAttachment: i === 3, lastMessageHasSharedPost: false, lastMessageAt: iso(i * 60), unreadCount: i === 1 ? 2 : 0, canMessage: true }))
const messages = [1, 2, 3, 4, 5, 6].map((i) => ({ id: i, conversationId: 1, senderId: i % 2 ? 11 : 1, content: ['Merhaba Ayşe, gönderini okudum', 'Merhaba! Nasılsın?', 'İyiyim, sana bir şey sormak istiyorum: genetik testi nerede yaptırdın?', 'İstanbul Tıp Fakültesi genetik bölümünde, 3 hafta sürdü', 'Çok teşekkürler, çok yardımcı oldun 🙏', 'Ne demek, her zaman'][i - 1], attachmentUrl: null, sharedPost: null, readAt: iso(1), createdAt: iso(60 - i * 5) }))
const notifications = [1, 2, 3, 4].map((i) => ({ id: i, type: ['NEW_COMMENT', 'NEW_REPLY', 'POST_REACTION', 'NEW_COMMENT'][i - 1], actorId: 10 + i, actorName: names[i], postId: 1, commentId: i, read: i > 2, createdAt: iso(i * 15) }))
const reports = [1, 2, 3, 4, 5].map((i) => ({ id: i, targetType: ['POST', 'COMMENT', 'MESSAGE', 'USER', 'POST'][i - 1], targetId: i, targetPreview: 'Bu ilacı kesinlikle bırakın, doktorlar yalan söylüyor, benim kullandığım bitkisel kür…', targetOwnerId: 30 + i, targetOwnerName: names[i % 6], reporterId: 1, reporterName: 'Ayşe Demir', reason: ['Tıbbi yanlış bilgi', 'Hakaret', 'Spam', 'Taciz', 'Reklam'][i - 1], status: i < 4 ? 'PENDING' : 'REVIEWED', resolvedById: null, resolvedByName: null, resolvedAt: null, createdAt: iso(i * 90) }))
const adminUsers = names.map((n, i) => ({ id: 10 + i, email: n.toLowerCase().replace(' ', '.').replace(/[çşğıöü]/g, 'x') + '@example.com', firstName: n.split(' ')[0], lastName: n.split(' ')[1], bio: '', role: i === 0 ? 'ADMIN' : 'USER', emailVerified: i !== 4, active: i !== 5, kvkkConsentAt: iso(9999), createdAt: iso(5000 - i * 300) }))
const adminPosts = [0, 1, 2, 3].map((i) => ({ id: i + 1, subGroupId: 2, diseaseGroupId: 1, authorId: 10 + i, authorName: names[i], title: post(i).title, content: post(i).content, attachments: post(i).attachments, createdAt: iso(i * 100) }))
const adminComments = topComments.filter((c) => !c.deleted).map((c) => ({ id: c.id, postId: 1, authorId: c.authorId, authorName: c.authorName, content: c.content, deleted: false, createdAt: c.createdAt }))

function route(url, method) {
  const p = url.pathname.replace(/^\/api/, '')
  const m = (re) => p.match(re)
  if (p === '/users/me') return me
  if (p === '/users/me/disease-groups') return groups
  if (p === '/users/me/posts') return page([post(0), post(1), post(2)])
  if (p === '/users/me/saved-posts') return page([post(0), post(2)])
  if (p === '/users/me/sessions') return [{ id: 1, deviceLabel: 'iPhone · Safari', ipAddress: '85.1.2.3', lastUsedAt: iso(1), createdAt: iso(999), current: true }, { id: 2, deviceLabel: 'Mac · Chrome', ipAddress: '85.1.2.4', lastUsedAt: iso(300), createdAt: iso(5000), current: false }]
  if (m(/^\/users\/\d+\/posts$/)) return page([post(1), post(3)])
  if (m(/^\/users\/(\d+)$/)) return { ...me, id: 11, firstName: 'Mehmet', lastName: 'Kaya', bio: 'RP ile 10 yıl. Sorularınıza elimden geldiğince yanıt veririm.' }
  if (p === '/disease-groups') return groups
  if (m(/^\/disease-groups\/\d+$/)) return groups[0]
  if (m(/^\/disease-groups\/\d+\/sub-groups$/)) return subGroups
  if (m(/^\/disease-groups\/\d+\/members$/)) return page(names.map((n, i) => ({ id: 10 + i, firstName: n.split(' ')[0], lastName: n.split(' ')[1] })))
  if (m(/^\/sub-groups\/\d+$/)) return subGroups[1]
  if (m(/^\/sub-groups\/\d+\/posts/)) return page([0, 1, 2, 3, 4].map(post), { last: false })
  if (p === '/posts/feed') return page([0, 1, 2, 3, 4].map(post), { last: false })
  if (p === '/posts/search') return page([post(0), post(3)])
  if (m(/^\/posts\/(\d+)\/comments$/)) return page(topComments)
  if (m(/^\/posts\/(\d+)$/)) return post(1)
  if (m(/^\/comments\/(\d+)\/replies$/)) return page(replies[+m(/^\/comments\/(\d+)\/replies$/)[1]] || [])
  if (p === '/notifications') return page(notifications)
  if (p === '/notifications/unread-count') return { count: 2 }
  if (p === '/messages/conversations') return page(conversations)
  if (m(/^\/messages\/conversations\/\d+\/messages$/)) return page([...messages].reverse())
  if (m(/^\/messages\/conversations\/\d+$/)) return conversations[0]
  if (p === '/messages/requests') return page([{ id: 1, senderId: 15, senderName: 'Elif Şahin', recipientId: 1, recipientName: 'Ayşe Demir', status: 'PENDING', createdAt: iso(120) }])
  if (p === '/messages/requests/outgoing') return page([])
  if (p === '/messages/requests/count') return { count: 1 }
  if (p === '/messages/unread-count') return { count: 2 }
  if (p === '/messages/blocked') return []
  if (p === '/search') return { posts: [post(0), post(3)], comments: topComments.slice(0, 2), users: adminUsers.slice(0, 3).map((u) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, bio: u.bio })) }
  if (p === '/admin/stats') return { totalUsers: 184, totalPosts: 412, totalComments: 1930, pendingReports: 3 }
  if (p === '/admin/users') return page(adminUsers)
  if (p === '/admin/reports') return page(reports)
  if (p === '/admin/posts') return page(adminPosts)
  if (p === '/admin/comments') return page(adminComments)
  if (method !== 'GET') return {}
  return null
}

const shots = [
  ['home', '/home'], ['groups', '/groups'], ['subgroups', '/groups/1'], ['posts', '/sub-groups/2'], ['post-detail', '/post/1'],
  ['search', '/search?q=gece'], ['profile', '/profile'], ['profile-groups', '/profile?tab=groups'], ['profile-groups-menu', '/profile?tab=groups'], ['profile-leave-confirm', '/profile?tab=groups'], ['profile-left', '/profile?tab=groups'], ['profile-edit', '/profile'], ['user-profile', '/users/11'], ['settings', '/profile/settings'],
  ['messages', '/messages'], ['chat', '/messages/1'], ['requests', '/messages/requests'],
  ['admin-dashboard', '/admin'], ['admin-reports', '/admin?tab=reports'], ['admin-users', '/admin?tab=users'], ['admin-content', '/admin?tab=content'], ['admin-groups', '/admin?tab=groups'],
]
const viewports = { mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, desktop: { width: 1280, height: 800 } }
const only = process.env.ONLY ? process.env.ONLY.split(',') : null
const theme = process.env.THEME || 'dark'

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [vpName, vp] of Object.entries(viewports)) {
  if (process.env.VP && process.env.VP !== vpName) continue
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1, locale: 'tr-TR', timezoneId: 'Europe/Istanbul' })
  await ctx.addInitScript(([access, refresh, theme]) => {
    localStorage.setItem('auth', JSON.stringify({ accessToken: access, refreshToken: refresh }))
    localStorage.setItem('sagliktan:accessibility', JSON.stringify({ themeMode: theme }))
    localStorage.setItem('sagliktan:install-prompt-dismissed', String(Date.now()))
  }, [jwt('access'), jwt('refresh'), theme])
  await ctx.route('**/api/**', async (r) => {
    const req = r.request(); const u = new URL(req.url())
    const body = route(u, req.method())
    if (body === null) return r.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'mock yok: ' + u.pathname }) })
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
  await ctx.route(/ws:\/\/|wss:\/\//, (r) => r.abort())
  // #root scroll container olduğu için fullPage çalışmaz; ekran görüntüsü için akışı belgeye bırak
  await ctx.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = 'html,body,#root{height:auto!important;overflow:visible!important}'; document.head.appendChild(st) }) })
  const pg = await ctx.newPage()
  const errors = []
  pg.on('pageerror', (e) => errors.push(e.message))
  pg.on('console', (m) => { if (m.type() === 'error' && !/WebSocket|ws:\/\//.test(m.text())) errors.push(m.text().slice(0, 160)) })
  for (const [name, path, tabName] of shots) {
    if (only && !only.includes(name)) continue
    try {
      await pg.goto('http://localhost:4173' + path, { waitUntil: 'networkidle', timeout: 20000 })
      await pg.waitForTimeout(600)
      if (tabName) { await pg.getByRole('tab', { name: tabName }).click(); await pg.waitForTimeout(700) }
      if (name === 'post-detail') {
        // yanıtları aç
        for (const btn of await pg.getByRole('button', { name: /^\d+ yanıt$/ }).all()) { try { await btn.click({ timeout: 500 }); await pg.waitForTimeout(250) } catch { /* yok */ } }
        await pg.waitForTimeout(400)
      }
      if (name.startsWith('profile-groups-menu') || name === 'profile-leave-confirm' || name === 'profile-left') {
        await pg.getByRole('button', { name: /için seçenekler$/ }).first().click(); await pg.waitForTimeout(400)
        if (name !== 'profile-groups-menu') { await pg.getByRole('menuitem', { name: 'Gruptan ayrıl' }).click(); await pg.waitForTimeout(400) }
        if (name === 'profile-left') { await pg.getByRole('button', { name: 'Ayrıl', exact: true }).click(); await pg.waitForTimeout(800) }
      }
      if (name === 'profile-edit') { await pg.getByRole('button', { name: 'Profili düzenle' }).click(); await pg.waitForTimeout(500) }
      const fullPage = !['profile-groups-menu', 'profile-leave-confirm'].includes(name)
      await pg.screenshot({ path: `${OUT}/${vpName}-${name}.png`, fullPage })
      console.log('ok', vpName, name)
    } catch (e) { console.log('FAIL', vpName, name, e.message.split('\n')[0]) }
  }
  if (errors.length) console.log(`[${vpName}] console/page errors:`, [...new Set(errors)].slice(0, 8))
  await ctx.close()
}
await browser.close()
