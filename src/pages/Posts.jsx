import { useMemo, useState, useEffect, useRef } from 'react'
import {
  Box, Button, Stack, TextField, Typography, Divider,
  Fab, Dialog, DialogTitle, DialogContent, DialogActions,
  useMediaQuery, Alert, Snackbar, CircularProgress, Container,
  Autocomplete
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Add } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'

import PostCard from '../components/PostCard.jsx'
import Surface from '../components/Surface.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getAllChats, getDiseaseNames } from '../services/api.js'
import { addChat } from '../services/api.js'

/* ---------------- Utils ---------------- */
function parseYMD(ymd) {
  // "YYYY-MM-DD" -> local timestamp
  if (!ymd) return Date.now()
  const [y, m, d] = String(ymd).split('-').map(Number)
  return new Date(y || 1970, (m || 1) - 1, d || 1).getTime()
}

function dedupUsers(arr) {
  if (!Array.isArray(arr)) return []
  const map = new Map()
  for (const u of arr) {
    const id = u?.userID ?? u?.userId
    if (id == null) continue
    if (!map.has(id)) map.set(id, u)
  }
  return Array.from(map.values())
}

function myVoteFor(currentUserId, likedUsers, dislikedUsers) {
  if (!currentUserId) return 0
  const liked = likedUsers.some(u => (u?.userID ?? u?.userId) === currentUserId)
  const disliked = dislikedUsers.some(u => (u?.userID ?? u?.userId) === currentUserId)
  if (liked) return 1
  if (disliked) return -1
  return 0
}

function toPostModel(chat, currentUserId) {
  const liked = dedupUsers(chat.likedUser)
  const disliked = dedupUsers(chat.dislikedUser)

  const comments = Array.isArray(chat.comments)
    ? chat.comments.map(c => {
        const cLiked = dedupUsers(c.likedUser)
        const cDisliked = dedupUsers(c.dislikedUser)
        const cid = c.commnetsID ?? c.commentsID ?? c.id ?? `c_${Math.random().toString(36).slice(2)}`
        return {
          id: `c_${cid}`,
          author: `Kullanıcı #${c.userID ?? '???'}`,
          text: c.message ?? '',
          timestamp: parseYMD(c.uploadDate),
          likes: cLiked.length,
          dislikes: cDisliked.length,
          myVote: myVoteFor(currentUserId, cLiked, cDisliked)
        }
      })
    : []

  return {
    id: `p_${chat.chatID}`,
    author: `Kullanıcı #${chat.userID ?? '???'}`,
    content: chat.message ?? '',
    timestamp: parseYMD(chat.uploadDate),
    likes: liked.length,
    dislikes: disliked.length,
    myVote: myVoteFor(currentUserId, liked, disliked),
    comments,
    category: chat.category || null
  }
}

