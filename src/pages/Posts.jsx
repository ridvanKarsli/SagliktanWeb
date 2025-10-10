import { useMemo, useState, useEffect } from 'react'
import {
  Box, Button, Grid, Stack, TextField, Typography, Divider,
  Fab, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, Alert, Snackbar, CircularProgress
} from '@mui/material'
import PostCard from '../components/PostCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Add } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { getAllChats } from '../services/api.js'

function parseYMD(ymd) {
  // "YYYY-MM-DD" -> local timestamp
  if (!ymd) return Date.now();
  const [y, m, d] = String(ymd).split('-').map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1).getTime();
}

function dedupUsers(arr) {
  if (!Array.isArray(arr)) return [];
  const map = new Map();
  for (const u of arr) {
    const id = u?.userID ?? u?.userId;
    if (id == null) continue;
    if (!map.has(id)) map.set(id, u);
  }
  return Array.from(map.values());
}

function myVoteFor(currentUserId, likedUsers, dislikedUsers) {
  if (!currentUserId) return 0;
  const liked = likedUsers.some(u => (u?.userID ?? u?.userId) === currentUserId);
  const disliked = dislikedUsers.some(u => (u?.userID ?? u?.userId) === currentUserId);
  if (liked) return 1;
  if (disliked) return -1;
  return 0;
}

function toPostModel(chat, currentUserId) {
  const liked = dedupUsers(chat.likedUser);
  const disliked = dedupUsers(chat.dislikedUser);

  const comments = Array.isArray(chat.comments) ? chat.comments.map(c => {
    const cLiked = dedupUsers(c.likedUser);
    const cDisliked = dedupUsers(c.dislikedUser);
    const cid = c.commnetsID ?? c.commentsID ?? c.id ?? `c_${Math.random().toString(36).slice(2)}`;
    return {
      id: `c_${cid}`,
      author: `Kullanıcı #${c.userID ?? '???'}`,
      text: c.message ?? '',
      timestamp: parseYMD(c.uploadDate),
      likes: cLiked.length,
      dislikes: cDisliked.length,
      myVote: myVoteFor(currentUserId, cLiked, cDisliked),
    };
  }) : [];

  return {
    id: `p_${chat.chatID}`,
    author: `Kullanıcı #${chat.userID ?? '???'}`,
    content: chat.message ?? '',
    timestamp: parseYMD(chat.uploadDate),
    likes: liked.length,
    dislikes: disliked.length,
    myVote: myVoteFor(currentUserId, liked, disliked),
    comments
  };
}

export default function Posts() {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [posts, setPosts] = useState([])
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

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
      // yeni → eski
      mapped.sort((a, b) => b.timestamp - a.timestamp)
      setPosts(mapped)
    } catch (e) {
      setError(e.message || 'Gönderiler alınamadı.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    loadChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const closeDialog = () => {
    setMsg('')
    params.delete('new')
    navigate(`/posts${params.toString() ? `?${params.toString()}` : ''}`, { replace: true })
  }
  const openDialog = () => {
    params.set('new', '1')
    navigate(`/posts?${params.toString()}`, { replace: true })
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

  const addComment = (postId, text) => {
    // Şimdilik local ekliyoruz (API verilince POST yapılır)
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

  const onSubmitNewPost = (e) => {
    e.preventDefault()
    if (!msg.trim()) return
    const authorName = user?.name || user?.username || `Kullanıcı #${user?.userId ?? ''}`
    const newPost = {
      id: `p_${Math.random().toString(36).slice(2)}`,
      author: authorName,
      content: msg.trim(),
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0,
      myVote: 0,
      comments: []
    }
    setPosts(p => [newPost, ...p])
    closeDialog()
  }

  const sorted = useMemo(() => [...posts].sort((a, b) => b.timestamp - a.timestamp), [posts])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h2" sx={{ fontWeight: 800 }}>Topluluk Akışı</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          API’den çekilen sohbetler (like/dislike, yorumlar dahil).
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>

      {loading ? (
        <Grid item xs={12} sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
          <CircularProgress color="primary" />
        </Grid>
      ) : error ? (
        <Grid item xs={12} sx={{ display: 'grid', placeItems: 'center' }}>
          <Stack spacing={1} alignItems="center">
            <Alert severity="error" variant="filled">{error}</Alert>
            <Button onClick={loadChats} size="small">Tekrar Dene</Button>
          </Stack>
        </Grid>
      ) : (
        <Grid item xs={12} md={8} lg={7} sx={{ mx: 'auto' }}>
          {sorted.map(p => (
            <PostCard
              key={p.id}
              {...p}
              onVote={votePost}
              onAddComment={addComment}
              onCommentVote={voteComment}
            />
          ))}
          {sorted.length === 0 && (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
              Henüz mesaj yok.
            </Box>
          )}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="Yeni gönderi"
        onClick={openDialog}
        sx={{ position: 'fixed', right: 16, bottom: { xs: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)', md: 24 }, zIndex: (t) => t.zIndex.appBar + 3 }}
      >
        <Add />
      </Fab>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: 'rgba(7,20,28,0.92)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', borderRadius: 0, color: 'text.primary' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#FAF9F6' }}>Yeni Gönderi</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <Box component="form" id="compose-form" onSubmit={onSubmitNewPost}>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <TextField autoFocus placeholder="Ne paylaşmak istersin?" multiline minRows={4} value={msg} onChange={e => setMsg(e.target.value)} />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} color="secondary" variant="text">Vazgeç</Button>
          <Button type="submit" form="compose-form">Paylaş</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error && !loading} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" variant="filled" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </Grid>
  )
}
