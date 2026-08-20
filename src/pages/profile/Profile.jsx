import { useCallback, useEffect, useState } from 'react'
import {
  Avatar, Box, Button, Chip, CircularProgress, Collapse, Divider, IconButton,
  Stack, Tab, Tabs, TextField, Typography
} from '@mui/material'
import {
  BookmarkBorderRounded, DynamicFeedRounded, EditOutlined, GroupsRounded, SettingsOutlined
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import PostCard from '../../components/PostCard.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import {
  getMyDiseaseGroups, getMyPosts, getMySavedPosts, getUserProfile, updateProfile
} from '../../services/api.js'
import { SectionList, SubRow } from './ProfileShared.jsx'
import { initialsFrom } from '../../utils/format.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'

const TABS = [
  { key: 'posts', label: 'Gönderiler', icon: <DynamicFeedRounded sx={{ fontSize: 18 }} /> },
  { key: 'saved', label: 'Kaydedilenler', icon: <BookmarkBorderRounded sx={{ fontSize: 18 }} /> },
  { key: 'groups', label: 'Gruplarım', icon: <GroupsRounded sx={{ fontSize: 18 }} /> },
]

/**
 * Kendi profilin - Faz5: X/Instagram'ın gerçek profil yapısına uyarlandı.
 * Kimlik bloğu (avatar/isim/bio/stats) üstte sabit, altında X'in
 * Gönderiler/Yanıtlar/Medya/Beğeniler sekme çubuğuna karşılık gelen bir
 * sekme grubu var (burada: Gönderiler/Kaydedilenler/Gruplarım - platformun
 * kendi içerik modeline uyarlanmış karşılığı). Şifre/gizlilik/hesap silme
 * gibi seyrek kullanılan hesap ayarları artık burada DEĞİL - X/IG'de de
 * hesap ayarları profil kaydırma akışının parçası değildir, dişli ikonuyla
 * ayrı bir ekrana (/profile/settings, bkz. AccountSettings.jsx) gidilir.
 */
export default function Profile() {
  const { token, user, updateLocalUser } = useAuth()
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

  /* ---- Kaydedilenler ---- */
  const [tabIndex, setTabIndex] = useState(0)
  const activeTabKey = TABS[tabIndex].key
  const savedPostsFetcher = useCallback((page) => getMySavedPosts(token, { page }), [token])
  const {
    items: savedPosts, loading: savedLoading, loadingMore: savedLoadingMore,
    last: savedLast, loadMore: loadMoreSaved
  } = usePaginatedList(savedPostsFetcher, {
    enabled: activeTabKey === 'saved' && !!token,
    once: true,
    deps: [token],
    onError: err => showError(err.message || 'Kaydedilen gönderiler alınamadı.')
  })

  /* ---- İstatistikler ---- */
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
      {/* Profil başlığı: solda avatar, sağda isim + istatistik satırı, altında bio */}
      <Box sx={{ mb: 2, px: { xs: 0.5, md: 0 } }}>
        <Stack direction="row" spacing={{ xs: 2, md: 3 }} alignItems="center">
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
            <Stack direction="row" alignItems="flex-start" spacing={0.5}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5, wordBreak: 'break-word', flex: 1 }}>
                {fullName}
              </Typography>
              {/* X/IG deseni: kalem = profili düzenle, dişli = hesap ayarları -
                  iki ayrı, birbirine karışmayan eylem. */}
              <IconButton onClick={() => setEditOpen(o => !o)} sx={{ flexShrink: 0, mt: -0.5 }} aria-label="Profili düzenle">
                <EditOutlined fontSize="small" />
              </IconButton>
              <IconButton onClick={() => navigate('/profile/settings')} sx={{ flexShrink: 0, mt: -0.5 }} aria-label="Ayarlar">
                <SettingsOutlined fontSize="small" />
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
          <Typography variant="body2" sx={{ color: 'text.primary', mt: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {user.bio}
          </Typography>
        )}
      </Box>

      {/* Profil düzenleme */}
      <Collapse in={editOpen} unmountOnExit>
        <Box sx={{ px: { xs: 0.5, md: 0 }, mb: 3 }}>
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

      {/* X tarzı alt-çizgili sekme çubuğu - profildeki tüm içerik türleri
          burada, ayrı Section'lara bölünmüş uzun bir kaydırma yerine tek bir
          anahtarlanabilir alanda. */}
      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        variant="fullWidth"
        sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {TABS.map(t => (
          <Tab key={t.key} icon={t.icon} iconPosition="start" label={t.label} sx={{ minHeight: 48 }} />
        ))}
      </Tabs>

      {activeTabKey === 'posts' && (
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
                <PostCard post={p} token={token} onClick={() => navigate(`/post/${p.id}`)} showPinnedBadge />
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
      )}

      {activeTabKey === 'saved' && (
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

      {activeTabKey === 'groups' && (
        <Box sx={{ px: { xs: 0.5, md: 0 } }}>
          {groupsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={22} />
            </Box>
          ) : myGroups.length === 0 ? (
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
          )}
        </Box>
      )}
    </Box>
  )
}
