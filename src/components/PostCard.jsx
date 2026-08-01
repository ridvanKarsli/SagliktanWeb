import { Avatar, Box, Stack, Typography } from '@mui/material'
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
 * Feed kartı - Instagram'ın gönderi öğesi deseninden ilham alınarak yeniden
 * kuruldu: ağır kart kenarlığı/gölge yerine borderless, sadece alt ince bir
 * bölücüyle ayrılan akış öğesi (bkz. Posts.jsx - kartlar artık `Divider`
 * ile ayrılıyor, kendi border'ı yok). Avatar'da IG'nin "story ring"
 * dilinden esinlenen ama markaya özgü sıcak gradyan bir halka var. Veri
 * sözleşmesi değişmedi - sadece görsel/yapısal düzen.
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
        py: { xs: 2, md: 2.25 },
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.15s ease',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : undefined
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
        {/* Gradyan "ring" avatar - IG'nin hikaye halkasından esinlenildi,
            burada marka rengiyle (yeşil->mercan) sabit bir dekoratif çerçeve. */}
        <Box
          sx={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #4CB89F 0%, #E08B6D 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', p: '2.5px'
          }}
        >
          <Avatar
            sx={{
              width: '100%', height: '100%', fontSize: 15, fontWeight: 700,
              border: '2px solid', borderColor: 'background.default'
            }}
          >
            {initialsFrom(authorName || '')}
          </Avatar>
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
            {authorName || 'Kullanıcı'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {dateLabel}{edited ? ' · düzenlendi' : ''}
          </Typography>
        </Box>
      </Stack>

      {/* Okunabilirlik: başlık ve gövde metni, akışta göz yormadan
          okunabilsin diye belirgin biçimde büyük. Gövde artık ikincil gri
          değil ana metin renginde - akışta okunacak asıl içerik bu, ikincil
          bir detay değil. */}
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75, wordBreak: 'break-word', lineHeight: 1.4 }}
      >
        {highlightQuery ? <HighlightText text={title} query={highlightQuery} /> : title}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: 'text.primary', whiteSpace: 'pre-line', wordBreak: 'break-word', mb: token ? 1.5 : 0 }}
      >
        {highlightQuery
          ? <HighlightText text={truncate(content, 180)} query={highlightQuery} />
          : truncate(content, 180)}
      </Typography>

      {token && (
        <ReactionButtons
          helpfulCount={helpfulCount}
          notHelpfulCount={notHelpfulCount}
          myReaction={myReaction}
          onReact={(value) => reactToPost(token, id, value)}
          onRemove={() => removePostReaction(token, id)}
        />
      )}
    </Box>
  )
}
