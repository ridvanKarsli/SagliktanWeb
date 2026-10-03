import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Divider, Stack, Tab, Tabs, Typography } from '@mui/material'
import { AutoAwesomeRounded, DynamicFeedRounded, GroupsRounded, QuestionAnswerOutlined } from '@mui/icons-material'
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

const FEED_TAB = 'feed'
const QUESTIONS_TAB = 'questions'
// "Senin gibi üyeler" kartı akışın bu sıradaki gönderisinden sonra gösterilir:
// en üstte içeriği aşağı itmesin ama ilk ekranlarda görülsün.
const SIMILAR_MEMBERS_AFTER_INDEX = 2

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
    if (loading || checkingGroups) {
      return <Box>{Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}</Box>
    }
    if (!hasJoinedGroups) {
      return (
        <EmptyState
          icon={GroupsRounded}
          title="Henüz hiçbir gruba katılmadın"
          description="İlgilendiğin hastalık gruplarına katıl, ana sayfanda gönderilerini görmeye başla."
          actionLabel="Grupları Keşfet"
          onAction={() => navigate('/groups')}
        />
      )
    }
    if (error && posts.length === 0) return null
    if (posts.length === 0) {
      return tab === QUESTIONS_TAB ? (
        <EmptyState
          icon={QuestionAnswerOutlined}
          title="Şu an cevap bekleyen soru yok"
          description="Gruplarındaki sorular cevaplandıkça burası boşalır. Sen de bir soru sorabilirsin."
          actionLabel="Soru sor"
          onAction={() => setComposerOpen(true)}
        />
      ) : (
        <EmptyState
          icon={DynamicFeedRounded}
          title="Akışında henüz gönderi yok"
          description="Katıldığın gruplarda henüz kimse paylaşım yapmamış. İlk adımı sen at!"
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
          renderAfter={(_, i) => showSimilarMembersAfter(i) && (
            <>
              <Divider />
              <SimilarMembers sx={{ py: 2 }} />
            </>
          )}
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

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Akış</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {tab === QUESTIONS_TAB ? 'Deneyimin birine yol gösterebilir' : 'Gruplarından son paylaşımlar'}
          </Typography>
        </Box>
        {canPost && tab === FEED_TAB && <SortToggle value={sort} onChange={setSort} />}
      </Stack>

      {/* Karşılamayı atlayanlara nazik hatırlatma (zorlamadan). */}
      {user && !user.onboardingCompleted && (
        <Alert
          severity="info"
          icon={<AutoAwesomeRounded />}
          sx={{ mb: 2, alignItems: 'center' }}
          action={<Button color="inherit" size="small" onClick={() => navigate('/hosgeldin')} sx={{ minHeight: 36, fontWeight: 700 }}>Başla</Button>}
        >
          Profilini 1 dakikada tamamla, sana uygun grupları ve üyeleri gösterelim.
        </Alert>
      )}

      {canPost && <ComposerPrompt onClick={() => setComposerOpen(true)} hint="Gruplarına bir şey paylaş…" sx={{ mb: 1.5 }} />}

      {canPost && (
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          aria-label="Akış görünümü"
          sx={{
            mb: 1, borderBottom: '1px solid', borderColor: 'divider', minHeight: 44,
            '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 700, px: 1 },
            '& .MuiTab-icon': { display: { xs: 'none', sm: 'inline-flex' } }
          }}
        >
          <Tab value={FEED_TAB} label="Tümü" icon={<DynamicFeedRounded sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab value={QUESTIONS_TAB} label="Cevap bekleyenler" icon={<QuestionAnswerOutlined sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
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
