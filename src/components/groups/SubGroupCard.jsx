import { Box, Chip, Stack, Typography } from '@mui/material'
import { ChatBubbleOutlineRounded } from '@mui/icons-material'
import GroupIcon from './GroupIcon.jsx'
import { cardActivationProps } from '../../utils/clickable.js'

// Hastalık grubu sayfasındaki alt grup (forum) satırı. Kart bir başlık
// (heading) içerdiği için <button> değil, klavyeyle de açılabilen bir makale.
export default function SubGroupCard({ subGroup, onOpen }) {
  return (
    <Box
      {...cardActivationProps(onOpen, subGroup.name)}
      className="tap-scale"
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        bgcolor: 'background.paper',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { bgcolor: 'action.hover', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <GroupIcon variant="forum" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3, overflowWrap: 'anywhere' }}>
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
        </Box>
        <Chip
          size="small"
          variant="outlined"
          icon={<ChatBubbleOutlineRounded sx={{ fontSize: '15px !important' }} />}
          label={`${subGroup.postCount ?? 0} sohbet`}
          data-testid={`subgroup-chat-count-${subGroup.name}`}
          sx={{ flexShrink: 0, color: 'text.secondary', borderColor: 'divider', borderRadius: 999, fontWeight: 500 }}
        />
      </Stack>
    </Box>
  )
}
