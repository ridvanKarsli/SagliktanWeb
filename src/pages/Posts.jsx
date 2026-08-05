import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert, Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Fab, IconButton, Stack, TextField, ToggleButton, ToggleButtonGroup,
  Typography, useMediaQuery, useTheme
} from '@mui/material'
import { Add, ArrowBack, CloseRounded, SearchRounded } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import PostCard from '../components/PostCard.jsx'
import PostCardSkeleton from '../components/PostCardSkeleton.jsx'
import PhotoUploadField from '../components/PhotoUploadField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { createPost, getSubGroup, listPostsBySubGroup, searchPostsInSubGroup } from '../services/api.js'
import { initialsFrom } from '../utils/format.js'
import { usePaginatedList } from '../hooks/usePaginatedList.js'

export default function Posts() {
  const { subGroupId } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { showError, showSuccess } = useNotification()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

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
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Faz 2 adım 4: her giriş {id, status, previewUrl, storageKey, errorMessage}
  // - bkz. PhotoUploadField.jsx.
  const [attachments, setAttachments] = useState([])
  const photosBusy = attachments.some(a => a.status === 'compressing' || a.status === 'uploading')

  const resetAttachments = () => {
    attachments.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl) })
    setAttachments([])
  }

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

  const openDialog = () => { setTitle(''); setContent(''); resetAttachments(); setDialogOpen(true) }
  const closeDialog = () => { if (!submitting) { resetAttachments(); setDialogOpen(false) } }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { showError('Başlık zorunludur.'); return }
    if (title.trim().length > 255) { showError('Başlık en fazla 255 karakter olabilir.'); return }
    if (!content.trim()) { showError('İçerik zorunludur.'); return }
    if (photosBusy) { showError('Fotoğraflar hâlâ yükleniyor, birazdan tekrar deneyin.'); return }

    const attachmentKeys = attachments.filter(a => a.status === 'done').map(a => a.storageKey)

    setSubmitting(true)
    try {
      await createPost(token, subGroupId, { title: title.trim(), content: content.trim(), attachmentKeys })
      showSuccess('Gönderi oluşturuldu.')
      setDialogOpen(false)
      resetAttachments()
      await reloadPosts()
    } catch (err) {
      showError(err.message || 'Gönderi oluşturulamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <IconButton
          onClick={() => navigate(subGroup ? `/groups/${subGroup.diseaseGroupId}` : '/groups')}
          size="small"
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
      {token && (
        <Box
          onClick={openDialog}
          className="tap-scale"
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: { xs: 1.5, md: 2 }, mb: 2.5, borderRadius: 3,
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
            cursor: 'pointer', transition: 'border-color 0.2s ease, background-color 0.2s ease',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
          }}
        >
          <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            {initialsFrom([user?.firstName, user?.lastName].filter(Boolean).join(' '))}
          </Avatar>
          <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
            Ne paylaşmak istersin?
          </Typography>
        </Box>
      )}

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
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                {isSearching ? 'Sonuç bulunamadı' : 'Henüz gönderi yok'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {isSearching ? 'Farklı bir arama terimi deneyin' : 'İlk gönderiyi sen yap!'}
              </Typography>
            </Box>
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

      {/* Gönderi yazma kutusu mobilde tam ekran açılıyor: telefonda klavye
          açıldığında ekranın yarısı kaybolduğu için, ortada yüzen küçük bir
          diyalogda çok satırlı metin yazmak sıkışık ve rahatsız oluyordu.
          Tam ekran, yazma alanına tüm yüksekliği veriyor. */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth fullScreen={isSmallScreen}>
        <DialogTitle>Yeni Gönderi</DialogTitle>
        <Box component="form" id="new-post-form" onSubmit={onSubmit}>
          <DialogContent>
            <Stack spacing={2.5}>
              <TextField
                label="Başlık"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                fullWidth
                slotProps={{ htmlInput: { maxLength: 255, 'data-testid': 'post-title' } }}
                autoFocus
              />
              <TextField
                label="İçerik"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                fullWidth
                multiline
                minRows={isSmallScreen ? 10 : 5}
                slotProps={{ htmlInput: { 'data-testid': 'post-content' } }}
              />
              <PhotoUploadField value={attachments} onChange={setAttachments} token={token} disabled={submitting} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={closeDialog} disabled={submitting}>İptal</Button>
            <Button type="submit" variant="contained" disabled={submitting || photosBusy}>
              {submitting ? <CircularProgress size={18} color="inherit" /> : 'Paylaş'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
