import { useEffect, useState } from 'react'
import { Box, Button, ButtonBase, IconButton, Skeleton, Stack, Typography } from '@mui/material'
import { CloseRounded, Diversity3Rounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getSimilarMembers } from '../services/api.js'
import { healthSummaryParts } from '../utils/communityProfile.js'
import UserAvatar from './avatars/UserAvatar.jsx'

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
      <Box sx={{ position: 'relative', p: 2, pr: 6, borderRadius: '22px', bgcolor: 'brand.apricotSoft', ...sx }}>
        <IconButton
          aria-label="Bu öneriyi kapat"
          onClick={() => { try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* yoksay */ } setDismissed(true) }}
          sx={{ position: 'absolute', top: 6, right: 6, width: 44, height: 44 }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <UserAvatar avatarKey="kirpi" size={48} aria-hidden sx={{ flexShrink: 0 }} />
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontFamily: (t) => t.typography.h5.fontFamily, fontWeight: 700, lineHeight: 1.3 }}>Senin gibi olanlarla tanış</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Benzer yoldan geçen üyeleri görmek için profilinde görünür olmayı açabilirsin. Bilgilerin, sen açmadıkça kimseyle paylaşılmaz.
            </Typography>
            <Button size="small" variant="outlined" onClick={() => navigate('/profile/settings#eslesme')} sx={{ mt: 1.25, minHeight: 44, bgcolor: 'background.paper' }}>
              Ayarları aç
            </Button>
          </Box>
        </Stack>
      </Box>
    )
  }

  if (members !== null && members.length === 0) return null

  return (
    <Box component="section" aria-labelledby="similar-members-title" sx={{ py: 1, ...sx }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25, px: 0.5 }}>
        <Diversity3Rounded sx={{ color: 'brand.apricotInk', fontSize: 22 }} />
        <Typography id="similar-members-title" variant="h6" component="h2" sx={{ fontFamily: (t) => t.typography.h5.fontFamily, fontWeight: 700 }}>Senin gibi üyeler</Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.25, px: 0.5 }}>
        Benzer bir yoldan geçiyorlar. Bir merhaba, iki kişinin de gününü güzelleştirebilir.
      </Typography>
      <Box
        sx={{
          display: 'flex', alignItems: 'stretch', gap: 1.25, overflowX: 'auto', mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 }, pb: 1, scrollSnapType: 'x mandatory',
          scrollPaddingLeft: 16, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {members === null
          ? [0, 1, 2].map(i => <Skeleton key={i} variant="rounded" width={196} height={176} sx={{ borderRadius: '20px', flexShrink: 0 }} />)
          : members.map(m => {
            const name = [m.firstName, m.lastName].filter(Boolean).join(' ')
            const summary = healthSummaryParts(m)
            return (
              <ButtonBase
                key={m.id}
                onClick={() => navigate(`/users/${m.id}`)}
                aria-label={`${name} profiline git`}
                className="tap-scale"
                sx={{
                  width: 196, flexShrink: 0, scrollSnapAlign: 'start', p: 1.75, borderRadius: '20px',
                  flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left', gap: 0.75,
                  overflow: 'hidden',
                  border: '1px solid', borderColor: 'brand.border', bgcolor: 'background.paper', boxShadow: 1,
                  transition: 'border-color 200ms ease, box-shadow 240ms ease, transform 160ms var(--ease-spring)',
                  '&:hover': { borderColor: 'primary.light', boxShadow: 3 },
                  '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 }
                }}
              >
                <UserAvatar avatarKey={m.avatarKey} name={name} size={52} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, width: '100%', color: 'text.primary' }} noWrap>{name}</Typography>
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
                  <Box
                    component="span"
                    sx={{
                      mt: 'auto', px: 1, py: 0.25, borderRadius: '999px', bgcolor: 'brand.apricotSoft', color: 'brand.apricotInk',
                      fontSize: '0.8125rem', fontWeight: 800, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}
                  >
                    {m.reasons[0]}
                  </Box>
                )}
              </ButtonBase>
            )
          })}
      </Box>
    </Box>
  )
}
