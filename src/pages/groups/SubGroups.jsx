import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Skeleton, Stack, Typography } from '@mui/material'
import { CheckRounded, PeopleAltRounded } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { getDiseaseGroup, getMyDiseaseGroups, listSubGroups, listDiseaseGroupMembers } from '../../services/api.js'
import { useGroupMembership } from '../../hooks/useGroupMembership.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { goToUserProfile } from '../../utils/navigation.js'
import EmptyState from '../../components/EmptyState.jsx'
import NewPostDialog from '../../components/NewPostDialog.jsx'
import ComposerPrompt from '../../components/ComposerPrompt.jsx'
import BackLink from '../../components/common/BackLink.jsx'
import SubGroupCard, { SubGroupCardSkeleton } from '../../components/groups/SubGroupCard.jsx'
import GroupIcon from '../../components/groups/GroupIcon.jsx'
import GroupMembersDialog from '../../components/groups/GroupMembersDialog.jsx'

// Grup, alt grupları ve kullanıcının üyeliği tek seferde yüklenir.
// joined: null = üyelik bilinmiyor (istek düştü) - yanlış durum göstermek
// yerine katıl/ayrıl düğmesi hiç gösterilmez.
function useDiseaseGroupPage(groupId) {
  const { token } = useAuth()
  const [state, setState] = useState({ group: null, subGroups: [], joined: null, loading: true, error: '' })

  useEffect(() => {
    if (!token || !groupId) { setState(s => ({ ...s, loading: false })); return undefined }
    let alive = true
    setState(s => ({ ...s, loading: true, error: '' }))
    Promise.all([
      getDiseaseGroup(token, groupId),
      listSubGroups(token, groupId),
      getMyDiseaseGroups(token).catch(() => null)
    ])
      .then(([group, subs, mine]) => {
        if (!alive) return
        setState({
          group,
          subGroups: Array.isArray(subs) ? subs : [],
          joined: Array.isArray(mine) ? mine.some(g => String(g.id) === String(groupId)) : null,
          loading: false,
          error: ''
        })
      })
      .catch(err => { if (alive) setState(s => ({ ...s, loading: false, error: err.message || 'Alt gruplar alınamadı.' })) })
    return () => { alive = false }
  }, [token, groupId])

  const update = useCallback((patch) => setState(s => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })), [])
  return [state, update]
}

