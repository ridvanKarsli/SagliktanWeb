import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material'
import { AutoAwesomeRounded, DynamicFeedRounded, ExploreRounded, QuestionAnswerOutlined } from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SimilarMembers from '../components/SimilarMembers.jsx'
import PostList from '../components/PostList.jsx'
import PostCardSkeleton from '../components/PostCardSkeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ComposerPrompt from '../components/ComposerPrompt.jsx'
import CreatePostFab from '../components/CreatePostFab.jsx'
import SortToggle from '../components/SortToggle.jsx'
import PullToRefreshIndicator from '../components/PullToRefreshIndicator.jsx'
import LoadMoreButton from '../components/common/LoadMoreButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { getMyFeed, getOpenQuestions } from '../services/api.js'
import { usePaginatedList } from '../hooks/usePaginatedList.js'
import { useMyDiseaseGroups } from '../hooks/useMyDiseaseGroups.js'
import { pillTabsSx } from '../components/shell/pillTabs.js'

// Gönderi penceresi (~9 KB gz + alt bileşenleri) ilk açılışa kadar
// indirilmez; FAB ve "Ne paylaşmak istersin?" istemi anında tepki verir,
// pencere ilk dokunuşta mount olur ve sonra açık/kapalı ağaçta kalır.
const NewPostDialog = lazy(() => import('../components/NewPostDialog.jsx'))

const FEED_TAB = 'feed'
const QUESTIONS_TAB = 'questions'
// "Senin gibi üyeler" kartı akışın bu sıradaki gönderisinden sonra gösterilir:
// en üstte içeriği aşağı itmesin ama ilk ekranlarda görülsün.
const SIMILAR_MEMBERS_AFTER_INDEX = 2

// Günün saatine göre sıcak bir selam (cihazın yerel saati).
function greetingFor(date = new Date()) {
  const h = date.getHours()
  if (h >= 5 && h < 11) return 'Günaydın'
  if (h >= 11 && h < 17) return 'İyi günler'
  if (h >= 17 && h < 22) return 'İyi akşamlar'
  return 'İyi geceler'
}

function scrollFeedToTop() {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch { /* eski tarayıcı: kaydırma kritik değil */ }
}

// Kullanıcının herhangi bir gruba üye olup olmadığı: akış boşsa "grup keşfet"
// mi yoksa "ilk gönderiyi paylaş" mı gösterileceğini belirler. Paylaşımlı
// önbellekten (useMyDiseaseGroups) gelir; null = henüz bilinmiyor. Akış
// iskeleti buna BAĞLI DEĞİL - yalnızca boş-durum dalı bekler.
function useHasJoinedGroups() {
  const groups = useMyDiseaseGroups()
  return { checking: groups === null, hasJoined: groups === null ? true : groups.length > 0 }
}

/**
 * Giriş sonrası ana sayfa: kullanıcının üye olduğu tüm gruplardaki
 * gönderiler tek bir zaman sıralı akışta; "Cevap bekleyenler" sekmesi açık
 * soruları listeler. Grup keşfi ayrı sayfada (/groups).
 */
