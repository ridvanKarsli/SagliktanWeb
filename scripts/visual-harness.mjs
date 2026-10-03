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

const me = { id: 1, email: 'ayse@example.com', firstName: 'Ayşe', lastName: 'Demir', bio: 'RP tanısı 2021. Kızım için buradayım.', role: process.env.ROLE || 'ADMIN', emailVerified: true, communityRole: 'CAREGIVER', diagnosisYear: 2021, city: 'İzmir', discoverable: process.env.DISCOVERABLE !== '0', onboardingCompleted: process.env.ONBOARDED !== '0', weeklyDigestEnabled: true, createdAt: iso(99999), postCount: 12, commentCount: 48, likesReceived: 130, dislikesReceived: 3 }
// [profil/avatar] yol arkadaşları kataloğu (backend AvatarCatalog ile aynı) + avatarKey alanları
me.avatarKey = process.env.NOAVATAR ? null : 'kirpi'
const HELPFUL = Number(process.env.HELPFUL ?? 27)
const avatarCatalog = [['filiz', 'Filiz', 0], ['damla', 'Damla', 0], ['bulut', 'Bulut', 0], ['cakil', 'Çakıl', 0], ['papatya', 'Papatya', 5], ['kirpi', 'Kirpi', 5], ['kaplumbaga', 'Kaplumbağa', 15], ['serce', 'Serçe', 15], ['kedi', 'Pamuk', 30], ['ayicik', 'Ayıcık', 30], ['baykus', 'Bilge', 60], ['tilki', 'Tilki', 60], ['gunes', 'Güneş', 120], ['deniz-feneri', 'Fener', 120], ['ay-cicegi', 'Ayçiçeği', 250], ['yildiz', 'Yıldız', 500]]
const avatarOptions = () => ({ helpfulReceived: HELPFUL, selectedKey: me.avatarKey, avatars: avatarCatalog.map(([key, name, requiredHelpful]) => ({ key, name, requiredHelpful, unlocked: HELPFUL >= requiredHelpful })) })
const names = ['Mehmet Kaya', 'Zeynep Arslan', 'Ali Yılmaz', 'Fatma Çelik', 'Deniz Koç', 'Elif Şahin']
// [akış] kişilerin avatarları (biri null: baş harf geri dönüşü de görünsün)
const avatarFor = (i) => ['kaplumbaga', 'papatya', null, 'baykus', 'deniz-feneri', 'tilki'][i % 6]
const post = (i) => ({
  id: i, subGroupId: 2, diseaseGroupId: 1, subGroupName: ['Soru-Cevap', 'Deneyim Paylaşımları', 'Tedavi & Araştırmalar'][i % 3], diseaseGroupName: 'Retinitis Pigmentosa',
  authorId: 10 + i, authorName: names[i % names.length], authorAvatarKey: avatarFor(i),
  title: ['Gece görüşü için hangi uygulamaları kullanıyorsunuz?', 'Genetik test sonucu geldi, sırada ne var?', 'İş yerinde durumumu nasıl anlatmalıyım', 'Luxturna hakkında bilgisi olan var mı?', 'Yeni tanı aldım, çok korkuyorum'][i % 5],
  content: 'Merhaba, ben 34 yaşındayım ve 2 yıl önce tanı aldım. Son zamanlarda akşamları dışarı çıkmak giderek zorlaşıyor. Telefonda kullandığınız, gerçekten işe yarayan bir uygulama var mı? Özellikle kaldırım kenarlarını ve merdivenleri fark etmekte zorlanıyorum. Deneyimlerinizi paylaşırsanız çok sevinirim.'.repeat(i % 2 ? 2 : 1),
  helpfulCount: 7 + i * 3, notHelpfulCount: i % 4, myReaction: i % 3 === 0 ? 'HELPFUL' : null, saved: i % 2 === 0, savedCount: 2 + i,
  attachments: i % 4 === 1 ? [{ id: 1, url: 'https://picsum.photos/seed/rp' + i + '/900/600', sortOrder: 0 }, { id: 2, url: 'https://picsum.photos/seed/rq' + i + '/900/600', sortOrder: 1 }] : [],
  flaggedSensitive: i === 4, pinned: i === 1, createdAt: iso(30 * (i + 1)), updatedAt: iso(30 * (i + 1)),
  postType: i === 0 ? 'QUESTION' : i === 3 ? 'POLL' : i === 2 ? 'QUESTION' : 'DISCUSSION',
  acceptedCommentId: i === 0 ? 2 : null, commentCount: [7, 3, 0, 12, 1][i % 5],
  poll: i === 3 ? { options: [{ id: 31, label: 'Luxturna', votes: 4 }, { id: 32, label: 'Klinik araştırma', votes: 7 }, { id: 33, label: 'Henüz bir şey denemedim', votes: 12 }], totalVotes: 23, myOptionId: process.env.VOTED ? 32 : null } : null,
})
const comment = (id, parentCommentId, depthText, replyCount = 0, minsAgo = 20) => ({
  id, postId: 1, authorId: 20 + id, authorName: names[id % names.length], authorAvatarKey: avatarFor(id),
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
const conversations = [1, 2, 3].map((i) => ({ id: i, otherUserId: 10 + i, otherUserName: names[i], lastMessagePreview: ['Teşekkürler, çok yardımcı oldun 🙏', 'Yarın randevum var, sonra yazarım', 'Fotoğrafı gördün mü?'][i - 1], lastMessageHasAttachment: i === 3, lastMessageHasSharedPost: false, otherUserAvatarKey: ['papatya', null, 'baykus'][i - 1], lastMessageAt: iso(i * 60), unreadCount: i === 1 ? 2 : 0, canMessage: true }))
const messages = [1, 2, 3, 4, 5, 6].map((i) => ({ id: i, conversationId: 1, senderId: i % 2 ? 11 : 1, content: ['Merhaba Ayşe, gönderini okudum', 'Merhaba! Nasılsın?', 'İyiyim, sana bir şey sormak istiyorum: genetik testi nerede yaptırdın?', 'İstanbul Tıp Fakültesi genetik bölümünde, 3 hafta sürdü', 'Çok teşekkürler, çok yardımcı oldun 🙏', 'Ne demek, her zaman'][i - 1], attachmentUrl: null, sharedPost: null, readAt: iso(1), createdAt: iso(60 - i * 5) }))
const notifications = [1, 2, 3, 4].map((i) => ({ id: i, type: ['NEW_COMMENT', 'NEW_REPLY', 'POST_REACTION', 'NEW_COMMENT'][i - 1], actorId: 10 + i, actorName: names[i], actorAvatarKey: avatarFor(i), postId: 1, commentId: i, read: i > 2, createdAt: iso(i * 15) }))
const reports = [1, 2, 3, 4, 5].map((i) => ({ id: i, targetType: ['POST', 'COMMENT', 'MESSAGE', 'USER', 'POST'][i - 1], targetId: i, targetPreview: 'Bu ilacı kesinlikle bırakın, doktorlar yalan söylüyor, benim kullandığım bitkisel kür…', targetOwnerId: 30 + i, targetOwnerName: names[i % 6], reporterId: 1, reporterName: 'Ayşe Demir', reason: ['Tıbbi yanlış bilgi', 'Hakaret', 'Spam', 'Taciz', 'Reklam'][i - 1], status: i < 4 ? 'PENDING' : 'REVIEWED', resolvedById: null, resolvedByName: null, resolvedAt: null, createdAt: iso(i * 90) }))
const adminUsers = names.map((n, i) => ({ id: 10 + i, email: n.toLowerCase().replace(' ', '.').replace(/[çşğıöü]/g, 'x') + '@example.com', firstName: n.split(' ')[0], lastName: n.split(' ')[1], bio: '', role: i === 0 ? 'ADMIN' : 'USER', emailVerified: i !== 4, active: i !== 5, kvkkConsentAt: iso(9999), createdAt: iso(5000 - i * 300) }))
const adminPosts = [0, 1, 2, 3].map((i) => ({ id: i + 1, subGroupId: 2, diseaseGroupId: 1, authorId: 10 + i, authorName: names[i], title: post(i).title, content: post(i).content, attachments: post(i).attachments, createdAt: iso(i * 100) }))
const adminComments = topComments.filter((c) => !c.deleted).map((c) => ({ id: c.id, postId: 1, authorId: c.authorId, authorName: c.authorName, content: c.content, deleted: false, createdAt: c.createdAt }))

// Admin kullanım grafiği: istenen gün sayısı kadar, hafta içi/sonu ritmi ve
// hafif büyüme eğilimi olan deterministik veri. ACTIVITY=empty|error durumları için.
function activity(days) {
  days = Math.max(7, Math.min(90, days || 30))
  let seed = 7 + days
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }))
  const point = (offset) => {
    const d = new Date(today); d.setDate(d.getDate() - offset)
    const dow = d.getDay()
    const rhythm = dow === 0 ? 0.62 : dow === 6 ? 0.74 : dow === 1 ? 1.12 : 1
    const growth = 1 + (90 - offset) / 260
    const n = (base, jitter = 0.25) => Math.max(0, Math.round(base * rhythm * growth * (1 - jitter + rnd() * jitter * 2)))
    const active = n(46)
    return { date: d.toISOString().slice(0, 10), activeUsers: active, newUsers: rnd() < 0.18 ? 0 : n(3.2, 0.6), posts: n(9, 0.4), comments: n(31, 0.35), reactions: n(64, 0.3), messages: n(40, 0.3) }
  }
  if (process.env.ACTIVITY === 'empty') {
    const z = (o) => { const p = point(o); return { date: p.date, activeUsers: 0, newUsers: 0, posts: 0, comments: 0, reactions: 0, messages: 0 } }
    const zero = { activeUsers: 0, newUsers: 0, posts: 0, comments: 0, reactions: 0, messages: 0, questionsAsked: 0, questionsSolved: 0 }
    return { days, series: Array.from({ length: days }, (_, i) => z(days - 1 - i)), current: zero, previous: zero, topGroups: [] }
  }
  const series = Array.from({ length: days }, (_, i) => point(days - 1 - i))
  const prev = Array.from({ length: days }, (_, i) => point(2 * days - 1 - i))
  const sum = (arr, k) => arr.reduce((a, p) => a + p[k], 0)
  const summary = (arr, f) => ({ activeUsers: Math.round(Math.max(...arr.map(p => p.activeUsers)) * (1.9 + Math.log2(days) * 0.35) * f), newUsers: sum(arr, 'newUsers'), posts: sum(arr, 'posts'), comments: sum(arr, 'comments'), reactions: sum(arr, 'reactions'), messages: sum(arr, 'messages'), questionsAsked: Math.round(sum(arr, 'posts') * 0.38), questionsSolved: Math.round(sum(arr, 'posts') * 0.38 * (f > 1 ? 0.64 : 0.59)) })
  const current = summary(series, 1.04)
  const previous = summary(prev, 1)
  const tg = [['Retinitis Pigmentosa', 0.34], ['Multipl Skleroz', 0.22], ['Duchenne Musküler Distrofi (DMD)', 0.14], ['Kistik Fibrozis', 0.1], ['Ailesel Akdeniz Ateşi', 0.07]]
  return { days, series, current, previous, topGroups: tg.map(([name, f], i) => ({ diseaseGroupId: i + 1, name, posts: Math.round(current.posts * f), comments: Math.round(current.comments * f * (i === 2 ? 1.5 : 1)) })) }
}

