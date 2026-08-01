import { useCallback, useEffect, useState } from 'react'
import {
  Alert, Box, Button, Chip, CircularProgress, Stack, Typography
} from '@mui/material'
import { GroupsRounded, PeopleAltRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import {
  listDiseaseGroups, getMyDiseaseGroups, joinDiseaseGroup, leaveDiseaseGroup
} from '../../services/api.js'

/**
 * Uygulamanın giriş sonrası ana sayfası: tüm hastalık gruplarını listeler,
 * kullanıcının katıldığı grupları işaretler, katıl/ayrıl aksiyonu sunar.
 */
export default function DiseaseGroups() {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [joinedIds, setJoinedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingId, setPendingId] = useState(null)

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const [all, mine] = await Promise.all([
        listDiseaseGroups(token),
        getMyDiseaseGroups(token)
      ])
      setGroups(Array.isArray(all) ? all : [])
      setJoinedIds(new Set((Array.isArray(mine) ? mine : []).map(g => g.id)))
    } catch (err) {
      setError(err.message || 'Hastalık grupları alınamadı.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const handleJoin = async (e, groupId) => {
    e.stopPropagation()
    if (!token) return
    setPendingId(groupId)
    try {
      await joinDiseaseGroup(token, groupId)
      setJoinedIds(prev => new Set(prev).add(groupId))
      showSuccess('Gruba katıldınız.')
    } catch (err) {
      showError(err.message || 'Gruba katılınamadı.')
    } finally {
      setPendingId(null)
    }
  }

  const handleLeave = async (e, groupId) => {
    e.stopPropagation()
    if (!token) return
    setPendingId(groupId)
    try {
      await leaveDiseaseGroup(token, groupId)
      setJoinedIds(prev => {
        const next = new Set(prev)
        next.delete(groupId)
        return next
      })
      showSuccess('Gruptan ayrıldınız.')
    } catch (err) {
      showError(err.message || 'Gruptan ayrılınamadı.')
    } finally {
      setPendingId(null)
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
      <Box sx={{ mb: 3, px: { xs: 0.5, md: 0 } }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Hastalık Grupları
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          İlgilendiğin gruplara katıl, alt forumlarını keşfet.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {groups.length === 0 && !error ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Henüz hiç hastalık grubu yok.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1.5
          }}
        >
          {groups.map(group => {
            const joined = joinedIds.has(group.id)
            const pending = pendingId === group.id
            return (
              <Box
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="tap-scale"
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: joined ? 'primary.main' : 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { bgcolor: 'action.hover', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }
                }}
              >
                <Stack direction="row" spacing={1.75} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                      display: 'grid', placeItems: 'center',
                      background: 'linear-gradient(135deg, rgba(76,184,159,0.22), rgba(224,139,109,0.14))',
                      color: 'primary.main'
                    }}
                  >
                    <GroupsRounded sx={{ fontSize: 26 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.25 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word' }}>
                        {group.name}
                      </Typography>
                      {joined && (
                        <Chip label="Katıldın" size="small" color="primary" variant="filled" sx={{ height: 20 }} />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.75 }}>
                      <PeopleAltRounded sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {group.memberCount ?? 0} üye
                      </Typography>
                    </Stack>
                    {group.description && (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', mb: 1.25 }}
                      >
                        {group.description}
                      </Typography>
                    )}
                    <Button
                      variant={joined ? 'outlined' : 'contained'}
                      size="small"
                      fullWidth
                      disabled={pending}
                      onClick={(e) => (joined ? handleLeave(e, group.id) : handleJoin(e, group.id))}
                      sx={{ borderRadius: 5, minHeight: 36 }}
                    >
                      {pending ? <CircularProgress size={16} color="inherit" /> : (joined ? 'Ayrıl' : 'Katıl')}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
