import { useCallback, useEffect, useState } from 'react'
import {
  Alert, Box, Button, Chip, CircularProgress, Stack, Typography
} from '@mui/material'
import { GroupsRounded } from '@mui/icons-material'
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
        <Stack spacing={1.5}>
          {groups.map(group => {
            const joined = joinedIds.has(group.id)
            const pending = pendingId === group.id
            return (
              <Box
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
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
                      width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                      display: 'grid', placeItems: 'center',
                      bgcolor: 'rgba(63,156,135,0.12)', color: 'primary.main'
                    }}
                  >
                    <GroupsRounded />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                        {group.name}
                      </Typography>
                      {joined && (
                        <Chip label="Katıldın" size="small" color="primary" variant="filled" sx={{ height: 20 }} />
                      )}
                    </Stack>
                    {group.description && (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                      >
                        {group.description}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant={joined ? 'outlined' : 'contained'}
                    size="small"
                    disabled={pending}
                    onClick={(e) => (joined ? handleLeave(e, group.id) : handleJoin(e, group.id))}
                    sx={{ flexShrink: 0, minWidth: { xs: 76, sm: 90 } }}
                  >
                    {pending ? <CircularProgress size={16} color="inherit" /> : (joined ? 'Ayrıl' : 'Katıl')}
                  </Button>
                </Stack>
              </Box>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}
