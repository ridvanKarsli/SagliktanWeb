import { useEffect, useState } from 'react'
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, Stack, Typography
} from '@mui/material'
import { ArrowBack, ChatBubbleOutlineRounded, CloseRounded, ForumRounded, PeopleAltRounded } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { getDiseaseGroup, listSubGroups, listDiseaseGroupMembers } from '../../services/api.js'

function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}

export default function SubGroups() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { token, user: currentUser } = useAuth()
  const { showError } = useNotification()

  const [group, setGroup] = useState(null)
  const [subGroups, setSubGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Gruba kayıtlı üyelerin listesi - "Üyeleri Gör" tıklanınca yükleniyor.
  const [membersOpen, setMembersOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    if (!token || !groupId) { setLoading(false); return }
    setLoading(true)
    setError('')
    Promise.all([
      getDiseaseGroup(token, groupId),
      listSubGroups(token, groupId)
    ])
      .then(([groupData, subs]) => {
        if (!mounted) return
        setGroup(groupData)
        setSubGroups(Array.isArray(subs) ? subs : [])
      })
      .catch(err => {
        if (!mounted) return
        setError(err.message || 'Alt gruplar alınamadı.')
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [token, groupId])

  const goToProfile = (userId) => {
    setMembersOpen(false)
    if (currentUser && String(currentUser.id) === String(userId)) {
      navigate('/profile')
    } else {
      navigate(`/users/${userId}`)
    }
  }

  const openMembers = async () => {
    setMembersOpen(true)
    if (members.length > 0) return
    setMembersLoading(true)
    try {
      const data = await listDiseaseGroupMembers(token, groupId)
      setMembers(Array.isArray(data) ? data : [])
    } catch (err) {
      showError(err.message || 'Üyeler alınamadı.')
    } finally {
      setMembersLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300, py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate('/groups')} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Hastalık Grupları
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {group && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {group.name}
          </Typography>
          {group.description && (
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
              {group.description}
            </Typography>
          )}
          <Button
            size="small"
            startIcon={<PeopleAltRounded />}
            onClick={openMembers}
            sx={{ color: 'text.secondary', pl: 0, '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}
          >
            {group.memberCount ?? 0} üye · Üyeleri Gör
          </Button>
        </Box>
      )}

      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1.5 }}>
        Alt Gruplar
      </Typography>

      {subGroups.length === 0 && !error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Bu grupta henüz alt grup (forum) yok.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {subGroups.map(sub => (
            <Box
              key={sub.id}
              onClick={() => navigate(`/sub-groups/${sub.id}`)}
              className="tap-scale"
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' }
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                    display: 'grid', placeItems: 'center',
                    bgcolor: 'rgba(217,119,87,0.15)', color: 'secondary.main'
                  }}
                >
                  <ForumRounded />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                    {sub.name}
                  </Typography>
                  {sub.description && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                    >
                      {sub.description}
                    </Typography>
                  )}
                </Box>
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<ChatBubbleOutlineRounded sx={{ fontSize: '15px !important' }} />}
                  label={`${sub.postCount ?? 0} sohbet`}
                  sx={{ flexShrink: 0, color: 'text.secondary', borderColor: 'divider' }}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={membersOpen} onClose={() => setMembersOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Üyeler
          <IconButton size="small" onClick={() => setMembersOpen(false)}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {membersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={22} />
            </Box>
          ) : members.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Henüz üye yok.
              </Typography>
            </Box>
          ) : (
            <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
              {members.map(m => {
                const fullName = [m.firstName, m.lastName].filter(Boolean).join(' ') || 'Kullanıcı'
                return (
                  <Stack
                    key={m.id}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    onClick={() => goToProfile(m.id)}
                    sx={{ px: 2, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 600 }}>
                      {initialsFrom(fullName)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
                      {fullName}
                    </Typography>
                  </Stack>
                )
              })}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
