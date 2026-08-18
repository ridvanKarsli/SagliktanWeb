import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Divider, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { DynamicFeedRounded, GroupsRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard.jsx'
import PostCardSkeleton from '../components/PostCardSkeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { getMyDiseaseGroups, getMyFeed } from '../services/api.js'
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
  const { token } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()

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

  useEffect(() => {
    if (!token) { setCheckingGroups(false); return }
    getMyDiseaseGroups(token)
      .then(mine => setHasJoinedGroups(Array.isArray(mine) && mine.length > 0))
      .catch(() => {})
      .finally(() => setCheckingGroups(false))
  }, [token])

  const fetchPage = useCallback((page) => getMyFeed(token, { page, sort }), [token, sort])
  const {
    items: posts, loading, loadingMore, last, loadMore, reload: reloadFeed
  } = usePaginatedList(fetchPage, {
    enabled: !!token,
    deps: [token, sort],
    onError: (err, phase) => {
      if (phase === 'initial') setError(err.message || 'Akış alınamadı.')
      else showError(err.message || 'Akış alınamadı.')
    }
  })

  // Kontrol listesi "Pull-to-refresh desteği" maddesi - Posts.jsx'teki
  // aynı desen.
  const { pullDistance, refreshing: pullRefreshing, threshold: pullThreshold } = usePullToRefresh(reloadFeed)

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

      {!checkingGroups && hasJoinedGroups && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
          <ToggleButtonGroup
            size="small"
            value={sort}
            exclusive
            onChange={(_, v) => v && setSort(v)}
          >
            <ToggleButton value="recent">Yeni</ToggleButton>
            <ToggleButton value="popular">Popüler</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
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
            </Box>
          ))}
          {posts.length === 0 && (
            <EmptyState
              icon={DynamicFeedRounded}
              title="Akışında henüz gönderi yok"
              description="Katıldığın gruplarda henüz kimse paylaşım yapmamış."
              actionLabel="Daha Fazla Grup Keşfet"
              onAction={() => navigate('/groups')}
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
    </Box>
  )
}
