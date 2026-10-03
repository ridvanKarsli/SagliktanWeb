import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material'
import { DeleteOutline, EditOutlined, FlagOutlined, PushPinOutlined, PushPinRounded } from '@mui/icons-material'
import UserAvatar from '../avatars/UserAvatar.jsx'
import { prettyDate, relativeTime } from '../../utils/format.js'
import { clickableProps } from '../../utils/clickable.js'

const actionSx = { width: 44, height: 44 }

// Gönderi detayının üst satırı: yazar (avatar + ad), zaman ve bölüm; sağda
// sahibine/yöneticiye özel eylemler (sabitle, düzenle, sil) ya da
// başkaları için "Şikayet Et".
export default function PostDetailHeader({
  post, isOwnPost, canManagePost, showActions,
  onAuthorClick, onTogglePin, togglingPin, onEdit, onDelete, deleting, onReport
}) {
  const authorName = post.authorName || 'Kullanıcı'
  const edited = !!(post.updatedAt && post.createdAt && post.updatedAt !== post.createdAt)
  const goToAuthor = () => onAuthorClick(post.authorId)
  const pinLabel = post.pinned ? 'Sabitlemeyi kaldır' : 'Profile sabitle'
  const when = relativeTime(post.createdAt)

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Box
        {...clickableProps(goToAuthor)}
        aria-label={`${authorName} profiline git`}
        sx={{ borderRadius: '50%', cursor: 'pointer', flexShrink: 0, '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 } }}
      >
        <UserAvatar avatarKey={post.authorAvatarKey} name={authorName} size={50} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          component="span"
          {...clickableProps(goToAuthor)}
          sx={{
            fontWeight: 800, display: 'inline-block', cursor: 'pointer', lineHeight: 1.3, borderRadius: '6px',
            '&:hover': { textDecoration: 'underline' },
            '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 }
          }}
        >
          {authorName}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} title={prettyDate(post.createdAt) || undefined}>
          {when}
          {edited ? ' · düzenlendi' : ''}
          {post.subGroupName ? ` · ${post.subGroupName}` : ''}
        </Typography>
      </Box>
      {showActions && (
        <Stack direction="row" spacing={0} sx={{ mr: -1 }}>
          {/* Sabitleme kişisel bir profil kararı: yalnızca gerçek sahip (admin değil). */}
          {isOwnPost && (
            <IconButton
              onClick={onTogglePin}
              disabled={togglingPin}
              aria-label={pinLabel}
              title={pinLabel}
              sx={{ ...actionSx, ...(post.pinned ? { color: 'primary.main' } : {}) }}
            >
              {togglingPin
                ? <CircularProgress size={16} />
                : (post.pinned ? <PushPinRounded fontSize="small" /> : <PushPinOutlined fontSize="small" />)}
            </IconButton>
          )}
          {canManagePost && (
            <>
              <IconButton onClick={onEdit} aria-label="Düzenle" title="Düzenle" sx={actionSx}>
                <EditOutlined fontSize="small" />
              </IconButton>
              <IconButton onClick={onDelete} disabled={deleting} aria-label="Sil" title="Sil" sx={actionSx}>
                {deleting ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
              </IconButton>
            </>
          )}
          {!isOwnPost && (
            <IconButton onClick={onReport} title="Şikayet Et" aria-label="Şikayet Et" sx={actionSx}>
              <FlagOutlined fontSize="small" />
            </IconButton>
          )}
        </Stack>
      )}
    </Stack>
  )
}