function route(url, method, req) {
  const p = url.pathname.replace(/^\/api/, '')
  const m = (re) => p.match(re)
  if (p === '/users/me/avatars') return avatarOptions()
  if (p === '/users/me/avatar' && method === 'PUT') { me.avatarKey = req?.postDataJSON()?.avatarKey ?? null; return me }
  if (p === '/users/me') return me
  if (p === '/users/me/similar') return [
    { id: 11, firstName: 'Zeynep', lastName: 'Arslan', communityRole: 'CAREGIVER', diagnosisYear: 2020, city: 'İzmir', sharedGroups: ['Retinitis Pigmentosa'], reasons: ['Senin gibi hasta yakını', 'Tanı yılınız yakın'], avatarKey: 'papatya' },
    { id: 12, firstName: 'Ali', lastName: 'Yılmaz', communityRole: 'PATIENT', diagnosisYear: 2019, city: 'Ankara', sharedGroups: ['Retinitis Pigmentosa', 'Multipl Skleroz'], reasons: [], avatarKey: 'gunes' },
    { id: 13, firstName: 'Fatma', lastName: 'Çelik', communityRole: 'CAREGIVER', diagnosisYear: null, city: 'İzmir', sharedGroups: ['Retinitis Pigmentosa'], reasons: ['Aynı şehirdesiniz'] },
  ]
  if (p === '/posts/open-questions') return page([{ ...post(2), subGroupName: 'Soru-Cevap', diseaseGroupName: 'Retinitis Pigmentosa' }, { ...post(0), acceptedCommentId: null, commentCount: 1, subGroupName: 'Soru-Cevap', diseaseGroupName: 'Retinitis Pigmentosa' }])
  if (p === '/users/me/disease-groups') return groups
  if (p === '/users/me/posts') return page([post(0), post(1), post(2)])
  if (p === '/users/me/saved-posts') return page([post(0), post(2)])
  if (p === '/users/me/sessions') return [{ id: 1, deviceLabel: 'iPhone · Safari', ipAddress: '85.1.2.3', lastUsedAt: iso(1), createdAt: iso(999), current: true }, { id: 2, deviceLabel: 'Mac · Chrome', ipAddress: '85.1.2.4', lastUsedAt: iso(300), createdAt: iso(5000), current: false }]
  if (m(/^\/users\/\d+\/posts$/)) return page([post(1), post(3)])
  if (m(/^\/users\/(\d+)$/)) return { ...me, id: 11, firstName: 'Mehmet', lastName: 'Kaya', bio: 'RP ile 10 yıl. Sorularınıza elimden geldiğince yanıt veririm.', avatarKey: 'kaplumbaga', likesReceived: 64 }
  if (p === '/disease-groups') return groups
  if (m(/^\/disease-groups\/\d+$/)) return groups[0]
  if (m(/^\/disease-groups\/\d+\/sub-groups$/)) return subGroups
  if (m(/^\/disease-groups\/\d+\/members$/)) return page(names.map((n, i) => ({ id: 10 + i, firstName: n.split(' ')[0], lastName: n.split(' ')[1], avatarKey: avatarFor(i) })))
  if (m(/^\/sub-groups\/\d+$/)) return subGroups[1]
  if (m(/^\/sub-groups\/\d+\/posts/)) return page([0, 1, 2, 3, 4].map(post), { last: false })
  if (p === '/posts/feed') return page([0, 1, 2, 3, 4].map(post), { last: false })
  if (p === '/posts/search') return page([post(0), post(3)])
  if (m(/^\/posts\/(\d+)\/comments$/)) return page(topComments)
  if (m(/^\/posts\/(\d+)$/)) { const id = Number(p.split('/')[2]); return id === 4 ? { ...post(3), id: 4, authorId: 1, authorName: 'Ayşe Demir' } : id === 1 ? { ...post(0), id: 1, authorId: 1, authorName: 'Ayşe Demir', commentCount: 4 } : post(1) }
  if (m(/^\/comments\/(\d+)\/replies$/)) return page(replies[+m(/^\/comments\/(\d+)\/replies$/)[1]] || [])
  if (p === '/notifications') return page(notifications)
  if (p === '/notifications/unread-count') return { count: 2 }
  if (p === '/messages/conversations') return page(conversations)
  if (m(/^\/messages\/conversations\/\d+\/messages$/)) return page([...messages].reverse())
  if (m(/^\/messages\/conversations\/\d+$/)) return conversations[0]
  if (p === '/messages/requests') return page([{ id: 1, senderId: 15, senderName: 'Elif Şahin', senderAvatarKey: 'kedi', recipientId: 1, recipientName: 'Ayşe Demir', status: 'PENDING', createdAt: iso(120) }])
  if (p === '/messages/requests/outgoing') return page([])
  if (p === '/messages/requests/count') return { count: 1 }
  if (p === '/messages/unread-count') return { count: 2 }
  if (p === '/messages/blocked') return [{ id: 1, userId: 16, userName: 'Can Öztürk', avatarKey: 'bulut', createdAt: iso(900) }, { id: 2, userId: 17, userName: 'Selin Ak', avatarKey: null, createdAt: iso(1900) }]
  if (p === '/search') return { posts: [post(0), post(3)], comments: topComments.slice(0, 2), users: adminUsers.slice(0, 3).map((u) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, bio: u.bio })) }
  if (p === '/admin/stats/activity') return process.env.ACTIVITY === 'error' ? null : activity(Number(url.searchParams.get('days')))
  if (p === '/admin/stats') return { totalUsers: 184, totalPosts: 412, totalComments: 1930, pendingReports: 3 }
  if (p === '/admin/users') return page(adminUsers)
  if (p === '/admin/reports') return page(reports)
  if (p === '/admin/posts') return page(adminPosts)
  if (p === '/admin/comments') return page(adminComments)
  if (method !== 'GET') return {}
  return null
}

