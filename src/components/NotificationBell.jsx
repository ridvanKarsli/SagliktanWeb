import { useState } from 'react'
import { Badge, Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import {
  ChatBubbleRounded, CheckCircleRounded, NotificationsNoneRounded, NotificationsRounded, ReplyRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useNotificationsFeed } from '../context/NotificationsFeedContext.jsx'
import { relativeTime } from '../utils/format.js'
import UserAvatar from './avatars/UserAvatar.jsx'
import EmptyState from './EmptyState.jsx'

// Bildirim türleri: ne olduğu (metin) + avatarın köşesindeki küçük ikon.
// Bilinmeyen bir tür gelirse genel bir metinle gösterilir.
const TYPES = {
  NEW_COMMENT: { text: 'gönderine yorum yaptı', Icon: ChatBubbleRounded, color: 'brand.sky' },
  COMMENT_REPLY: { text: 'yorumuna yanıt verdi', Icon: ReplyRounded, color: 'primary.main' },
  NEW_REPLY: { text: 'yorumuna yanıt verdi', Icon: ReplyRounded, color: 'primary.main' },
  ANSWER_ACCEPTED: { text: 'yorumunu en iyi cevap seçti', Icon: CheckCircleRounded, color: 'brand.apricotInk' },
}
const FALLBACK = { text: 'sana bir şey bıraktı', Icon: NotificationsRounded, color: 'text.secondary' }

function NotificationItem({ n, onClick }) {
  const meta = TYPES[n.type] || FALLBACK
  const actor = n.actorName || 'Bir üye'
  const Icon = meta.Icon
  return (
    <MenuItem
      onClick={onClick}
      sx={{
        whiteSpace: 'normal', alignItems: 'flex-start', gap: 1.5, py: 1.25, px: 2, mx: 0.75, my: 0.25, borderRadius: '14px',
        bgcolor: n.read ? 'transparent' : 'brand.primarySoft',
        '&:hover': { bgcolor: n.read ? 'action.hover' : 'brand.primarySoft' }
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <UserAvatar avatarKey={n.actorAvatarKey} name={actor} size={42} />
        <Box
          aria-hidden
          sx={{
            position: 'absolute', right: -4, bottom: -4, width: 22, height: 22, borderRadius: '50%',
            display: 'grid', placeItems: 'center', bgcolor: 'background.paper', color: meta.color,
            boxShadow: (t) => `0 1px 3px rgba(${t.palette.brand.shadowRgb}, 0.25)`
          }}
        >
          <Icon sx={{ fontSize: 14 }} />
        </Box>
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.45 }}>
          <Box component="span" sx={{ fontWeight: 800 }}>{actor}</Box> {meta.text}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {relativeTime(n.createdAt)}{!n.read ? ' · yeni' : ''}
        </Typography>
      </Box>
      {!n.read && (
        <Box aria-hidden sx={{ width: 10, height: 10, mt: 1, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
      )}
    </MenuItem>
  )
}

export default function NotificationBell() {
  const { items, unreadCount, markRead, markAllRead, wsConnected } = useNotificationsFeed()
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()
  const open = Boolean(anchorEl)

  const handleOpen = (e) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)

  // markRead iyimser (yerel durumu hemen günceller); ağ isteğini beklemek
  // yavaş bağlantıda gezinmeyi gereksiz yere geciktiriyordu.
  const handleItemClick = (n) => {
    handleClose()
    if (!n.read) markRead(n.id)
    if (n.postId) navigate(`/post/${n.postId}`)
  }

  return (
    <>
      {/*
        data-ws-connected: sadece E2E testleri için - STOMP aboneliği gerçekten
        kurulana kadar "true" olmuyor (bkz. NotificationsFeedContext,
        notificationSocket.js). notifications.spec.js bu bayrağı bekliyor.
      */}
      <IconButton
        onClick={handleOpen}
        aria-label="Bildirimler"
        aria-haspopup="menu"
        aria-expanded={open || undefined}
        data-ws-connected={wsConnected ? 'true' : 'false'}
        sx={{ width: 44, height: 44, color: open ? 'primary.main' : 'text.secondary' }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {open ? <NotificationsRounded /> : <NotificationsNoneRounded />}
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { width: { xs: 'calc(100vw - 24px)', sm: 380 }, maxWidth: 420, maxHeight: 480, borderRadius: '22px', mt: 0.5 } },
          list: { sx: { pt: 0 } }
        }}
      >
        <Box
          sx={{
            px: 2, pt: 1.75, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1,
            position: 'sticky', top: 0, zIndex: 1, bgcolor: 'brand.surfaceRaised'
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontFamily: (t) => t.typography.h5.fontFamily, fontWeight: 700 }}>
            Bildirimler
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllRead()} sx={{ minHeight: 40 }}>
              Tümünü okundu işaretle
            </Button>
          )}
        </Box>
        {items.length === 0 ? (
          <EmptyState
            companion="gunes"
            dense
            title="Şimdilik sessiz"
            description="Biri gönderine yorum yaptığında ya da sana yanıt verdiğinde burada haber veririz."
            sx={{ py: 3 }}
          />
        ) : (
          items.map((n) => <NotificationItem key={n.id} n={n} onClick={() => handleItemClick(n)} />)
        )}
      </Menu>
    </>
  )
}
