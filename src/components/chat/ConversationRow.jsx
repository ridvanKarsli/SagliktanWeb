import { Box, ButtonBase, Skeleton, Stack, Typography } from '@mui/material'
import { ImageOutlined, LinkRounded } from '@mui/icons-material'
import UserAvatar from '../avatars/UserAvatar.jsx'
import { parseServerDate } from '../../utils/format.js'
import { radius } from '../../design/tokens.js'

// Bugünse saat, değilse gün.ay.
function formatWhen(value) {
  const date = parseServerDate(value)
  if (!date) return ''
  const sameDay = date.toDateString() === new Date().toDateString()
  return sameDay
    ? date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
}

function Preview({ c }) {
  if (c.lastMessagePreview) return c.lastMessagePreview
  const icon = { fontSize: 16, verticalAlign: '-3px', mr: 0.5 }
  if (c.lastMessageHasAttachment) return <><ImageOutlined sx={icon} />Fotoğraf</>
  if (c.lastMessageHasSharedPost) return <><LinkRounded sx={icon} />Bir gönderi paylaştı</>
  return 'Sohbete başla'
}

const ROW_SX = { display: 'flex', alignItems: 'center', gap: 1.5, px: 1.25, py: 1.25, width: '100%', textAlign: 'left', borderRadius: `${radius.md}px` }

export function ConversationRowSkeleton() {
  return (
    <Box sx={ROW_SX}>
      <Skeleton variant="circular" width={52} height={52} sx={{ flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width={36} />
        </Stack>
        <Skeleton variant="text" width="75%" />
      </Box>
    </Box>
  )
}

// Sohbet listesindeki bir konuşma satırı (son mesaj önizlemesi + okunmamış sayısı).
export default function ConversationRow({ conversation: c, onOpen }) {
  const unread = c.unreadCount > 0
  return (
    <ButtonBase
      onClick={onOpen}
      className="tap-scale"
      aria-label={`${c.otherUserName}${unread ? `, ${c.unreadCount} okunmamış mesaj` : ''}`}
      sx={{
        ...ROW_SX,
        bgcolor: unread ? 'brand.primarySoft' : 'transparent',
        '&:hover': { bgcolor: unread ? 'brand.primarySoft' : 'action.hover' },
        '&.Mui-focusVisible': { bgcolor: 'action.focus' }
      }}
    >
      <UserAvatar avatarKey={c.otherUserAvatarKey} name={c.otherUserName} size={52} sx={{ flexShrink: 0 }} />
      <Box component="span" sx={{ display: 'block', flex: 1, minWidth: 0 }}>
        <Stack component="span" direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
          <Typography
            variant="subtitle1"
            component="span"
            sx={{ fontWeight: unread ? 800 : 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {c.otherUserName}
          </Typography>
          <Typography variant="caption" component="span" sx={{ color: unread ? 'primary.main' : 'text.secondary', fontWeight: unread ? 800 : 600, flexShrink: 0 }}>
            {formatWhen(c.lastMessageAt)}
          </Typography>
        </Stack>
        <Stack component="span" direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="body2"
            component="span"
            sx={{
              display: 'block', flex: 1, minWidth: 0,
              color: unread ? 'text.primary' : 'text.secondary',
              fontWeight: unread ? 700 : 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}
          >
            <Preview c={c} />
          </Typography>
          {unread && (
            <Box
              component="span"
              aria-hidden
              sx={{
                minWidth: 22, height: 22, px: 0.75, borderRadius: `${radius.pill}px`, flexShrink: 0,
                display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText',
                fontSize: '0.75rem', fontWeight: 800
              }}
            >
              {c.unreadCount > 99 ? '99+' : c.unreadCount}
            </Box>
          )}
        </Stack>
      </Box>
    </ButtonBase>
  )
}
