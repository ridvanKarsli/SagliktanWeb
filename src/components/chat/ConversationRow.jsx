import { Avatar, Badge, Box, ButtonBase, Stack, Typography } from '@mui/material'
import { initialsFrom, parseServerDate } from '../../utils/format.js'

// Bugünse saat, değilse gün.ay.
function formatWhen(value) {
  const date = parseServerDate(value)
  if (!date) return ''
  const sameDay = date.toDateString() === new Date().toDateString()
  return sameDay
    ? date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
}

function previewText(c) {
  if (c.lastMessagePreview) return c.lastMessagePreview
  if (c.lastMessageHasAttachment) return '📷 Fotoğraf'
  if (c.lastMessageHasSharedPost) return '🔗 Gönderi paylaştı'
  return 'Sohbete başla'
}

// Sohbet listesindeki bir konuşma satırı (son mesaj önizlemesi + okunmamış sayısı).
export default function ConversationRow({ conversation: c, onOpen }) {
  const unread = c.unreadCount > 0
  return (
    <ButtonBase
      onClick={onOpen}
      className="tap-scale"
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, width: '100%', textAlign: 'left',
        bgcolor: unread ? 'action.hover' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' },
        '&.Mui-focusVisible': { bgcolor: 'action.focus' }
      }}
    >
      <Avatar sx={{ width: 48, height: 48, fontWeight: 600, flexShrink: 0 }}>
        {initialsFrom(c.otherUserName)}
      </Avatar>
      <Box component="span" sx={{ display: 'block', flex: 1, minWidth: 0 }}>
        <Stack component="span" direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="subtitle2"
            component="span"
            sx={{ fontWeight: unread ? 700 : 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {c.otherUserName}
          </Typography>
          <Typography variant="caption" component="span" sx={{ color: 'text.secondary', flexShrink: 0, ml: 1 }}>
            {formatWhen(c.lastMessageAt)}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          component="span"
          sx={{
            display: 'block',
            color: unread ? 'text.primary' : 'text.secondary',
            fontWeight: unread ? 600 : 400,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}
        >
          {previewText(c)}
        </Typography>
      </Box>
      {unread && (
        <Badge badgeContent={c.unreadCount} color="error" max={99} sx={{ flexShrink: 0, mr: 0.5 }} />
      )}
    </ButtonBase>
  )
}
