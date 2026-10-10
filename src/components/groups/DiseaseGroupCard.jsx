import { Box, Button, CircularProgress, Skeleton, Stack, Typography } from '@mui/material'
import { CheckCircleRounded, PeopleAltRounded } from '@mui/icons-material'
import GroupIcon from './GroupIcon.jsx'
import { cardActivationProps } from '../../utils/clickable.js'
import { focusRingSx } from '../../design/focus.js'

const groupCardSx = {
  p: { xs: 2, sm: 2.25 },
  borderRadius: '22px',
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'brand.border',
  boxShadow: 1,
}

// Grup listesindeki kart: kartın kendisi gruba girer (birincil eylem),
// Katıl/Ayrıl altta ikincil bir buton. Katıldığın gruplar yeşil bir
// "Katıldın" rozetiyle (ikon + metin) ve ince yeşil kenarla belli olur.
export default function DiseaseGroupCard({ group, joined, pending, onOpen, onJoin, onLeave }) {
  const handleMembership = (e) => {
    e.stopPropagation()
    if (joined) onLeave(group); else onJoin(group)
  }

  return (
    <Box
      {...cardActivationProps(onOpen, group.name)}
      className="tap-scale"
      sx={{
        ...groupCardSx,
        display: 'flex', flexDirection: 'column', gap: 1.25,
        borderColor: joined ? 'primary.light' : 'brand.border',
        cursor: 'pointer',
        transition: 'border-color 200ms ease, box-shadow 240ms ease, transform 160ms var(--ease-spring)',
        '@media (hover: hover)': { '&:hover': { boxShadow: 3, borderColor: joined ? 'primary.main' : 'brand.borderStrong' } },
        '&:focus-visible': focusRingSx
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <GroupIcon size={50} iconSize={26} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{ fontFamily: (t) => t.typography.h5.fontFamily, fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.3, color: 'text.primary', wordBreak: 'break-word' }}
          >
            {group.name}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary', mt: 0.25 }}>
            <PeopleAltRounded sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 700 }}>
              {group.memberCount ?? 0} üye
            </Typography>
          </Stack>
        </Box>
      </Stack>
      {group.description && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
          }}
        >
          {group.description}
        </Typography>
      )}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 'auto', pt: 0.25 }}>
        {joined ? (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'primary.main' }}>
            <CheckCircleRounded sx={{ fontSize: 18 }} />
            <Typography component="span" variant="body2" sx={{ fontWeight: 800, color: 'inherit' }}>Katıldın</Typography>
          </Stack>
        ) : <Box />}
        <Button
          variant={joined ? 'text' : 'contained'}
          size="small"
          disabled={pending}
          onClick={handleMembership}
          sx={{ flexShrink: 0, minHeight: 44, minWidth: 92, px: 2.25 }}
        >
          {pending ? <CircularProgress size={16} color="inherit" aria-label="İşleniyor" /> : (joined ? 'Ayrıl' : 'Katıl')}
        </Button>
      </Stack>
    </Box>
  )
}

// Liste yüklenirken aynı ölçülerde taslak kart.
export function DiseaseGroupCardSkeleton() {
  return (
    <Box aria-hidden sx={{ ...groupCardSx, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Skeleton variant="rounded" width={50} height={50} sx={{ borderRadius: '16px' }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="65%" sx={{ fontSize: '1.2rem' }} />
          <Skeleton variant="text" width="30%" sx={{ fontSize: '0.8rem' }} />
        </Box>
      </Stack>
      <Box>
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="72%" />
      </Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" width={120} />
        <Skeleton variant="rounded" width={92} height={40} sx={{ borderRadius: 999 }} />
      </Stack>
    </Box>
  )
}
