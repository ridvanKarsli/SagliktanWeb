import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert, Box, Button, CircularProgress, Divider, Fab, IconButton, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material'
import { Add, ArrowBack, CloseRounded, DynamicFeedRounded, SearchOffRounded, SearchRounded } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import PostCard from '../components/PostCard.jsx'
import PostCardSkeleton from '../components/PostCardSkeleton.jsx'
import NewPostDialog from '../components/NewPostDialog.jsx'
import ComposerPrompt from '../components/ComposerPrompt.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { getSubGroup, listPostsBySubGroup, searchPostsInSubGroup } from '../services/api.js'
import { usePaginatedList } from '../hooks/usePaginatedList.js'
import { usePullToRefresh } from '../hooks/usePullToRefresh.js'

export default function Posts() {
  const { subGroupId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { showError } = useNotification()

  const [subGroup, setSubGroup] = useState(null)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('recent')

  // Faz 2 adım 2: gruba özel arama kutusu. `query` kullanıcının yazdığı ham
  // metin, `debouncedQuery` 300ms sonra (Search.jsx'teki genel arama
  // sayfasıyla aynı debounce süresi) gerçek isteğe dönüşen değer - her
  // tuş vuruşunda backend'e gitmemek için.
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const searchDebounceRef = useRef(null)
  const isSearching = debouncedQuery.length > 0

  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!token || !subGroupId) return
    getSubGroup(token, subGroupId)
      .then(setSubGroup)
      .catch(err => showError(err.message || 'Alt grup bilgisi alınamadı.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, subGroupId])

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(searchDebounceRef.current)
  }, [query])

  // Arama modundaysak (debouncedQuery dolu) gruba özel arama uçlarını,
  // değilse normal listeleme+sıralama uçlarını çağırır.
  const fetchPage = useCallback((pageNum) => (
    isSearching
      ? searchPostsInSubGroup(token, subGroupId, debouncedQuery, { page: pageNum })
      : listPostsBySubGroup(token, subGroupId, { page: pageNum, sort })
  ), [token, subGroupId, sort, isSearching, debouncedQuery])

  const {
    items: posts, loading, loadingMore, last, loadMore, reload: reloadPosts
  } = usePaginatedList(fetchPage, {
    enabled: !!token && !!subGroupId,
    deps: [token, subGroupId, sort, debouncedQuery],
    // İlk yükleme hatası sayfanın en üstünde kalıcı bir Alert olarak
    // gösterilir, "Daha Fazla Yükle" hatası ise (liste zaten dolu olduğu
    // için) sadece bir toast - eskisiyle aynı ayrım.
    onError: (err, phase) => {
      if (phase === 'initial') setError(err.message || 'Gönderiler alınamadı.')
      else showError(err.message || 'Gönderiler alınamadı.')
    }
  })

  // Yeni bir sorgu/sıralama başladığında önceki hatayı temizle - eskiden
  // fetch effect'inin başında senkron yapılıyordu, aynı deps üzerinden
  // burada da aynı anda tetikleniyor.
  useEffect(() => { setError('') }, [token, subGroupId, sort, debouncedQuery])

  // Kontrol listesi "Pull-to-refresh desteği" maddesi - dialog açıkken
  // (gönderi yazarken) devre dışı, yanlışlıkla tetiklenip yazılanı
  // kaybettirmesin diye.
  const { pullDistance, refreshing: pullRefreshing, threshold: pullThreshold } = usePullToRefresh(
    reloadPosts, { disabled: dialogOpen }
  )

  const openDialog = () => setDialogOpen(true)

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      {/* Pull-to-refresh göstergesi: parmak çekildikçe yükseklik açılır,
          bıraktığında ya sıfıra döner ya da (eşiği geçtiyse) dönen bir
          spinner'a geçip reloadPosts() bitene kadar açık kalır. */}
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

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        {/* axe-core "button-name" (kritik) ihlali: ikon-sadece buton, yanındaki
            "Alt Gruba Dön" metni DOM'da AYRI bir Typography - butonla ilişkili
            değil, erişilebilir isim vermiyor. */}
        <IconButton
          onClick={() => navigate(subGroup ? `/groups/${subGroup.diseaseGroupId}` : '/groups')}
          size="small"
          aria-label="Alt gruba dön"
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Alt Gruba Dön
        </Typography>
      </Stack>

      {subGroup && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {subGroup.name}
          </Typography>
          {subGroup.description && (
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {subGroup.description}
            </Typography>
          )}
        </Box>
      )}

      {/* Facebook tarzı "Ne düşünüyorsun?" composer girişi - önceden gönderi
          oluşturmanın tek yolu sağ altta gizli kalan bir FAB'dı, akışın en
          üstünde görünür bir davet yoktu. FAB mobilde hızlı erişim için
          duruyor. */}
      {token && <ComposerPrompt onClick={openDialog} sx={{ mb: 2.5 }} />}

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Bu grupta ara..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchRounded sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
              endAdornment: query ? (
                <IconButton size="small" aria-label="Aramayı temizle" onClick={() => setQuery('')} edge="end">
                  <CloseRounded fontSize="small" />
                </IconButton>
              ) : null,
            }
          }}
        />
        {/* Arama sonuçları alaka düzeyine göre sıralı geldiği için (bkz.
            backend searchBySubGroup), arama modundayken sıralama seçicisi
            anlamsız - gizleniyor. */}
        {!isSearching && (
          <ToggleButtonGroup
            size="small"
            value={sort}
            exclusive
            onChange={(_, v) => v && setSort(v)}
            sx={{ flexShrink: 0 }}
          >
            <ToggleButton value="recent">Yeni</ToggleButton>
            <ToggleButton value="popular">Popüler</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box>
          {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </Box>
      ) : (
        <Box>
          {posts.map((post, i) => (
            <Box key={post.id}>
              {i > 0 && <Divider />}
              <PostCard
                post={post}
                token={token}
                onClick={() => navigate(`/post/${post.id}`)}
                highlightQuery={isSearching ? debouncedQuery : undefined}
              />
            </Box>
          ))}
          {posts.length === 0 && (
            <EmptyState
              icon={isSearching ? SearchOffRounded : DynamicFeedRounded}
              title={isSearching ? 'Sonuç bulunamadı' : 'Henüz gönderi yok'}
              description={isSearching ? 'Farklı bir arama terimi deneyin.' : 'İlk gönderiyi sen yap!'}
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

      <Fab
        color="primary"
        aria-label="Yeni gönderi"
        onClick={openDialog}
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 24 },
          bottom: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)', md: 24 },
          zIndex: (t) => t.zIndex.appBar + 3
        }}
      >
        <Add />
      </Fab>

      <NewPostDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        presetSubGroup={subGroup ? { id: subGroup.id, name: subGroup.name, diseaseGroupId: subGroup.diseaseGroupId } : null}
        onCreated={() => { setQuery(''); reloadPosts() }}
      />
    </Box>
  )
}