const shots = [
  ['home', '/home'], ['groups', '/groups'],
  // [akış] iskelet çekimleri + bildirim menüsü + boş arama
  ['home-loading', '/home'], ['groups-loading', '/groups'], ['subgroups-loading', '/groups/1'], ['posts-loading', '/sub-groups/2'], ['post-detail-loading', '/post/1'], ['search-loading', '/search?q=gece'], ['notifications', '/home'], ['search-empty', '/search'], ['subgroups', '/groups/1'], ['posts', '/sub-groups/2'], ['post-detail', '/post/1'],
  ['search', '/search?q=gece'], ['profile', '/profile'], ['profile-groups', '/profile?tab=groups'], ['profile-groups-menu', '/profile?tab=groups'], ['profile-leave-confirm', '/profile?tab=groups'], ['profile-left', '/profile?tab=groups'], ['profile-edit', '/profile'], ['home-compose', '/home'], ['home-questions', '/home?tab=questions'], ['compose-poll', '/home'], ['post-poll', '/post/4'], ['post-question', '/post/1'], ['onboarding-role', '/hosgeldin'], ['onboarding-groups', '/hosgeldin'], ['onboarding-details', '/hosgeldin'], ['settings-matching', '/profile/settings#eslesme'], ['home-compose-picked', '/home'], ['subgroups-compose', '/groups/1'], ['posts-compose', '/sub-groups/2'], ['user-profile', '/users/11'], ['settings', '/profile/settings'],
  ['messages', '/messages'], ['chat', '/messages/1'], ['requests', '/messages/requests'],
  ['profile-avatar', '/profile'], ['profile-unlock', '/profile'], ['settings-blocked', '/profile/settings'], ['profile-loading', '/profile'], ['user-profile-loading', '/users/11'], ['messages-loading', '/messages'], ['chat-loading', '/messages/1'], ['requests-loading', '/messages/requests'], ['onboarding-loading', '/hosgeldin'], ['onboarding-done', '/hosgeldin'],
  ['form-profile-city', '/profile'], ['form-profile-errors', '/profile'], ['form-compose-errors', '/sub-groups/2'], ['form-poll-dup', '/home'], ['form-password', '/profile/settings'],
  ['admin-dashboard', '/admin'], ['admin-dashboard-7', '/admin?gun=7'], ['admin-dashboard-90', '/admin?gun=90'], ['admin-dashboard-tooltip', '/admin'], ['admin-dashboard-table', '/admin'], ['admin-reports', '/admin?tab=reports'], ['admin-users', '/admin?tab=users'], ['admin-content', '/admin?tab=content'], ['admin-groups', '/admin?tab=groups'],
]
const viewports = { mobile: { width: Number(process.env.VW) || 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, desktop: { width: 1280, height: 800 } }
const only = process.env.ONLY ? process.env.ONLY.split(',') : null
const theme = process.env.THEME || 'dark'
let holdApi = false // *-loading çekimleri: API yanıtları bekletilir, iskeletler görünür

// Form doğrulama görünümleri (form-*): alanları hatalı doldurup hata metinlerini gösterir.
async function formShot(pg, name) {
  if (name.startsWith('form-profile')) {
    await pg.getByRole('button', { name: 'Profili düzenle' }).click(); await pg.waitForTimeout(400)
    if (name === 'form-profile-city') { const c = pg.getByRole('combobox', { name: 'Yaşadığın şehir' }); await c.click(); await c.fill('ıs') }
    else { await pg.getByRole('textbox', { name: 'Ad', exact: true }).fill('Ali3'); await pg.getByRole('textbox', { name: 'Soyad' }).fill(' '); await pg.locator('form').filter({ hasText: 'Profili düzenle' }).getByRole('button', { name: 'Kaydet' }).click() }
  }
  if (name === 'form-compose-errors') {
    await pg.evaluate(() => { try { localStorage.removeItem('sagliktan:post-draft') } catch { /* */ } })
    await pg.getByRole('button', { name: /paylaş…$|Ne paylaşmak istersin\?|küçük bir sevinç…$/ }).first().click(); await pg.waitForTimeout(600)
    await pg.getByTestId('post-title').fill('   '); await pg.getByRole('button', { name: 'Paylaş', exact: true }).click()
  }
  if (name === 'form-poll-dup') {
    await pg.evaluate(() => { try { localStorage.removeItem('sagliktan:post-draft') } catch { /* */ } })
    await pg.getByRole('button', { name: /paylaş…$|küçük bir sevinç…$/ }).first().click(); await pg.waitForTimeout(600)
    await pg.getByRole('button', { name: 'Anket' }).click()
    await pg.getByTestId('post-title').fill('Hangi tedaviyi denediniz?')
    await pg.getByTestId('poll-option-0').fill('Luxturna'); await pg.getByTestId('poll-option-1').fill('luxturna ')
    await pg.getByRole('button', { name: 'Paylaş', exact: true }).click()
  }
  if (name === 'form-password') {
    await pg.getByText('Şifre Değiştir').click(); await pg.waitForTimeout(400)
    const np = pg.locator('input[autocomplete="new-password"]'); await np.nth(0).fill('kisa'); await np.nth(1).fill('baska')
    await pg.getByRole('button', { name: 'Şifreyi Değiştir' }).click()
  }
  await pg.waitForTimeout(500)
}

// Girişsiz formlar (kayıt/giriş/şifre sıfırlama): ayrı, oturumsuz bağlamda hatalı gönderim.
async function publicFormShots(vpName, vp) {
  const list = [['public-register', '/register', 'Kayıt Ol'], ['public-login', '/login', 'Giriş Yap'], ['public-forgot', '/forgot-password', 'Sıfırlama Kodu Gönder'], ['public-welcome', '/'], ['public-login-clean', '/login'], ['public-register-clean', '/register'], ['public-forgot-clean', '/forgot-password'], ['public-notfound', '/bu-sayfa-yok'], ['public-about', '/hakkimizda'], ['public-help', '/yardim']]
  if (!list.some(([n]) => !only || only.includes(n))) return
  const pctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1, locale: 'tr-TR', colorScheme: theme })
  await pctx.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = 'html,body,#root{height:auto!important;overflow:visible!important}'; document.head.appendChild(st) }) })
  const pp = await pctx.newPage()
  for (const [name, path, btn] of list) {
    if (only && !only.includes(name)) continue
    try {
      await pp.goto('http://localhost:4173' + path, { waitUntil: 'networkidle', timeout: 20000 }); await pp.waitForTimeout(1500)
      if (name === 'public-register') {
        await pp.getByTestId('register-firstName').fill('Ali3'); await pp.getByTestId('register-email').fill('ali@gmial.com')
        await pp.getByTestId('register-password').fill('kisa'); await pp.getByTestId('register-confirmPassword').fill('baska')
        await pp.getByTestId('register-city').fill('izm'); await pp.waitForTimeout(300); await pp.keyboard.press('Escape')
      }
      if (name === 'public-login') await pp.getByTestId('login-email').fill('ali')
      if (btn) { await pp.getByRole('button', { name: btn, exact: true }).click(); await pp.waitForTimeout(600) }
      await pp.screenshot({ path: `${OUT}/${vpName}-${name}.png`, fullPage: true })
      console.log('ok', vpName, name)
    } catch (e) { console.log('FAIL', vpName, name, e.message.split('\n')[0]) }
  }
  await pctx.close()
}

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
    if (holdApi && !/\/users\/me$/.test(u.pathname)) { await new Promise((res) => setTimeout(res, 9000)); try { return await r.abort() } catch { return } }
    const body = route(u, req.method(), req)
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
      holdApi = name.endsWith('-loading')
      if (name === 'profile-unlock') await pg.evaluate(() => { try { localStorage.setItem('sagliktan:avatars:1', JSON.stringify({ seen: ['filiz', 'damla', 'bulut', 'cakil', 'papatya', 'kirpi', 'kaplumbaga'], fresh: [] })); sessionStorage.removeItem('sagliktan:avatars-checked') } catch { /* */ } })
      await pg.goto('http://localhost:4173' + path, { waitUntil: holdApi ? 'domcontentloaded' : 'networkidle', timeout: 20000 })
      await pg.waitForTimeout(holdApi ? 1200 : 600)
      if (name === 'profile-avatar') { await pg.getByRole('button', { name: 'Yol arkadaşını değiştir' }).first().click(); await pg.waitForTimeout(700) }
      if (name === 'settings-blocked') { await pg.getByText('Engellenen Kullanıcılar').click(); await pg.waitForTimeout(500) }
      if (name === 'onboarding-done') { await pg.getByRole('button', { name: 'Devam', exact: true }).click(); await pg.waitForTimeout(400); await pg.getByRole('button', { name: /gruba katıl|Devam/ }).last().click(); await pg.waitForTimeout(400); await pg.getByRole('button', { name: 'Kaydet ve bitir' }).click(); await pg.waitForTimeout(900) }
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
      if (name.endsWith('-compose') || name === 'home-compose-picked') {
        await pg.evaluate(() => { try { localStorage.removeItem('sagliktan:post-draft'); localStorage.removeItem('sagliktan:last-post-target') } catch { /* */ } })
        await pg.getByRole('button', { name: /paylaş…$|Ne paylaşmak istersin\?|küçük bir sevinç…$/ }).first().click(); await pg.waitForTimeout(700)
        if (name === 'home-compose-picked') {
          await pg.getByRole('radio', { name: 'Retinitis Pigmentosa' }).click(); await pg.waitForTimeout(500)
          await pg.getByRole('radio', { name: 'Soru-Cevap' }).click()
          await pg.getByTestId('post-title').fill('Gece körlüğü için gözlük önerisi')
          await pg.getByTestId('post-content').fill('Akşamları dışarı çıkarken zorlanıyorum, kullandığınız bir şey var mı?')
          await pg.waitForTimeout(300)
        }
      }
      if (name === 'compose-poll') {
        await pg.evaluate(() => { try { localStorage.removeItem('sagliktan:post-draft') } catch { /* */ } })
        await pg.getByRole('button', { name: /paylaş…$|küçük bir sevinç…$/ }).first().click(); await pg.waitForTimeout(600)
        await pg.getByRole('button', { name: 'Anket' }).click()
        await pg.getByTestId('post-title').fill('Hangi tedaviyi denediniz?')
        await pg.getByTestId('poll-option-0').fill('Luxturna')
        await pg.getByTestId('poll-option-1').fill('Klinik araştırma')
        await pg.waitForTimeout(900)
      }
      if (name.startsWith('onboarding-') && !['onboarding-loading', 'onboarding-done'].includes(name)) {
        await pg.getByRole('radio', { name: 'Hasta yakınıyım' }).click()
        if (name !== 'onboarding-role') { await pg.getByRole('button', { name: 'Devam', exact: true }).click(); await pg.waitForTimeout(500) }
        if (name === 'onboarding-details') {
          await pg.getByRole('button', { name: /gruba katıl|Devam/ }).last().click(); await pg.waitForTimeout(500)
        }
      }
      if (name === 'admin-dashboard-tooltip') {
        // dokunarak/gezdirerek tooltip: aktif kişi grafiğinin sağ ucuna, sütun grafiğin ortasına
        await pg.waitForTimeout(600)
        const svgs = pg.locator('figure svg[role="img"]')
        await svgs.nth(0).scrollIntoViewIfNeeded()
        const a = await svgs.nth(0).boundingBox()
        if (vp.hasTouch) await pg.touchscreen.tap(a.x + a.width - 6, a.y + a.height / 2); else await pg.mouse.move(a.x + a.width - 6, a.y + a.height / 2)
        await pg.waitForTimeout(300)
      }
      if (name === 'admin-dashboard-table') { await pg.getByRole('button', { name: 'Tablo olarak gör' }).nth(1).click(); await pg.waitForTimeout(300) }
      if (name === 'notifications') { await pg.getByRole('button', { name: 'Bildirimler' }).first().click(); await pg.waitForTimeout(500) }
      if (name === 'profile-edit') { await pg.getByRole('button', { name: 'Profili düzenle' }).click(); await pg.waitForTimeout(500) }
      if (name.startsWith('form-')) await formShot(pg, name)
      // tooltip: tam sayfa çekimi görünümü yeniden boyutlandırıp kabuğu yeniden kurar, etkileşim kaybolur
      const fullPage = !['profile-groups-menu', 'profile-leave-confirm', 'admin-dashboard-tooltip', 'profile-avatar', 'profile-unlock', 'chat-loading', 'notifications'].includes(name) && !name.includes('compose') && !name.startsWith('onboarding')
      await pg.screenshot({ path: `${OUT}/${vpName}-${name}.png`, fullPage })
      console.log('ok', vpName, name)
    } catch (e) { console.log('FAIL', vpName, name, e.message.split('\n')[0]) }
  }
  await publicFormShots(vpName, vp)
  if (errors.length) console.log(`[${vpName}] console/page errors:`, [...new Set(errors)].slice(0, 8))
  await ctx.close()
}
await browser.close()
