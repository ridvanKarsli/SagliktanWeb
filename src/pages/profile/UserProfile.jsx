import { useEffect, useState } from 'react'
import { Avatar, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import PostCard from '../../components/PostCard.jsx'
import { getUserPublicProfile, getUserPosts } from '../../services/api.js'

function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}

// Başka bir kullanıcının herkese açık profili - arama sonuçlarında ya da bir
// post/yorumun altında isme tıklayınca gelinen sayfa. Kendi profilin için
// (düzenleme, ayarlar vb.) her zaman /profile kullanılıyor - bkz. App.jsx'te
// bu sayfaya girildiğinde kendi id'nse otomatik /profile'a yönlenme.
export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { token, user: currentUser } = useAuth()
  const { showError } = useNotification()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsPage, setPostsPage] = useState(0)
  const [postsTotalPages, setPostsTotalPages] = useState(1)
  const [postsLast, setPostsLast] = useState(true)

  useEffect(() => {
    // Kendi profiline bu sayfadan (link/geri butonu vb.) ulaşılırsa tam
    // yetkili /profile'a yönlendir.
    if (currentUser && String(currentUser.id) === String(userId)) {
      navigate('/profile', { replace: true })
    }
  }, [currentUser, userId, navigate])

  useEffect(() => {
    if (!token || !userId) return
    let mounted = true
    setLoading(true)
    setError('')
    getUserPublicProfile(token, userId)
      .then(data => { if (mounted) setProfile(data) })
      .catch(err => { if (mounted) setError(err.message || 'Kullanıcı bulunamadı.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [token, userId])

  useEffect(() => {
    if (!token || !userId) return
    let mounted = true
    setPostsLoading(true)
    getUserPosts(token, userId, { page: postsPage })
      .then(res => {
        if (!mounted) return
        setPosts(Array.isArray(res?.content) ? res.content : [])
        setPostsTotalPages(res?.totalPages ?? 1)
        setPostsLast(res?.last ?? true)
      })
      .catch(err => showError(err.message || 'Gönderiler alınamadı.'))
      .finally(() => { if (mounted) setPostsLoading(false) })
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId, postsPage])

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300, py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (error || !profile) {
    return (
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, color: 'text.secondary' }}>
          Geri
        </Button>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {error || 'Kullanıcı bulunamadı.'}
        </Typography>
      </Box>
    )
  }

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Kullanıcı'

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, color: 'text.secondary' }}>
        Geri
      </Button>

      <Box sx={{ mb: 4, px: { xs: 0.5, md: 0 } }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar sx={{ width: { xs: 72, md: 88 }, height: { xs: 72, md: 88 }, fontSize: { xs: 24, md: 30 }, fontWeight: 600 }}>
            {initialsFrom(fullName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {fullName}
            </Typography>
            {profile.bio && (
              <Typography variant="body2" sx={{ color: 'text.primary', mt: 1 }}>
                {profile.bio}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      <Typography variant="h3" sx={{ mb: 2, px: { xs: 0.5, md: 0 }, color: 'text.primary' }}>
        Gönderileri
      </Typography>
      {postsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={22} />
        </Box>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Henüz gönderisi yok.
          </Typography>
        </Box>
      ) : (
        <>
          {posts.map(p => (
            <PostCard key={p.id} post={p} onClick={() => navigate(`/post/${p.id}`)} />
          ))}
          {postsTotalPages > 1 && (
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ py: 2 }}>
              <Button
                variant="outlined" size="small" disabled={postsPage <= 0}
                onClick={() => setPostsPage(p => Math.max(0, p - 1))}
              >
                Önceki
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Sayfa {postsPage + 1} / {postsTotalPages}
              </Typography>
              <Button
                variant="outlined" size="small" disabled={postsLast}
                onClick={() => setPostsPage(p => p + 1)}
              >
                Sonraki
              </Button>
            </Stack>
          )}
        </>
      )}
    </Box>
  )
}
