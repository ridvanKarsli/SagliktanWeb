import { Avatar, Box, Stack, Typography } from '@mui/material'

function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}

function truncate(text = '', max = 180) {
  const clean = String(text || '').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trimEnd()}…`
}

/**
 * Sade gönderi kartı: yazar, tarih, başlık ve kısaltılmış içerik.
 * Backend'de reaksiyon (beğeni/beğenmeme) desteği olmadığı için hiçbir oy UI'ı içermez.
 */
export default function PostCard({ post, onClick }) {
  if (!post) return null
  const { authorName, title, content, createdAt, updatedAt } = post

  const dateLabel = createdAt ? new Date(createdAt).toLocaleDateString('tr-TR') : ''
  const edited = !!(updatedAt && createdAt && updatedAt !== createdAt)

  return (
    <Box
      onClick={onClick}
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        '&:hover': onClick ? { bgcolor: 'action.hover', borderColor: 'primary.main' } : undefined
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
        <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
          {initialsFrom(authorName || '')}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
            {authorName || 'Kullanıcı'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {dateLabel}
            {edited ? ' · düzenlendi' : ''}
          </Typography>
        </Box>
      </Stack>

      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5, wordBreak: 'break-word' }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', whiteSpace: 'pre-line', wordBreak: 'break-word' }}
      >
        {truncate(content, 180)}
      </Typography>
    </Box>
  )
}
