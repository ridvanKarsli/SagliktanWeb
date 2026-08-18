import { useCallback, useEffect, useState } from 'react'
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Collapse, Divider, FormControlLabel,
  IconButton, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material'
import {
  BlockRounded, BookmarkBorderRounded, ChevronRightRounded, DeleteForeverRounded, DescriptionOutlined,
  DevicesOutlined, DynamicFeedRounded, EditOutlined, FileDownloadOutlined, FormatSizeRounded, GroupsRounded,
  HelpOutlineRounded, InfoOutlined, LockOutlined, LogoutRounded, PrivacyTipOutlined, WarningAmberRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAccessibility } from '../../context/AccessibilityContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import PostCard from '../../components/PostCard.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter.jsx'
import {
  changePassword, deactivateAccount, deleteAccount, exportMyData, getMyDiseaseGroups, getMyPosts,
  getMySavedPosts, getUserProfile, listBlockedUsers, listSessions, revokeSession, unblockUser, updateProfile
} from '../../services/api.js'
import { Section, SectionList, SubRow } from './ProfileShared.jsx'
import { initialsFrom, prettyDate } from '../../utils/format.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'

// Ayarlar sekmesindeki her satır (şifre, gizlilik, çıkış, hesap silme) için
// ortak tıklanabilir satır bileşeni.
function SettingsRow({ icon, label, onClick, danger, open, loading }) {
  return (
    <Box
      onClick={loading ? undefined : onClick}
      className="tap-scale"
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1.25, borderRadius: 1.5, cursor: loading ? 'default' : 'pointer',
        color: danger ? 'error.main' : 'text.primary',
        opacity: loading ? 0.7 : 1,
        '&:hover': { bgcolor: loading ? 'transparent' : danger ? 'rgba(196,85,74,0.08)' : 'action.hover' }
      }}
    >
      <Box sx={{ display: 'flex', color: danger ? 'error.main' : 'text.secondary' }}>
        {icon}
      </Box>
      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      {loading ? (
        <CircularProgress size={16} sx={{ color: danger ? 'error.main' : 'text.secondary' }} />
      ) : (
        <ChevronRightRounded
          sx={{
            fontSize: 20, color: 'text.secondary',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.15s ease'
          }}
        />
      )}
    </Box>
  )
}