/* ---------------- Page ---------------- */
export default function Posts() {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { user, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [posts, setPosts] = useState([])
  const [msg, setMsg] = useState('')

  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [catsLoading, setCatsLoading] = useState(false)
  const [catsError, setCatsError] = useState('')
  const catsLoadedRef = useRef(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const params = new URLSearchParams(location.search)
  const dialogOpen = params.get('new') === '1'

  useEffect(() => {
    // /posts#compose desteği
    if (location.hash === '#compose') navigate('/posts?new=1', { replace: true })
  }, [location.hash, navigate])

  async function loadChats() {
    setLoading(true)
    setError('')
    try {
      const data = await getAllChats(token)
      const mapped = data.map(ch => toPostModel(ch, user?.userId ?? user?.userID ?? null))
      mapped.sort((a, b) => b.timestamp - a.timestamp) // yeni → eski
      setPosts(mapped)
    } catch (e) {
      setError(e.message || 'Gönderiler alınamadı.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) { setLoading(false); return }
    loadChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Kategori listesi: diyalog ilk açıldığında (veya daha önce yüklenmediyse) çek
  useEffect(() => {
    if (!dialogOpen || catsLoadedRef.current || !token) return
    ;(async () => {
      setCatsLoading(true); setCatsError('')
      try {
        const list = await getDiseaseNames(token)
        const arr = Array.isArray(list) ? list : (Array.isArray(list?.data) ? list.data : [])
        const clean = arr.map(String).filter(Boolean)
        setCategories(clean)
        catsLoadedRef.current = true
      } catch (e) {
        setCatsError(e.message || 'Kategoriler alınamadı.')
      } finally {
        setCatsLoading(false)
      }
    })()
  }, [dialogOpen, token])

  const closeDialog = () => {
    setMsg('')
    setCategory('')
    params.delete('new')
    navigate(`/posts${params.toString() ? `?${params.toString()}` : ''}`, { replace: true })
  }
  const openDialog = () => {
    params.set('new', '1')
    navigate(`/posts?${params.toString()}`)
  }

  // Local beğeni – backend endpoint verilene kadar sadece UI üzerinde
  const votePost = (postId, delta) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      let { myVote, likes, dislikes } = p
      if (myVote === delta) {
        if (delta === 1) likes -= 1
        if (delta === -1) dislikes -= 1
        myVote = 0
      } else {
        if (delta === 1) { likes += 1; if (myVote === -1) dislikes -= 1 }
        else { dislikes += 1; if (myVote === 1) likes -= 1 }
        myVote = delta
      }
      return { ...p, myVote, likes, dislikes }
    }))
  }

  const addCommentLocal = (postId, text) => {
    const authorName = user?.name || user?.username || `Kullanıcı #${user?.userId ?? ''}`
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const newComment = {
        id: `c_${crypto.randomUUID()}`,
        author: authorName,
        text,
        timestamp: Date.now(),
        likes: 0,
        dislikes: 0,
        myVote: 0
      }
      return { ...p, comments: [newComment, ...p.comments] }
    }))
  }

  const voteComment = (postId, commentId, delta) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const updated = p.comments.map(c => {
        if (c.id !== commentId) return c
        let { myVote, likes, dislikes } = c
        if (myVote === delta) {
          if (delta === 1) likes -= 1
          if (delta === -1) dislikes -= 1
          myVote = 0
        } else {
          if (delta === 1) { likes += 1; if (myVote === -1) dislikes -= 1 }
          else { dislikes += 1; if (myVote === 1) likes -= 1 }
          myVote = delta
        }
        return { ...c, myVote, likes, dislikes }
      })
      return { ...p, comments: updated }
    }))
  }

  // Yeni gönderi gönder (gerçek API çağrısı)
  const onSubmitNewPost = async (e) => {
    e.preventDefault()
    if (!msg.trim()) { setError('Mesaj boş olamaz.'); return }
    if (!category) { setError('Lütfen bir kategori seçiniz.'); return }

    setSubmitting(true)
    try {
      await addChat(token, { message: msg.trim(), category })
      setSuccess('Gönderi oluşturuldu.')
      closeDialog()
      await loadChats() // sunucudaki kanonik veriyi göster
    } catch (err) {
      setError(err.message || 'Gönderi oluşturulamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  const sorted = useMemo(() => [...posts].sort((a, b) => b.timestamp - a.timestamp), [posts])

  return (
    <Container maxWidth="md" sx={{ py: { xs: 1.25, md: 4 }, px: { xs: 1.25, sm: 2 } }}>
      <Surface sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Stack spacing={0.5} sx={{ mb: 1 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24, md: 28 } }}
          >
            Topluluk Akışı
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            API’den çekilen sohbetler (beğeni, beğenmeme ve yorumlar dahil).
          </Typography>
        </Stack>
        <Divider sx={{ mb: 2, opacity: 0.16 }} />

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
            <CircularProgress size={22} />
          </Box>
        ) : error && !dialogOpen ? (
          <Box sx={{ display: 'grid', placeItems: 'center' }}>
            <Stack spacing={1} alignItems="center">
              <Alert severity="error" variant="filled">{error}</Alert>
              <Button onClick={loadChats} size="small" variant="contained">Tekrar Dene</Button>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {sorted.map(p => (
              <PostCard
                key={p.id}
                {...p}
                onVote={votePost}
                onAddComment={addCommentLocal}
                onCommentVote={voteComment}
              />
            ))}
            {sorted.length === 0 && (
              <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
                Henüz mesaj yok.
              </Box>
            )}
          </Stack>
        )}
      </Surface>

      {/* Composer FAB */}
      <Fab
        color="primary"
        aria-label="Yeni gönderi"
        onClick={openDialog}
        sx={{ position: 'fixed', right: 16, bottom: { xs: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)', md: 24 }, zIndex: (t) => t.zIndex.appBar + 3 }}
      >
        <Add />
      </Fab>

      {/* Yeni Gönderi Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={submitting ? undefined : closeDialog}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(7,20,28,0.92)',
            border: '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(8px)',
            borderRadius: 0,
            color: 'text.primary'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#FAF9F6' }}>Yeni Gönderi</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <Box component="form" id="compose-form" onSubmit={onSubmitNewPost}>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <TextField
                autoFocus
                placeholder="Ne paylaşmak istersin?"
                multiline
                minRows={4}
                value={msg}
                onChange={e => setMsg(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: false }}
                aria-label="Yeni gönderi mesajı"
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                  '& .MuiInputBase-input': { color: '#FAF9F6' },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }
                }}
              />

              {/* Kategori: Hastalık isimlerinden autocomplete (AddDiseaseForm ile uyumlu) */}
              <Autocomplete
                fullWidth
                options={categories}
                loading={catsLoading}
                value={category || null}
                onChange={(_, v) => setCategory(v || '')}
                disablePortal
                blurOnSelect
                disableClearable
                isOptionEqualToValue={(opt, val) => String(opt) === String(val)}
                getOptionLabel={(opt) => (typeof opt === 'string' ? opt : '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Kategori (Hastalık) Seçin"
                    size="small"
                    required
                    helperText={catsError ? `Liste alınamadı: ${catsError}` : ''}
                    sx={{
                      '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                      '& .MuiInputBase-input': { color: '#FAF9F6' },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' },
                      '& .MuiSvgIcon-root': { color: '#FAF9F6' }
                    }}
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: 'rgba(7,20,28,0.98)',
                      color: '#FAF9F6',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(6px)',
                      '& .MuiAutocomplete-option': {
                        color: '#FAF9F6',
                        minHeight: 44,
                        '&[aria-selected="true"]': { bgcolor: 'rgba(52,195,161,0.22)' },
                        '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.08)' }
                      }
                    }
                  }
                }}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} color="secondary" variant="text" disabled={submitting}>Vazgeç</Button>
          <Button type="submit" form="compose-form" variant="contained" disabled={submitting}>
            {submitting ? 'Paylaşılıyor…' : 'Paylaş'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bildirimler */}
      <Snackbar open={!!error && !loading} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" variant="filled" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess('')}>
        <Alert severity="success" variant="filled" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Container>
  )
}
