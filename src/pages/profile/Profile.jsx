import { useEffect, useMemo, useState } from 'react'
import {
  Alert, Avatar, Box, Stack, Typography, Divider, CircularProgress,
  Tabs, Tab, Container, useMediaQuery, Select, MenuItem, FormControl, InputLabel,
  Toolbar, IconButton, Paper
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import PostCard from '../../components/PostCard.jsx'
import {
  getUserProfile,
  getDoctorProfile,
  getPublicUserProfile,
  getChatsByUserID,
  deleteChat,
  addComment as apiAddComment,
  deleteComment as apiDeleteComment,
  getUserByID
} from '../../services/api.js'
import { getLikedCommentPeople, getDislikedCommentPeople, getAllChats } from '../../services/api.js'
import {
  likeChatReaction,
  dislikeChatReaction,
  cancelLikeChatReaction,
  cancelDislikeChatReaction,
  likeCommentReaction,
  dislikeCommentReaction,
  cancelLikeCommentReaction,
  cancelDislikeCommentReaction
} from '../../services/api.js'
import DoctorPart from './DoctorPart.jsx'
import UserPart from './UserPart.jsx'
import { Logout as LogoutIcon, AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';

/* ---------------- Helpers ---------------- */
function initialsFrom(name = '', fallback = '') {
  const src = name || fallback
  const parts = src.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}
function prettyDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR') : 'Belirtilmemiş'
}
function Row({ label, value }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        mb: 1.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(255,255,255,0.12)'
        }
      }}
    >
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
        gap: { xs: 1, sm: 2 },
        alignItems: 'start'
      }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-word', color: 'text.primary' }}>{value || 'Belirtilmemiş'}</Typography>
      </Box>
    </Paper>
  )
}

const displayName = (u) =>
  [u?.name, u?.surname].filter(Boolean).join(' ') || `Kullanıcı #${u?.userID || ''}`

/** API -> UI (PostCard) dönüştürücü */
function mapChatToPost(chat, meId, authorName, idToName) {
  const liked = Array.isArray(chat.likedUser) ? chat.likedUser : []
  const disliked = Array.isArray(chat.dislikedUser) ? chat.dislikedUser : []
  const myVote =
    liked.some(u => u.userID === meId) ? 1 :
    disliked.some(u => u.userID === meId) ? -1 : 0

  const comments = Array.isArray(chat.comments) ? chat.comments.map(c => {
    const cLiked = Array.isArray(c.likedUser) ? c.likedUser : []
    const cDisliked = Array.isArray(c.dislikedUser) ? c.dislikedUser : []
    const cVote =
      cLiked.some(u => u.userID === meId) ? 1 :
      cDisliked.some(u => u.userID === meId) ? -1 : 0

    const override = idToName?.get?.(c?.userID ?? c?.userId)
    const author = override || c.userName || `Kullanıcı #${c.userID}`
    const cidRaw = c.commnetsID || c.commentID || c.id
    const cidNum = Number(cidRaw)
    return {
      id: Number.isFinite(cidNum) ? `c_${cidNum}` : `${chat.chatID}-${c.userID}-${c.uploadDate}`,
      author,
      text: c.message,
      timestamp: c.uploadDate,
      likes: cLiked.length,
      dislikes: cDisliked.length,
      myVote: cVote,
      likedUsers: cLiked.map(u => ({ userID: u.userID, chatReactionsID: u.chatReactionsID ?? u.commentReactionsID ?? u.reactionID ?? u.id })),
      dislikedUsers: cDisliked.map(u => ({ userID: u.userID, chatReactionsID: u.chatReactionsID ?? u.commentReactionsID ?? u.reactionID ?? u.id }))
    }
  }) : []

  const isOwner = (chat.userID === meId) || (chat.userId === meId)

  return {
    id: chat.chatID,
    author: authorName,
    content: chat.message,
    timestamp: chat.uploadDate,
    likes: liked.length,
    dislikes: disliked.length,
    myVote,
    comments,
    isOwner,
    category: chat.category || chat.Category || null,
    likedUsers: liked.map(u => ({ userID: u.userID, name: u.name, surname: u.surname })),
    dislikedUsers: disliked.map(u => ({ userID: u.userID, name: u.name, surname: u.surname }))
  }
}

