import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material'
import { AutoAwesomeRounded, DynamicFeedRounded, ExploreRounded, QuestionAnswerOutlined } from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SimilarMembers from '../components/SimilarMembers.jsx'
import PostList from '../components/PostList.jsx'
import PostCardSkeleton from '../components/PostCardSkeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'
import NewPostDialog from '../components/NewPostDialog.jsx'
import ComposerPrompt from '../components/ComposerPrompt.jsx'
import CreatePostFab from '../components/CreatePostFab.jsx'
import SortToggle from '../components/SortToggle.jsx'
import PullToRefreshIndicator from '../components/PullToRefreshIndicator.jsx'
import LoadMoreButton from '../components/common/LoadMoreButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { getMyDiseaseGroups, getMyFeed, getOpenQuestions } from '../services/api.js'
import { usePaginatedList } from '../hooks/usePaginatedList.js'
import { pillTabsSx } from '../components/shell/pillTabs.js'

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
    document.getElementById('root')?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch { /* eski tarayıcı: kaydırma kritik değil */ }
}

// Kullanıcının herhangi bir gruba üye olup olmadığı: akış boşsa "grup keşfet"
// mi yoksa "ilk gönderiyi paylaş" mı gösterileceğini belirler.
function useHasJoinedGroups(token) {
  const [state, setState] = useState({ checking: true, hasJoined: true })
  useEffect(() => {
    if (!token) { setState({ checking: false, hasJoined: false }); return undefined }
    let alive = true
    getMyDiseaseGroups(token)
      .then(mine => { if (alive) setState({ checking: false, hasJoined: Array.isArray(mine) && mine.length > 0 }) })
      // İkincil veri: bilinemiyorsa akışı normal göster (varsayılan "üye").
      .catch(() => { if (alive) setState({ checking: false, hasJoined: true }) })
    return () => { alive = false }
  }, [token])
  return state
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

  const [error, setError] = useState('')
  const [sort, setSort] = useState('recent')
  const [composerOpen, setComposerOpen] = useState(false)
  const { checking: checkingGroups, hasJoined: hasJoinedGroups } = useHasJoinedGroups(token)

  const fetchPage = useCallback(
    (page) => (tab === QUESTIONS_TAB ? getOpenQuestions(token, { page }) : getMyFeed(token, { page, sort })),
    [token, sort, tab]
  )
  const { items: posts, loading, loadingMore, last, loadMore, reload } = usePaginatedList(fetchPage, {
    enabled: !!token,
    deps: [token, sort, tab],
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

  const canPost = !checkingGroups && hasJoinedGroups
  const showSimilarMembersAfter = (index) => tab === FEED_TAB && (
    index === SIMILAR_MEMBERS_AFTER_INDEX
    || (index === posts.length - 1 && posts.length <= SIMILAR_MEMBERS_AFTER_INDEX)
  )

  const renderFeed = () => {
    if (loading || checkingGroups) return <PostCardSkeleton count={3} />
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
          onAction={() => setComposerOpen(true)}
        />
      ) : (
        <EmptyState
          companion="papatya"
          title="Akışın henüz sessiz"
          description="Katıldığın gruplarda henüz paylaşım yok. İlk sözü sen söylemek ister misin? Küçük bir merhaba bile yeter."
          actionLabel="İlk gönderiyi paylaş"
          onAction={() => setComposerOpen(true)}
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

      {canPost && <ComposerPrompt onClick={() => setComposerOpen(true)} sx={{ mb: 2.5 }} />}

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

      {canPost && <CreatePostFab onClick={() => setComposerOpen(true)} />}

      <NewPostDialog
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreated={onPostCreated}
        initialPostType={tab === QUESTIONS_TAB ? 'QUESTION' : 'DISCUSSION'}
      />
    </Box>
  )
}
