import { Box, Button, IconButton, Typography } from '@mui/material'
import { FlagOutlined } from '@mui/icons-material'
import SharedPostPreview from './SharedPostPreview.jsx'
import { radius } from '../../design/tokens.js'
import { parseServerDate } from '../../utils/format.js'

const BIG = `${radius.lg}px`
const SMALL = '6px'

function timeOf(value) {
  const d = parseServerDate(value)
  return d ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''
}

// Tek bir sohbet balonu. Aynı kişinin art arda mesajları bir grup gibi
// birleşir (köşeler yumuşar, zaman yalnızca grubun sonunda). Gelen
// mesajlarda şikayet: masaüstünde hover'da görünen küçük bayrak; mobilde
// balona dokununca altında beliren düğme. animate: yeni gelen/gönderilen.
export default function MessageBubble({
  message, mine, selected, onToggleSelect, onReport, onOpenPost, first = true, last = true, animate = false
}) {
  const m = message
  const hasText = !!m.content
  const hasImage = !!m.attachmentUrl
  // Konuşma yönündeki köşe, grubun ortasında küçülür: balonlar birbirine "yaslanır".
  const corners = mine
    ? { borderTopRightRadius: first ? BIG : SMALL, borderBottomRightRadius: SMALL }
    : { borderTopLeftRadius: first ? BIG : SMALL, borderBottomLeftRadius: SMALL }

  return (
    <Box
      className={animate ? (mine ? 'sg-bubble-in' : 'sg-bubble-in-left') : undefined}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', mt: first ? 1.25 : 0.375 }}
    >
      <Box
        onContextMenu={(e) => { if (!mine) { e.preventDefault(); onReport() } }}
        onClick={() => { if (!mine) onToggleSelect() }}
        sx={{
          maxWidth: { xs: '82%', sm: '72%' },
          bgcolor: mine ? 'primary.main' : 'background.paper',
          color: mine ? 'primary.contrastText' : 'text.primary',
          border: mine ? 0 : '1px solid',
          borderColor: 'brand.border',
          borderRadius: BIG,
          ...corners,
          px: 1.75, py: 1,
          position: 'relative',
          '&:hover .report-message-btn': { opacity: 1 }
        }}
      >
        {/* Paylaşılan gönderi silinmişse backend sharedPost'u null döner. */}
        {m.sharedPost ? (
          <SharedPostPreview post={m.sharedPost} mine={mine} hasMoreContent={hasText || hasImage} onOpen={() => onOpenPost(m.sharedPost.id)} />
        ) : (!hasText && !hasImage && (
          <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
            Paylaşılan gönderi silinmiş
          </Typography>
        ))}
        {hasImage && (
          <Box
            component="a"
            href={m.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Fotoğrafı yeni sekmede aç"
            sx={{ display: 'block', mb: hasText ? 0.75 : 0, mx: -0.75, mt: -0.25 }}
          >
            {/* Sabit boyutlu küçük resim kutusu: fotoğraf inmeden önce de yer
                ayrılır, yüklenince sohbet akışı zıplamaz (CLS). */}
            <Box
              sx={{
                width: { xs: 220, sm: 260 }, maxWidth: '100%', aspectRatio: '4 / 3',
                borderRadius: `${radius.md}px`, overflow: 'hidden', bgcolor: 'brand.surfaceAlt'
              }}
            >
              <Box
                component="img"
                src={m.attachmentUrl}
                alt=""
                loading="lazy"
                decoding="async"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </Box>
          </Box>
        )}
        {hasText && (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.45 }}>
            {m.content}
          </Typography>
        )}
        {!mine && (
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onReport() }}
            aria-label="Mesajı şikayet et"
            className="report-message-btn"
            sx={{
              position: 'absolute', top: -10, right: -12, width: 28, height: 28, minWidth: 28, minHeight: 28,
              bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
              opacity: 0, transition: 'opacity 0.15s',
              '&:focus-visible': { opacity: 1 },
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            <FlagOutlined sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>
      {last && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.375, px: 0.75, fontWeight: 600 }}>
          {timeOf(m.createdAt)}
        </Typography>
      )}
      {!mine && selected && (
        <Button
          size="small"
          startIcon={<FlagOutlined sx={{ fontSize: 16 }} />}
          onClick={onReport}
          sx={{ mt: 0.5, minHeight: 44, display: { xs: 'inline-flex', sm: 'none' } }}
        >
          Mesajı şikayet et
        </Button>
      )}
    </Box>
  )
}
