import { useEffect, useState } from 'react'
import { Avatar, Box, Button, ButtonBase, Chip, IconButton, Skeleton, Stack, Typography } from '@mui/material'
import { CloseRounded, Diversity3Rounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getSimilarMembers } from '../services/api.js'
import { healthSummaryParts } from '../utils/communityProfile.js'
import { initialsFrom } from '../utils/format.js'

const DISMISS_KEY = 'sagliktan:similar-invite-dismissed'

function readDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

/**
 * "Senin gibi üyeler": aynı gruplarda, benzer rol/tanı yılı/şehirdeki görünür
 * üyeler - yatay kaydırılan kartlar. Kullanıcı kendisi görünür değilse
 * (karşılıklılık) liste yerine kısa bir davet kartı gösterilir.
 */
export default function SimilarMembers({ sx }) {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [members, setMembers] = useState(null)
  const [dismissed, setDismissed] = useState(readDismissed)

  const discoverable = !!user?.discoverable

  useEffect(() => {
    if (!token || !discoverable) return
    const ctrl = new AbortController()
    getSimilarMembers(token, { limit: 8, signal: ctrl.signal })
      .then(list => setMembers(Array.isArray(list) ? list : []))
      .catch(() => setMembers([]))
    return () => ctrl.abort()
  }, [token, discoverable])

  if (!discoverable) {
    if (dismissed) return null
    return (
      <Box sx={{ position: 'relative', p: 2, pr: 5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', ...sx }}>
        <IconButton
          aria-label="Bu öneriyi kapat"
          onClick={() => { try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* yoksay */ } setDismissed(true) }}
          sx={{ position: 'absolute', top: 4, right: 4, width: 40, height: 40 }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Diversity3Rounded sx={{ color: 'primary.main', mt: 0.25 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Senin gibi olanlarla tanış</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              Benzer süreçteki üyeleri görmek için profilinde görünür olmayı aç. Bilgilerin sen açmadıkça kimseyle paylaşılmaz.
            </Typography>
            <Button size="small" onClick={() => navigate('/profile/settings#eslesme')} sx={{ mt: 1, ml: -1, fontWeight: 700, minHeight: 36 }}>
              Ayarları aç
            </Button>
          </Box>
        </Stack>
      </Box>
    )
  }

  if (members !== null && members.length === 0) return null

  return (
    <Box component="section" aria-labelledby="similar-members-title" sx={sx}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Diversity3Rounded sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography id="similar-members-title" variant="subtitle1" sx={{ fontWeight: 700 }}>Senin gibi üyeler</Typography>
      </Stack>
      <Box
        sx={{
          display: 'flex', alignItems: 'stretch', gap: 1.25, overflowX: 'auto', mx: -2, px: 2, pb: 1, scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {members === null
          ? [0, 1, 2].map(i => <Skeleton key={i} variant="rounded" width={200} height={168} sx={{ borderRadius: 3, flexShrink: 0 }} />)
          : members.map(m => {
            const name = [m.firstName, m.lastName].filter(Boolean).join(' ')
            const summary = healthSummaryParts(m)
            return (
              <ButtonBase
                key={m.id}
                onClick={() => navigate(`/users/${m.id}`)}
                aria-label={`${name} profiline git`}
                sx={{
                  width: 200, flexShrink: 0, scrollSnapAlign: 'start', p: 1.5, borderRadius: 3,
                  flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left', gap: 0.75,
                  overflow: 'hidden',
                  border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
                  '&:hover': { borderColor: 'primary.main' }
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                  <Avatar sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 700 }}>{initialsFrom(name)}</Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 0 }} noWrap>{name}</Typography>
                </Stack>
                {summary.length > 0 && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', width: '100%' }} noWrap title={summary.join(' · ')}>
                    {summary.join(' · ')}
                  </Typography>
                )}
                {m.sharedGroups?.[0] && (
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, width: '100%' }} noWrap>
                    {m.sharedGroups[0]}{m.sharedGroups.length > 1 ? ` +${m.sharedGroups.length - 1}` : ''}
                  </Typography>
                )}
                {m.reasons?.[0] && (
                  <Chip size="small" label={m.reasons[0]} sx={{ height: 24, maxWidth: '100%' }} />
                )}
              </ButtonBase>
            )
          })}
      </Box>
    </Box>
  )
}
