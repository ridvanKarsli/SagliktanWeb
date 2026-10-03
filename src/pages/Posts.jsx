import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, IconButton, Skeleton, Stack, TextField, Typography } from '@mui/material'
import { CloseRounded, ForumRounded, SearchRounded } from '@mui/icons-material'
import { useParams } from 'react-router-dom'
import PostList from '../components/PostList.jsx'
import PostCardSkeleton from '../components/PostCardSkeleton.jsx'
import NewPostDialog from '../components/NewPostDialog.jsx'
import ComposerPrompt from '../components/ComposerPrompt.jsx'
import EmptyState from '../components/EmptyState.jsx'
import CreatePostFab from '../components/CreatePostFab.jsx'
import SortToggle from '../components/SortToggle.jsx'
import PullToRefreshIndicator from '../components/PullToRefreshIndicator.jsx'
import BackLink from '../components/common/BackLink.jsx'
import LoadMoreButton from '../components/common/LoadMoreButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { getSubGroup, listPostsBySubGroup, searchPostsInSubGroup } from '../services/api.js'
import { usePaginatedList } from '../hooks/usePaginatedList.js'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'
import { LIMITS, clampLength } from '../utils/validation.js'

// Alt grubun (forum) gönderi akışı: sıralama, gruba özel arama ve paylaşım.
export default function Posts() {
  const { subGroupId } = useParams()
  const { token } = useAuth()
  const { showError } = useNotification()

  const [subGroup, setSubGroup] = useState(null)
  const [subGroupFailed, setSubGroupFailed] = useState(false)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('recent')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query.trim(), 300)
  const isSearching = debouncedQuery.length > 0
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!token || !subGroupId) return undefined
    let alive = true
    getSubGroup(token, subGroupId)
      .then(data => { if (alive) setSubGroup(data) })
      .catch(err => {
        if (!alive) return
        setSubGroupFailed(true)
        showError(err.message || 'Alt grup bilgisi alınamadı. Sayfayı yenileyip yeniden deneyebilirsin.')
      })
    return () => { alive = false }
  }, [token, subGroupId, showError])

  // Arama modunda gruba özel arama ucu (alaka sıralı), değilse sıralı listeleme.
  const fetchPage = useCallback((pageNum) => (
    isSearching
      ? searchPostsInSubGroup(token, subGroupId, debouncedQuery, { page: pageNum })
      : listPostsBySubGroup(token, subGroupId, { page: pageNum, sort })
  ), [token, subGroupId, sort, isSearching, debouncedQuery])

  const { items: posts, loading, loadingMore, last, loadMore, reload } = usePaginatedList(fetchPage, {
    enabled: !!token && !!subGroupId,
    deps: [token, subGroupId, sort, debouncedQuery],
    // İlk yükleme hatası kalıcı bir Alert; "Daha Fazla Yükle" hatası (liste
    // zaten dolu) yalnızca bir toast.
    onError: (err, phase) => {
      if (phase === 'initial') setError(err.message || 'Gönderiler alınamadı.')
      else showError(err.message || 'Gönderiler alınamadı.')
    }
  })

  useEffect(() => { setError('') }, [token, subGroupId, sort, debouncedQuery])

  const reloadPosts = useCallback(() => {
    setError('')
    return reload()
  }, [reload])

  const onPostCreated = () => {
    // Arama açıksa temizlemek zaten listeyi yeniden yükler (debounce sonrası);
    // değilse doğrudan tazele.
    // (Debounce edilmiş sorgu boşsa temizlemek yeniden yükleme tetiklemez.)
    setQuery('')
    if (!isSearching) reloadPosts()
  }

  const openDialog = () => setDialogOpen(true)

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <PullToRefreshIndicator onRefresh={reloadPosts} disabled={dialogOpen} />

      <BackLink
        to={subGroup ? `/groups/${subGroup.diseaseGroupId}` : '/groups'}
        label="Gruba dön"
      />

      {subGroup ? (
        <Box sx={{ mb: 2.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.75 }}>
            <Box
              aria-hidden
              sx={{
                width: 48, height: 48, borderRadius: '16px', flexShrink: 0, display: 'grid', placeItems: 'center',
                bgcolor: 'brand.apricotSoft', color: 'brand.apricotInk'
              }}
            >
              <ForumRounded />
            </Box>
            <Typography variant="h3" component="h1" sx={{ minWidth: 0, wordBreak: 'break-word' }}>
              {subGroup.name}
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560 }}>
            {subGroup.description || 'Aynı konuyu konuşmak isteyenlerin buluştuğu bir köşe.'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 560 }}>
            Okuyabilir, soru sorabilir ya da kendi deneyimini paylaşabilirsin.
          </Typography>
        </Box>
      ) : !subGroupFailed && (
        <Box aria-hidden sx={{ mb: 2.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: '16px' }} />
            <Skeleton variant="text" width="55%" sx={{ fontSize: '2rem' }} />
          </Stack>
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="60%" />
        </Box>
      )}

      {token && <ComposerPrompt onClick={openDialog} sx={{ mb: 2.5 }} />}

      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Bu grupta ara..."
          value={query}
          onChange={e => setQuery(clampLength(e.target.value, LIMITS.SEARCH_MAX))}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '999px', bgcolor: 'background.paper', minHeight: 46 } }}
          slotProps={{
            input: {
              startAdornment: <SearchRounded sx={{ color: 'text.secondary', mr: 1, fontSize: 22 }} />,
              endAdornment: query ? (
                <IconButton aria-label="Aramayı temizle" onClick={() => setQuery('')} edge="end" sx={{ width: 40, height: 40 }}>
                  <CloseRounded fontSize="small" />
                </IconButton>
              ) : null,
            },
            htmlInput: { 'aria-label': 'Bu grupta ara', inputMode: 'search', enterKeyHint: 'search', maxLength: LIMITS.SEARCH_MAX, autoComplete: 'off' }
          }}
        />
        {/* Arama sonuçları alaka düzeyine göre geldiği için sıralama anlamsız. */}
        {!isSearching && <SortToggle value={sort} onChange={setSort} sx={{ flexShrink: 0 }} />}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <PostCardSkeleton count={3} />
      ) : (
        <Box>
          <PostList posts={posts} token={token} highlightQuery={isSearching ? debouncedQuery : undefined} />
          {posts.length === 0 && !error && (isSearching ? (
            <EmptyState
              companion="bulut"
              title="Bu aramayla eşleşen gönderi yok"
              description="Farklı ya da daha kısa bir kelimeyle yeniden dene. Aradığını bulamazsan sormaktan çekinme."
            />
          ) : (
            <EmptyState
              companion="serce"
              title="Burası henüz sessiz"
              description="Bu köşede ilk sözü sen söyleyebilirsin. Bir merhaba, bir soru ya da bir deneyim yeter."
              actionLabel="İlk gönderiyi paylaş"
              onAction={openDialog}
            />
          ))}
          {!last && posts.length > 0 && <LoadMoreButton loading={loadingMore} onClick={loadMore} />}
        </Box>
      )}

      <CreatePostFab onClick={openDialog} />

      <NewPostDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        presetSubGroup={subGroup ? { id: subGroup.id, name: subGroup.name, diseaseGroupId: subGroup.diseaseGroupId } : null}
        onCreated={onPostCreated}
      />
    </Box>
  )
}
