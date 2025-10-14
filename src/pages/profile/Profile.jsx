import { useEffect, useMemo, useState } from 'react'
import {
  Alert, Avatar, Box, Stack, Typography, Divider, CircularProgress,
  Tabs, Tab, Container, useMediaQuery, Select, MenuItem, FormControl, InputLabel,
  Toolbar, Paper
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useAuth } from '../../context/AuthContext.jsx'
import Surface from '../../components/Surface.jsx'
import PostCard from '../../components/PostCard.jsx'
import {
  getUserProfile,
  getDoctorProfile,
  getPublicUserProfile,
  getChatsByUserID
} from '../../services/api.js'
import DoctorPart from './DoctorPart.jsx'
import UserPart from './UserPart.jsx'

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
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' },
      gap: { xs: 0.5, sm: 1.25 },
      alignItems: 'start',
      py: 0.5
    }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{value || 'Belirtilmemiş'}</Typography>
      <Divider sx={{ gridColumn: '1 / -1', opacity: 0.16, mt: { xs: 0.5, sm: 1 } }} />
    </Box>
  )
}
/** API -> UI (PostCard) dönüştürücü */
function mapChatToPost(chat, meId, authorName) {
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

    const author = c.userName || `Kullanıcı #${c.userID}`
    return {
      id: c.commnetsID || c.commentID || `${chat.chatID}-${c.userID}-${c.uploadDate}`,
      author,
      text: c.message,
      timestamp: c.uploadDate,
      likes: cLiked.length,
      dislikes: cDisliked.length,
      myVote: cVote
    }
  }) : []

  return {
    id: chat.chatID,
    author: authorName,
    content: chat.message,
    timestamp: chat.uploadDate,
    likes: liked.length,
    dislikes: disliked.length,
    myVote,
    comments
  }
}

/* ---------------- Page ---------------- */
export default function Profile() {
  const { token } = useAuth()
  const theme = useTheme()
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'))

  const [profileData, setProfileData] = useState(null)
  const [doctorData, setDoctorData] = useState(null)
  const [publicUserData, setPublicUserData] = useState(null)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState(0)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) { setLoading(false); return }
      setError('')
      try {
        const base = await getUserProfile(token)
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
            const mapped = chats.map(c => mapChatToPost(c, base.userID, base.name || 'Kullanıcı'))
            setPosts(mapped)
          } catch {
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
  }, [token])

  const isDoctor = profileData?.role === 'doctor'
  const isUser = profileData?.role === 'user'

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

  function MobileSectionSelector() {
    return (
      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
        <InputLabel id="profile-section-label" sx={{ color: 'rgba(255,255,255,0.85)' }}>
          Bölüm
        </InputLabel>
        <Select
          labelId="profile-section-label"
          id="profile-section"
          label="Bölüm"
          value={currentKey}
          onChange={(e) => {
            const idx = tabs.findIndex(t => t.key === e.target.value)
            if (idx >= 0) setTab(idx)
          }}
          sx={{
            bgcolor: 'rgba(255,255,255,0.06)',
            color: '#FAF9F6',
            '& .MuiSvgIcon-root': { color: '#FAF9F6' }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: 'rgba(7,20,28,0.96)',
                color: '#FAF9F6',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(6px)',
                '& .MuiMenuItem-root': {
                  color: '#FAF9F6',
                  minHeight: 44,
                  '&.Mui-selected': { bgcolor: 'rgba(52,195,161,0.18)' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' }
                }
              }
            }
          }}
        >
          {tabs.map(t => (
            <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
    )
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
    <Container maxWidth="md" sx={{ py: { xs: 1.25, md: 4 }, px: { xs: 1.25, sm: 2 } }}>
      <Surface sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Avatar
            sx={{
              width: { xs: 68, md: 76 },
              height: { xs: 68, md: 76 },
              bgcolor: 'secondary.main',
              fontWeight: 800,
              fontSize: { xs: 22, md: 24 }
            }}
            aria-label="Kullanıcı avatarı"
          >
            {initialsFrom(profileData?.name, profileData?.email)}
          </Avatar>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24, md: 28 }, wordBreak: 'break-word' }}
          >
            {profileData?.name || 'Kullanıcı'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {isDoctor ? 'Doktor' : 'Kullanıcı'}
          </Typography>
        </Stack>

        {/* Sticky Navigasyon */}
        <Paper
          elevation={0}
          sx={{
            position: 'sticky',
            top: 8,
            zIndex: 1,
            mt: 1.5,
            px: { xs: 1, sm: 0 },
            py: { xs: 0.5, sm: 0 },
            background: 'transparent',
            backdropFilter: 'blur(6px)'
          }}
        >
          {isSmUp ? (
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Profil sekmeleri"
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                '& .MuiTab-root': {
                  fontWeight: 700,
                  textTransform: 'none',
                  minHeight: 44
                }
              }}
            >
              {tabs.map(t => <Tab key={t.key} label={t.label} />)}
            </Tabs>
          ) : (
            <MobileSectionSelector />
          )}
        </Paper>

        {/* İçerik */}
        <Box sx={{ pt: 2 }}>
          {currentKey === 'info' && (
            <Stack spacing={1}>
              <Row label="İsim" value={profileData?.name} />
              <Row label="Soyisim" value={profileData?.surname} />
              <Row label="Doğum Tarihi" value={prettyDate(profileData?.dateOfBirth)} />
              {/* E-posta satırı kaldırıldı */}
              <Row label="Rol" value={isDoctor ? 'Doktor' : 'Kullanıcı'} />
            </Stack>
          )}

          {/* Doktor sekmeleri */}
          {isDoctor && ['spec', 'addr', 'contact', 'ann'].includes(currentKey) && (
            <DoctorPart doctorData={doctorData} sectionKey={currentKey} />
          )}

          {/* Kullanıcı sekmeleri */}
          {isUser && currentKey === 'diseases' && (
            <UserPart publicUserData={publicUserData} sectionKey={currentKey} canEdit />
          )}

          {/* Gönderiler */}
          {currentKey === 'posts' && (
            <Stack spacing={1}>
              {postsLoading ? (
                <Box sx={{ display: 'grid', placeItems: 'center', py: 2 }}>
                  <CircularProgress size={22} />
                </Box>
              ) : posts.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Henüz gönderiniz yok.
                </Typography>
              ) : (
                posts.map(p => <PostCard key={p.id} {...p} />)
              )}
            </Stack>
          )}
        </Box>
      </Surface>
      <Toolbar sx={{ minHeight: 16 }} /> {/* alt boşluk */}
    </Container>
  )
}
