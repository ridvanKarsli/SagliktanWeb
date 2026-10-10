import { useCallback, useEffect, useState } from 'react'
import { Box, Button, CircularProgress, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material'
import {
  ArrowBackRounded, BlockRounded, FlagOutlined, LockOpenRounded, MailOutlineRounded, MoreVertRounded
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import HealthSummary from '../../components/profile/HealthSummary.jsx'
import PostList from '../../components/PostList.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import ReportDialog from '../../components/comments/ReportDialog.jsx'
import ProfileHeader, { ProfileAvatar, ProfileHeaderSkeleton, StatStrip } from '../../components/profile/ProfileHeader.jsx'
import ProfileStat from '../../components/profile/ProfileStat.jsx'
import CompanionEmpty from '../../components/avatars/CompanionEmpty.jsx'
import PostCardSkeleton from '../../components/PostCardSkeleton.jsx'
import LoadMoreButton from '../../components/common/LoadMoreButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { useReportDialog } from '../../hooks/useReportDialog.js'
import {
  getUserPublicProfile, getUserPosts, sendMessageRequest, blockUser, unblockUser, listBlockedUsers, reportUser
} from '../../services/api.js'
import '../../styles/companions.css'
import { fullNameOf } from '../../utils/text.js'

function usePublicProfile(token, userId) {
  const [state, setState] = useState({ profile: null, loading: true, error: '', notFound: false })
  useEffect(() => {
    if (!token || !userId) return undefined
    let alive = true
    setState({ profile: null, loading: true, error: '', notFound: false })
    getUserPublicProfile(token, userId)
      .then(profile => { if (alive) setState({ profile, loading: false, error: '', notFound: false }) })
      // 404: hesap yok, gizli ya da taraflardan biri diğerini engellemiş -
      // backend bu durumları bilerek ayırt etmez; biz de "görüntülenemiyor" deriz.
      .catch(err => { if (alive) setState({ profile: null, loading: false, error: err.message || 'Kullanıcı bulunamadı.', notFound: err?.status === 404 }) })
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
      { title: 'Kullanıcıyı engelle', confirmLabel: 'Engelle' }
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

  const { profile, loading, error, notFound } = usePublicProfile(token, userId)
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

  const pageSx = { width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 1.5, md: 4 } }
  const roundIcon = { width: 44, height: 44, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }
  const backButton = (
    <IconButton onClick={() => navigate(-1)} aria-label="Geri" sx={roundIcon}>
      <ArrowBackRounded />
    </IconButton>
  )

  if (loading) {
    return (
      <Box sx={pageSx}>
        <ProfileHeaderSkeleton />
        <Box sx={{ mt: 3 }}><PostCardSkeleton /><PostCardSkeleton /></Box>
      </Box>
    )
  }

  if (error || !profile) {
    return (
      <Box sx={pageSx}>
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate(-1)} sx={{ mb: 1 }}>Geri</Button>
        {notFound ? (
          <CompanionEmpty
            companion="bulut"
            title="Bu profil görüntülenemiyor"
            description="Kişi profilini gizlemiş, hesabını kapatmış ya da aranızda bir engel olabilir. Bağlantı eski de olabilir."
            actionLabel="Ana sayfaya dön"
            onAction={() => navigate('/home')}
          />
        ) : (
          <CompanionEmpty
            companion="bulut"
            title="Bu profili bulamadık"
            description={error ? `${error} Bağlantını kontrol edip tekrar deneyebilirsin.` : 'Bağlantı eski olabilir ya da kişi hesabını kapatmış olabilir.'}
            actionLabel="Ana sayfaya dön"
            onAction={() => navigate('/home')}
          />
        )}
      </Box>
    )
  }

  const firstName = profile.firstName || fullName

  return (
    <Box className="page-transition" sx={pageSx}>
      <ProfileHeader
        avatar={<ProfileAvatar avatarKey={profile.avatarKey} name={fullName} />}
        name={fullName}
        badge={profile.emailVerified ? <VerifiedBadge /> : null}
        summary={<HealthSummary profile={profile} />}
        bio={profile.bio}
        topLeft={backButton}
        topRight={(
          <>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Seçenekler" aria-haspopup="menu" sx={roundIcon}>
              <MoreVertRounded />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {blocking.isBlocked ? (
                <MenuItem onClick={closeMenuThen(blocking.unblock)}>
                  <ListItemIcon><LockOpenRounded fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Engeli Kaldır" />
                </MenuItem>
              ) : (
                <MenuItem onClick={closeMenuThen(blocking.block)} sx={{ color: 'error.main' }}>
                  <ListItemIcon sx={{ color: 'error.main' }}><BlockRounded fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Kullanıcıyı Engelle" />
                </MenuItem>
              )}
              <MenuItem onClick={closeMenuThen(() => report.open(userId))}>
                <ListItemIcon><FlagOutlined fontSize="small" /></ListItemIcon>
                <ListItemText primary="Şikayet Et" />
              </MenuItem>
            </Menu>
          </>
        )}
        stats={(
          <StatStrip>
            <ProfileStat value={posts.totalCount} label="Gönderi" loading={posts.loading} />
            <ProfileStat value={profile.commentCount} label="Yorum" />
            <ProfileStat value={profile.likesReceived} label="Faydalı" highlight />
          </StatStrip>
        )}
      >
        {blocking.isBlocked ? (
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Bu kişiyi engelledin. Engeli kaldırmak için sağ üstteki menüyü kullanabilirsin.
          </Typography>
        ) : (
          <Box sx={{ mt: 2.5 }}>
            <Button
              variant={requestSent ? 'outlined' : 'contained'}
              startIcon={sendingRequest ? <CircularProgress size={16} color="inherit" /> : <MailOutlineRounded />}
              onClick={handleSendMessageRequest}
              disabled={sendingRequest || requestSent}
              sx={{ width: { xs: '100%', md: 'auto' }, minWidth: { md: 220 } }}
            >
              {requestSent ? 'İstek Gönderildi' : 'Mesaj Gönder'}
            </Button>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              {requestSent
                ? `${firstName} isteğini kabul edince sohbetiniz Mesajlar'da açılır.`
                : `${firstName} kabul ederse birebir sohbet başlar.`}
            </Typography>
          </Box>
        )}
      </ProfileHeader>

      <Typography variant="h4" component="h2" sx={{ mt: 3.5, mb: 1.5, px: 0.5 }}>Paylaşımları</Typography>
      {posts.loading ? (
        <Box aria-busy="true" aria-label="Gönderiler yükleniyor"><PostCardSkeleton /><PostCardSkeleton /></Box>
      ) : posts.items.length === 0 ? (
        <CompanionEmpty
          companion="cakil"
          title="Henüz bir paylaşımı yok"
          description={`${firstName} ilk paylaşımını yaptığında burada göreceksin.`}
          dense
        />
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
