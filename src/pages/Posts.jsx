import { useEffect, useState } from 'react'
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Fab, IconButton, Stack, TextField, Typography
} from '@mui/material'
import { Add, ArrowBack } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import PostCard from '../components/PostCard.jsx'
import PostCardSkeleton from '../components/PostCardSkeleton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { createPost, getSubGroup, listPostsBySubGroup } from '../services/api.js'

export default function Posts() {
  const { subGroupId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()

  const [subGroup, setSubGroup] = useState(null)
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token || !subGroupId) return
    getSubGroup(token, subGroupId)
      .then(setSubGroup)
      .catch(err => showError(err.message || 'Alt grup bilgisi alınamadı.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, subGroupId])

  useEffect(() => {
    if (!token || !subGroupId) { setLoading(false); return }
    let mounted = true
    setLoading(true)
    setError('')
    setPage(0)
    listPostsBySubGroup(token, subGroupId, { page: 0 })
      .then(res => {
        if (!mounted) return
        setPosts(Array.isArray(res?.content) ? res.content : [])
        setLast(res?.last ?? true)
      })
      .catch(err => {
        if (!mounted) return
        setError(err.message || 'Gönderiler alınamadı.')
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [token, subGroupId])

  // Sayfa numaralı "Önceki/Sonraki" yerine mobilde tek elle kullanımı daha
  // kolay olan "Daha Fazla Yükle" - yeni sayfa mevcut listeye ekleniyor,
  // kullanıcı yerini kaybetmiyor.
  const loadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const res = await listPostsBySubGroup(token, subGroupId, { page: nextPage })
      setPosts(prev => [...prev, ...(Array.isArray(res?.content) ? res.content : [])])
      setLast(res?.last ?? true)
      setPage(nextPage)
    } catch (err) {
      showError(err.message || 'Gönderiler alınamadı.')
    } finally {
      setLoadingMore(false)
    }
  }

  const openDialog = () => { setTitle(''); setContent(''); setDialogOpen(true) }
  const closeDialog = () => { if (!submitting) setDialogOpen(false) }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { showError('Başlık zorunludur.'); return }
    if (title.trim().length > 255) { showError('Başlık en fazla 255 karakter olabilir.'); return }
    if (!content.trim()) { showError('İçerik zorunludur.'); return }

    setSubmitting(true)
    try {
      await createPost(token, subGroupId, { title: title.trim(), content: content.trim() })
      showSuccess('Gönderi oluşturuldu.')
      setDialogOpen(false)
      setPage(0)
      const res = await listPostsBySubGroup(token, subGroupId, { page: 0 })
      setPosts(Array.isArray(res?.content) ? res.content : [])
      setLast(res?.last ?? true)
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box>
          {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </Box>
      ) : (
        <Box>
          {posts.map(post => (
            <PostCard key={post.id} post={post} token={token} onClick={() => navigate(`/post/${post.id}`)} />
          ))}
          {posts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                Henüz gönderi yok
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.7 }}>
                İlk gönderiyi sen yap!
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

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
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
                minRows={5}
                slotProps={{ htmlInput: { 'data-testid': 'post-content' } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={closeDialog} disabled={submitting}>İptal</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={18} color="inherit" /> : 'Paylaş'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
