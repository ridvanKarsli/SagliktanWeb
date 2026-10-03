import { useCallback, useEffect, useState } from 'react'
import { Avatar, Box, Button, Chip, Collapse, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material'
import {
  BookmarkBorderRounded, DynamicFeedRounded, EditOutlined, ExploreOutlined, GroupsRounded, SettingsOutlined
} from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import HealthSummary from '../../components/profile/HealthSummary.jsx'
import ProfileStat from '../../components/profile/ProfileStat.jsx'
import ProfileEditForm from '../../components/profile/ProfileEditForm.jsx'
import MyGroupRow from '../../components/profile/MyGroupRow.jsx'
import PostList from '../../components/PostList.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import CenteredSpinner from '../../components/common/CenteredSpinner.jsx'
import LoadMoreButton from '../../components/common/LoadMoreButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { getMyDiseaseGroups, getMyPosts, getMySavedPosts, getUserProfile } from '../../services/api.js'
import { initialsFrom } from '../../utils/format.js'
import { fullNameOf } from '../../utils/text.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { useGroupMembership } from '../../hooks/useGroupMembership.js'

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
  const [stats, setStats] = useState({ commentCount: 0, likesReceived: 0 })
  useEffect(() => {
    if (!token) return undefined
    let alive = true
    getUserProfile(token)
      .then(res => { if (alive) setStats({ commentCount: res?.commentCount ?? 0, likesReceived: res?.likesReceived ?? 0 }) })
      .catch(() => {})
    return () => { alive = false }
  }, [token])
  return stats
}

function useMyGroupsList(token, showError) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!token) { setLoading(false); return undefined }
    let alive = true
    getMyDiseaseGroups(token)
      .then(data => { if (alive) setGroups(Array.isArray(data) ? data : []) })
      .catch(err => { if (alive) showError(err.message || 'Gruplar alınamadı.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [token, showError])
  return { groups, setGroups, loading }
}

/**
 * Kendi profilin: kimlik bloğu (avatar/isim/istatistik/bio) üstte, altında
 * Gönderiler / Kaydedilenler / Gruplarım sekmeleri. Hesap ayarları ayrı
 * ekranda (/profile/settings, dişli ikonu).
 */
export default function Profile() {
  const { token, user } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()
  const [activeTab, setTab] = useProfileTab()
  const [editOpen, setEditOpen] = useState(false)

  const stats = useProfileStats(token)
  const myGroups = useMyGroupsList(token, showError)
  const { leave, pendingId } = useGroupMembership()

  const postsFetcher = useCallback((page) => getMyPosts(token, { page }), [token])
  const posts = usePaginatedList(postsFetcher, {
    enabled: !!token,
    deps: [token],
    onError: err => showError(err.message || 'Gönderilerin alınamadı.')
  })

  const savedFetcher = useCallback((page) => getMySavedPosts(token, { page }), [token])
  const saved = usePaginatedList(savedFetcher, {
    enabled: activeTab === 'saved' && !!token,
    once: true,
    deps: [token],
    onError: err => showError(err.message || 'Kaydedilen gönderiler alınamadı.')
  })

  const handleLeave = async (group) => {
    if (await leave(group)) myGroups.setGroups(prev => prev.filter(g => g.id !== group.id))
  }

  if (!user) return <CenteredSpinner page />

  const fullName = fullNameOf(user, 'Kullanıcı')
  const hasGroups = myGroups.groups.length > 0

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
              <ProfileStat value={posts.totalCount} label="Gönderi" onClick={() => setTab('posts')} />
              <ProfileStat value={stats.commentCount} label="Yorum" />
              <ProfileStat value={myGroups.groups.length} label="Grup" onClick={() => setTab('groups')} />
              <ProfileStat value={stats.likesReceived} label="Faydalı" highlight />
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

        <HealthSummary profile={user} sx={{ mt: 1.25 }} />
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

      <Collapse in={editOpen} unmountOnExit>
        <Box sx={{ px: { xs: 0.5, md: 0 }, mb: 3 }}>
          <ProfileEditForm onDone={() => setEditOpen(false)} />
        </Box>
      </Collapse>

      <Tabs
        value={activeTab}
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

      {activeTab === 'posts' && (
        posts.loading ? <CenteredSpinner /> : posts.items.length === 0 ? (
          <EmptyState
            icon={DynamicFeedRounded}
            title="Henüz gönderin yok."
            description="Bir alt gruba girip deneyimini paylaşarak başlayabilirsin."
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
        saved.loading ? <CenteredSpinner /> : saved.items.length === 0 ? (
          <EmptyState
            icon={BookmarkBorderRounded}
            title="Kaydettiğin gönderi yok."
            description="Gönderilerdeki yer imi simgesine dokunarak sonra okumak için kaydedebilirsin."
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
        <Box sx={{ px: { xs: 0.5, md: 0 } }}>
          {myGroups.loading ? <CenteredSpinner /> : !hasGroups ? (
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
                  {myGroups.groups.length} gruba üyesin
                </Typography>
                <Button size="small" startIcon={<ExploreOutlined />} onClick={() => navigate('/groups')} sx={{ minHeight: 40 }}>
                  Keşfet
                </Button>
              </Stack>
              <Stack spacing={1} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
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
    </Box>
  )
}
