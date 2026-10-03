import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { ChatBubbleOutlineRounded, ChevronRightRounded } from '@mui/icons-material'
import GroupIcon from './GroupIcon.jsx'
import { cardActivationProps } from '../../utils/clickable.js'

const cardSx = {
  p: { xs: 1.75, sm: 2.25 },
  borderRadius: '20px',
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'brand.border',
  boxShadow: 1,
}

// Hastalık grubu sayfasındaki alt grup (forum) satırı. Kart bir başlık
// (heading) içerdiği için <button> değil, klavyeyle de açılabilen bir makale.
export default function SubGroupCard({ subGroup, onOpen }) {
  const count = subGroup.postCount ?? 0
  return (
    <Box
      {...cardActivationProps(onOpen, subGroup.name)}
      className="tap-scale"
      sx={{
        ...cardSx,
        cursor: 'pointer',
        transition: 'border-color 200ms ease, box-shadow 240ms ease, transform 160ms var(--ease-spring)',
        '@media (hover: hover)': { '&:hover': { boxShadow: 3, borderColor: 'brand.borderStrong' }, '&:hover .sg-chevron': { transform: 'translateX(3px)' } },
        '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 }
      }}
    >
      <Stack direction="row" spacing={1.75} alignItems="center">
        <GroupIcon variant="forum" size={46} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{ fontFamily: (t) => t.typography.h5.fontFamily, fontSize: '1.15rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3, overflowWrap: 'anywhere' }}
          >
            {subGroup.name}
          </Typography>
          {subGroup.description && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
            >
              {subGroup.description}
            </Typography>
          )}
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
            <ChatBubbleOutlineRounded sx={{ fontSize: 15 }} />
            <Typography
              variant="caption"
              data-testid={`subgroup-chat-count-${subGroup.name}`}
              sx={{ color: 'inherit', fontWeight: 700 }}
            >
              {`${count} sohbet`}
            </Typography>
          </Stack>
        </Box>
        <ChevronRightRounded className="sg-chevron" aria-hidden sx={{ color: 'text.secondary', transition: 'transform 200ms var(--ease-spring)' }} />
      </Stack>
    </Box>
  )
}

export function SubGroupCardSkeleton() {
  return (
    <Box aria-hidden sx={cardSx}>
      <Stack direction="row" spacing={1.75} alignItems="center">
        <Skeleton variant="rounded" width={46} height={46} sx={{ borderRadius: '15px' }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="45%" sx={{ fontSize: '1.15rem' }} />
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="22%" sx={{ fontSize: '0.8rem' }} />
        </Box>
      </Stack>
    </Box>
  )
}
