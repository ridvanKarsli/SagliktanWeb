import { useCallback, useEffect, useState } from 'react'
import {
  Avatar, Box, Button, ButtonBase, Chip, CircularProgress, Collapse, Divider, IconButton,
  ListItemIcon, ListItemText, Menu, MenuItem, Stack, Tab, Tabs, TextField, Typography
} from '@mui/material'
import {
  BookmarkBorderRounded, DynamicFeedRounded, EditOutlined, ExploreOutlined, GroupsRounded,
  LogoutRounded, MoreVertRounded, OpenInNewRounded, PeopleAltRounded, SettingsOutlined
} from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import PostCard from '../../components/PostCard.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import {
  getMyDiseaseGroups, getMyPosts, getMySavedPosts, getUserProfile, updateProfile
} from '../../services/api.js'
import { initialsFrom } from '../../utils/format.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { useGroupMembership } from '../../hooks/useGroupMembership.js'

const TABS = [
  { key: 'posts', label: 'Gönderiler', icon: DynamicFeedRounded },
  { key: 'saved', label: 'Kaydedilenler', icon: BookmarkBorderRounded },
  { key: 'groups', label: 'Gruplarım', icon: GroupsRounded },
]
const TAB_KEYS = new Set(TABS.map(t => t.key))
const BIO_MAX = 1000

/* İstatistik hücresi: sayı + etiket. onClick verilirse ilgili sekmeye götüren
   gerçek bir buton olur (IG'de "gönderi" sayısına dokunmak gönderilere iner). */
function Stat({ value, label, onClick, highlight }) {
  const content = (
    <>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3, color: highlight ? 'primary.main' : 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
    </>
  )
  if (!onClick) return <Box sx={{ minWidth: 44, py: 0.25, display: 'flex', flexDirection: 'column' }}>{content}</Box>
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`${value} ${label} - göster`}
      sx={{ flexDirection: 'column', alignItems: 'flex-start', borderRadius: 1, px: 0.5, mx: -0.5, py: 0.25, minWidth: 44 }}
    >
      {content}
    </ButtonBase>
  )
}

/* Gruplarım satırı. Satıra dokunmak gruba girer (birincil eylem); gruptan
   ayrılmak gibi yıkıcı eylem sağdaki ⋮ menüsünde - mobilde kaydırırken
   yanlışlıkla "Ayrıl"a basılmasın diye doğrudan buton değil. */
function MyGroupRow({ group, pending, onOpen, onLeave }) {
  const [anchor, setAnchor] = useState(null)
  const close = () => setAnchor(null)
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center',
        borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
        overflow: 'hidden', opacity: pending ? 0.6 : 1, transition: 'opacity .15s ease'
      }}
    >
      <ButtonBase
        onClick={onOpen}
        aria-label={`${group.name} grubuna git`}
        sx={{
          flex: 1, minWidth: 0, justifyContent: 'flex-start', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 1.5, pl: 1.5, pr: 0.5, py: 1.25,
          '&:hover': { bgcolor: 'action.hover' },
          '&.Mui-focusVisible': { bgcolor: 'action.focus' }
        }}
      >
        <Box sx={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: 'rgba(76,184,159,0.16)', color: 'primary.main' }}>
          <GroupsRounded sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>{group.name}</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PeopleAltRounded sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {new Intl.NumberFormat('tr-TR').format(group.memberCount ?? 0)} üye
            </Typography>
          </Stack>
          {group.description && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mt: 0.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
            >
              {group.description}
            </Typography>
          )}
        </Box>
      </ButtonBase>
      <Box sx={{ width: 48, display: 'grid', placeItems: 'center', flexShrink: 0, pr: 0.5 }}>
        {pending ? (
          <CircularProgress size={18} />
        ) : (
          <IconButton
            aria-label={`${group.name} için seçenekler`}
            aria-haspopup="menu"
            aria-expanded={anchor ? 'true' : undefined}
            onClick={(e) => setAnchor(e.currentTarget)}
            sx={{ width: 44, height: 44, color: 'text.secondary' }}
          >
            <MoreVertRounded />
          </IconButton>
        )}
      </Box>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem onClick={() => { close(); onOpen() }} sx={{ minHeight: 44 }}>
          <ListItemIcon><OpenInNewRounded fontSize="small" /></ListItemIcon>
          <ListItemText>Gruba git</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { close(); onLeave() }} sx={{ minHeight: 44, color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}><LogoutRounded fontSize="small" /></ListItemIcon>
          <ListItemText>Gruptan ayrıl</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

function LoadMore({ loading, onClick }) {
  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <Button variant="outlined" onClick={onClick} disabled={loading} sx={{ minWidth: 180, minHeight: 44 }}>
        {loading ? <CircularProgress size={18} /> : 'Daha Fazla Yükle'}
      </Button>
    </Box>
  )
}

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress size={22} />
    </Box>
  )
}

