import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { PeopleAltRounded } from '@mui/icons-material'
import GroupIcon from './GroupIcon.jsx'
import { cardActivationProps } from '../../utils/clickable.js'

// Grup listesindeki kart: kartın kendisi gruba girer (birincil eylem),
// Katıl/Ayrıl sağda kompakt ikincil bir buton.
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
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: joined ? 'primary.main' : 'transparent',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { bgcolor: 'action.hover', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <GroupIcon size={46} iconSize={24} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word' }}>
              {group.name}
            </Typography>
            {joined && <Chip label="Katıldın" size="small" color="primary" variant="filled" sx={{ height: 24 }} />}
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PeopleAltRounded sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {group.memberCount ?? 0} üye
            </Typography>
          </Stack>
          {group.description && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical'
              }}
            >
              {group.description}
            </Typography>
          )}
        </Box>
        <Button
          variant={joined ? 'outlined' : 'contained'}
          size="small"
          disabled={pending}
          onClick={handleMembership}
          sx={{
            flexShrink: 0, borderRadius: 999, minHeight: 40, minWidth: 84, px: 1.75, alignSelf: 'center',
            ...(joined ? { color: 'text.secondary', borderColor: 'divider' } : {})
          }}
        >
          {pending ? <CircularProgress size={16} color="inherit" /> : (joined ? 'Ayrıl' : 'Katıl')}
        </Button>
      </Stack>
    </Box>
  )
}
