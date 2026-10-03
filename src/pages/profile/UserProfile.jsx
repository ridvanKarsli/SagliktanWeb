import { useCallback, useEffect, useState } from 'react'
import { Avatar, Box, Button, CircularProgress, IconButton, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material'
import {
  ArrowBack, BlockRounded, DynamicFeedRounded, FlagOutlined, LockOpenRounded, MailOutlineRounded, MoreVertRounded
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import HealthSummary from '../../components/profile/HealthSummary.jsx'
import PostList from '../../components/PostList.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ReportDialog from '../../components/comments/ReportDialog.jsx'
import CenteredSpinner from '../../components/common/CenteredSpinner.jsx'
import LoadMoreButton from '../../components/common/LoadMoreButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { useReportDialog } from '../../hooks/useReportDialog.js'
import {
  getUserPublicProfile, getUserPosts, sendMessageRequest, blockUser, unblockUser, listBlockedUsers, reportUser
} from '../../services/api.js'
import { formatCount, initialsFrom } from '../../utils/format.js'
import { fullNameOf } from '../../utils/text.js'

function InlineStat({ value, label, highlight = false }) {
  return (
    <Box>
      <Typography variant="subtitle2" component="span" sx={{ fontWeight: 700, color: highlight ? 'primary.main' : undefined }}>
        {formatCount(value)}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>{label}</Typography>
    </Box>
  )
}

function usePublicProfile(token, userId) {
  const [state, setState] = useState({ profile: null, loading: true, error: '' })
  useEffect(() => {
    if (!token || !userId) return undefined
    let alive = true
    setState({ profile: null, loading: true, error: '' })
    getUserPublicProfile(token, userId)
      .then(profile => { if (alive) setState({ profile, loading: false, error: '' }) })
      .catch(err => { if (alive) setState({ profile: null, loading: false, error: err.message || 'Kullanıcı bulunamadı.' }) })
    return () => { alive = false }
  }, [token, userId])
  return state
}

// Bu kullanıcıyı engelleyip engellemediğim + engelle/engeli kaldır eylemleri.
function useBlockToggle(token, userId, displayName) {
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    if (!token || !userId) return undefined
    let alive = true
    listBlockedUsers(token)
      .then(list => { if (alive) setIsBlocked((Array.isArray(list) ? list : []).some(b => String(b.userId) === String(userId))) })
      // İkincil veri: bilinemiyorsa menü "Engelle" seçeneğini gösterir.
      .catch(() => {})
    return () => { alive = false }
  }, [token, userId])

  const block = async () => {
    const ok = await confirm(
      `${displayName || 'Bu kullanıcıyı'} kullanıcısını engellemek istiyor musun? Birbirinize mesaj gönderemezsiniz.`,
      { title: 'Kullanıcıyı engelle' }
    )
    if (!ok) return
    try {
      await blockUser(token, userId)
      setIsBlocked(true)
      showSuccess('Kullanıcı engellendi.')
    } catch (err) {
      showError(err.message || 'Kullanıcı engellenemedi.')
    }
  }

  const unblock = async () => {
    try {
      await unblockUser(token, userId)
      setIsBlocked(false)
      showSuccess('Engel kaldırıldı.')
    } catch (err) {
      showError(err.message || 'Engel kaldırılamadı.')
    }
  }

  return { isBlocked, block, unblock }
}

