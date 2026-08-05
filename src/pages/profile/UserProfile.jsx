import { useEffect, useState } from 'react'
import { Avatar, Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material'
import { ArrowBack, MailOutlineRounded } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import PostCard from '../../components/PostCard.jsx'
import { getUserPublicProfile, getUserPosts, sendMessageRequest } from '../../services/api.js'

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
  const { showError, showSuccess } = useNotification()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsLoadingMore, setPostsLoadingMore] = useState(false)
  const [postsPage, setPostsPage] = useState(0)
  const [postsTotalCount, setPostsTotalCount] = useState(0)
  const [postsLast, setPostsLast] = useState(true)

  const [sendingRequest, setSendingRequest] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

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
    setPostsPage(0)
    getUserPosts(token, userId, { page: 0 })
      .then(res => {
        if (!mounted) return
        setPosts(Array.isArray(res?.content) ? res.content : [])
        setPostsTotalCount(res?.totalElements ?? 0)
        setPostsLast(res?.last ?? true)
      })
      .catch(err => showError(err.message || 'Gönderiler alınamadı.'))
      .finally(() => { if (mounted) setPostsLoading(false) })
    return () => { mounted = false }
  }, [token, userId, showError])

  const loadMorePosts = async () => {
    const nextPage = postsPage + 1
    setPostsLoadingMore(true)
    try {
      const res = await getUserPosts(token, userId, { page: nextPage })
      setPosts(prev => [...prev, ...(Array.isArray(res?.content) ? res.content : [])])
      setPostsLast(res?.last ?? true)
      setPostsPage(nextPage)
    } catch (err) {
      showError(err.message || 'Gönderiler alınamadı.')
    } finally {
      setPostsLoadingMore(false)
    }
  }

  const handleSendMessageRequest = async () => {
    setSendingRequest(true)
    try {
      const res = await sendMessageRequest(token, userId)
      if (res?.autoAccepted) {
        // Karşı taraf zaten bize istek göndermişti ya da aramızda bir
        // konuşma vardı - backend otomatik eşleştirdi, direkt sohbete gir
        // (bkz. MessageRequestService.send Outcome.autoAccepted).
        navigate(`/messages/${res.conversationId}`)
        return
      }
      setRequestSent(true)
      showSuccess('Mesaj isteği gönderildi.')
    } catch (err) {
      showError(err.message || 'Mesaj isteği gönderilemedi.')
    } finally {
      setSendingRequest(false)
    }
  }

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
        <Stack direction="row" spacing={{ xs: 2, md: 3 }} alignItems="center">
          <Box
            sx={{
              width: { xs: 78, md: 102 }, height: { xs: 78, md: 102 }, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #4CB89F 0%, #E08B6D 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', p: '3px'
            }}
          >
            <Avatar
              sx={{
                width: '100%', height: '100%',
                fontSize: { xs: 24, md: 32 }, fontWeight: 600,
                border: '3px solid', borderColor: 'background.default'
              }}
            >
              {initialsFrom(fullName)}
            </Avatar>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5, wordBreak: 'break-word' }}>
              {fullName}
            </Typography>
            <Stack direction="row" spacing={{ xs: 2, md: 3 }} flexWrap="wrap" useFlexGap>
              <Box>
                <Typography variant="subtitle2" component="span" sx={{ fontWeight: 700 }}>
                  {postsTotalCount}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  Gönderi
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" component="span" sx={{ fontWeight: 700 }}>
                  {profile.commentCount ?? 0}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  Yorum
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" component="span" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {profile.likesReceived ?? 0}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  Faydalı
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" component="span" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {profile.dislikesReceived ?? 0}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  Faydalı Değil
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
        {profile.bio && (
          <Typography variant="body2" sx={{ color: 'text.primary', mt: 1.5 }}>
            {profile.bio}
          </Typography>
        )}
        <Button
          variant={requestSent ? 'outlined' : 'contained'}
          size="small"
          startIcon={sendingRequest ? <CircularProgress size={14} color="inherit" /> : <MailOutlineRounded />}
          onClick={handleSendMessageRequest}
          disabled={sendingRequest || requestSent}
          sx={{ mt: 2, minHeight: 40 }}
        >
          {requestSent ? 'İstek Gönderildi' : 'Mesaj Gönder'}
        </Button>
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
          {posts.map((p, i) => (
            <Box key={p.id}>
              {i > 0 && <Divider />}
              <PostCard post={p} token={token} onClick={() => navigate(`/post/${p.id}`)} />
            </Box>
          ))}
          {!postsLast && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Button
                variant="outlined"
                onClick={loadMorePosts}
                disabled={postsLoadingMore}
                sx={{ minWidth: 180, minHeight: 44 }}
              >
                {postsLoadingMore ? <CircularProgress size={18} /> : 'Daha Fazla Yükle'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
