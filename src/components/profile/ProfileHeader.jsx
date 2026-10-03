import { Box, ButtonBase, Skeleton, Stack, Typography } from '@mui/material'
import { AutoAwesomeRounded } from '@mui/icons-material'
import UserAvatar from '../avatars/UserAvatar.jsx'
import { radius } from '../../design/tokens.js'

const AVATAR_SIZE = { xs: 104, md: 116 }

// Profil kartının üstündeki "bahçe şeridi": düz, sakin bir yüzey; köşelerde
// birkaç küçük yaprak. Süs olduğu için ekran okuyucudan gizli.
function GardenBand({ children }) {
  return (
    <Box sx={{ position: 'relative', height: { xs: 84, md: 100 }, bgcolor: 'brand.surfaceAlt' }}>
      <Box
        component="svg"
        aria-hidden
        viewBox="0 0 360 100"
        preserveAspectRatio="xMidYMid slice"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: 'brand.primaryBright', opacity: 0.32 }}
      >
        <g fill="currentColor">
          <path d="M18 78 C26 62 40 58 50 62 C44 74 32 82 18 78Z" />
          <path d="M40 92 C44 80 54 74 62 76 C60 86 52 94 40 92Z" opacity="0.7" />
          <path d="M318 24 C328 12 342 10 350 16 C342 28 330 30 318 24Z" />
          <path d="M300 10 C306 2 316 0 322 4 C318 12 308 14 300 10Z" opacity="0.6" />
          <circle cx="282" cy="40" r="3" opacity="0.6" />
          <circle cx="78" cy="58" r="2.5" opacity="0.6" />
        </g>
      </Box>
      {children}
    </Box>
  )
}

/** Büyük profil görseli; onEdit verilirse dokunulabilir ve küçük bir ışıltı rozeti taşır. */
export function ProfileAvatar({ avatarKey, name, onEdit, editLabel = 'Yol arkadaşını değiştir' }) {
  const avatar = (
    <UserAvatar
      avatarKey={avatarKey}
      name={name}
      size={AVATAR_SIZE.xs}
      sx={{
        width: AVATAR_SIZE, height: AVATAR_SIZE, fontSize: { xs: 36, md: 40 },
        border: '4px solid', borderColor: 'background.paper', boxShadow: 3,
      }}
    />
  )
  if (!onEdit) return <Box sx={{ display: 'inline-flex', borderRadius: '50%' }}>{avatar}</Box>
  return (
    <ButtonBase
      onClick={onEdit}
      aria-label={editLabel}
      className="sg-sway-on-hover"
      sx={{
        position: 'relative', borderRadius: '50%',
        transition: 'transform 180ms var(--ease-spring)',
        '&:active': { transform: 'scale(0.95)' },
        '&.Mui-focusVisible': { boxShadow: theme => `0 0 0 4px ${theme.palette.brand.primaryBright}` },
      }}
    >
      <Box className="sg-sway-target" sx={{ borderRadius: '50%' }}>{avatar}</Box>
      <Box
        aria-hidden
        sx={{
          position: 'absolute', right: 0, bottom: 4, width: 34, height: 34, borderRadius: '50%',
          display: 'grid', placeItems: 'center',
          bgcolor: 'secondary.main', color: 'secondary.contrastText',
          border: '3px solid', borderColor: 'background.paper',
        }}
      >
        <AutoAwesomeRounded sx={{ fontSize: 17 }} />
      </Box>
    </ButtonBase>
  )
}

/**
 * Kendi profilin ve başkasının profili için ortak kimlik kartı. Mobilde
 * ortalı, geniş ekranda sola yaslı. topLeft/topRight şeridin köşelerine
 * (geri, ayarlar, menü), children kartın altına (ipucu, düğmeler) yerleşir.
 */
export default function ProfileHeader({ avatar, name, badge, summary, bio, stats, topLeft, topRight, children }) {
  return (
    <Box
      component="section"
      aria-label="Profil"
      sx={{
        borderRadius: { xs: `${radius.lg}px`, md: `${radius.xl}px` }, overflow: 'hidden',
        bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border',
      }}
    >
      <GardenBand>
        {topLeft && <Box sx={{ position: 'absolute', top: 8, left: 8 }}>{topLeft}</Box>}
        {topRight && <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>{topRight}</Box>}
      </GardenBand>
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2.5, md: 3 }, textAlign: { xs: 'center', md: 'left' } }}>
        <Box sx={{ mt: { xs: '-56px', md: '-62px' }, mb: 1.25, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
          {avatar}
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: 'center', md: 'flex-start' }}
          spacing={1}
          flexWrap="wrap"
          useFlexGap
        >
          <Typography variant="h2" component="h1" sx={{ wordBreak: 'break-word', fontSize: { xs: '1.75rem', md: '2rem' } }}>
            {name}
          </Typography>
          {badge}
        </Stack>
        {summary && <Box sx={{ mt: 1, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>{summary}</Box>}
        {bio && (
          <Typography
            variant="body1"
            sx={{
              color: 'text.primary', mt: 1.5, mx: { xs: 'auto', md: 0 }, maxWidth: 520,
              wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-line'
            }}
          >
            {bio}
          </Typography>
        )}
        {stats && <Box sx={{ mt: 2.25 }}>{stats}</Box>}
        {children}
      </Box>
    </Box>
  )
}

/** İstatistik şeridi: eşit sütunlar, aralarında ince çizgi. */
export function StatStrip({ children }) {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'stretch', justifyContent: { xs: 'space-around', md: 'flex-start' },
        gap: { md: 1 },
        '& > * + *': { borderLeft: '1px solid', borderColor: 'divider' },
      }}
    >
      {children}
    </Box>
  )
}

export function ProfileHeaderSkeleton({ withActions = true }) {
  return (
    <Box
      aria-busy="true"
      aria-label="Profil yükleniyor"
      sx={{ borderRadius: { xs: `${radius.lg}px`, md: `${radius.xl}px` }, overflow: 'hidden', bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border' }}
    >
      <Box sx={{ height: { xs: 84, md: 100 }, bgcolor: 'brand.surfaceAlt' }} />
      <Stack alignItems={{ xs: 'center', md: 'flex-start' }} sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
        <Box sx={{ mt: { xs: '-56px', md: '-62px' }, mb: 1.25, p: '4px', borderRadius: '50%', bgcolor: 'background.paper' }}>
          <Skeleton variant="circular" sx={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} />
        </Box>
        <Skeleton variant="text" sx={{ fontSize: '2rem', width: 200 }} />
        <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
          <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: `${radius.pill}px` }} />
          <Skeleton variant="rounded" width={70} height={28} sx={{ borderRadius: `${radius.pill}px` }} />
        </Stack>
        <Skeleton variant="text" sx={{ mt: 1.5, width: '80%', maxWidth: 420 }} />
        <Skeleton variant="text" sx={{ width: '60%', maxWidth: 320 }} />
        <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
          {[0, 1, 2, 3].map(i => (
            <Stack key={i} alignItems="center" spacing={0.25}>
              <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: 36 }} />
              <Skeleton variant="text" sx={{ width: 48 }} />
            </Stack>
          ))}
        </Stack>
        {withActions && <Skeleton variant="rounded" sx={{ mt: 2.5, height: 46, width: '100%', borderRadius: `${radius.pill}px` }} />}
      </Stack>
    </Box>
  )
}
