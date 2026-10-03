import { useState } from 'react'
import { Box, ButtonBase, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Skeleton, Stack, Typography } from '@mui/material'
import { ArrowBackRounded, BlockRounded, LockOpenRounded, MoreVertRounded } from '@mui/icons-material'
import UserAvatar from '../avatars/UserAvatar.jsx'
import { radius } from '../../design/tokens.js'

const BAR_SX = { py: 1, px: { xs: 0.5, md: 0 }, borderBottom: '1px solid', borderColor: 'brand.border', minHeight: 64 }

export function ChatHeaderSkeleton() {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={BAR_SX}>
      <Box sx={{ width: 44 }} />
      <Skeleton variant="circular" width={42} height={42} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="25%" sx={{ fontSize: '0.75rem' }} />
      </Box>
    </Stack>
  )
}

// Sohbet başlığı: geri, karşı tarafın yol arkadaşı/adı (profile gider) ve
// engelle / engeli kaldır menüsü.
export default function ChatHeader({ otherUserName, otherUserAvatarKey, onBack, onOpenProfile, isBlocked, onBlock, onUnblock }) {
  const [menuAnchor, setMenuAnchor] = useState(null)
  const runAndClose = (action) => () => { setMenuAnchor(null); action() }
  const name = otherUserName || 'Kullanıcı'

  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={BAR_SX}>
      <IconButton onClick={onBack} aria-label="Geri" sx={{ width: 44, height: 44 }}>
        <ArrowBackRounded />
      </IconButton>
      <ButtonBase
        onClick={onOpenProfile}
        aria-label={`${name} profiline git`}
        sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', gap: 1.25, px: 0.75, py: 0.5, borderRadius: `${radius.md}px`, textAlign: 'left', '&:hover': { bgcolor: 'action.hover' } }}
      >
        <UserAvatar avatarKey={otherUserAvatarKey} name={name} size={42} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" component="h1" sx={{ lineHeight: 1.25 }} noWrap>{name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>Profilini gör</Typography>
        </Box>
      </ButtonBase>
      <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Seçenekler" aria-haspopup="menu" sx={{ width: 44, height: 44 }}>
        <MoreVertRounded />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {isBlocked ? (
          <MenuItem onClick={runAndClose(onUnblock)}>
            <ListItemIcon><LockOpenRounded fontSize="small" /></ListItemIcon>
            <ListItemText primary="Engeli Kaldır" />
          </MenuItem>
        ) : (
          <MenuItem onClick={runAndClose(onBlock)} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}><BlockRounded fontSize="small" /></ListItemIcon>
            <ListItemText primary="Kullanıcıyı Engelle" />
          </MenuItem>
        )}
      </Menu>
    </Stack>
  )
}
