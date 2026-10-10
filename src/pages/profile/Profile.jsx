import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Chip, Collapse, IconButton, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material'
import {
  BookmarkBorderRounded, DynamicFeedRounded, EditOutlined, ExploreOutlined, GroupsRounded, SettingsOutlined
} from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import HealthSummary from '../../components/profile/HealthSummary.jsx'
import ProfileStat from '../../components/profile/ProfileStat.jsx'
import ProfileEditForm from '../../components/profile/ProfileEditForm.jsx'
import MyGroupRow, { MyGroupRowSkeleton } from '../../components/profile/MyGroupRow.jsx'
import ProfileHeader, { ProfileAvatar, ProfileHeaderSkeleton, StatStrip } from '../../components/profile/ProfileHeader.jsx'
import HelpfulHint from '../../components/profile/HelpfulHint.jsx'
import AvatarPicker from '../../components/avatars/AvatarPicker.jsx'
import AvatarUnlockWatcher from '../../components/avatars/AvatarUnlockWatcher.jsx'
import CompanionEmpty from '../../components/avatars/CompanionEmpty.jsx'
import PostList from '../../components/PostList.jsx'
import PostCardSkeleton from '../../components/PostCardSkeleton.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import LoadMoreButton from '../../components/common/LoadMoreButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { getMyPosts, getMySavedPosts, getUserProfile } from '../../services/api.js'
import { useMyDiseaseGroups } from '../../hooks/useMyDiseaseGroups.js'
import { fullNameOf } from '../../utils/text.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { useGroupMembership } from '../../hooks/useGroupMembership.js'
import '../../styles/companions.css'

const TABS = [
  { key: 'posts', label: 'Gönderiler', icon: DynamicFeedRounded },
  { key: 'saved', label: 'Kaydedilenler', icon: BookmarkBorderRounded },
  { key: 'groups', label: 'Gruplarım', icon: GroupsRounded },
]
const TAB_KEYS = new Set(TABS.map(t => t.key))
const DEFAULT_TAB = 'posts'

// Aktif sekme URL'de (?tab=groups): yenileme, geri tuşu ve paylaşılan link aynı sekmeyi açar.
function useProfileTab() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab = TAB_KEYS.has(raw) ? raw : DEFAULT_TAB
  const setTab = useCallback((key) => {
    const next = new URLSearchParams(params)
    if (key === DEFAULT_TAB) next.delete('tab'); else next.set('tab', key)
    setParams(next, { replace: true })
  }, [params, setParams])
  return [tab, setTab]
}

// Yorum ve "faydalı" sayıları /users/me yanıtında gelir. İkincil veri:
// yüklenemezse 0 gösterilir, sayfa akışı bozulmaz.
function useProfileStats(token) {
  const [stats, setStats] = useState({ commentCount: 0, likesReceived: 0, loading: true })
  useEffect(() => {
    if (!token) return undefined
    let alive = true
    getUserProfile(token)
      .then(res => { if (alive) setStats({ commentCount: res?.commentCount ?? 0, likesReceived: res?.likesReceived ?? 0, loading: false }) })
      .catch(() => { if (alive) setStats(s => ({ ...s, loading: false })) })
    return () => { alive = false }
  }, [token])
  return stats
}

// Üye olunan gruplar paylaşımlı önbellekten (bkz. services/myGroups.js);
// ayrılınca useGroupMembership önbelleği düşürür, liste kendiliğinden tazelenir.
function useMyGroupsList() {
  const groups = useMyDiseaseGroups()
  return { groups: groups ?? [], loading: groups === null }
}

function PostsSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Gönderiler yükleniyor">
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </Box>
  )
}

/**
 * Kendi profilin: kimlik kartı (yol arkadaşın, isim, istatistikler, sıradaki
 * yol arkadaşı ipucu) üstte, altında Gönderiler / Kaydedilenler / Gruplarım
 * sekmeleri. Hesap ayarları ayrı ekranda (/profile/settings, dişli ikonu).
 */