export default function Profile() {
  const { token, user, updateLocalUser, logout } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()
  const { fontScale, highContrast, fontScaleOptions, setFontScale, setHighContrast } = useAccessibility()

  /* ---- Profil düzenleme ---- */
  const [editOpen, setEditOpen] = useState(false)
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    setFirstName(user?.firstName || '')
    setLastName(user?.lastName || '')
    setBio(user?.bio || '')
  }, [user?.firstName, user?.lastName, user?.bio])

  const saveProfile = async (e) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      showError('Ad ve soyad zorunludur.')
      return
    }
    setSavingProfile(true)
    try {
      await updateProfile(token, { firstName: firstName.trim(), lastName: lastName.trim(), bio: bio.trim() })
      updateLocalUser({ firstName: firstName.trim(), lastName: lastName.trim(), bio: bio.trim() })
      showSuccess('Profil güncellendi.')
      setEditOpen(false)
    } catch (err) {
      showError(err.message || 'Profil güncellenemedi.')
    } finally {
      setSavingProfile(false)
    }
  }

  /* ---- Şifre değiştirme ---- */
  const [pwOpen, setPwOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const savePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword) { showError('Mevcut şifreni gir.'); return }
    if (newPassword.length < 8) { showError('Yeni şifre en az 8 karakter olmalı.'); return }
    setSavingPassword(true)
    try {
      await changePassword(token, { currentPassword, newPassword })
      showSuccess('Şifre değiştirildi.')
      setCurrentPassword('')
      setNewPassword('')
      setPwOpen(false)
    } catch (err) {
      showError(err.message || 'Şifre değiştirilemedi.')
    } finally {
      setSavingPassword(false)
    }
  }

  /* ---- Hastalık gruplarım ---- */
  const [myGroups, setMyGroups] = useState([])
  const [groupsLoading, setGroupsLoading] = useState(true)

  useEffect(() => {
    if (!token) { setGroupsLoading(false); return }
    let mounted = true
    getMyDiseaseGroups(token)
      .then(data => { if (mounted) setMyGroups(Array.isArray(data) ? data : []) })
      .catch(err => showError(err.message || 'Gruplar alınamadı.'))
      .finally(() => { if (mounted) setGroupsLoading(false) })
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  /* ---- Postlarım ---- */
  const postsFetcher = useCallback((page) => getMyPosts(token, { page }), [token])
  const {
    items: myPosts, loading: postsLoading, loadingMore: postsLoadingMore,
    last: postsLast, totalCount: postsTotalCount, loadMore: loadMorePosts
  } = usePaginatedList(postsFetcher, {
    enabled: !!token,
    deps: [token],
    onError: err => showError(err.message || 'Postlarınız alınamadı.')
  })

  /* ---- Kaydedilenler (Faz 2 adım 3) ----
     "Postlarım" bölümünün üstündeki Gönderiler/Kaydedilenler seçiciyle
     değişen ikinci bir liste. Herkes kaydedilenler sekmesine hiç
     bakmayabileceği için tembel yükleniyor: ilk kez "Kaydedilenler"e
     geçilince çekiliyor, sonrasında cache'leniyor (usePaginatedList'in
     once:true'su). */
  const [postsMode, setPostsMode] = useState('mine')
  const savedPostsFetcher = useCallback((page) => getMySavedPosts(token, { page }), [token])
  const {
    items: savedPosts, loading: savedLoading, loadingMore: savedLoadingMore,
    last: savedLast, loadMore: loadMoreSaved
  } = usePaginatedList(savedPostsFetcher, {
    enabled: postsMode === 'saved' && !!token,
    once: true,
    deps: [token],
    onError: err => showError(err.message || 'Kaydedilen gönderiler alınamadı.')
  })

  /* ---- İstatistikler (yorum sayısı, faydalı/faydalı değil) ----
     AuthContext'teki user nesnesi bootstrap/login anında bir kereliğine
     alınıp cache'leniyor - içerik ürettikçe bu sayılar değişeceği için,
     tıpkı postsTotalCount gibi, sayfa her açıldığında /users/me'den taze
     çekiyoruz (kaynak zaten stats'ı da döndürüyor, ekstra uç gerekmedi). */
  const [stats, setStats] = useState({ commentCount: 0, likesReceived: 0, dislikesReceived: 0 })

  useEffect(() => {
    if (!token) return
    let mounted = true
    getUserProfile(token)
      .then(res => {
        if (!mounted) return
        setStats({
          commentCount: res?.commentCount ?? 0,
          likesReceived: res?.likesReceived ?? 0,
          dislikesReceived: res?.dislikesReceived ?? 0
        })
      })
      .catch(() => { /* istatistik yüklenemezse sessizce 0 göster, sayfa akışını bozmasın */ })
    return () => { mounted = false }
  }, [token])

  /* ---- Hesabı deaktive et ---- */
  const [deactivateConfirm, setDeactivateConfirm] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const doDeactivate = async () => {
    setDeactivating(true)
    try {
      await deactivateAccount(token)
      showSuccess('Hesabınız deaktive edildi.')
      await logout()
      navigate('/')
    } catch (err) {
      showError(err.message || 'Hesap deaktive edilemedi.')
      setDeactivating(false)
    }
  }

  /* ---- Verilerimi indir (KVKK veri taşınabilirliği) ----
     Backend zaten Content-Disposition: attachment header'ı gönderiyor ama
     fetch() bunu otomatik "indirmeye" çevirmiyor (sadece response body'sini
     JS'e veriyor) - bu yüzden JSON'u kendimiz bir Blob'a sarıp geçici bir
     <a download> ile tetikliyoruz, standart tarayıcı-taraflı indirme deseni. */
  const [exportingData, setExportingData] = useState(false)

  const doExportData = async () => {
    if (exportingData) return
    setExportingData(true)
    try {
      const data = await exportMyData(token)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'sagliktan-verilerim.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      showSuccess('Verileriniz indirildi.')
    } catch (err) {
      showError(err.message || 'Verileriniz indirilemedi.')
    } finally {
      setExportingData(false)
    }
  }

  /* ---- Hesabı sil (geri alınamaz, anonimleştirme) ----
     deactivateAccount'tan (yukarıda) farklı: bu işlem geri alınamaz ve şifre
     teyidi ister (bkz. UserServiceImpl.deleteAccount javadoc'u - kimlik
     anonimleştirilir, gönderi/yorum içeriği korunur). */
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false)
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  const doDeleteAccount = async (e) => {
    e.preventDefault()
    if (!deleteAccountPassword) { showError('Şifreni gir.'); return }
    setDeletingAccount(true)
    try {
      await deleteAccount(token, deleteAccountPassword)
      showSuccess('Hesabınız silindi.')
      await logout()
      navigate('/')
    } catch (err) {
      showError(err.message || 'Hesap silinemedi.')
      setDeletingAccount(false)
    }
  }

  /* ---- Engellenen kullanıcılar (Faz 2 adım 6) ----
     listBlockedUsers/unblockUser zaten mesajlaşma API'sinde vardı ama hiçbir
     sayfa kullanmıyordu - Chat.jsx'te engelleyebiliyordun ama geri
     kaldıracak bir arayüz yoktu. Diğer lazy-load'lu (Kaydedilenler) bölümle
     aynı desen: ilk açılışta çekilir. */
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState([])
  const [blockedLoading, setBlockedLoading] = useState(false)
  const [blockedLoaded, setBlockedLoaded] = useState(false)
  const [unblockingId, setUnblockingId] = useState(null)

  useEffect(() => {
    if (!blockedOpen || blockedLoaded || !token) return
    let mounted = true
    setBlockedLoading(true)
    listBlockedUsers(token)
      .then(res => { if (mounted) { setBlockedUsers(Array.isArray(res) ? res : []); setBlockedLoaded(true) } })
      .catch(err => showError(err.message || 'Engellenen kullanıcılar alınamadı.'))
      .finally(() => { if (mounted) setBlockedLoading(false) })
    return () => { mounted = false }
  }, [blockedOpen, blockedLoaded, token, showError])

  const handleUnblock = async (userId) => {
    setUnblockingId(userId)
    try {
      await unblockUser(token, userId)
      setBlockedUsers(prev => prev.filter(b => b.userId !== userId))
      showSuccess('Engel kaldırıldı.')
    } catch (err) {
      showError(err.message || 'Engel kaldırılamadı.')
    } finally {
      setUnblockingId(null)
    }
  }

  /* ---- Aktif Oturumlar (görev #305/#306) ----
     Blocked kullanıcılar bölümüyle aynı lazy-load desen: sadece açılınca çekilir.
     Şu an kullanılan oturum (current: true) revoke edilemez - onun için zaten
     "Çıkış Yap" satırı var; burada listelenen diğer cihazlardan uzaktan çıkış. */
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsLoaded, setSessionsLoaded] = useState(false)
  const [revokingSessionId, setRevokingSessionId] = useState(null)

  useEffect(() => {
    if (!sessionsOpen || sessionsLoaded || !token) return
    let mounted = true
    setSessionsLoading(true)
    listSessions(token)
      .then(res => { if (mounted) { setSessions(Array.isArray(res) ? res : []); setSessionsLoaded(true) } })
      .catch(err => showError(err.message || 'Aktif oturumlar alınamadı.'))
      .finally(() => { if (mounted) setSessionsLoading(false) })
    return () => { mounted = false }
  }, [sessionsOpen, sessionsLoaded, token, showError])

  const handleRevokeSession = async (sessionRowId) => {
    setRevokingSessionId(sessionRowId)
    try {
      await revokeSession(token, sessionRowId)
      setSessions(prev => prev.filter(s => s.id !== sessionRowId))
      showSuccess('Oturum sonlandırıldı.')
    } catch (err) {
      showError(err.message || 'Oturum sonlandırılamadı.')
    } finally {
      setRevokingSessionId(null)
    }
  }

  /* ---- Ayarlar: çıkış yap ---- */
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300, py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Kullanıcı'

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
      {/* Profil başlığı - Instagram tarzı: solda avatar, sağda isim + istatistik
          satırı (gönderi/grup sayısı), altında bio. Önceden sadece isim+e-posta
          vardı, hesabın ne kadar aktif olduğuna dair hiçbir sinyal yoktu. */}
      <Box sx={{ mb: 4, px: { xs: 0.5, md: 0 } }}>
        <Stack direction="row" spacing={{ xs: 2, md: 3 }} alignItems="center">
          {/* Gradyan "ring" avatar - bkz. PostCard.jsx, aynı marka dili */}
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
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5, wordBreak: 'break-word', flex: 1 }}>
                {fullName}
              </Typography>
              <IconButton onClick={() => setEditOpen(o => !o)} sx={{ flexShrink: 0, mt: -0.5 }} aria-label="Profili düzenle">
                <EditOutlined fontSize="small" />
              </IconButton>
            </Stack>
            <Stack direction="row" spacing={{ xs: 2, md: 3 }} sx={{ mt: 0.5, mb: 0.5 }} flexWrap="wrap" useFlexGap>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {postsTotalCount}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Gönderi
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {stats.commentCount}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Yorum
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {myGroups.length}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Grup
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3, color: 'success.main' }}>
                  {stats.likesReceived}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Faydalı
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3, color: 'error.main' }}>
                  {stats.dislikesReceived}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Faydalı Değil
                </Typography>
              </Box>
            </Stack>
            {user.emailVerified ? (
              <Box sx={{ mt: 0.5 }}>
                <VerifiedBadge />
              </Box>
            ) : (
              <Chip label="e-posta doğrulanmadı" size="small" color="warning" variant="outlined" sx={{ height: 24, mt: 0.5 }} />
            )}
          </Box>
        </Stack>
        {user.bio && (
          <Typography variant="body2" sx={{ color: 'text.primary', mt: 1.5 }}>
            {user.bio}
          </Typography>
        )}
      </Box>

      <Stack spacing={4}>
        {/* Profil düzenleme */}
        <Collapse in={editOpen} unmountOnExit>
          <Box sx={{ px: { xs: 0.5, md: 0 } }}>
            <Box component="form" onSubmit={saveProfile} sx={{ p: 2.5, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Profili Düzenle</Typography>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Ad" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth required />
                  <TextField label="Soyad" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth required />
                </Stack>
                <TextField label="Hakkında" value={bio} onChange={e => setBio(e.target.value)} fullWidth multiline minRows={3} />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button type="submit" variant="contained" disabled={savingProfile}>
                    {savingProfile ? <CircularProgress size={16} color="inherit" /> : 'Kaydet'}
                  </Button>
                  <Button onClick={() => setEditOpen(false)} disabled={savingProfile}>İptal</Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Collapse>

        {/* Hastalık gruplarım */}
        <Section title="Hastalık Gruplarım">
          {groupsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={22} />
            </Box>
          ) : (
            myGroups.length === 0 ? (
              <EmptyState
                icon={GroupsRounded}
                title="Henüz bir hastalık grubuna katılmadınız."
                actionLabel="Grupları Keşfet"
                onAction={() => navigate('/groups')}
                dense
              />
            ) : (
            <SectionList
              items={myGroups}
              getKey={(g) => g.id}
              emptyText="Henüz bir hastalık grubuna katılmadınız."
              renderItem={(g) => (
                <Box
                  onClick={() => navigate(`/groups/${g.id}`)}
                  sx={{
                    p: 1.5, borderRadius: 1.5, bgcolor: 'background.paper',
                    cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <GroupsRounded sx={{ color: 'primary.main' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                        {g.name}
                      </Typography>
                      {g.description && (
                        <SubRow value={g.description} />
                      )}
                    </Box>
                  </Stack>
                </Box>
              )}
            />
            )
          )}
        </Section>

        {/* Postlarım / Kaydedilenler - Instagram'daki gönderiler/kaydedilenler
            sekme çiftiyle aynı fikir (bkz. Posts.jsx'teki Yeni/Popüler
            seçiciyle aynı ToggleButtonGroup deseni, tutarlılık için). */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: { xs: 0.5, md: 0 } }}>
            <Typography variant="h3" sx={{ color: 'text.primary' }}>
              {postsMode === 'saved' ? 'Kaydedilenler' : 'Postlarım'}
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={postsMode}
              exclusive
              onChange={(_, v) => v && setPostsMode(v)}
            >
              <ToggleButton value="mine">Postlarım</ToggleButton>
              <ToggleButton value="saved">Kaydedilenler</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {postsMode === 'mine' ? (
            postsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={22} />
              </Box>
            ) : myPosts.length === 0 ? (
              <EmptyState icon={DynamicFeedRounded} title="Henüz gönderiniz yok." dense />
            ) : (
              <>
                {myPosts.map((p, i) => (
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
            )
          ) : (
            savedLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={22} />
              </Box>
            ) : savedPosts.length === 0 ? (
              <EmptyState icon={BookmarkBorderRounded} title="Henüz kaydettiğiniz bir gönderi yok." dense />
            ) : (
              <>
                {savedPosts.map((p, i) => (
                  <Box key={p.id}>
                    {i > 0 && <Divider />}
                    <PostCard post={p} token={token} onClick={() => navigate(`/post/${p.id}`)} />
                  </Box>
                ))}
                {!savedLast && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={loadMoreSaved}
                      disabled={savedLoadingMore}
                      sx={{ minWidth: 180, minHeight: 44 }}
                    >
                      {savedLoadingMore ? <CircularProgress size={18} /> : 'Daha Fazla Yükle'}
                    </Button>
                  </Box>
                )}
              </>
            )
          )}
        </Box>

        {/* Kişiselleştirme: yazı boyutu + yüksek kontrast (bkz. AccessibilityContext.jsx) */}
        <Section title="Erişilebilirlik">
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 2.5 }}>
            <Stack spacing={2.5}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <FormatSizeRounded sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Yazı Boyutu</Typography>
                </Stack>
                <ToggleButtonGroup
                  value={fontScale}
                  exclusive
                  size="small"
                  onChange={(_, v) => v && setFontScale(v)}
                  fullWidth
                >
                  {Object.entries(fontScaleOptions).map(([key, opt]) => (
                    <ToggleButton key={key} value={key}>{opt.label}</ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={highContrast}
                    onChange={e => setHighContrast(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Yüksek Kontrast</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Metin ve kenarlıkları daha belirgin hale getirir
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { ml: 1 } }}
              />
            </Stack>
          </Box>
        </Section>

        {/* Ayarlar: şifre, gizlilik, çıkış, hesap silme - hepsi tek yerde */}
        <Section title="Ayarlar">
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Stack divider={<Divider />}>
              <Box>
                <SettingsRow
                  icon={<LockOutlined sx={{ fontSize: 20 }} />}
                  label="Şifre Değiştir"
                  open={pwOpen}
                  onClick={() => setPwOpen(o => !o)}
                />
                <Collapse in={pwOpen} unmountOnExit>
                  <Box component="form" onSubmit={savePassword} sx={{ p: 2.5, pt: 0.5 }}>
                    <Stack spacing={2}>
                      <TextField
                        label="Mevcut Şifre" type="password" value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)} fullWidth required size="small"
                      />
                      <Box>
                        <TextField
                          label="Yeni Şifre" type="password" value={newPassword}
                          onChange={e => setNewPassword(e.target.value)} fullWidth required size="small"
                          helperText="En az 8 karakter"
                        />
                        <Box sx={{ mt: 1 }}>
                          <PasswordStrengthMeter password={newPassword} />
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button type="submit" variant="contained" size="small" disabled={savingPassword}>
                          {savingPassword ? <CircularProgress size={16} color="inherit" /> : 'Şifreyi Değiştir'}
                        </Button>
                        <Button size="small" onClick={() => setPwOpen(false)} disabled={savingPassword}>İptal</Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Collapse>
              </Box>

              <Box>
                <SettingsRow
                  icon={<BlockRounded sx={{ fontSize: 20 }} />}
                  label="Engellenen Kullanıcılar"
                  open={blockedOpen}
                  onClick={() => setBlockedOpen(o => !o)}
                />
                <Collapse in={blockedOpen} unmountOnExit>
                  <Box sx={{ px: 1.5, pb: 1.5 }}>
                    {blockedLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : blockedUsers.length === 0 ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                        Engellediğin kimse yok.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {blockedUsers.map(b => (
                          <Stack
                            key={b.id} direction="row" alignItems="center" spacing={1.5}
                            sx={{ py: 0.75 }}
                          >
                            <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }} noWrap>
                              {b.userName}
                            </Typography>
                            <Button
                              size="small" variant="outlined"
                              disabled={unblockingId === b.userId}
                              onClick={() => handleUnblock(b.userId)}
                            >
                              {unblockingId === b.userId ? <CircularProgress size={14} color="inherit" /> : 'Engeli Kaldır'}
                            </Button>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Collapse>
              </Box>

              <Box>
                <SettingsRow
                  icon={<DevicesOutlined sx={{ fontSize: 20 }} />}
                  label="Aktif Oturumlar"
                  open={sessionsOpen}
                  onClick={() => setSessionsOpen(o => !o)}
                />
                <Collapse in={sessionsOpen} unmountOnExit>
                  <Box sx={{ px: 1.5, pb: 1.5 }}>
                    {sessionsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : sessions.length === 0 ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                        Aktif oturum bulunamadı.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {sessions.map(s => (
                          <Stack
                            key={s.id} direction="row" alignItems="center" spacing={1.5}
                            sx={{ py: 0.75 }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                                  {s.deviceLabel}
                                </Typography>
                                {s.current && (
                                  <Chip label="Bu cihaz" size="small" color="primary" variant="outlined" sx={{ height: 20 }} />
                                )}
                              </Stack>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Son kullanım: {prettyDate(s.lastUsedAt) || 'Bilinmiyor'}
                              </Typography>
                            </Box>
                            {!s.current && (
                              <Button
                                size="small" variant="outlined" color="error"
                                disabled={revokingSessionId === s.id}
                                onClick={() => handleRevokeSession(s.id)}
                              >
                                {revokingSessionId === s.id ? <CircularProgress size={14} color="inherit" /> : 'Çıkış Yap'}
                              </Button>
                            )}
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Collapse>
              </Box>

              <SettingsRow
                icon={<FileDownloadOutlined sx={{ fontSize: 20 }} />}
                label="Verilerimi İndir"
                loading={exportingData}
                onClick={doExportData}
              />

              <SettingsRow
                icon={<HelpOutlineRounded sx={{ fontSize: 20 }} />}
                label="Yardım ve Destek"
                onClick={() => navigate('/yardim')}
              />

              <SettingsRow
                icon={<InfoOutlined sx={{ fontSize: 20 }} />}
                label="Hakkımızda"
                onClick={() => navigate('/hakkimizda')}
              />

              <SettingsRow
                icon={<GroupsRounded sx={{ fontSize: 20 }} />}
                label="Topluluk Kuralları"
                onClick={() => navigate('/topluluk-kurallari')}
              />

              <SettingsRow
                icon={<DescriptionOutlined sx={{ fontSize: 20 }} />}
                label="Kullanım Şartları"
                onClick={() => navigate('/kullanim-sartlari')}
              />

              <SettingsRow
                icon={<PrivacyTipOutlined sx={{ fontSize: 20 }} />}
                label="Gizlilik Politikası"
                onClick={() => navigate('/gizlilik-politikasi')}
              />

              <SettingsRow
                icon={<LogoutRounded sx={{ fontSize: 20 }} />}
                label="Çıkış Yap"
                onClick={handleLogout}
              />

              <Box>
                <SettingsRow
                  icon={<WarningAmberRounded sx={{ fontSize: 20 }} />}
                  label="Hesabımı Deaktive Et"
                  danger
                  open={deactivateConfirm}
                  onClick={() => setDeactivateConfirm(o => !o)}
                />
                <Collapse in={deactivateConfirm} unmountOnExit>
                  <Box sx={{ p: 2.5, pt: 0.5 }}>
                    <Alert severity="warning" sx={{ mb: 0 }}>
                      <Stack spacing={1.5}>
                        <Typography variant="body2">
                          Hesabını deaktive edersen oturumun kapatılır ve tekrar giriş yapamazsın.
                          Bu işlem geri alınamaz.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Button
                            variant="contained" color="error" size="small"
                            onClick={doDeactivate} disabled={deactivating}
                          >
                            {deactivating ? <CircularProgress size={14} color="inherit" /> : 'Evet, Deaktive Et'}
                          </Button>
                          <Button size="small" onClick={() => setDeactivateConfirm(false)} disabled={deactivating}>
                            Vazgeç
                          </Button>
                        </Stack>
                      </Stack>
                    </Alert>
                  </Box>
                </Collapse>
              </Box>

              <Box>
                <SettingsRow
                  icon={<DeleteForeverRounded sx={{ fontSize: 20 }} />}
                  label="Hesabımı Sil"
                  danger
                  open={deleteAccountConfirm}
                  onClick={() => setDeleteAccountConfirm(o => !o)}
                />
                <Collapse in={deleteAccountConfirm} unmountOnExit>
                  <Box component="form" onSubmit={doDeleteAccount} sx={{ p: 2.5, pt: 0.5 }}>
                    <Alert severity="error" sx={{ mb: 0 }}>
                      <Stack spacing={1.5}>
                        <Typography variant="body2">
                          Hesabını silersen kimlik bilgilerin (ad, soyad, e-posta) kalıcı olarak
                          anonimleştirilir ve oturumun kapatılır. Bu işlem GERİ ALINAMAZ.
                          Gönderi/yorumların, topluluk tartışmaları bozulmasın diye kaldırılmadan
                          kalır ama artık sana ait görünmez.
                        </Typography>
                        <TextField
                          label="Şifreni gir" type="password" value={deleteAccountPassword}
                          onChange={e => setDeleteAccountPassword(e.target.value)}
                          fullWidth required size="small"
                          slotProps={{ htmlInput: { 'data-testid': 'delete-account-password' } }}
                        />
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Button
                            type="submit" variant="contained" color="error" size="small"
                            disabled={deletingAccount}
                          >
                            {deletingAccount ? <CircularProgress size={14} color="inherit" /> : 'Evet, Hesabımı Sil'}
                          </Button>
                          <Button
                            size="small"
                            onClick={() => { setDeleteAccountConfirm(false); setDeleteAccountPassword('') }}
                            disabled={deletingAccount}
                          >
                            Vazgeç
                          </Button>
                        </Stack>
                      </Stack>
                    </Alert>
                  </Box>
                </Collapse>
              </Box>
            </Stack>
          </Box>
        </Section>
      </Stack>
    </Box>
  )
}