/**
 * Kendi profilin. Kimlik bloğu (avatar/isim/istatistik/bio) üstte, altında
 * Gönderiler/Kaydedilenler/Gruplarım sekmeleri. Aktif sekme URL'de
 * (?tab=groups) tutulur: yenileme, geri tuşu ve paylaşılan link aynı sekmeyi
 * açar. Hesap ayarları ayrı ekranda (/profile/settings, dişli ikonu).
 */
export default function Profile() {
  const { token, user, updateLocalUser } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const rawTab = params.get('tab')
  const activeTabKey = TAB_KEYS.has(rawTab) ? rawTab : 'posts'

  const setTab = useCallback((key) => {
    const next = new URLSearchParams(params)
    if (key === 'posts') next.delete('tab'); else next.set('tab', key)
    setParams(next, { replace: true })
  }, [params, setParams])

  /* ---- Profil düzenleme ---- */
  const [editOpen, setEditOpen] = useState(false)
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const resetForm = useCallback(() => {
    setFirstName(user?.firstName || '')
    setLastName(user?.lastName || '')
    setBio(user?.bio || '')
  }, [user?.firstName, user?.lastName, user?.bio])

  useEffect(() => { resetForm() }, [resetForm])

  const dirty = firstName.trim() !== (user?.firstName || '')
    || lastName.trim() !== (user?.lastName || '')
    || bio.trim() !== (user?.bio || '')

  const cancelEdit = () => { resetForm(); setEditOpen(false) }

  const saveProfile = async (e) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      showError('Ad ve soyad zorunludur.')
      return
    }
    setSavingProfile(true)
    try {
      const payload = { firstName: firstName.trim(), lastName: lastName.trim(), bio: bio.trim() }
      await updateProfile(token, payload)
      updateLocalUser(payload)
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
  const { leave, pendingId } = useGroupMembership()

  useEffect(() => {
    if (!token) { setGroupsLoading(false); return }
    let mounted = true
    getMyDiseaseGroups(token)
      .then(data => { if (mounted) setMyGroups(Array.isArray(data) ? data : []) })
      .catch(err => showError(err.message || 'Gruplar alınamadı.'))
      .finally(() => { if (mounted) setGroupsLoading(false) })
    return () => { mounted = false }
  }, [token, showError])

  const handleLeave = async (group) => {
    if (await leave(group)) {
      setMyGroups(prev => prev.filter(g => g.id !== group.id))
    }
  }

  /* ---- Gönderilerim ---- */
  const postsFetcher = useCallback((page) => getMyPosts(token, { page }), [token])
  const {
    items: myPosts, loading: postsLoading, loadingMore: postsLoadingMore,
    last: postsLast, totalCount: postsTotalCount, loadMore: loadMorePosts
  } = usePaginatedList(postsFetcher, {
    enabled: !!token,
    deps: [token],
    onError: err => showError(err.message || 'Gönderilerin alınamadı.')
  })

  /* ---- Kaydedilenler ---- */
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
  const [stats, setStats] = useState({ commentCount: 0, likesReceived: 0 })

  useEffect(() => {
    if (!token) return
    let mounted = true
    getUserProfile(token)
      .then(res => {
        if (!mounted) return
        setStats({ commentCount: res?.commentCount ?? 0, likesReceived: res?.likesReceived ?? 0 })
      })
      .catch(() => { /* istatistik yüklenemezse 0 göster, sayfa akışını bozmasın */ })
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
  const fmt = (n) => new Intl.NumberFormat('tr-TR').format(n ?? 0)

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
      {/* Kimlik bloğu */}
      <Box sx={{ mb: 2, px: { xs: 0.5, md: 0 } }}>
        <Stack direction="row" spacing={{ xs: 2, md: 3 }} alignItems="center">
          <Avatar
            sx={{
              width: { xs: 72, md: 96 }, height: { xs: 72, md: 96 }, flexShrink: 0,
              fontSize: { xs: 22, md: 30 }, fontWeight: 600,
              border: '3px solid', borderColor: 'primary.main'
            }}
          >
            {initialsFrom(fullName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="flex-start" spacing={0.5}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5, wordBreak: 'break-word', flex: 1, fontSize: { xs: '1.375rem', md: undefined } }}>
                {fullName}
              </Typography>
              <IconButton onClick={() => navigate('/profile/settings')} sx={{ flexShrink: 0, mt: -0.75, width: 44, height: 44 }} aria-label="Ayarlar">
                <SettingsOutlined />
              </IconButton>
            </Stack>
            <Stack direction="row" spacing={{ xs: 1.75, md: 3 }} sx={{ mt: 0.25 }} flexWrap="wrap" useFlexGap>
              <Stat value={fmt(postsTotalCount)} label="Gönderi" onClick={() => setTab('posts')} />
              <Stat value={fmt(stats.commentCount)} label="Yorum" />
              <Stat value={fmt(myGroups.length)} label="Grup" onClick={() => setTab('groups')} />
              <Stat value={fmt(stats.likesReceived)} label="Faydalı" highlight />
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ mt: 1.25 }}>
          {user.emailVerified ? (
            <VerifiedBadge />
          ) : (
            <Chip
              label="E-posta doğrulanmadı · Ayarlar"
              size="small" color="warning" variant="outlined"
              onClick={() => navigate('/profile/settings')}
              sx={{ height: 28 }}
            />
          )}
        </Box>

        {user.bio && (
          <Typography variant="body2" sx={{ color: 'text.primary', mt: 1.25, wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}>
            {user.bio}
          </Typography>
        )}

        {!editOpen && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EditOutlined />}
            onClick={() => setEditOpen(true)}
            sx={{ mt: 1.75, minHeight: 40, color: 'text.primary', borderColor: 'divider', fontWeight: 600 }}
          >
            Profili düzenle
          </Button>
        )}
      </Box>

      {/* Profil düzenleme */}
      <Collapse in={editOpen} unmountOnExit>
        <Box sx={{ px: { xs: 0.5, md: 0 }, mb: 3 }}>
          <Box component="form" onSubmit={saveProfile} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Profili düzenle</Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Ad" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth required autoComplete="given-name" />
                <TextField label="Soyad" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth required autoComplete="family-name" />
              </Stack>
              <TextField
                label="Hakkında"
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, BIO_MAX))}
                fullWidth multiline minRows={3} maxRows={8}
                placeholder="Kendinden, deneyimlerinden kısaca bahset (isteğe bağlı)"
                helperText={`${bio.length}/${BIO_MAX}`}
                slotProps={{ htmlInput: { maxLength: BIO_MAX }, formHelperText: { sx: { textAlign: 'right', mr: 0 } } }}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={cancelEdit} disabled={savingProfile} sx={{ minHeight: 44 }}>Vazgeç</Button>
                <Button type="submit" variant="contained" disabled={savingProfile || !dirty} sx={{ minHeight: 44, minWidth: 96 }}>
                  {savingProfile ? <CircularProgress size={16} color="inherit" /> : 'Kaydet'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Collapse>

      <Tabs
        value={activeTabKey}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        aria-label="Profil bölümleri"
        sx={{
          mb: 2, borderBottom: '1px solid', borderColor: 'divider', minHeight: 48,
          '& .MuiTab-root': { minHeight: 48, minWidth: 0, px: 1, textTransform: 'none', fontWeight: 600 },
          '& .MuiTab-icon': { display: { xs: 'none', sm: 'inline-flex' } }
        }}
      >
        {TABS.map(t => {
          const Icon = t.icon
          return <Tab key={t.key} value={t.key} icon={<Icon sx={{ fontSize: 18 }} />} iconPosition="start" label={t.label} />
        })}
      </Tabs>

      {activeTabKey === 'posts' && (
        postsLoading ? <Loading /> : myPosts.length === 0 ? (
          <EmptyState
            icon={DynamicFeedRounded}
            title="Henüz gönderin yok."
            description="Bir alt gruba girip deneyimini paylaşarak başlayabilirsin."
            actionLabel={myGroups.length > 0 ? 'Gruplarıma git' : 'Grupları keşfet'}
            onAction={() => (myGroups.length > 0 ? setTab('groups') : navigate('/groups'))}
            dense
          />
        ) : (
          <>
            {myPosts.map((p, i) => (
              <Box key={p.id}>
                {i > 0 && <Divider />}
                <PostCard post={p} token={token} onClick={() => navigate(`/post/${p.id}`)} showPinnedBadge />
              </Box>
            ))}
            {!postsLast && <LoadMore loading={postsLoadingMore} onClick={loadMorePosts} />}
          </>
        )
      )}

      {activeTabKey === 'saved' && (
        savedLoading ? <Loading /> : savedPosts.length === 0 ? (
          <EmptyState
            icon={BookmarkBorderRounded}
            title="Kaydettiğin gönderi yok."
            description="Gönderilerdeki yer imi simgesine dokunarak sonra okumak için kaydedebilirsin."
            dense
          />
        ) : (
          <>
            {savedPosts.map((p, i) => (
              <Box key={p.id}>
                {i > 0 && <Divider />}
                <PostCard post={p} token={token} onClick={() => navigate(`/post/${p.id}`)} />
              </Box>
            ))}
            {!savedLast && <LoadMore loading={savedLoadingMore} onClick={loadMoreSaved} />}
          </>
        )
      )}

      {activeTabKey === 'groups' && (
        <Box sx={{ px: { xs: 0.5, md: 0 } }}>
          {groupsLoading ? <Loading /> : myGroups.length === 0 ? (
            <EmptyState
              icon={GroupsRounded}
              title="Henüz bir gruba katılmadın."
              description="Seninle aynı süreçten geçen insanlarla tanışmak için bir hastalık grubuna katıl."
              actionLabel="Grupları keşfet"
              onAction={() => navigate('/groups')}
              dense
            />
          ) : (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {myGroups.length} gruba üyesin
                </Typography>
                <Button size="small" startIcon={<ExploreOutlined />} onClick={() => navigate('/groups')} sx={{ minHeight: 40 }}>
                  Keşfet
                </Button>
              </Stack>
              <Stack spacing={1} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {myGroups.map(g => (
                  <li key={g.id}>
                    <MyGroupRow
                      group={g}
                      pending={pendingId === g.id}
                      onOpen={() => navigate(`/groups/${g.id}`)}
                      onLeave={() => handleLeave(g)}
                    />
                  </li>
                ))}
              </Stack>
            </>
          )}
        </Box>
      )}
    </Box>
  )
}