/* ---------------- Page ---------------- */
export default function Profile() {
  const { token, user: me, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'))
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const userIdParam = searchParams.get('userID')

  const [profileData, setProfileData] = useState(null)
  const [doctorData, setDoctorData] = useState(null)
  const [publicUserData, setPublicUserData] = useState(null)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState(0)
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const handleMobileMenuOpen = (e) => setMobileMenuAnchor(e.currentTarget);
  const handleMenuClose = () => { setMobileMenuAnchor(null); };

  // Menü içeriği fonksiyonu: (kopya önle için)
  function ProfileMenu({ anchorEl, open, onClose }) {
    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        getContentAnchorEl={null}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={() => { onClose(); navigate('/profile'); }}>
          <AccountCircleIcon sx={{ mr: 1, color: 'primary.main' }} /> Profilim
        </MenuItem>
        <MenuItem onClick={() => { onClose(); logout(); navigate('/'); }}>
          <LogoutIcon sx={{ mr: 1, color: 'error.main' }} /> Çıkış Yap
        </MenuItem>
      </Menu>
    )
  }


  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) { setLoading(false); return }
      setError('')
      try {
        let base
        const viewingOther = !!userIdParam
        if (viewingOther) {
          base = await getUserByID(token, userIdParam)
        } else {
          // Önce sunucudan giriş yapmış kişinin tam profilini al (doğum tarihi vb. için)
          try {
            base = await getUserProfile(token)
          } catch (_) {
            // Sunucu başarısızsa JWT'den (AuthContext) kimliği temel al (fallback)
            const myId = me?.userId ?? me?.userID
            base = {
              userID: myId,
              name: me?.name || '',
              surname: me?.surname || '',
              role: me?.role || 'user',
              email: me?.email || ''
            }
          }
        }
        if (!mounted) return
        setProfileData(base)

        if (base.userID) {
          if (base.role === 'doctor') {
            getDoctorProfile(token, base.userID)
              .then(d => { if (mounted) setDoctorData(d) })
              .catch(() => {})
          } else if (base.role === 'user') {
            getPublicUserProfile(token, base.userID)
              .then(u => { if (mounted) setPublicUserData(u) })
              .catch(() => {})
          }

          setPostsLoading(true)
          try {
            const chats = await getChatsByUserID(token, base.userID)
            if (!mounted) return
            // Debug: Profil akışında yorum reaction ID'leri
            try {
              console.groupCollapsed('[Profile] getChatsByUserID payload')
              console.debug('count:', Array.isArray(chats) ? chats.length : 0)
              ;(Array.isArray(chats) ? chats : []).slice(0, 10).forEach((ch, idx) => {
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
            // Yorum yazar adlarını da doldur
            const ids = new Set()
            for (const ch of chats) {
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
            const mapped = chats.map(c => mapChatToPost(c, base.userID, base.name || 'Kullanıcı', idToName))
            setPosts(mapped)
          } finally {
            if (mounted) setPostsLoading(false)
          }
        }
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Profil bilgileri alınamadı.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [token, userIdParam])

  const isDoctor = profileData?.role === 'doctor'
  const isUser = profileData?.role === 'user'
  const isVisitor = !!userIdParam && (Number(userIdParam) !== (me?.userId ?? me?.userID))

  const tabs = useMemo(() => ([
    { key: 'info', label: 'Bilgiler' },
    ...(isDoctor ? [
      { key: 'spec', label: 'Uzmanlık' },
      { key: 'addr', label: 'Adresler' },
      { key: 'contact', label: 'İletişim' },
      { key: 'ann', label: 'Duyurular' },
    ] : []),
    ...(isUser ? [{ key: 'diseases', label: 'Hastalıklarım' }] : []),
    { key: 'posts', label: 'Gönderilerim' },
  ]), [isDoctor, isUser])

  const currentKey = tabs[tab]?.key || 'info'

  // Post silme
  async function handleDeletePost(postId) {
    if (!token || !postId || isVisitor) return
    try {
      setDeletingId(postId)
      await deleteChat(token, postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (err) {
      alert(err?.message || 'Silme işlemi başarısız.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleVote = async (postId, delta) => {
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
        if (delta === 1) await cancelLikeChatReaction(token, chatID, me?.userId ?? me?.userID)
        else await cancelDislikeChatReaction(token, chatID, me?.userId ?? me?.userID)
      } else if (delta === 1) {
        await likeChatReaction(token, chatID)
      } else if (delta === -1) {
        await dislikeChatReaction(token, chatID)
      }
    } catch (e) {
      setError(e?.message || 'Oy işlemi başarısız.')
    }
  }

  // Yorum ekleme (token'lı, optimistic update)
  const handleAddComment = async (postId, text) => {
    if (!token || isVisitor) return

    const tempId = `tmp-${Date.now()}`
    const tempComment = {
      id: tempId,
      author: profileData?.name || 'Sen',
      text,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      myVote: 0
    }
    setPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, comments: [tempComment, ...p.comments] } : p
      )
    )

    try {
      const res = await apiAddComment(token, postId, text, me?.userId ?? me?.userID ?? undefined)
      const realId = res?.commentID || res?.commnetsID || res?.id || tempId
      setPosts(prev =>
        prev.map(p => {
          if (p.id !== postId) return p
          const comments = p.comments.map(c =>
            c.id === tempId ? { ...c, id: realId } : c
          )
          return { ...p, comments }
        })
      )
    } catch (err) {
      alert(err.message || 'Yorum eklenemedi.')
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, comments: p.comments.filter(c => c.id !== tempId) }
            : p
        )
      )
    }
  }

  const handleCommentVote = async (postId, commentId, delta) => {
    const meId = me?.userId ?? me?.userID
    // Mevcut yorumdan benim reaction kaydımı bul
    const currentPost = posts.find(p => p.id === postId)
    const currentComment = currentPost?.comments?.find(c => c.id === commentId)
    console.debug('[Profile/Comments] voteComment start', { postId, commentId, delta, meId, currentComment })
    const likedEntry = currentComment?.likedUsers?.find?.(u => Number(u.userID) === Number(meId))
    const dislikedEntry = currentComment?.dislikedUsers?.find?.(u => Number(u.userID) === Number(meId))
    const likeReactionId = likedEntry?.chatReactionsID
    const dislikeReactionId = dislikedEntry?.chatReactionsID
    const realCommentId = Number(String(commentId).replace(/^c_/, ''))
    console.debug('[Profile/Comments] current dislikedUsers', { meId, dislikedUsers: currentComment?.dislikedUsers, dislikeReactionId })
    let prevVote = 0
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const comments = p.comments.map(c => {
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
      return { ...p, comments }
    }))
    try {
      if (prevVote === delta) {
        if (delta === 1) {
          let rid = likeReactionId
          if (!rid) {
            const people = await getLikedCommentPeople(token, realCommentId)
            console.debug('[Profile/Comments] fetched liked people', { realCommentId, people })
            const mine = Array.isArray(people) ? people.find(p => Number(p?.userID ?? p?.userId) === Number(meId)) : null
            rid = mine?.chatReactionsID ?? mine?.commentReactionsID ?? mine?.reactionID ?? mine?.id
          }
          console.info('[Profile/Comments] cancel like', { postId, commentId, realCommentId, reactionId: rid })
          if (!rid) throw new Error('İptal için like reaction ID bulunamadı.')
          await cancelLikeCommentReaction(token, rid)
        } else {
          let rid = dislikeReactionId
          if (!rid) {
            const people = await getDislikedCommentPeople(token, realCommentId)
            console.debug('[Profile/Comments] fetched disliked people', { realCommentId, people })
            const mine = Array.isArray(people) ? people.find(p => Number(p?.userID ?? p?.userId) === Number(meId)) : null
            rid = mine?.chatReactionsID ?? mine?.commentReactionsID ?? mine?.reactionID ?? mine?.id
            if (!rid) {
              const uiList = Array.isArray(currentComment?.dislikedUsers) ? currentComment.dislikedUsers : []
              if (uiList.length === 1) {
                rid = uiList[0]?.chatReactionsID
                console.warn('[Profile/Comments] fallback: single dislikedUser used', { rid, uiList })
              }
            }
            if (!rid) {
              try {
                const chats = await getAllChats(token)
                const chatIdNum = Number(String(postId).replace(/^p_/, ''))
                const chat = Array.isArray(chats) ? chats.find(c => Number(c?.chatID) === chatIdNum) : null
                const comment = chat?.comments?.find?.(c => Number(c?.commnetsID ?? c?.commentID ?? c?.id) === realCommentId)
                const mine2 = comment?.dislikedUser?.find?.(u => Number(u?.userID ?? u?.userId) === Number(meId))
                rid = mine2?.chatReactionsID ?? mine2?.commentReactionsID ?? mine2?.reactionID ?? mine2?.id
                console.warn('[Profile/Comments] final fallback: getAllChats-derived reactionId', { rid })
              } catch (e2) {
                console.error('[Profile/Comments] final fallback failed', e2)
              }
            }
          }
          console.info('[Profile/Comments] cancel dislike', { postId, commentId, realCommentId, reactionId: rid })
          if (!rid) throw new Error('İptal için dislike reaction ID bulunamadı.')
          await cancelDislikeCommentReaction(token, rid)
        }
      } else if (delta === 1) {
        console.info('[Profile/Comments] like comment', { postId, commentId, realCommentId })
        await likeCommentReaction(token, realCommentId)
      } else if (delta === -1) {
        console.info('[Profile/Comments] dislike comment', { postId, commentId, realCommentId })
        await dislikeCommentReaction(token, realCommentId)
      }
    } catch (e) {
      console.error('[Profile/Comments] voteComment error', { postId, commentId, delta, error: e?.message, stack: e?.stack })
      setError(e?.message || 'Yorum oylama başarısız.')
    }
  }

  // Yorum silme (token'lı, optimistic update)
  async function handleDeleteComment(postId, commentId) {
    if (!token || !postId || !commentId || isVisitor) return

    // optimistic: UI'dan kaldır
    const prevSnapshot = posts
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
          : p
      )
    )

    try {
      await apiDeleteComment(token, commentId) // endpoint paramı: commnetsID
    } catch (err) {
      alert(err.message || 'Yorum silinemedi.')
      // geri al
      setPosts(prevSnapshot)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }
  if (error) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
        <Alert severity="error" variant="filled">{error}</Alert>
      </Box>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mb: 2, position: 'relative' }}>
        {/* Mobilde sağ üstte 3 nokta menü */}
        <IconButton
          onClick={handleMobileMenuOpen}
          sx={{ display: { xs: 'flex', sm: 'none' }, position: 'absolute', right: 0, top: 0, zIndex: 15 }}
          aria-label="Menü Aç"
        >
          <MoreVertIcon sx={{ fontSize: 30 }} />
        </IconButton>
        {/* Masaüstü için boşluk */}
      </Stack>

      {/* Avatar ve menus: avatar tıklandığında her zamanki gibi */}
      <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', position: 'relative', mb: 3 }}>
        <Avatar
          sx={{
            width: { xs: 72, md: 80 },
            height: { xs: 72, md: 80 },
            bgcolor: 'secondary.main',
            fontWeight: 800,
            fontSize: { xs: 24, md: 26 },
            cursor: 'pointer'
          }}
          aria-label="Kullanıcı avatarı"
        >
          {initialsFrom(profileData?.name, profileData?.email)}
        </Avatar>
        {/* Menüleri render et: avatar veya mobile butondan açılır */}
        <ProfileMenu anchorEl={null} open={Boolean(mobileMenuAnchor)} onClose={handleMenuClose} />
      </Stack>

      {/* Navigasyon - Mobilde Select, Desktop'ta Tabs */}
      <Box sx={{ mb: 3 }}>
        {isSmUp ? (
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Profil sekmeleri"
            sx={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 56,
                fontSize: 15,
                px: 3,
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              }
            }}
          >
            {tabs.map(t => <Tab key={t.key} label={t.label} />)}
          </Tabs>
        ) : (
          <FormControl fullWidth>
            <Select
              value={tab}
              onChange={(e) => setTab(e.target.value)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 2,
                color: 'text.primary',
                '& .MuiSelect-select': {
                  py: 1.5,
                  fontWeight: 600
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.12)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: 'rgba(7,20,28,0.98)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    '& .MuiMenuItem-root': {
                      color: '#FAF9F6',
                      '&.Mui-selected': {
                        bgcolor: 'rgba(52,195,161,0.18)',
                        color: 'primary.main'
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.08)'
                      }
                    }
                  }
                }
              }}
            >
              {tabs.map((t, index) => (
                <MenuItem key={t.key} value={index}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* İçerik */}
      <Box>
        {currentKey === 'info' && (
          <Stack spacing={0}>
            <Row label="İsim" value={profileData?.name} />
            <Row label="Soyisim" value={profileData?.surname} />
            <Row label="Doğum Tarihi" value={prettyDate(profileData?.dateOfBirth)} />
            <Row label="Rol" value={isDoctor ? 'Doktor' : 'Kullanıcı'} />
          </Stack>
        )}

          {/* Doktor sekmeleri */}
          {isDoctor && ['spec', 'addr', 'contact', 'ann'].includes(currentKey) && (
            <DoctorPart doctorData={doctorData} sectionKey={currentKey} canEdit={!isVisitor} />
          )}

          {/* Kullanıcı sekmeleri */}
          {isUser && currentKey === 'diseases' && (
            <UserPart publicUserData={publicUserData} sectionKey={currentKey} canEdit={!isVisitor} />
          )}

        {/* Gönderiler */}
        {currentKey === 'posts' && (
          <Stack spacing={0}>
            {postsLoading ? (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
                <CircularProgress size={22} />
              </Box>
            ) : posts.length === 0 ? (
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
                  Henüz gönderiniz yok
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', opacity: 0.9 }}>
                  İlk gönderinizi paylaşın
                </Typography>
              </Box>
            ) : (
              posts.map(p => (
                <PostCard
                  key={p.id}
                  {...p}
                  deleting={deletingId === p.id}
                  {...(!isVisitor ? { onDelete: (postId) => handleDeletePost(postId) } : {})}
                  onVote={handleVote}
                  {...(!isVisitor ? { onAddComment: handleAddComment, onCommentVote: handleCommentVote, onCommentDelete: (postId, commentId) => handleDeleteComment(postId, commentId) } : {})}
                />
              ))
            )}
          </Stack>
        )}
      </Box>
      <Toolbar sx={{ minHeight: 16 }} /> {/* alt boşluk */}
    </Container>
  )
}
