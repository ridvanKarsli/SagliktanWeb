// Görsel inceleme harness'i: backend olmadan, /api/* isteklerini sahte
// verilerle yanıtlayıp giriş yapılmış sayfaların ekran görüntüsünü alır.
// Kullanım: node scripts/visual-harness.mjs [outDir] (vite preview 4173'te açık olmalı)
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { FALLBACK_CATALOG } from '../src/game/data/catalog.js'
import { ZONES, buildWalkable } from '../src/game/world/zones.js'

const OUT = process.argv[2] || 'visual-out'
mkdirSync(OUT, { recursive: true })

const now = new Date()
const iso = (minsAgo) => new Date(now.getTime() - minsAgo * 60000).toISOString().replace('Z', '')
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = (type) => `${b64({ alg: 'HS256' })}.${b64({ sub: 'ayse@example.com', type, sid: 's1', exp: Math.floor(Date.now() / 1000) + 86400 })}.sig`

const me = { id: 1, email: 'ayse@example.com', firstName: 'Ayşe', lastName: 'Demir', bio: 'RP tanısı 2021. Kızım için buradayım.', role: process.env.ROLE || 'ADMIN', emailVerified: true, communityRole: 'CAREGIVER', city: 'İzmir', discoverable: process.env.DISCOVERABLE !== '0', onboardingCompleted: process.env.ONBOARDED !== '0', weeklyDigestEnabled: true, createdAt: iso(99999), postCount: 12, commentCount: 48, likesReceived: 130, dislikesReceived: 3, helpedPeople: 11 }
// [profil/avatar] yol arkadaşları kataloğu (backend AvatarCatalog ile aynı) + avatarKey alanları
me.avatarKey = process.env.NOAVATAR ? null : 'kirpi'
const HELPED = Number(process.env.HELPED ?? 11)
const MEMBER_DAYS = Number(process.env.MEMBER_DAYS ?? 40)
const LEVELS = [[0, 0], [3, 7], [8, 14], [15, 30], [30, 60], [60, 120], [120, 180], [250, 365]]
const avatarCatalog = [['filiz', 'Filiz', 0], ['damla', 'Damla', 0], ['bulut', 'Bulut', 0], ['cakil', 'Çakıl', 0], ['papatya', 'Papatya', 1], ['kirpi', 'Kirpi', 1], ['kaplumbaga', 'Kaplumbağa', 2], ['serce', 'Serçe', 2], ['kedi', 'Pamuk', 3], ['ayicik', 'Ayıcık', 3], ['baykus', 'Bilge', 4], ['tilki', 'Tilki', 4], ['gunes', 'Güneş', 5], ['deniz-feneri', 'Fener', 5], ['ay-cicegi', 'Ayçiçeği', 6], ['yildiz', 'Yıldız', 7]]
const unlockedLevel = LEVELS.reduce((m, [p, d], i) => (HELPED >= p && MEMBER_DAYS >= d ? i : m), 0)
const avatarOptions = () => ({ helpedPeople: HELPED, memberDays: MEMBER_DAYS, unlockedLevel, selectedKey: me.avatarKey, avatars: avatarCatalog.map(([key, name, level]) => ({ key, name, level, requiredPeople: LEVELS[level][0], requiredDays: LEVELS[level][1], unlocked: level <= unlockedLevel })) })
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
    { id: 11, firstName: 'Zeynep', lastName: 'Arslan', communityRole: 'CAREGIVER', city: 'İzmir', sharedGroups: ['Retinitis Pigmentosa'], reasons: ['Senin gibi hasta yakını'], avatarKey: 'papatya' },
    { id: 12, firstName: 'Ali', lastName: 'Yılmaz', communityRole: 'PATIENT', city: 'Ankara', sharedGroups: ['Retinitis Pigmentosa', 'Multipl Skleroz'], reasons: [], avatarKey: 'gunes' },
    { id: 13, firstName: 'Fatma', lastName: 'Çelik', communityRole: 'CAREGIVER', city: 'İzmir', sharedGroups: ['Retinitis Pigmentosa'], reasons: ['Aynı şehirdesiniz'] },
  ]
  if (p === '/posts/open-questions') return page([{ ...post(2), subGroupName: 'Soru-Cevap', diseaseGroupName: 'Retinitis Pigmentosa' }, { ...post(0), acceptedCommentId: null, commentCount: 1, subGroupName: 'Soru-Cevap', diseaseGroupName: 'Retinitis Pigmentosa' }])
  if (p === '/users/me/disease-groups') return groups
  if (p === '/users/me/posts') return page([post(0), post(1), post(2)])
  if (p === '/users/me/saved-posts') return page([post(0), post(2)])
  if (p === '/users/me/sessions') return [{ id: 1, deviceLabel: 'iPhone · Safari', ipAddress: '85.1.2.3', lastUsedAt: iso(1), createdAt: iso(999), current: true }, { id: 2, deviceLabel: 'Mac · Chrome', ipAddress: '85.1.2.4', lastUsedAt: iso(300), createdAt: iso(5000), current: false }]
  if (m(/^\/users\/\d+\/posts$/)) return page([post(1), post(3)])
  if (m(/^\/users\/12$/)) return { id: 12, firstName: 'Ali', lastName: 'Yılmaz', avatarKey: 'gunes', profileHidden: true, postCount: 0, commentCount: 0, likesReceived: 0, dislikesReceived: 0 }
  if (m(/^\/users\/(\d+)$/)) return { ...me, id: 11, firstName: 'Mehmet', lastName: 'Kaya', bio: 'RP ile 10 yıl. Sorularınıza elimden geldiğince yanıt veririm.', avatarKey: 'kaplumbaga', likesReceived: 64, helpedPeople: 23 }
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
  ['search', '/search?q=gece'], ['profile', '/profile'], ['profile-groups', '/profile?tab=groups'], ['profile-groups-menu', '/profile?tab=groups'], ['profile-leave-confirm', '/profile?tab=groups'], ['profile-left', '/profile?tab=groups'], ['profile-edit', '/profile'], ['home-compose', '/home'], ['home-questions', '/home?tab=questions'], ['compose-poll', '/home'], ['post-poll', '/post/4'], ['post-question', '/post/1'], ['onboarding-groups', '/hosgeldin'], ['home-compose-closed', '/home'], ['settings-matching', '/profile/settings#eslesme'], ['home-compose-picked', '/home'], ['home-compose-topic', '/home'], ['subgroups-compose', '/groups/1'], ['posts-compose', '/sub-groups/2'], ['user-profile', '/users/11'], ['user-profile-hidden', '/users/12'], ['group-members', '/groups/1'], ['settings', '/profile/settings'],
  ['messages', '/messages'], ['chat', '/messages/1'], ['requests', '/messages/requests'],
  ['profile-avatar', '/profile'], ['profile-unlock', '/profile'], ['settings-blocked', '/profile/settings'], ['profile-loading', '/profile'], ['user-profile-loading', '/users/11'], ['messages-loading', '/messages'], ['chat-loading', '/messages/1'], ['requests-loading', '/messages/requests'], ['onboarding-loading', '/hosgeldin'], ['onboarding-done', '/hosgeldin'],
  ['form-profile-city', '/profile'], ['form-profile-errors', '/profile'], ['form-compose-errors', '/sub-groups/2'], ['form-poll-dup', '/home'], ['form-password', '/profile/settings'],
  ['admin-dashboard', '/admin'], ['admin-dashboard-7', '/admin?gun=7'], ['admin-dashboard-90', '/admin?gun=90'], ['admin-dashboard-tooltip', '/admin'], ['admin-dashboard-table', '/admin'], ['admin-reports', '/admin?tab=reports'], ['admin-users', '/admin?tab=users'], ['admin-content', '/admin?tab=content'], ['admin-groups', '/admin?tab=groups'],
]
const viewports = { mobile: { width: Number(process.env.VW) || 390, height: Number(process.env.VH) || 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, desktop: { width: 1280, height: 800 } }
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
        await pp.getByTestId('register-password').fill('kisa')
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


// ------------------------------------------------------------------ Mahalle (oyun)
// /api/game/* sahte cevapları. gameState.hasProfile=false iken GET /me 404 döner
// (karakter oluşturma ekranı). Dünya katılımı her bölgede ~6 oyuncuyu yürünebilir
// hücrelere koyar. STOMP olayları taklit edilmez (yalnızca anlık görüntü).
const gameState = { hasProfile: true, crowd: false, calls: [] }
const blockedList = () => [
  { player: card(['p8sessiz00', 'Sessiz Kuş', look('s4', 'curly', 'brown', 'tee_mint', 'jeans'), null]), blockedAt: iso(60 * 26) },
  { player: card(['p9ruzgar00', 'Rüzgar', look('s1', 'buzz', 'blonde', 'hoodie_sky', 'joggers', 'cap'), 'serce']), blockedAt: iso(60 * 24 * 9) },
]
const look = (skin, hair, hairColor, top, bottom, accessory = null) => ({ skin, hair, hairColor, top, bottom, accessory })
const gamePlayers = [
  ['p1papatya0', 'Papatya', look('s1', 'bun', 'gray', 'cardigan_rose', 'long_skirt', 'glasses_round'), 'kedi'],
  ['p2deniz420', 'Deniz_42', look('s3', 'curly', 'black', 'raincoat_sun', 'jeans'), null],
  ['p3gulteyze', 'Gül Teyze', look('s2', 'bob', 'auburn', 'sweater_cream', 'skirt', 'flower_pin'), 'papatya'],
  ['p4mavibulu', 'Mavi Bulut', look('s4', 'short', 'black', 'hoodie_sky', 'joggers', 'headphones'), 'bulut'],
  ['p5cinar000', 'Çınar', look('s5', 'buzz', 'black', 'jacket_denim', 'chinos', 'cap'), null],
  ['p6kuzey000', 'Kuzey Yıldızı', look('s2', 'long', 'blonde', 'vest_knit', 'shorts', 'sunhat'), 'kaplumbaga'],
]
const card = ([publicId, nickname, appearance, petKey]) => ({ publicId, nickname, appearance, petKey })
const myGame = () => ({
  publicId: 'mepublic01', nickname: 'Ayşe_Bahçe', appearance: look('s2', 'long', 'brown', 'cardigan_rose', 'jeans', 'scarf'), petKey: 'kirpi',
  seeds: 135, roomVisibility: 'EVERYONE', dailyAvailable: true, unseenGifts: 2, nicknameChangeableAt: null,
  ownedItems: [
    ...FALLBACK_CATALOG.clothing.filter((c) => c.starter).map((c) => ({ itemKey: c.key, quantity: 1 })),
    { itemKey: 'cardigan_rose', quantity: 1 }, { itemKey: 'scarf', quantity: 1 },
    { itemKey: 'sofa', quantity: 1 }, { itemKey: 'rug', quantity: 1 }, { itemKey: 'coffee_table', quantity: 1 }, { itemKey: 'floor_lamp', quantity: 1 },
    { itemKey: 'monstera', quantity: 2 }, { itemKey: 'bookshelf', quantity: 1 }, { itemKey: 'aquarium', quantity: 1 }, { itemKey: 'armchair', quantity: 1 },
    { itemKey: 'radio', quantity: 1 }, { itemKey: 'cat_bed', quantity: 1 }, { itemKey: 'piano', quantity: 1 }, { itemKey: 'tv', quantity: 1 },
  ],
})
const myRoom = () => ({
  owner: card(['mepublic01', 'Ayşe_Bahçe', myGame().appearance, 'kirpi']), visibility: 'EVERYONE', mine: true,
  items: [
    { itemKey: 'rug', x: 3, y: 3, rot: 0 }, { itemKey: 'sofa', x: 1, y: 1, rot: 0 }, { itemKey: 'coffee_table', x: 4, y: 4, rot: 0 },
    { itemKey: 'floor_lamp', x: 0, y: 0, rot: 0 }, { itemKey: 'monstera', x: 6, y: 1, rot: 0 }, { itemKey: 'bookshelf', x: 0, y: 3, rot: 1 },
    { itemKey: 'armchair', x: 5, y: 3, rot: 1 }, { itemKey: 'radio', x: 5, y: 0, rot: 0 }, { itemKey: 'cat_bed', x: 6, y: 6, rot: 0 },
    { itemKey: 'tv', x: 2, y: 0, rot: 0 }, { itemKey: 'piano', x: 3, y: 6, rot: 0 },
  ],
})
function zonePlayers(zone) {
  const z = ZONES[zone]
  if (!z) return []
  const g = buildWalkable(z)
  const out = []
  const cells = []
  for (let y = 0; y < z.height; y++) for (let x = 0; x < z.width; x++) if (g[y][x]) cells.push({ x, y })
  // spawn çevresinde ama birbirinden ayrık, deterministik dağılım (kapı karelerinden uzak)
  const sp = z.spawn
  const near = cells
    .filter((c) => !z.portals.some((p) => c.x >= p.x && c.x < p.x + p.w && c.y >= p.y && c.y < p.y + p.d))
    .filter((c) => Math.abs(c.x - sp.x) + Math.abs(c.y - sp.y) >= 2)
    .sort((a, b) => (Math.abs(a.x - sp.x) + Math.abs(a.y - sp.y)) - (Math.abs(b.x - sp.x) + Math.abs(b.y - sp.y)))
  const taken = []
  for (const c of near) {
    if (taken.length >= gamePlayers.length) break
    if (taken.every((t) => Math.abs(t.x - c.x) + Math.abs(t.y - c.y) >= 3)) taken.push(c)
  }
  // kalabalık çekimi: herkes doğma noktasının dibinde (etiket çakışması denemesi)
  if (gameState.crowd) { gamePlayers.forEach((p, i) => { const c = near[i]; out.push({ ...card(p), x: c.x, y: c.y }) }); return out }
  gamePlayers.forEach((p, i) => { const c = taken[i] || near[i]; out.push({ ...card(p), x: c.x, y: c.y, pose: 'stand', facing: 'front', flip: false, held: null }) })
  // EK v1.1 duruşlar: Meydan'da biri bankta oturuyor, biri çay içiyor; Sahil'de biri şezlongda
  if (zone === 'meydan') { Object.assign(out[0], { x: 9, y: 4, pose: 'sit', facing: 'front', flip: true }); out[2].held = 'tea' }
  if (zone === 'sahil') Object.assign(out[5], { x: 10, y: 2, pose: 'lie', facing: 'front', flip: false })
  return out
}
function gameRoute(p, method, url, body) {
  if (p === '/game/players/blocked') return blockedList()
  if (p === '/game/me' && method === 'GET') return gameState.hasProfile ? myGame() : { status: 404, body: { message: 'Mahalle profili yok' } }
  if (p === '/game/me' && method === 'POST') { gameState.hasProfile = true; return myGame() }
  if (p.startsWith('/game/me/')) return p === '/game/me/daily' ? { granted: true, amount: 15, seeds: 150 } : myGame()
  if (p === '/game/catalog') return FALLBACK_CATALOG
  if (p === '/game/rooms/me' && method === 'GET') return myRoom()
  if (p === '/game/rooms/me') return myRoom()
  if (p === '/game/rooms/p2deniz420') return { status: 404, body: { message: 'Bu eve şu an girilemiyor' } }
  if (p.startsWith('/game/rooms/')) {
    const id = p.split('/').pop()
    const pl = gamePlayers.find((x) => x[0] === id) || gamePlayers[0]
    return { owner: card(pl), visibility: 'EVERYONE', mine: false, items: [{ itemKey: 'rug', x: 2, y: 2, rot: 0 }, { itemKey: 'bed', x: 5, y: 0, rot: 0 }, { itemKey: 'piano', x: 0, y: 2, rot: 1 }, { itemKey: 'flower_vase', x: 4, y: 4, rot: 0 }, { itemKey: 'fireplace', x: 2, y: 0, rot: 0 }] }
  }
  if (p === '/game/neighbors') return { content: gamePlayers.map((x, i) => ({ player: card(x), known: i < 2, visitedByMeAt: i % 2 ? iso(60 * i) : null, lastActiveAt: iso(15 * (i + 1)) })), page: 0, size: 20, totalElements: 6, totalPages: 1, last: true }
  if (p === '/game/visitors') return gamePlayers.slice(0, 4).map((x, i) => ({ player: card(x), visitedAt: iso(40 * (i + 1)) }))
  if (p === '/game/gifts' && method === 'GET') {
    const pg = Number(url.searchParams.get('page') || 0)
    const g = [['flower', 'gecmis_olsun'], ['tea', 'yanindayim'], ['lantern', 'iyi_ki_varsin'], ['soup', 'kendine_iyi_bak']]
    return { content: g.map(([giftKey, messageKey], i) => ({ id: pg * 10 + i + 1, from: card(gamePlayers[i]), giftKey, messageKey, createdAt: iso(25 * (i + 1) + pg * 600), seen: i > 1 })), page: pg, size: 20, totalElements: -1, totalPages: -1, last: pg > 0 }
  }
  if (p === '/game/gifts') return { seeds: 130 }
  const jm = p.match(/^\/game\/world\/(\w+)\/join$/)
  if (jm) {
    // doğma ipucu {x,y}: sınır içindeyse oraya, değilse ortaya (sunucuyla aynı)
    const z = ZONES[jm[1]]
    const ok = body && Number.isInteger(body.x) && Number.isInteger(body.y) && body.x >= 0 && body.y >= 0 && body.x < z.width && body.y < z.height
    gameState.lastJoin = body || null
    return { zone: jm[1], instance: 1, me: ok ? { x: body.x, y: body.y } : { x: Math.floor(z.width / 2), y: Math.floor(z.height / 2) }, players: zonePlayers(jm[1]) }
  }
  if (p === '/game/world/pose') { gameState.calls.push(`pose ${JSON.stringify(body)}`); return { status: 204 } }
  if (p.startsWith('/game/')) return { status: 204 }
  return undefined
}

const gameShots = [
  ['game-create', { hasProfile: false }],
  ['game-world-meydan', { zone: 'meydan', hint: true }],
  ['game-world-carsi-shop', { zone: 'carsi' }],
  ['game-world-sahil', { zone: 'sahil' }],
  ['game-world-park', { zone: 'park' }],
  ['game-mahalle', { zone: 'mahalle' }],
  ['game-speech', { zone: 'meydan' }],
  ['game-speech-bubble', { zone: 'meydan' }],
  ['game-player-card', { zone: 'meydan' }],
  ['game-players-here', { zone: 'meydan' }],
  ['game-map', { zone: 'meydan' }],
  ['game-neighbors', { zone: 'meydan' }],
  ['game-gifts', { zone: 'meydan' }],
  ['game-gift-send', { zone: 'meydan' }],
  ['game-settings', { zone: 'meydan' }],
  ['game-shop-furniture', { zone: 'carsi' }],
  ['game-room', { path: '/game/ev' }],
  ['game-room-edit', { path: '/game/ev' }],
  ['game-room-visit', { path: '/game/ev/p1papatya0' }],
  ['game-edit-look', { path: '/game/karakter' }],
  ['game-zone-switch', { zone: 'meydan' }],
  ['game-portal-walk', { zone: 'carsi' }],
  ['game-daily', { zone: 'park' }],
  ['game-room-exit', { path: '/game/ev' }],
  ['game-walking', { zone: 'park' }],
  ['game-live', { zone: 'meydan' }],
  ['game-crowd', { zone: 'meydan', crowd: true }],
  ['game-settings-blocked', { zone: 'meydan' }],
  // EK v1.1
  ['game-create-body', { hasProfile: false }],
  ['game-room-sit', { path: '/game/ev?atmo=ogle:clear' }],
  ['game-room-tv', { path: '/game/ev?atmo=gece:clear' }],
  ['game-room-piano', { path: '/game/ev?atmo=aksam:clear' }],
  ['game-world-bench', { zone: 'meydan', query: '?atmo=ogle:clear' }],
  ['game-world-tea', { zone: 'carsi', query: '?atmo=sabah:partly' }],
  ['game-world-night', { zone: 'mahalle', query: '?atmo=gece:clear' }],
  ['game-world-rain', { zone: 'meydan', query: '?atmo=aksam:rain' }],
  ['game-world-snow', { zone: 'park', query: '?atmo=ogle:snow' }],
  ['game-world-sahil-lie', { zone: 'sahil', query: '?atmo=ogle:clear' }],
  ['game-neighbors-known', { zone: 'meydan', query: '?atmo=ogle:clear' }],
  ['app-topbar-mahalle', { path: '/home' }],
]

async function runGameShots(vpName, vp) {
  if (!gameShots.some(([n]) => !only || only.includes(n))) return
  const gctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1, locale: 'tr-TR', timezoneId: 'Europe/Istanbul', reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' })
  await gctx.addInitScript(([access, refresh]) => {
    window.__SG_HARNESS__ = true // ?atmo= test kancası yalnızca bununla açılır
    localStorage.setItem('auth', JSON.stringify({ accessToken: access, refreshToken: refresh }))
    localStorage.setItem('sagliktan:accessibility', JSON.stringify({ themeMode: 'light' }))
    localStorage.setItem('sagliktan:install-prompt-dismissed', String(Date.now()))
  }, [jwt('access'), jwt('refresh')])
  await gctx.route('**/api/**', async (r) => {
    const req = r.request(); const u = new URL(req.url())
    const p = u.pathname.replace(/^\/api/, '')
    let reqBody = null
    try { reqBody = req.postDataJSON() } catch { /* gövdesiz */ }
    if (/\/world\/(move|\w+\/join)$/.test(p)) gameState.calls.push(`${p} ${JSON.stringify(reqBody)}`)
    const g = gameRoute(p, req.method(), u, reqBody)
    if (g !== undefined) {
      if (g && g.status) return r.fulfill({ status: g.status, contentType: 'application/json', body: g.body ? JSON.stringify(g.body) : '' })
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(g) })
    }
    const body = route(u, req.method(), req)
    if (body === null) return r.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'mock yok: ' + u.pathname }) })
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
  // Sahte STOMP sunucusu (Playwright routeWebSocket): CONNECT'e CONNECTED,
  // SUBSCRIBE'ı kaydeder; game-live çekiminde oyun olayları yollanır.
  let stomp = null
  await gctx.routeWebSocket(/\/ws/, (ws) => {
    const subs = new Map()
    stomp = {
      send: (dest, body) => {
        const id = subs.get(dest)
        if (id == null) return false
        ws.send(`MESSAGE\ndestination:${dest}\nsubscription:${id}\nmessage-id:${Date.now()}\ncontent-type:application/json\n\n${JSON.stringify(body)}\0`)
        return true
      },
    }
    ws.onMessage((raw) => {
      for (const frame of String(raw).split('\0')) {
        const f = frame.replace(/^\n+/, '')
        if (!f) continue
        const [head] = f.split('\n\n')
        const lines = head.split('\n')
        const cmd = lines[0]
        const h = Object.fromEntries(lines.slice(1).map((l) => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1)]))
        if (cmd === 'CONNECT' || cmd === 'STOMP') ws.send('CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0')
        if (cmd === 'SUBSCRIBE') subs.set(h.destination, h.id)
      }
    })
  })
  const gp = await gctx.newPage()
  const errs = []
  gp.on('pageerror', (e) => errs.push(e.message))
  gp.on('console', (m) => { if (m.type() === 'error' && !/WebSocket|ws:\/\//.test(m.text())) errs.push(m.text().slice(0, 200)) })
  await gp.goto('http://localhost:4173/home', { waitUntil: 'networkidle' })
  for (const [name, o] of gameShots) {
    if (only && !only.includes(name)) continue
    try {
      gameState.hasProfile = o.hasProfile !== false
      gameState.crowd = !!o.crowd
      gameState.calls = []
      await gp.evaluate(([zone, hint]) => {
        try {
          if (zone) localStorage.setItem('sagliktan:mahalle:last-zone', zone)
          if (hint) localStorage.removeItem('sagliktan:mahalle:hint-seen'); else localStorage.setItem('sagliktan:mahalle:hint-seen', '1')
        } catch { /* */ }
      }, [o.zone || null, !!o.hint])
      await gp.goto('http://localhost:4173/home', { waitUntil: 'networkidle' })
      await gp.goto('http://localhost:4173' + (o.path || '/game') + (o.query || ''), { waitUntil: 'networkidle', timeout: 20000 })
      await gp.waitForTimeout(1400)
      const tapActor = async (id) => {
        const b = await gp.locator(`[data-actor="${id}"]`).last().boundingBox()
        if (process.env.DEBUG) console.log('tap', id, b, await gp.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return el?.tagName + ' ' + (el?.closest('[data-actor]')?.getAttribute('data-actor') || '-') }, [b.x + b.width / 2, b.y + b.height / 2]))
        if (vp.hasTouch) await gp.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await gp.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
      }
      // nesnenin gerçekten dokunulabilir (üstünde karakter/etiket olmayan) bir noktasını bul
      const tapObj = async (idx) => {
        const pt = await gp.evaluate((i) => {
          const el = document.querySelector(`[data-obj="${i}"]`)
          const r = el.getBoundingClientRect()
          for (let fy = 0.9; fy > 0.05; fy -= 0.05) for (let fx = 0.2; fx < 0.85; fx += 0.1) {
            const x = r.left + r.width * fx; const y = r.top + r.height * fy
            if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue
            const hit = document.elementFromPoint(x, y)
            if (hit?.closest('[data-obj]')?.getAttribute('data-obj') === String(i) && !hit.closest('[data-actor]')) return { x, y }
          }
          return { x: r.left + r.width / 2, y: r.top + r.height * 0.7 }
        }, idx)
        if (vp.hasTouch) await gp.touchscreen.tap(pt.x, pt.y); else await gp.mouse.click(pt.x, pt.y)
      }
      const bar = (label) => gp.getByRole('navigation', { name: 'Mahalle menüsü' }).getByRole('button', { name: new RegExp('^' + label) }).click()
      if (name === 'game-world-carsi-shop') { await tapObj(1); await gp.waitForTimeout(3200) }
      if (name === 'game-shop-furniture') { await tapObj(1); await gp.waitForTimeout(3200); await gp.getByRole('tab', { name: 'Mobilya' }).click(); await gp.waitForTimeout(500) }
      if (name === 'game-speech') { await bar('Konuş'); await gp.waitForTimeout(600) }
      if (name === 'game-speech-bubble') {
        await bar('Konuş'); await gp.waitForTimeout(500)
        await gp.getByRole('button', { name: 'Çay içelim mi?' }).click(); await gp.waitForTimeout(700)
      }
      if (name === 'game-player-card') { await tapActor('p3gulteyze'); await gp.waitForTimeout(700) }
      if (name === 'game-players-here') { await gp.getByRole('button', { name: /^Buradakiler/ }).click(); await gp.waitForTimeout(600) }
      if (name === 'game-map') { await bar('Harita'); await gp.waitForTimeout(600) }
      if (name === 'game-neighbors') { await bar('Komşular'); await gp.waitForTimeout(900) }
      if (name === 'game-gifts') { await bar('Hediyeler'); await gp.waitForTimeout(900) }
      if (name === 'game-gift-send') {
        await tapActor('p3gulteyze'); await gp.waitForTimeout(600)
        await gp.getByRole('button', { name: 'Hediye bırak' }).click(); await gp.waitForTimeout(600)
        await gp.getByRole('radio', { name: /^Sıcak çay/ }).click(); await gp.getByRole('radio', { name: /Yanındayım/ }).click(); await gp.waitForTimeout(300)
      }
      if (name === 'game-zone-switch') { await bar('Harita'); await gp.waitForTimeout(500); await gp.getByRole('button', { name: /^Sahil/ }).click(); await gp.waitForTimeout(1800) }
      if (name === 'game-portal-walk') { await tapObj(0); await gp.waitForTimeout(2600) }
      if (name === 'game-daily') { await gp.getByRole('button', { name: 'Günlük tohumunu al' }).click(); await gp.waitForTimeout(700) }
      if (name === 'game-room-exit') {
        await gp.getByRole('navigation', { name: 'Mahalle menüsü' }).getByRole('button', { name: 'Sokağa çık' }).click(); await gp.waitForTimeout(1500)
      }
      if (name === 'game-live') {
        const at = new Date().toISOString()
        const ev = (o) => stomp?.send('/user/queue/game', { zone: 'meydan', instance: 1, at, ...o })
        await gp.waitForTimeout(800)
        ev({ type: 'SAY', publicId: 'p1papatya0', phraseKey: 'hosgeldin' })
        ev({ type: 'SAY', publicId: 'p4mavibulu', emoteKey: 'heart' })
        ev({ type: 'MOVE', publicId: 'p2deniz420', x: 9, y: 11 })
        ev({ type: 'LEAVE', publicId: 'p5cinar000' })
        ev({ type: 'JOIN', publicId: 'p7yeni0000', player: { publicId: 'p7yeni0000', nickname: 'Yeni Komşu', appearance: look('s3', 'bob', 'black', 'shirt_check', 'skirt', 'beanie'), petKey: 'serce', x: 5, y: 10 }, x: 5, y: 10 })
        const ok = ev({ type: 'GIFT', publicId: 'p3gulteyze', giftKey: 'tea', messageKey: 'yanindayim', fromNickname: 'Gül Teyze' })
        console.log('stomp delivered:', ok)
        await gp.waitForTimeout(1300)
      }
      if (name === 'game-walking') {
        const W = vp.width; if (vp.hasTouch) await gp.touchscreen.tap(W * 0.3, 330); else await gp.mouse.click(W * 0.35, 260)
        await gp.waitForTimeout(650)
      }
      const tapKey = async (key) => {
        const idx = await gp.evaluate((k) => document.querySelector(`[data-key="${k}"]`)?.getAttribute('data-obj'), key)
        await tapObj(idx)
      }
      const menuPick = async (label) => { await gp.waitForTimeout(500); await gp.getByRole('menuitem', { name: label }).click() }
      if (name === 'game-create-body') { await gp.getByRole('radio', { name: 'Erkek' }).click(); await gp.waitForTimeout(400) }
      if (name === 'game-room-sit') {
        await tapKey('sofa'); await menuPick('Otur'); await gp.waitForTimeout(2600)
        if (process.env.DEBUG) console.log(await gp.evaluate(() => JSON.stringify([...window.__SG_ENGINE__.actors.values()].map((a) => ({ id: a.id, pose: a.pose, seat: a.seat, cell: a.cell, moving: a.moving })))))
      }
      if (name === 'game-room-tv') {
        await tapKey('tv'); await menuPick('Televizyonu aç'); await gp.waitForTimeout(500)
        await tapKey('sofa'); await menuPick('Otur'); await gp.waitForTimeout(2600)
      }
      if (name === 'game-room-piano') { await tapKey('piano'); await menuPick('Piyano çal'); await gp.waitForTimeout(3000) }
      if (name === 'game-world-bench') {
        await tapKey('bench'); await menuPick('Otur'); await gp.waitForTimeout(3000)
        if (process.env.DEBUG) console.log(await gp.evaluate(() => JSON.stringify([...window.__SG_ENGINE__.actors.values()].filter((a) => a.pose.posture !== 'stand' || a.pose.held).map((a) => ({ id: a.id, p: a.pose.posture, h: a.pose.held, seat: a.seat, cell: a.cell })))))
        if (process.env.DEBUG) console.log(gameState.calls.join(' | '))
      }
      if (name === 'game-world-tea') { await tapKey('tea_kiosk'); await menuPick('Çay al'); await gp.waitForTimeout(3500) }
      if (name === 'game-neighbors-known') { await bar('Komşular'); await gp.waitForTimeout(900) }
      if (name === 'game-settings-blocked') {
        await gp.getByRole('button', { name: 'Ayarlar', exact: true }).click(); await gp.waitForTimeout(800)
        await gp.getByText('Engellediklerin').scrollIntoViewIfNeeded(); await gp.waitForTimeout(300)
      }
      if (name === 'game-settings') { await gp.getByRole('button', { name: 'Ayarlar', exact: true }).click(); await gp.waitForTimeout(800) }
      if (name === 'game-room-edit') {
        await bar('Düzenle'); await gp.waitForTimeout(500)
        await gp.getByRole('button', { name: /^Akvaryum/ }).click(); await gp.waitForTimeout(600)
      }
      await gp.screenshot({ path: `${OUT}/${vpName}-${name}.png` })
      console.log('ok', vpName, name, process.env.DEBUG ? gameState.calls.join(' | ') : '')
    } catch (e) { console.log('FAIL', vpName, name, e.message.split('\n')[0]) }
  }
  if (errs.length) console.log(`[${vpName}] game console/page errors:`, [...new Set(errs)].slice(0, 8))
  await gctx.close()
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
      if (name === 'onboarding-done') { await pg.getByRole('button', { name: /gruba katıl ve bitir|^Bitir$/ }).last().click(); await pg.waitForTimeout(900) }
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
      if (name.endsWith('-compose') || name === 'home-compose-picked' || name === 'home-compose-topic' || name === 'home-compose-closed') {
        await pg.evaluate(() => { try { localStorage.removeItem('sagliktan:post-draft'); localStorage.removeItem('sagliktan:last-post-target') } catch { /* */ } })
        await pg.getByRole('button', { name: /paylaş…$|Ne paylaşmak istersin\?|küçük bir sevinç…$/ }).first().click(); await pg.waitForTimeout(700)
        if (name === 'home-compose-topic' || name === 'home-compose-closed') {
          await pg.getByRole('radio', { name: 'Retinitis Pigmentosa' }).click(); await pg.waitForTimeout(600)
        }
        if (name === 'home-compose-closed') {
          await pg.getByRole('button', { name: /kutusunu kapat$/ }).click(); await pg.waitForTimeout(400)
        }
        if (name === 'home-compose-picked') {
          await pg.getByRole('radio', { name: 'Retinitis Pigmentosa' }).click(); await pg.waitForTimeout(500)
          await pg.getByRole('radio', { name: 'Soru-Cevap' }).click()
          await pg.getByTestId('post-title').fill('Gece körlüğü için gözlük önerisi')
          await pg.getByTestId('post-content').fill('Akşamları dışarı çıkarken zorlanıyorum, kullandığınız bir şey var mı?')
          await pg.waitForTimeout(300)
        }
      }
      if (name === 'group-members') {
        await pg.getByRole('button', { name: /Üyeleri Gör/ }).click(); await pg.waitForTimeout(900)
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
      const fullPage = !['group-members', 'profile-groups-menu', 'profile-leave-confirm', 'admin-dashboard-tooltip', 'profile-avatar', 'profile-unlock', 'chat-loading', 'notifications'].includes(name) && !name.includes('compose') && !name.startsWith('onboarding')
      await pg.screenshot({ path: `${OUT}/${vpName}-${name}.png`, fullPage })
      console.log('ok', vpName, name)
    } catch (e) { console.log('FAIL', vpName, name, e.message.split('\n')[0]) }
  }
  await publicFormShots(vpName, vp)
  await runGameShots(vpName, vp)
  if (errors.length) console.log(`[${vpName}] console/page errors:`, [...new Set(errors)].slice(0, 8))
  await ctx.close()
}
await browser.close()