export default function Profile() {
  const { token, user } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()
  const [activeTab, setTab] = useProfileTab()
  const [editOpen, setEditOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const openPicker = useCallback(() => setPickerOpen(true), [])
  const closePicker = useCallback(() => setPickerOpen(false), [])

  const stats = useProfileStats(token)
  const myGroups = useMyGroupsList()
  const { leave, pendingId } = useGroupMembership()

  const postsFetcher = useCallback((page, { signal } = {}) => getMyPosts(token, { page, signal }), [token])
  const posts = usePaginatedList(postsFetcher, {
    enabled: !!token,
    deps: [token],
    cacheKey: token ? 'profile:posts' : null,
    onError: err => showError(err.message || 'Gönderilerin alınamadı. Biraz sonra tekrar dener misin?')
  })

  const savedFetcher = useCallback((page, { signal } = {}) => getMySavedPosts(token, { page, signal }), [token])
  const saved = usePaginatedList(savedFetcher, {
    enabled: activeTab === 'saved' && !!token,
    once: true,
    deps: [token],
    cacheKey: token ? 'profile:saved' : null,
    onError: err => showError(err.message || 'Kaydettiğin gönderiler alınamadı. Biraz sonra tekrar dener misin?')
  })

  // Ayrılma başarılıysa paylaşımlı önbellek düşer ve liste yeniden çekilir.
  const handleLeave = (group) => leave(group)

  const pageSx = { width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 1.5, md: 4 } }

  if (!user) {
    return (
      <Box sx={pageSx}>
        <ProfileHeaderSkeleton />
        <Skeleton variant="rounded" height={48} sx={{ my: 2.5 }} />
        <PostsSkeleton />
      </Box>
    )
  }

  const fullName = fullNameOf(user, 'Kullanıcı')
  const hasGroups = myGroups.groups.length > 0

  return (
    <Box className="page-transition" sx={pageSx}>
      <AvatarUnlockWatcher />

      <ProfileHeader
        avatar={<ProfileAvatar avatarKey={user.avatarKey} name={fullName} onEdit={openPicker} />}
        name={fullName}
        badge={user.emailVerified ? <VerifiedBadge /> : (
          <Chip
            label="E-postanı doğrula"
            size="small" color="warning" variant="outlined"
            onClick={() => navigate('/profile/settings')}
            sx={{ height: 28 }}
          />
        )}
        summary={<HealthSummary profile={user} />}
        bio={user.bio}
        topRight={(
          <IconButton
            onClick={() => navigate('/profile/settings')}
            aria-label="Ayarlar"
            sx={{ width: 44, height: 44, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
          >
            <SettingsOutlined />
          </IconButton>
        )}
        stats={(
          <StatStrip>
            <ProfileStat value={posts.totalCount} label="Gönderi" onClick={() => setTab('posts')} loading={posts.loading} />
            <ProfileStat value={stats.commentCount} label="Yorum" loading={stats.loading} />
            <ProfileStat value={myGroups.groups.length} label="Grup" onClick={() => setTab('groups')} loading={myGroups.loading} />
            <ProfileStat value={stats.likesReceived} label="Faydalı" highlight loading={stats.loading} />
          </StatStrip>
        )}
      >
        <HelpfulHint userId={user.id} onOpen={openPicker} />
        {!editOpen && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EditOutlined />}
            onClick={() => setEditOpen(true)}
            sx={{ mt: 2, maxWidth: { md: 240 } }}
          >
            Profili düzenle
          </Button>
        )}
      </ProfileHeader>

      <Collapse in={editOpen} unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <ProfileEditForm onDone={() => setEditOpen(false)} onEditAvatar={openPicker} />
        </Box>
      </Collapse>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        aria-label="Profil bölümleri"
        sx={{
          mt: 2.5, mb: 2, borderBottom: '1px solid', borderColor: 'divider', minHeight: 48,
          '& .MuiTab-root': { minHeight: 48, minWidth: 0, px: 1 },
          '& .MuiTab-icon': { display: { xs: 'none', sm: 'inline-flex' } }
        }}
      >
        {TABS.map(t => {
          const Icon = t.icon
          return <Tab key={t.key} value={t.key} icon={<Icon sx={{ fontSize: 18 }} />} iconPosition="start" label={t.label} />
        })}
      </Tabs>

      {activeTab === 'posts' && (
        posts.loading ? <PostsSkeleton /> : posts.items.length === 0 ? (
          <CompanionEmpty
            companion="filiz"
            title="Hikâyen burada büyüyecek"
            description="Bir deneyimini ya da sorunu paylaştığında burada görünür. Küçük bir paylaşım bile birine yol gösterebilir."
            actionLabel={hasGroups ? 'Gruplarıma git' : 'Grupları keşfet'}
            onAction={() => (hasGroups ? setTab('groups') : navigate('/groups'))}
            dense
          />
        ) : (
          <>
            <PostList posts={posts.items} token={token} showPinnedBadge />
            {!posts.last && <LoadMoreButton loading={posts.loadingMore} onClick={posts.loadMore} />}
          </>
        )
      )}

      {activeTab === 'saved' && (
        saved.loading ? <PostsSkeleton /> : saved.items.length === 0 ? (
          <CompanionEmpty
            companion="baykus"
            title="Kaydettiğin gönderi yok"
            description="Sonra yeniden okumak istediğin bir gönderide yer imi simgesine dokun; burada seni bekler."
            dense
          />
        ) : (
          <>
            <PostList posts={saved.items} token={token} />
            {!saved.last && <LoadMoreButton loading={saved.loadingMore} onClick={saved.loadMore} />}
          </>
        )
      )}

      {activeTab === 'groups' && (
        <Box>
          {myGroups.loading ? (
            <Stack spacing={1} aria-busy="true" aria-label="Grupların yükleniyor">
              {[0, 1, 2].map(i => <MyGroupRowSkeleton key={i} />)}
            </Stack>
          ) : !hasGroups ? (
            <CompanionEmpty
              companion="kaplumbaga"
              title="Henüz bir gruba katılmadın"
              description="Seninle aynı süreçten geçen insanlar bir hastalık grubunda buluşuyor. Sana uygun olanı bul, selam ver."
              actionLabel="Grupları keşfet"
              onAction={() => navigate('/groups')}
              dense
            />
          ) : (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25, px: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {myGroups.groups.length} gruba üyesin
                </Typography>
                <Button size="small" startIcon={<ExploreOutlined />} onClick={() => navigate('/groups')} sx={{ minHeight: 44 }}>
                  Keşfet
                </Button>
              </Stack>
              <Stack spacing={1} component="ul" className="sg-stagger" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {myGroups.groups.map(g => (
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

      <AvatarPicker open={pickerOpen} onClose={closePicker} />
    </Box>
  )
}