export default function Home() {
  const { token, user } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  // ?tab=questions -> "Cevap bekleyenler" (e-posta özetindeki link de buraya gelir)
  const tab = params.get('tab') === QUESTIONS_TAB ? QUESTIONS_TAB : FEED_TAB
  const setTab = (value) => {
    const next = new URLSearchParams(params)
    if (value === QUESTIONS_TAB) next.set('tab', QUESTIONS_TAB); else next.delete('tab')
    setParams(next, { replace: true })
  }
  // ?sirala=popular -> sıralama da URL'de: geri/yenile sonrası korunur ve
  // önbellek anahtarı (feed:tab:sort) ile aynı kaynaktan beslenir.
  const sort = params.get('sirala') === 'popular' ? 'popular' : 'recent'
  const setSort = (value) => {
    const next = new URLSearchParams(params)
    if (value === 'popular') next.set('sirala', 'popular'); else next.delete('sirala')
    setParams(next, { replace: true })
  }

  const [error, setError] = useState('')
  const [composerOpen, setComposerOpen] = useState(false)
  // Pencere bir kez açıldıktan sonra ağaçta kalır (form taslağı korunur).
  const [composerMounted, setComposerMounted] = useState(false)
  const openComposer = useCallback(() => { setComposerMounted(true); setComposerOpen(true) }, [])
  const { checking: checkingGroups, hasJoined: hasJoinedGroups } = useHasJoinedGroups()

  const fetchPage = useCallback(
    (page, { signal } = {}) => (
      tab === QUESTIONS_TAB ? getOpenQuestions(token, { page, signal }) : getMyFeed(token, { page, sort, signal })
    ),
    [token, sort, tab]
  )
  const { items: posts, loading, loadingMore, last, loadMore, reload } = usePaginatedList(fetchPage, {
    enabled: !!token,
    deps: [token, sort, tab],
    // Geri dönüşte iskelet yerine son liste anında (bkz. usePaginatedList).
    cacheKey: token ? `feed:${tab}:${sort}` : null,
    onError: (err, phase) => {
      if (phase === 'initial') setError(err.message || 'Akış alınamadı.')
      else showError(err.message || 'Akış alınamadı.')
    }
  })

  // Yeni bir sekme/sıralama yüklenirken önceki hata ekranda kalmasın.
  useEffect(() => { setError('') }, [token, sort, tab])

  const reloadFeed = useCallback(() => {
    setError('')
    return reload()
  }, [reload])

  // Yeni gönderi en üstte görünsün: başka sekme/sıralamadaysak "Tümü / Yeni"ye
  // geç (bu değişim akışı zaten yeniden yükler), değilse akışı tazele.
  const onPostCreated = () => {
    if (tab !== FEED_TAB) setTab(FEED_TAB)
    else if (sort !== 'recent') setSort('recent')
    else reloadFeed()
    scrollFeedToTop()
  }

  // Üyelik henüz bilinmiyorken varsayılan "üye" (kullanıcıların büyük
  // çoğunluğu): sekmeler/istem ilk boyamada yerinde durur, sonradan
  // belirip içeriği itmez. Üyeliksiz çıkarsa boş durum zaten devralır.
  const canPost = hasJoinedGroups
  const showSimilarMembersAfter = (index) => tab === FEED_TAB && (
    index === SIMILAR_MEMBERS_AFTER_INDEX
    || (index === posts.length - 1 && posts.length <= SIMILAR_MEMBERS_AFTER_INDEX)
  )

  const renderFeed = () => {
    if (loading) return <PostCardSkeleton count={3} />
    // Akış boşsa ve üyelik hâlâ bilinmiyorsa kısa bir iskelet; dolu akış
    // üyelik yanıtını hiç beklemez.
    if (posts.length === 0 && checkingGroups && !error) return <PostCardSkeleton count={3} />
    if (!hasJoinedGroups) {
      return (
        <EmptyState
          companion="filiz"
          title="Henüz hiçbir gruba katılmadın"
          description="Gruplar, aynı hastalıkla yaşayanların ve yakınlarının buluştuğu küçük topluluklar. Sana yakın olana katıl, akışın burada yeşersin."
          actionLabel="Grupları keşfet"
          actionIcon={<ExploreRounded />}
          onAction={() => navigate('/groups')}
        />
      )
    }
    if (error && posts.length === 0) return null
    if (posts.length === 0) {
      return tab === QUESTIONS_TAB ? (
        <EmptyState
          companion="baykus"
          title="Şu an cevap bekleyen soru yok"
          description="Gruplarındaki her soru bir cevap buldu. Merak ettiğin bir şey varsa sorman yeter; deneyimi olan biri mutlaka yazar."
          actionLabel="Soru sor"
          onAction={openComposer}
        />
      ) : (
        <EmptyState
          companion="papatya"
          title="Akışın henüz sessiz"
          description="Katıldığın gruplarda henüz paylaşım yok. İlk sözü sen söylemek ister misin? Küçük bir merhaba bile yeter."
          actionLabel="İlk gönderiyi paylaş"
          onAction={openComposer}
        />
      )
    }
    return (
      <Box>
        <PostList
          posts={posts}
          token={token}
          renderAfter={(_, i) => showSimilarMembersAfter(i) && <SimilarMembers />}
        />
        {!last && <LoadMoreButton loading={loadingMore} onClick={loadMore} />}
      </Box>
    )
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <PullToRefreshIndicator onRefresh={reloadFeed} disabled={composerOpen} />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={reloadFeed} sx={{ minHeight: 36 }}>Tekrar dene</Button>}
        >
          {error}
        </Alert>
      )}

      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h3" component="h1" sx={{ mb: 0.5 }}>
            {greetingFor()}{user?.firstName ? `, ${user.firstName}` : ''}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 520 }}>
            {tab === QUESTIONS_TAB
              ? 'Bu sorular hâlâ bir cevap bekliyor. Yaşadıkların, birinin yolunu aydınlatabilir.'
              : 'Gruplarındaki en yeni paylaşımlar burada. Okumak da, yazmak da iyi gelir.'}
          </Typography>
        </Box>
      </Stack>

      {/* Karşılamayı atlayanlara nazik hatırlatma (zorlamadan). */}
      {user && !user.onboardingCompleted && (
        <Alert
          severity="info"
          icon={<AutoAwesomeRounded />}
          sx={{ mb: 2, alignItems: 'center' }}
          action={<Button color="inherit" size="small" onClick={() => navigate('/hosgeldin')} sx={{ minHeight: 44, fontWeight: 800 }}>Başla</Button>}
        >
          Profilini bir dakikada tamamla; sana yakın grupları ve üyeleri gösterelim.
        </Alert>
      )}

      {canPost && <ComposerPrompt onClick={openComposer} sx={{ mb: 2.5 }} />}

      {canPost && (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            aria-label="Akış görünümü"
            sx={{ ...pillTabsSx, flex: 1, '& .MuiTab-root': { ...pillTabsSx['& .MuiTab-root'], px: 1 }, '& .MuiTab-icon': { display: { xs: 'none', sm: 'inline-flex' } } }}
          >
            <Tab value={FEED_TAB} label="Tümü" icon={<DynamicFeedRounded sx={{ fontSize: 18 }} />} iconPosition="start" />
            <Tab value={QUESTIONS_TAB} label="Cevap bekleyenler" icon={<QuestionAnswerOutlined sx={{ fontSize: 18 }} />} iconPosition="start" />
          </Tabs>
        </Stack>
      )}

      {canPost && tab === FEED_TAB && (posts.length > 1 || loading || sort !== 'recent') && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5, px: 0.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {sort === 'popular' ? 'En çok faydalı bulunanlar' : 'En yeniler önce'}
          </Typography>
          <SortToggle value={sort} onChange={setSort} />
        </Stack>
      )}

      {renderFeed()}

      {canPost && <CreatePostFab onClick={openComposer} />}

      {composerMounted && (
        <Suspense fallback={null}>
          <NewPostDialog
            open={composerOpen}
            onClose={() => setComposerOpen(false)}
            onCreated={onPostCreated}
            initialPostType={tab === QUESTIONS_TAB ? 'QUESTION' : 'DISCUSSION'}
          />
        </Suspense>
      )}
    </Box>
  )
}
