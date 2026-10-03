import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, IconButton, Stack, TextField, Typography } from '@mui/material'
import { CloseRounded, DynamicFeedRounded, SearchOffRounded, SearchRounded } from '@mui/icons-material'
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

// Alt grubun (forum) gönderi akışı: sıralama, gruba özel arama ve paylaşım.
export default function Posts() {
  const { subGroupId } = useParams()
  const { token } = useAuth()
  const { showError } = useNotification()

  const [subGroup, setSubGroup] = useState(null)
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
      .catch(err => { if (alive) showError(err.message || 'Alt grup bilgisi alınamadı.') })
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
        ariaLabel="Alt gruba dön"
        label="Alt Gruba Dön"
      />

      {subGroup && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5, wordBreak: 'break-word' }}>
            {subGroup.name}
          </Typography>
          {subGroup.description && (
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {subGroup.description}
            </Typography>
          )}
        </Box>
      )}

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
            },
            htmlInput: { 'aria-label': 'Bu grupta ara' }
          }}
        />
        {/* Arama sonuçları alaka düzeyine göre geldiği için sıralama anlamsız. */}
        {!isSearching && <SortToggle value={sort} onChange={setSort} sx={{ flexShrink: 0 }} />}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box>
          {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </Box>
      ) : (
        <Box>
          <PostList posts={posts} token={token} highlightQuery={isSearching ? debouncedQuery : undefined} />
          {posts.length === 0 && !error && (
            <EmptyState
              icon={isSearching ? SearchOffRounded : DynamicFeedRounded}
              title={isSearching ? 'Sonuç bulunamadı' : 'Henüz gönderi yok'}
              description={isSearching ? 'Farklı bir arama terimi deneyin.' : 'İlk gönderiyi sen yap!'}
            />
          )}
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
