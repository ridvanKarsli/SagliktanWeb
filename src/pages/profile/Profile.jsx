import { useEffect, useState } from 'react'
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Collapse, Divider, IconButton,
  Stack, TextField, Typography
} from '@mui/material'
import {
  ChevronRightRounded, EditOutlined, GroupsRounded, LockOutlined, LogoutRounded,
  PrivacyTipOutlined, WarningAmberRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import PostCard from '../../components/PostCard.jsx'
import {
  changePassword, deactivateAccount, getMyDiseaseGroups, getMyPosts, getUserProfile, updateProfile
} from '../../services/api.js'
import { Section, SectionList, SubRow } from './ProfileShared.jsx'

function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}

// Ayarlar sekmesindeki her satır (şifre, gizlilik, çıkış, hesap silme) için
// ortak tıklanabilir satır bileşeni.
function SettingsRow({ icon, label, onClick, danger, open }) {
  return (
    <Box
      onClick={onClick}
      className="tap-scale"
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1.25, borderRadius: 1.5, cursor: 'pointer',
        color: danger ? 'error.main' : 'text.primary',
        '&:hover': { bgcolor: danger ? 'rgba(196,85,74,0.08)' : 'action.hover' }
      }}
    >
      <Box sx={{ display: 'flex', color: danger ? 'error.main' : 'text.secondary' }}>
        {icon}
      </Box>
      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      <ChevronRightRounded
        sx={{
          fontSize: 20, color: 'text.secondary',
          transform: open ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.15s ease'
        }}
      />
    </Box>
  )
}

export default function Profile() {
  const { token, user, updateLocalUser, logout } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()

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
  const [myPosts, setMyPosts] = useState([])
  const [postsPage, setPostsPage] = useState(0)
  const [postsTotalCount, setPostsTotalCount] = useState(0)
  const [postsLast, setPostsLast] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsLoadingMore, setPostsLoadingMore] = useState(false)

  useEffect(() => {
    if (!token) { setPostsLoading(false); return }
    let mounted = true
    setPostsLoading(true)
    setPostsPage(0)
    getMyPosts(token, { page: 0 })
      .then(res => {
        if (!mounted) return
        setMyPosts(Array.isArray(res?.content) ? res.content : [])
        // totalElements standart Spring Page yanıtında zaten mevcut - yeni
        // bir backend alanı gerekmiyor, sadece bu sayıyı arayüzde gösteriyoruz.
        setPostsTotalCount(res?.totalElements ?? 0)
        setPostsLast(res?.last ?? true)
      })
      .catch(err => showError(err.message || 'Postlarınız alınamadı.'))
      .finally(() => { if (mounted) setPostsLoading(false) })
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const loadMorePosts = async () => {
    const nextPage = postsPage + 1
    setPostsLoadingMore(true)
    try {
      const res = await getMyPosts(token, { page: nextPage })
      setMyPosts(prev => [...prev, ...(Array.isArray(res?.content) ? res.content : [])])
      setPostsLast(res?.last ?? true)
      setPostsPage(nextPage)
    } catch (err) {
      showError(err.message || 'Postlarınız alınamadı.')
    } finally {
      setPostsLoadingMore(false)
    }
  }

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
            {!user.emailVerified && (
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
          )}
        </Section>

        {/* Postlarım */}
        <Box>
          <Typography variant="h3" sx={{ mb: 2, px: { xs: 0.5, md: 0 }, color: 'text.primary' }}>
            Postlarım
          </Typography>
          {postsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={22} />
            </Box>
          ) : myPosts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Henüz gönderiniz yok.
              </Typography>
            </Box>
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
          )}
        </Box>

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
                      <TextField
                        label="Yeni Şifre" type="password" value={newPassword}
                        onChange={e => setNewPassword(e.target.value)} fullWidth required size="small"
                        helperText="En az 8 karakter"
                      />
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
            </Stack>
          </Box>
        </Section>
      </Stack>
    </Box>
  )
}
