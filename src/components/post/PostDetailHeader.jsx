import { Avatar, Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material'
import { DeleteOutline, EditOutlined, FlagOutlined, PushPinOutlined, PushPinRounded } from '@mui/icons-material'
import { initialsFrom, prettyDate } from '../../utils/format.js'
import { clickableProps } from '../../utils/clickable.js'

// Gönderi detayının üst satırı: yazar, tarih ve sahibine/yöneticiye özel
// eylemler (sabitle, düzenle, sil) ya da başkaları için "Şikayet Et".
export default function PostDetailHeader({
  post, isOwnPost, canManagePost, showActions,
  onAuthorClick, onTogglePin, togglingPin, onEdit, onDelete, deleting, onReport
}) {
  const authorName = post.authorName || 'Kullanıcı'
  const edited = !!(post.updatedAt && post.createdAt && post.updatedAt !== post.createdAt)
  const goToAuthor = () => onAuthorClick(post.authorId)
  const pinLabel = post.pinned ? 'Sabitlemeyi kaldır' : 'Profile sabitle'

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Avatar
        {...clickableProps(goToAuthor)}
        aria-label={`${authorName} profiline git`}
        sx={{ width: 48, height: 48, flexShrink: 0, cursor: 'pointer', fontWeight: 700, border: '2px solid', borderColor: 'primary.main' }}
      >
        {initialsFrom(post.authorName || '')}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          {...clickableProps(goToAuthor)}
          sx={{ fontWeight: 600, display: 'inline-block', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          {authorName}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {prettyDate(post.createdAt) || ''}
          {edited ? ' · düzenlendi' : ''}
        </Typography>
      </Box>
      {showActions && (
        <Stack direction="row" spacing={0.5}>
          {/* Sabitleme kişisel bir profil kararı: yalnızca gerçek sahip (admin değil). */}
          {isOwnPost && (
            <IconButton
              size="small"
              onClick={onTogglePin}
              disabled={togglingPin}
              aria-label={pinLabel}
              title={pinLabel}
              sx={post.pinned ? { color: 'primary.main' } : undefined}
            >
              {togglingPin
                ? <CircularProgress size={16} />
                : (post.pinned ? <PushPinRounded fontSize="small" /> : <PushPinOutlined fontSize="small" />)}
            </IconButton>
          )}
          {canManagePost && (
            <>
              <IconButton size="small" onClick={onEdit} aria-label="Düzenle">
                <EditOutlined fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={onDelete} disabled={deleting} aria-label="Sil">
                {deleting ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
              </IconButton>
            </>
          )}
          {!isOwnPost && (
            <IconButton size="small" onClick={onReport} title="Şikayet Et" aria-label="Şikayet Et">
              <FlagOutlined fontSize="small" />
            </IconButton>
          )}
        </Stack>
      )}
    </Stack>
  )
}
