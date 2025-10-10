// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  Alert, Avatar, Box, Stack, Typography, Divider, CircularProgress,
  Tabs, Tab, Container
} from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import Surface from '../components/Surface.jsx'
import PostCard from '../components/PostCard.jsx'
import {
  getUserProfile,
  getDoctorProfile,
  getPublicUserProfile,
  getChatsByUserID
} from '../services/api.js'

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
function SectionList({ items, renderItem, getKey, emptyText }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>{emptyText}</Typography>
  }
  return (
    <Stack divider={<Divider sx={{ my: 1 }} />} spacing={1}>
      {items.map((it, i) => (
        <Box key={getKey?.(it, i) ?? i}>{renderItem(it, i)}</Box>
      ))}
    </Stack>
  )
}
function Row({ label, value }) {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '200px 1fr' },
      gap: 1,
      alignItems: 'start'
    }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>{value || 'Belirtilmemiş'}</Typography>
      <Divider sx={{ gridColumn: '1 / -1', mt: 1 }} />
    </Box>
  )
}
function SubRow({ label, value }) {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' },
      gap: 1,
      alignItems: 'start'
    }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value || '—'}</Typography>
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
    comments,
    // category: chat.category, // istersen PostCard'da chip ile kullan
  }
}

/* ---------------- Page ---------------- */
export default function Profile() {
  const { token } = useAuth()

  const [profileData, setProfileData] = useState(null)           // /user/loggedUser
  const [doctorData, setDoctorData] = useState(null)             // /doctor/doctor
  const [publicUserData, setPublicUserData] = useState(null)     // /publicUser/publicUser
  const [posts, setPosts] = useState([])                         // /chats/getChats
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
          // Role bazlı detay
          if (base.role === 'doctor') {
            getDoctorProfile(token, base.userID)
              .then(d => { if (mounted) setDoctorData(d) })
              .catch(() => {})
          } else if (base.role === 'user') {
            getPublicUserProfile(token, base.userID)
              .then(u => { if (mounted) setPublicUserData(u) })
              .catch(() => {})
          }

          // Gönderiler
          setPostsLoading(true)
          try {
            const chats = await getChatsByUserID(token, base.userID)
            if (!mounted) return
            const mapped = chats.map(c => mapChatToPost(c, base.userID, base.name || 'Kullanıcı'))
            setPosts(mapped)
          } catch (_) {
            // gönderi hatasını sessiz geç
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

  // Sekmeler: Bilgiler / (rol bazlı) / Gönderilerim
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
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Surface>
        {/* Header — Login/Register kutusu estetiği */}
        <Stack spacing={1.25} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'secondary.main', fontWeight: 800, fontSize: 24 }}>
            {initialsFrom(profileData?.name, profileData?.email)}
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 800 }} noWrap>
            {profileData?.name || 'Kullanıcı'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {isDoctor ? 'Doktor' : 'Kullanıcı'}
          </Typography>
        </Stack>

        {/* Tabs – mobilde kaydırılabilir */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mt: 2,
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minHeight: 44 }
          }}
        >
          {tabs.map(t => <Tab key={t.key} label={t.label} />)}
        </Tabs>

        {/* Content */}
        <Box sx={{ pt: 2 }}>
          {currentKey === 'info' && (
            <Stack spacing={2}>
              <Row label="İsim" value={profileData?.name} />
              <Row label="Soyisim" value={profileData?.surname} />
              <Row label="Doğum Tarihi" value={prettyDate(profileData?.dateOfBirth)} />
              <Row label="E-posta" value={profileData?.email} />
              <Row label="Rol" value={isDoctor ? 'Doktor' : 'Kullanıcı'} />
            </Stack>
          )}

          {currentKey === 'spec' && isDoctor && (
            <SectionList
              emptyText="Uzmanlık alanı bulunamadı."
              items={doctorData?.specialization}
              renderItem={(spec) => (
                <Stack spacing={0.5}>
                  <SubRow label="Uzmanlık" value={spec.nameOfSpecialization} />
                  <SubRow label="Deneyim" value={`${spec.specializationExperience} yıl`} />
                </Stack>
              )}
              getKey={(spec, i) => spec.specializationID || i}
            />
          )}

          {currentKey === 'addr' && isDoctor && (
            <SectionList
              emptyText="Çalışma adresi bulunamadı."
              items={doctorData?.worksAddress}
              renderItem={(a) => (
                <Stack spacing={0.5}>
                  <SubRow label="İş Yeri" value={a.workPlaceName} />
                  <SubRow label="Adres" value={`${a.street}, ${a.county}, ${a.city}, ${a.country}`} />
                </Stack>
              )}
              getKey={(a, i) => a.adressID || i}
            />
          )}

          {currentKey === 'contact' && isDoctor && (
            <SectionList
              emptyText="İletişim bilgisi bulunamadı."
              items={doctorData?.contactInfor}
              renderItem={(c) => (
                <Stack spacing={0.5}>
                  <SubRow label="E-posta" value={c.email} />
                  <SubRow label="Telefon" value={c.phoneNumber} />
                </Stack>
              )}
              getKey={(c, i) => c.contactID || i}
            />
          )}

          {currentKey === 'ann' && isDoctor && (
            <SectionList
              emptyText="Duyuru bulunamadı."
              items={doctorData?.announcement}
              renderItem={(a) => (
                <Stack spacing={0.5}>
                  <SubRow label="Başlık" value={a.title} />
                  <SubRow label="İçerik" value={a.content} />
                  <SubRow label="Tarih" value={prettyDate(a.uploadDate)} />
                </Stack>
              )}
              getKey={(a, i) => a.announcementID || i}
            />
          )}

          {currentKey === 'diseases' && isUser && (
            <SectionList
              emptyText="Kayıtlı hastalık bulunamadı."
              items={publicUserData?.diseases}
              renderItem={(d) => (
                <Stack spacing={0.5}>
                  <SubRow label="Hastalık" value={d.name} />
                  <SubRow label="Tanı Tarihi" value={prettyDate(d.dateOfDiagnosis)} />
                </Stack>
              )}
              getKey={(d, i) => d.diseaseID || i}
            />
          )}

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
    </Container>
  )
}
