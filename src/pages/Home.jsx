import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Divider, Fab, Stack, Tab, Tabs, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { Add, AutoAwesomeRounded, DynamicFeedRounded, GroupsRounded, QuestionAnswerOutlined } from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SimilarMembers from '../components/SimilarMembers.jsx'
import PostCard from '../components/PostCard.jsx'
import PostCardSkeleton from '../components/PostCardSkeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'
import NewPostDialog from '../components/NewPostDialog.jsx'
import ComposerPrompt from '../components/ComposerPrompt.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { getMyDiseaseGroups, getMyFeed, getOpenQuestions } from '../services/api.js'
import { usePaginatedList } from '../hooks/usePaginatedList.js'
import { usePullToRefresh } from '../hooks/usePullToRefresh.js'

/**
 * Giriş sonrası asıl ana sayfa (bkz. App.jsx "/" route'u). Önceden burada
 * doğrudan Gruplar (DiseaseGroups.jsx) listesi açılıyordu - kullanıcı her
 * girişte önce bir grup seçip içine girmek zorundaydı, gönderilere erişmek
 * en az iki tıklama alıyordu. Artık Twitter/Instagram ana sayfası gibi:
 * katıldığı TÜM gruplardaki gönderiler tek bir zaman sıralı akışta (bkz.
 * backend PostController.feed / PostRepository.findFeedForUser). Grup
 * keşfi/yönetimi ayrı bir sayfaya taşındı (bkz. ResponsiveShell nav'daki
 * ayrı "Gruplar" ikonu).
 */
