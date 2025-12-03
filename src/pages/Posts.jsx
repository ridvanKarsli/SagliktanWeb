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
import { useAuth } from '../context/AuthContext.jsx'
import { getAllChats, getDiseaseNames, getUserByID, getChatsWithFilter } from '../services/api.js'
import { addComment as apiAddComment } from '../services/api.js'
import {
  likeChatReaction,
  dislikeChatReaction,
  cancelLikeChatReaction,
  cancelDislikeChatReaction,
  likeCommentReaction,
  dislikeCommentReaction,
  cancelLikeCommentReaction,
  cancelDislikeCommentReaction
} from '../services/api.js'
import { getLikedCommentPeople, getDislikedCommentPeople } from '../services/api.js'
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

function toPostModel(chat, currentUserId, authorNameOverride, idToName) {
  const liked = dedupUsers(chat.likedUser)
  const disliked = dedupUsers(chat.dislikedUser)

  const comments = Array.isArray(chat.comments)
    ? chat.comments.map(c => {
        const cLiked = dedupUsers(c.likedUser)
        const cDisliked = dedupUsers(c.dislikedUser)
        const cidRaw = c.commnetsID ?? c.commentsID ?? c.id
        const cidNum = Number(cidRaw)
        const safeId = Number.isFinite(cidNum) ? `c_${cidNum}` : `c_tmp_${Math.random().toString(36).slice(2)}`
        const authorId = c.userID ?? c.userId
        const authorOverride = idToName?.get?.(authorId)
        return {
          id: safeId,
          author: authorOverride || `Kullanıcı #${c.userID ?? '???'}`,
          text: c.message ?? '',
          timestamp: parseYMD(c.uploadDate),
          likes: cLiked.length,
          dislikes: cDisliked.length,
          myVote: myVoteFor(currentUserId, cLiked, cDisliked),
          likedUsers: (Array.isArray(c.likedUser) ? c.likedUser : []).map(u => ({
            userID: u?.userID ?? u?.userId,
            chatReactionsID: u?.chatReactionsID ?? u?.commentReactionsID ?? u?.reactionID ?? u?.id
          })),
          dislikedUsers: (Array.isArray(c.dislikedUser) ? c.dislikedUser : []).map(u => ({
            userID: u?.userID ?? u?.userId,
            chatReactionsID: u?.chatReactionsID ?? u?.commentReactionsID ?? u?.reactionID ?? u?.id
          }))
        }
      })
    : []

  const authorFull = authorNameOverride
    || [chat.name, chat.surname].filter(Boolean).join(' ')
    || chat.userName
    || `Kullanıcı #${chat.userID ?? '???'}`

  return {
    id: `p_${chat.chatID}`,
    author: authorFull,
    authorId: chat.userID ?? chat.userId,
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
      const data = category ? await getChatsWithFilter(token, category) : await getAllChats(token)
      // Debug: Ham payload ve yorumlardaki reaction ID'ler
      try {
        console.groupCollapsed('[Feed] getAllChats payload')
        console.debug('count:', Array.isArray(data) ? data.length : 0)
        ;(Array.isArray(data) ? data : []).slice(0, 10).forEach((ch, idx) => {
          const comments = Array.isArray(ch?.comments) ? ch.comments : []
          console.debug(`#${idx} chatID=${ch?.chatID} comments=${comments.length}`)
          comments.slice(0, 10).forEach((c, ci) => {
            const liked = Array.isArray(c?.likedUser) ? c.likedUser : []
            const disliked = Array.isArray(c?.dislikedUser) ? c.dislikedUser : []
            console.debug(`  c#${ci} commnetsID=${c?.commnetsID} likedIDs=`, liked.map(u => u?.chatReactionsID), 'dislikedIDs=', disliked.map(u => u?.chatReactionsID))
          })
        })
        console.groupEnd()
      } catch {}
      // Yazar ve yorum yazarlarını userID -> full name ile zenginleştir
      const ids = new Set()
      for (const ch of data) {
        const uid = ch?.userID ?? ch?.userId
        if (uid != null) ids.add(uid)
        if (Array.isArray(ch?.comments)) {
          for (const c of ch.comments) {
            const cuid = c?.userID ?? c?.userId
            if (cuid != null) ids.add(cuid)
          }
        }
      }
      const idToName = new Map()
      await Promise.all(Array.from(ids).map(async (id) => {
        try {
          const person = await getUserByID(token, id)
          const full = [person?.name, person?.surname].filter(Boolean).join(' ')
          if (full) idToName.set(id, full)
        } catch {}
      }))

      const meId = user?.userId ?? user?.userID ?? null
      const mapped = data.map(ch => {
        const authorId = ch?.userID ?? ch?.userId
        const authorName = authorId != null ? idToName.get(authorId) : undefined
        return toPostModel(ch, meId, authorName, idToName)
      })
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
  }, [token, category])

  // Kategori listesi: sayfa ilk açıldığında yükle
  useEffect(() => {
    if (!token) { setCategories([]); return }
    (async () => {
      setCatsLoading(true); setCatsError('')
      try {
        const list = await getDiseaseNames(token)
        const arr = Array.isArray(list) ? list : (Array.isArray(list?.data) ? list.data : [])
        const clean = arr.map(String).filter(Boolean)
        setCategories(clean)
      } catch (e) {
        setCatsError(e.message || 'Kategoriler alınamadı.')
      } finally {
        setCatsLoading(false)
      }
    })()
  }, [token])

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

  const votePost = async (postId, delta) => {
    const chatID = Number(String(postId).replace(/^p_/, ''))
    let prevVote = 0
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      prevVote = p.myVote
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
    try {
      if (prevVote === delta) {
        if (delta === 1) await cancelLikeChatReaction(token, chatID, user?.userId ?? user?.userID)
        else await cancelDislikeChatReaction(token, chatID, user?.userId ?? user?.userID)
      } else if (delta === 1) {
        await likeChatReaction(token, chatID)
      } else if (delta === -1) {
        await dislikeChatReaction(token, chatID)
      }
    } catch (e) {
      // rollback
      setPosts(prev => prev.map(p => (p.id === postId ? { ...p, myVote: prevVote,
        likes: p.likes + ((prevVote === 1) - (p.myVote === 1)),
        dislikes: p.dislikes + ((prevVote === -1) - (p.myVote === -1)) } : p)))
      setError(e?.message || 'Oy işlemi başarısız.')
    }
  }

  const handleAddComment = async (postId, text) => {
    if (!token) return
    const authorName = user?.name || user?.username || `Kullanıcı #${user?.userId ?? ''}`
    const tempId = `tmp-${Date.now()}`
    const tempComment = {
      id: tempId,
      author: authorName,
      text,
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0,
      myVote: 0
    }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [tempComment, ...p.comments] } : p))

    try {
      const real = await apiAddComment(token, postId.replace(/^p_/, ''), text, user?.userId ?? user?.userID ?? undefined)
      const realId = real?.commentID || real?.commnetsID || real?.id || tempId
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        const comments = p.comments.map(c => c.id === tempId ? { ...c, id: realId } : c)
        return { ...p, comments }
      }))
    } catch (err) {
      setError(err?.message || 'Yorum eklenemedi.')
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments.filter(c => c.id !== tempId) } : p))
    }
  }

  const voteComment = async (postId, commentId, delta) => {
    const meId = user?.userId ?? user?.userID
    // Mevcut durumdan bu yorum için benim reaction kaydımı bul
    const currentPost = posts.find(p => p.id === postId)
    const currentComment = currentPost?.comments?.find(c => c.id === commentId)
    console.debug('[Comments] voteComment start', { postId, commentId, delta, meId, currentComment })
    const likedEntry = currentComment?.likedUsers?.find?.(u => Number(u.userID) === Number(meId))
    const dislikedEntry = currentComment?.dislikedUsers?.find?.(u => Number(u.userID) === Number(meId))
    const likeReactionId = likedEntry?.chatReactionsID
    const dislikeReactionId = dislikedEntry?.chatReactionsID
    const realCommentId = Number(String(commentId).replace(/^c_/, ''))
    console.debug('[Comments] current dislikedUsers', { meId, dislikedUsers: currentComment?.dislikedUsers, dislikeReactionId })
    let prevVote = 0
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const updated = p.comments.map(c => {
        if (c.id !== commentId) return c
        prevVote = c.myVote
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
    try {
      if (prevVote === delta) {
        if (delta === 1) {
          let rid = likeReactionId
          if (!rid) {
            const people = await getLikedCommentPeople(token, realCommentId)
            console.debug('[Comments] fetched liked people', { realCommentId, people })
            const mine = Array.isArray(people) ? people.find(p => Number(p?.userID ?? p?.userId) === Number(meId)) : null
            rid = mine?.chatReactionsID ?? mine?.commentReactionsID ?? mine?.reactionID ?? mine?.id
          }
          console.info('[Comments] cancel like', { postId, commentId, realCommentId, reactionId: rid })
          if (!rid) throw new Error('İptal için like reaction ID bulunamadı.')
          await cancelLikeCommentReaction(token, rid)
        } else {
          let rid = dislikeReactionId
          if (!rid) {
            const people = await getDislikedCommentPeople(token, realCommentId)
            console.debug('[Comments] fetched disliked people', { realCommentId, people })
            const mine = Array.isArray(people) ? people.find(p => Number(p?.userID ?? p?.userId) === Number(meId)) : null
            rid = mine?.chatReactionsID ?? mine?.commentReactionsID ?? mine?.reactionID ?? mine?.id
            if (!rid) {
              // Heuristic fallback: UI state'te tek bir dislike kaydı varsa onu kullan
              const uiList = Array.isArray(currentComment?.dislikedUsers) ? currentComment.dislikedUsers : []
              if (uiList.length === 1) {
                rid = uiList[0]?.chatReactionsID
                console.warn('[Comments] fallback: single dislikedUser used', { rid, uiList })
              }
            }
            if (!rid) {
              // Son çare: Tüm chatleri çek, ilgili yorumun dislikedUser listesinden benim reaction ID'imi bul
              try {
                const chats = await getAllChats(token)
                const chatIdNum = Number(String(postId).replace(/^p_/, ''))
                const chat = Array.isArray(chats) ? chats.find(c => Number(c?.chatID) === chatIdNum) : null
                const comment = chat?.comments?.find?.(c => Number(c?.commnetsID ?? c?.commentID ?? c?.id) === realCommentId)
                const mine2 = comment?.dislikedUser?.find?.(u => Number(u?.userID ?? u?.userId) === Number(meId))
                rid = mine2?.chatReactionsID ?? mine2?.commentReactionsID ?? mine2?.reactionID ?? mine2?.id
                console.warn('[Comments] final fallback: getAllChats-derived reactionId', { rid })
              } catch (e2) {
                console.error('[Comments] final fallback failed', e2)
              }
            }
          }
          console.info('[Comments] cancel dislike', { postId, commentId, realCommentId, reactionId: rid })
          if (!rid) throw new Error('İptal için dislike reaction ID bulunamadı.')
          await cancelDislikeCommentReaction(token, rid)
        }
      } else if (delta === 1) {
        console.info('[Comments] like comment', { postId, commentId, realCommentId })
        await likeCommentReaction(token, realCommentId)
      } else if (delta === -1) {
        console.info('[Comments] dislike comment', { postId, commentId, realCommentId })
        await dislikeCommentReaction(token, realCommentId)
      }
    } catch (e) {
      console.error('[Comments] voteComment error', { postId, commentId, delta, error: e?.message, stack: e?.stack })
      // rollback by reloading post reactions state conservatively
      setError(e?.message || 'Yorum oylama başarısız.')
      await loadChats()
    }
  }

  const openAuthorProfile = (authorId) => {
    if (!authorId) return
    navigate(`/profile?userID=${encodeURIComponent(authorId)}`)
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
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, fontSize: { xs: 20, sm: 24, md: 28 } }}
        >
          Topluluk Akışı
        </Typography>
      </Stack>

      {/* Kategori filtresi */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
        <Autocomplete
          fullWidth
          options={categories}
          loading={catsLoading}
          value={category || null}
          onChange={(_, v) => setCategory(v || '')}
          disablePortal
          blurOnSelect
          clearOnBlur={false}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Kategoriye göre filtrele"
              size="small"
              helperText={catsError ? `Liste alınamadı: ${catsError}` : 'Boş bırakılırsa tüm gönderiler gösterilir.'}
            />
          )}
          slotProps={{
            paper: {
              sx: {
                bgcolor: 'rgba(7,20,28,0.98)',
                color: '#FAF9F6',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(6px)'
              }
            }
          }}
        />
        {category && (
          <Button variant="outlined" color="secondary" onClick={() => setCategory('')} sx={{ whiteSpace: 'nowrap' }}>
            Filtreyi Temizle
          </Button>
        )}
      </Stack>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240, py: 4 }}>
          <CircularProgress size={22} />
        </Box>
      ) : error && !dialogOpen ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
          <Stack spacing={1.5} alignItems="center">
            <Alert severity="error" variant="filled">{error}</Alert>
            <Button onClick={loadChats} size="small" variant="contained">Tekrar Dene</Button>
          </Stack>
        </Box>
      ) : (
        <Stack spacing={0}>
          {sorted.map(p => (
            <PostCard
              key={p.id}
              {...p}
              onVote={votePost}
              onAddComment={handleAddComment}
              onCommentVote={voteComment}
              onAuthorClick={openAuthorProfile}
            />
          ))}
          {sorted.length === 0 && (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: { xs: 8, md: 10 },
                px: 3,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Box
                component="img"
                src="/Lumo.png"
                alt="Lumo"
                sx={{ 
                  width: { xs: 160, md: 220 }, 
                  height: 'auto', 
                  mb: 3, 
                  mx: 'auto',
                  display: 'block',
                  maxWidth: '100%',
                  filter: 'drop-shadow(0 8px 24px rgba(52,195,161,0.25))'
                }}
              />
              <Typography variant="h5" sx={{ color: 'text.primary', mb: 1, fontWeight: 700 }}>
                Henüz mesaj yok
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', opacity: 0.9 }}>
                İlk gönderiyi sen yap ve topluluğa katıl!
              </Typography>
            </Box>
          )}
        </Stack>
      )}

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
