import { Avatar, Box, Divider, Stack, Typography } from '@mui/material'
import ReactionButtons from './ReactionButtons.jsx'
import HighlightText from './HighlightText.jsx'
import { reactToPost, removePostReaction } from '../services/api.js'

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
 * Feed kartı - büyük platformların (X, Instagram, Facebook) standart feed
 * kartı deseninden ilham alınarak yenilendi: yuvarlak avatar rozeti, tek
 * satırda isim + zaman (X tarzı kompakt başlık), tam genişlik bölücüyle
 * ayrılmış aksiyon çubuğu (Facebook tarzı). Veri sözleşmesi değişmedi -
 * sadece görsel/yapısal düzen.
 */
export default function PostCard({ post, onClick, token, highlightQuery }) {
  if (!post) return null
  const { id, authorName, title, content, createdAt, updatedAt, helpfulCount, notHelpfulCount, myReaction } = post

  const dateLabel = createdAt
    ? new Date(createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    : ''
  const edited = !!(updatedAt && createdAt && updatedAt !== createdAt)

  return (
    <Box
      onClick={onClick}
      className={onClick ? 'tap-scale' : undefined}
      sx={{
        mb: 1.5,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': onClick
          ? { bgcolor: 'action.hover', borderColor: 'primary.main', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }
          : undefined
      }}
    >
      <Box sx={{ p: { xs: 2, md: 2.5 }, pb: { xs: 1.5, md: 1.75 } }}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.25 }}>
          <Avatar
            sx={{
              width: 40, height: 40, fontSize: 15, fontWeight: 700, flexShrink: 0,
              border: '2px solid', borderColor: 'primary.main'
            }}
          >
            {initialsFrom(authorName || '')}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={0.75} alignItems="baseline" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                {authorName || 'Kullanıcı'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                · {dateLabel}{edited ? ' · düzenlendi' : ''}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5, wordBreak: 'break-word', lineHeight: 1.35 }}
        >
          {highlightQuery ? <HighlightText text={title} query={highlightQuery} /> : title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', whiteSpace: 'pre-line', wordBreak: 'break-word', lineHeight: 1.55 }}
        >
          {highlightQuery
            ? <HighlightText text={truncate(content, 180)} query={highlightQuery} />
            : truncate(content, 180)}
        </Typography>
      </Box>

      {token && (
        <>
          <Divider />
          <Box sx={{ px: { xs: 1.5, md: 2 }, py: 0.75 }}>
            <ReactionButtons
              helpfulCount={helpfulCount}
              notHelpfulCount={notHelpfulCount}
              myReaction={myReaction}
              onReact={(value) => reactToPost(token, id, value)}
              onRemove={() => removePostReaction(token, id)}
            />
          </Box>
        </>
      )}
    </Box>
  )
}