// Başka bir kullanıcının herkese açık profili. Kendi profiline buradan
// gelinirse tam yetkili /profile'a yönlendirilir.
export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { token, user: currentUser } = useAuth()
  const { showError, showSuccess } = useNotification()

  const { profile, loading, error } = usePublicProfile(token, userId)
  const fullName = fullNameOf(profile, 'Kullanıcı')
  const blocking = useBlockToggle(token, userId, profile ? fullName : '')
  const report = useReportDialog((id, reason) => reportUser(token, id, reason))
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  useEffect(() => {
    if (currentUser && String(currentUser.id) === String(userId)) {
      navigate('/profile', { replace: true })
    }
  }, [currentUser, userId, navigate])

  const postsFetcher = useCallback((page) => getUserPosts(token, userId, { page }), [token, userId])
  const posts = usePaginatedList(postsFetcher, {
    enabled: !!token && !!userId,
    deps: [token, userId],
    onError: err => showError(err.message || 'Gönderiler alınamadı.')
  })

  const closeMenuThen = (action) => () => { setMenuAnchor(null); action() }

  const handleSendMessageRequest = async () => {
    setSendingRequest(true)
    try {
      const res = await sendMessageRequest(token, userId)
      if (res?.autoAccepted) {
        // Karşı taraf zaten istek göndermişti ya da aramızda bir konuşma
        // vardı - backend eşleştirdi, doğrudan sohbete gir.
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

  if (loading) return <CenteredSpinner page />

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

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
          Geri
        </Button>
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Seçenekler" aria-haspopup="menu">
          <MoreVertRounded />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          {blocking.isBlocked ? (
            <MenuItem onClick={closeMenuThen(blocking.unblock)}>
              <LockOpenRounded fontSize="small" sx={{ mr: 1.5 }} />
              <ListItemText primary="Engeli Kaldır" />
            </MenuItem>
          ) : (
            <MenuItem onClick={closeMenuThen(blocking.block)} sx={{ color: 'error.main' }}>
              <BlockRounded fontSize="small" sx={{ mr: 1.5 }} />
              <ListItemText primary="Kullanıcıyı Engelle" />
            </MenuItem>
          )}
          <MenuItem onClick={closeMenuThen(() => report.open(userId))}>
            <FlagOutlined fontSize="small" sx={{ mr: 1.5 }} />
            <ListItemText primary="Şikayet Et" />
          </MenuItem>
        </Menu>
      </Stack>

      <Box sx={{ mb: 4, px: { xs: 0.5, md: 0 } }}>
        <Stack direction="row" spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
          <Avatar
            sx={{
              width: { xs: 78, md: 102 }, height: { xs: 78, md: 102 }, flexShrink: 0,
              fontSize: { xs: 24, md: 32 }, fontWeight: 600,
              border: '3px solid', borderColor: 'primary.main'
            }}
          >
            {initialsFrom(fullName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} flexWrap="wrap" useFlexGap>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5, wordBreak: 'break-word' }}>
                  {fullName}
                </Typography>
                {profile.emailVerified && <VerifiedBadge />}
              </Stack>
              {!blocking.isBlocked && (
                <Button
                  variant={requestSent ? 'outlined' : 'contained'}
                  size="small"
                  startIcon={sendingRequest ? <CircularProgress size={14} color="inherit" /> : <MailOutlineRounded />}
                  onClick={handleSendMessageRequest}
                  disabled={sendingRequest || requestSent}
                  sx={{ minHeight: 40, flexShrink: 0 }}
                >
                  {requestSent ? 'İstek Gönderildi' : 'Mesaj Gönder'}
                </Button>
              )}
            </Stack>
            <Stack direction="row" spacing={{ xs: 2, md: 3 }} flexWrap="wrap" useFlexGap>
              <InlineStat value={posts.totalCount} label="Gönderi" />
              <InlineStat value={profile.commentCount} label="Yorum" />
              <InlineStat value={profile.likesReceived} label="Faydalı" highlight />
            </Stack>
          </Box>
        </Stack>
        <HealthSummary profile={profile} sx={{ mt: 1.25 }} />
        {profile.bio && (
          <Typography variant="body2" sx={{ color: 'text.primary', mt: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}>
            {profile.bio}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 2, px: { xs: 0.5, md: 0 }, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h3" sx={{ color: 'text.primary' }}>Gönderiler</Typography>
      </Box>
      {posts.loading ? (
        <CenteredSpinner />
      ) : posts.items.length === 0 ? (
        <EmptyState icon={DynamicFeedRounded} title="Henüz gönderisi yok." dense />
      ) : (
        <>
          <PostList posts={posts.items} token={token} showPinnedBadge />
          {!posts.last && <LoadMoreButton loading={posts.loadingMore} onClick={posts.loadMore} />}
        </>
      )}

      <ReportDialog
        {...report.dialogProps}
        title="Kullanıcıyı Şikayet Et"
        description={`${fullName} kullanıcısını neden şikayet ediyorsun? (isteğe bağlı)`}
        placeholder="Açıklama..."
      />
    </Box>
  )
}