export default function Home() {
  const { token, user } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  // ?tab=questions -> "Cevap bekleyenler" (e-posta özetindeki link de buraya gelir)
  const tab = params.get('tab') === 'questions' ? 'questions' : 'feed'
  const setTab = (v) => {
    const next = new URLSearchParams(params)
    if (v === 'questions') next.set('tab', 'questions'); else next.delete('tab')
    setParams(next, { replace: true })
  }

  const [error, setError] = useState('')
  // Akış boşsa nedenini ayırt etmek için: hiç gruba katılmamış mı (o zaman
  // "grup keşfet" CTA'sı asıl mesaj), yoksa katıldığı gruplarda henüz
  // gönderi mi yok (o zaman farklı, daha nötr bir boş durum).
  const [hasJoinedGroups, setHasJoinedGroups] = useState(true)
  const [checkingGroups, setCheckingGroups] = useState(true)

  // Faz6: en çok kullanılan ekranda (bkz. kullanıcı geri bildirimi) sıralama
  // seçeneği yoktu - Posts.jsx'teki alt grup akışıyla aynı Yeni/Popüler
  // deseni burada da. Backend tarafı PostController.feed'de aynı
  // PostSortOption (RECENT/POPULAR) ile karşılanıyor.
  const [sort, setSort] = useState('recent')
  const [composerOpen, setComposerOpen] = useState(false)

  useEffect(() => {
    if (!token) { setCheckingGroups(false); return }
    getMyDiseaseGroups(token)
      .then(mine => setHasJoinedGroups(Array.isArray(mine) && mine.length > 0))
      .catch(() => {})
      .finally(() => setCheckingGroups(false))
  }, [token])

  const fetchPage = useCallback(
    (page) => (tab === 'questions' ? getOpenQuestions(token, { page }) : getMyFeed(token, { page, sort })),
    [token, sort, tab]
  )
  const {
    items: posts, loading, loadingMore, last, loadMore, reload: reloadFeed
  } = usePaginatedList(fetchPage, {
    enabled: !!token,
    deps: [token, sort, tab],
    onError: (err, phase) => {
      if (phase === 'initial') setError(err.message || 'Akış alınamadı.')
      else showError(err.message || 'Akış alınamadı.')
    }
  })

  // Kontrol listesi "Pull-to-refresh desteği" maddesi - Posts.jsx'teki
  // aynı desen.
  const { pullDistance, refreshing: pullRefreshing, threshold: pullThreshold } = usePullToRefresh(
    reloadFeed, { disabled: composerOpen }
  )

  // Yeni gönderi en üstte görünsün: "Popüler" sıralamadaysak "Yeni"ye geç
  // (sort değişimi akışı zaten yeniden yükler), değilse akışı tazele.
  const onPostCreated = () => {
    if (tab !== 'feed') setTab('feed')
    else if (sort !== 'recent') setSort('recent')
    else reloadFeed()
    try { document.getElementById('root')?.scrollTo({ top: 0, behavior: 'smooth' }); window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { /* yoksay */ }
  }
  const canPost = !checkingGroups && hasJoinedGroups

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          height: pullDistance,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', color: 'primary.main',
          transition: pullDistance === 0 ? 'height 0.2s ease' : 'none'
        }}
      >
        {pullDistance > 0 && (
          <CircularProgress
            size={22}
            thickness={5}
            variant={pullRefreshing ? 'indeterminate' : 'determinate'}
            value={Math.min(100, (pullDistance / pullThreshold) * 100)}
          />
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Sayfa başlığı: diğer sayfalarla (Gruplar, Mesajlar, Profil) aynı
          başlık dili; sıralama anahtarı başlığın karşısında, tek satırda. */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Akış</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {tab === 'questions' ? 'Deneyimin birine yol gösterebilir' : 'Gruplarından son paylaşımlar'}
          </Typography>
        </Box>
        {!checkingGroups && hasJoinedGroups && tab === 'feed' && (
          <ToggleButtonGroup
            size="small"
            value={sort}
            exclusive
            onChange={(_, v) => v && setSort(v)}
          >
            <ToggleButton value="recent">Yeni</ToggleButton>
            <ToggleButton value="popular">Popüler</ToggleButton>
          </ToggleButtonGroup>
        )}
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
          <Tab value="feed" label="Tümü" icon={<DynamicFeedRounded sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab value="questions" label="Cevap bekleyenler" icon={<QuestionAnswerOutlined sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      )}

      {(loading || checkingGroups) ? (
        <Box>
          {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </Box>
      ) : !hasJoinedGroups ? (
        <EmptyState
          icon={GroupsRounded}
          title="Henüz hiçbir gruba katılmadın"
          description="İlgilendiğin hastalık gruplarına katıl, ana sayfanda gönderilerini görmeye başla."
          actionLabel="Grupları Keşfet"
          onAction={() => navigate('/groups')}
        />
      ) : (
        <Box>
          {posts.map((post, i) => (
            <Box key={post.id}>
              {i > 0 && <Divider />}
              <PostCard post={post} token={token} onClick={() => navigate(`/post/${post.id}`)} />
              {/* "Senin gibi üyeler" akışın 3. gönderisinden sonra - en üstte
                  içeriği aşağı itmesin ama ilk ekranlarda görülsün. */}
              {tab === 'feed' && (i === 2 || (i === posts.length - 1 && posts.length < 3)) && (
                <>
                  <Divider />
                  <SimilarMembers sx={{ py: 2 }} />
                </>
              )}
            </Box>
          ))}
          {posts.length === 0 && tab === 'questions' && (
            <EmptyState
              icon={QuestionAnswerOutlined}
              title="Şu an cevap bekleyen soru yok"
              description="Gruplarındaki sorular cevaplandıkça burası boşalır. Sen de bir soru sorabilirsin."
              actionLabel="Soru sor"
              onAction={() => setComposerOpen(true)}
            />
          )}
          {posts.length === 0 && tab === 'feed' && (
            <EmptyState
              icon={DynamicFeedRounded}
              title="Akışında henüz gönderi yok"
              description="Katıldığın gruplarda henüz kimse paylaşım yapmamış. İlk adımı sen at!"
              actionLabel="İlk gönderiyi paylaş"
              onAction={() => setComposerOpen(true)}
            />
          )}
          {!last && posts.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Button
                variant="outlined"
                onClick={loadMore}
                disabled={loadingMore}
                sx={{ minWidth: 180, minHeight: 44 }}
              >
                {loadingMore ? <CircularProgress size={18} /> : 'Daha Fazla Yükle'}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {canPost && (
        <Fab
          color="primary"
          aria-label="Yeni gönderi"
          onClick={() => setComposerOpen(true)}
          sx={{
            position: 'fixed',
            right: { xs: 16, md: 24 },
            bottom: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)', md: 24 },
            zIndex: (t) => t.zIndex.appBar + 3
          }}
        >
          <Add />
        </Fab>
      )}

      <NewPostDialog
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreated={onPostCreated}
        initialPostType={tab === 'questions' ? 'QUESTION' : 'DISCUSSION'}
      />
    </Box>
  )
}
