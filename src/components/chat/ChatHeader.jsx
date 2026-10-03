import { useState } from 'react'
import { Avatar, IconButton, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { ArrowBackRounded, BlockRounded, LockOpenRounded, MoreVertRounded } from '@mui/icons-material'
import { initialsFrom } from '../../utils/format.js'
import { clickableProps } from '../../utils/clickable.js'

// Sohbet başlığı: geri, karşı tarafın adı/avatarı (profile gider) ve
// engelle / engeli kaldır menüsü.
export default function ChatHeader({ otherUserName, onBack, onOpenProfile, isBlocked, onBlock, onUnblock }) {
  const [menuAnchor, setMenuAnchor] = useState(null)
  const runAndClose = (action) => () => { setMenuAnchor(null); action() }
  const name = otherUserName || 'Kullanıcı'

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1.5, px: { xs: 0.5, md: 0 }, borderBottom: '1px solid', borderColor: 'divider' }}>
      <IconButton onClick={onBack} aria-label="Geri" size="small">
        <ArrowBackRounded />
      </IconButton>
      <Avatar
        sx={{ width: 36, height: 36, fontWeight: 600, cursor: 'pointer' }}
        {...clickableProps(onOpenProfile)}
        aria-label={`${name} profiline git`}
      >
        {initialsFrom(otherUserName)}
      </Avatar>
      <Typography
        variant="subtitle1"
        component="h1"
        sx={{ fontWeight: 700, flex: 1, minWidth: 0, cursor: 'pointer' }}
        noWrap
        onClick={onOpenProfile}
      >
        {otherUserName}
      </Typography>
      <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Seçenekler" aria-haspopup="menu" size="small">
        <MoreVertRounded />
      </IconButton>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        {isBlocked ? (
          <MenuItem onClick={runAndClose(onUnblock)}>
            <LockOpenRounded fontSize="small" sx={{ mr: 1.5 }} />
            <ListItemText primary="Engeli Kaldır" />
          </MenuItem>
        ) : (
          <MenuItem onClick={runAndClose(onBlock)} sx={{ color: 'error.main' }}>
            <BlockRounded fontSize="small" sx={{ mr: 1.5 }} />
            <ListItemText primary="Kullanıcıyı Engelle" />
          </MenuItem>
        )}
      </Menu>
    </Stack>
  )
}
