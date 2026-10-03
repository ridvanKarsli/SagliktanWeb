import { useState } from 'react'
import { Box, ButtonBase, CircularProgress, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { LogoutRounded, MoreVertRounded, OpenInNewRounded, PeopleAltRounded } from '@mui/icons-material'
import GroupIcon from '../groups/GroupIcon.jsx'
import { formatCount } from '../../utils/format.js'

// Profil > Gruplarım satırı. Satıra dokunmak gruba girer (birincil eylem);
// gruptan ayrılmak gibi yıkıcı eylem ⋮ menüsünde - mobilde kaydırırken
// yanlışlıkla "Ayrıl"a basılmasın diye doğrudan buton değil.
export default function MyGroupRow({ group, pending, onOpen, onLeave }) {
  const [anchor, setAnchor] = useState(null)
  const close = () => setAnchor(null)
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center',
        borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
        overflow: 'hidden', opacity: pending ? 0.6 : 1, transition: 'opacity .15s ease'
      }}
    >
      <ButtonBase
        onClick={onOpen}
        aria-label={`${group.name} grubuna git`}
        sx={{
          flex: 1, minWidth: 0, justifyContent: 'flex-start', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 1.5, pl: 1.5, pr: 0.5, py: 1.25,
          '&:hover': { bgcolor: 'action.hover' },
          '&.Mui-focusVisible': { bgcolor: 'action.focus' }
        }}
      >
        <GroupIcon />
        <Box component="span" sx={{ display: 'block', flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" component="span" sx={{ display: 'block', fontWeight: 700, lineHeight: 1.3 }} noWrap>{group.name}</Typography>
          <Stack component="span" direction="row" spacing={0.5} alignItems="center">
            <PeopleAltRounded sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
              {formatCount(group.memberCount)} üye
            </Typography>
          </Stack>
          {group.description && (
            <Typography
              variant="body2"
              component="span"
              sx={{ color: 'text.secondary', mt: 0.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
            >
              {group.description}
            </Typography>
          )}
        </Box>
      </ButtonBase>
      <Box sx={{ width: 48, display: 'grid', placeItems: 'center', flexShrink: 0, pr: 0.5 }}>
        {pending ? (
          <CircularProgress size={18} aria-label="İşleniyor" />
        ) : (
          <IconButton
            aria-label={`${group.name} için seçenekler`}
            aria-haspopup="menu"
            aria-expanded={anchor ? 'true' : undefined}
            onClick={(e) => setAnchor(e.currentTarget)}
            sx={{ width: 44, height: 44, color: 'text.secondary' }}
          >
            <MoreVertRounded />
          </IconButton>
        )}
      </Box>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem onClick={() => { close(); onOpen() }} sx={{ minHeight: 44 }}>
          <ListItemIcon><OpenInNewRounded fontSize="small" /></ListItemIcon>
          <ListItemText>Gruba git</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { close(); onLeave() }} sx={{ minHeight: 44, color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}><LogoutRounded fontSize="small" /></ListItemIcon>
          <ListItemText>Gruptan ayrıl</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}