// Bir hastalık grubunun sayfası: açıklama, üyelik, üye listesi ve alt gruplar (forumlar).
export default function SubGroups() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { token, user: currentUser } = useAuth()
  const { showError } = useNotification()
  const { join, leave, pendingId } = useGroupMembership()
  const [{ group, subGroups, joined, loading, error }, update] = useDiseaseGroupPage(groupId)
  const [composerOpen, setComposerOpen] = useState(false)

  // Üye listesi "Üyeleri Gör" ile ilk açılışta yüklenir ve önbellekte kalır
  // (kalabalık gruplarda sayfalı).
  const [membersOpen, setMembersOpen] = useState(false)
  const membersFetcher = useCallback((page) => listDiseaseGroupMembers(token, groupId, { page }), [token, groupId])
  const members = usePaginatedList(membersFetcher, {
    enabled: membersOpen,
    once: true,
    deps: [token, groupId],
    onError: err => showError(err.message || 'Üyeler alınamadı.')
  })

  const toggleMembership = async () => {
    if (!group) return
    const ok = joined ? await leave(group) : await join(group)
    if (!ok) return
    const delta = joined ? -1 : 1
    update(s => ({ joined: !s.joined, group: { ...s.group, memberCount: Math.max(0, (s.group.memberCount ?? 0) + delta) } }))
    // Üye listesi (önbellekteyse) artık eksik/fazla: tazele.
    members.reload()
  }

  const openProfile = (userId) => {
    setMembersOpen(false)
    goToUserProfile(navigate, currentUser, userId)
  }

  const onPostCreated = (_, target) => update(s => ({
    subGroups: s.subGroups.map(sg => (
      String(sg.id) === String(target.subGroupId) ? { ...sg, postCount: (sg.postCount ?? 0) + 1 } : sg
    ))
  }))

  if (loading) return <SubGroupsSkeleton />

  const membershipPending = !!group && pendingId === group.id

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <BackLink to="/groups" label="Tüm gruplar" />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {group && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <GroupIcon size={52} iconSize={28} />
            <Typography variant="h3" component="h1" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
              {group.name}
            </Typography>
          </Stack>
          {group.description && (
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1.5, maxWidth: 580 }}>
              {group.description}
            </Typography>
          )}
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            {joined !== null && (
              <Button
                variant={joined ? 'outlined' : 'contained'}
                disabled={membershipPending}
                onClick={toggleMembership}
                startIcon={joined && !membershipPending ? <CheckRounded /> : undefined}
                aria-label={joined ? `${group.name} grubundan ayrıl` : `${group.name} grubuna katıl`}
                sx={{ minHeight: 44, minWidth: 110, ...(joined ? { color: 'primary.main', borderColor: 'primary.light' } : {}) }}
              >
                {membershipPending ? <CircularProgress size={16} color="inherit" aria-label="İşleniyor" /> : (joined ? 'Üyesin' : 'Katıl')}
              </Button>
            )}
            <Button
              startIcon={<PeopleAltRounded />}
              onClick={() => setMembersOpen(true)}
              sx={{ minHeight: 44, color: 'text.secondary' }}
            >
              {group.memberCount ?? 0} üye · Üyeleri Gör
            </Button>
          </Stack>
          {joined === false && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.25, maxWidth: 560 }}>
              Katılınca bu gruptaki paylaşımlar akışına gelir; soru sorabilir, yorum yazabilir ve deneyimini paylaşabilirsin.
            </Typography>
          )}
        </Box>
      )}

      {group && joined === true && (
        <ComposerPrompt onClick={() => setComposerOpen(true)} hint={`${group.name} grubunda paylaş…`} sx={{ mb: 3 }} />
      )}

      <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>
        Alt gruplar
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.75 }}>
        Grubun içindeki konu köşeleri. Merak ettiğin konuya en yakın olanı seç.
      </Typography>

      {subGroups.length === 0 && !error ? (
        <EmptyState
          companion="kaplumbaga"
          dense
          title="Bu grupta henüz alt grup yok"
          description="Konu köşeleri açıldığında burada göreceksin."
        />
      ) : (
        <Stack spacing={1.25} className="sg-stagger">
          {subGroups.map(sub => (
            <SubGroupCard key={sub.id} subGroup={sub} onOpen={() => navigate(`/sub-groups/${sub.id}`)} />
          ))}
        </Stack>
      )}

      <GroupMembersDialog
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        members={members.items}
        loading={members.loading}
        loadingMore={members.loadingMore}
        hasMore={!members.last}
        onLoadMore={members.loadMore}
        onOpenProfile={openProfile}
      />
      {group && (
        <NewPostDialog
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          presetDiseaseGroupId={group.id}
          presetDiseaseGroupName={group.name}
          onCreated={onPostCreated}
        />
      )}
    </Box>
  )
}

// Grup sayfası yüklenirken: başlık, düğmeler ve alt grup kartlarının taslağı.
function SubGroupsSkeleton() {
  return (
    <Box role="status" aria-label="Grup yükleniyor" sx={{ py: { xs: 2, md: 4 } }}>
      <Skeleton variant="rounded" width={130} height={36} sx={{ borderRadius: 999, mb: 2 }} />
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
        <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: '17px' }} />
        <Skeleton variant="text" width="60%" sx={{ fontSize: '2rem' }} />
      </Stack>
      <Skeleton variant="text" width="95%" />
      <Skeleton variant="text" width="70%" sx={{ mb: 1.5 }} />
      <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
        <Skeleton variant="rounded" width={110} height={44} sx={{ borderRadius: 999 }} />
        <Skeleton variant="rounded" width={170} height={44} sx={{ borderRadius: 999 }} />
      </Stack>
      <Skeleton variant="text" width={160} sx={{ fontSize: '1.6rem', mb: 1.5 }} />
      <Stack spacing={1.25}>
        {[0, 1, 2].map(i => <SubGroupCardSkeleton key={i} />)}
      </Stack>
    </Box>
  )
}
