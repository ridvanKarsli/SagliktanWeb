import { useState } from 'react'
import { Badge, Box, Button, Divider, IconButton, ListItemText, Menu, MenuItem, Typography } from '@mui/material'
import { NotificationsNoneRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useNotificationsFeed } from '../context/NotificationsFeedContext.jsx'

const TYPE_LABEL = {
  NEW_COMMENT: (actorName) => `${actorName} gönderine yorum yaptı`,
  COMMENT_REPLY: (actorName) => `${actorName} yorumuna yanıt verdi`
}

export default function NotificationBell() {
  const { items, unreadCount, markRead, markAllRead, wsConnected } = useNotificationsFeed()
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()

  const handleOpen = (e) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)

  const handleItemClick = async (n) => {
    handleClose()
    if (!n.read) await markRead(n.id)
    navigate(`/post/${n.postId}`)
  }

  return (
    <>
      {/*
        data-ws-connected: sadece E2E testleri için - STOMP aboneliği gerçekten
        kurulana kadar "true" olmuyor (bkz. NotificationsFeedContext,
        notificationSocket.js). notifications.spec.js bu bayrağı bekleyerek
        yorum/yanıt tetiklemeden önce bağlantının hazır olduğunu garanti ediyor -
        aksi halde subscribe tamamlanmadan gelen bir bildirim sessizce kaybolup
        testi flaky hale getiriyordu. Kullanıcı arayüzünde görünmez etkisi yok.
      */}
      <IconButton
        onClick={handleOpen}
        aria-label="Bildirimler"
        size="small"
        data-ws-connected={wsConnected ? 'true' : 'false'}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsNoneRounded />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: { xs: 'calc(100vw - 32px)', sm: 340 }, maxWidth: 400, maxHeight: 420 } } }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Bildirimler
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllRead()}>
              Tümünü okundu işaretle
            </Button>
          )}
        </Box>
        <Divider />
        {items.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="Henüz bildirimin yok" />
          </MenuItem>
        ) : (
          items.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleItemClick(n)}
              sx={{ whiteSpace: 'normal', alignItems: 'flex-start', bgcolor: n.read ? 'transparent' : 'action.hover' }}
            >
              <ListItemText
                primary={(TYPE_LABEL[n.type] || (() => 'Yeni bildirim'))(n.actorName || 'Bir kullanıcı')}
                secondary={n.createdAt ? new Date(n.createdAt).toLocaleString('tr-TR') : ''}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  )
}
