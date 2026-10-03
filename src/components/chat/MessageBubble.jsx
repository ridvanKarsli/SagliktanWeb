import { Box, Button, IconButton, Typography } from '@mui/material'
import { FlagOutlined } from '@mui/icons-material'
import SharedPostPreview from './SharedPostPreview.jsx'

// Tek bir sohbet balonu. Gelen mesajlarda şikayet: masaüstünde hover'da
// görünen küçük bayrak; mobilde balona dokununca altında beliren düğme.
export default function MessageBubble({ message, mine, selected, onToggleSelect, onReport, onOpenPost }) {
  const m = message
  const hasText = !!m.content
  const hasImage = !!m.attachmentUrl

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
      <Box
        onContextMenu={(e) => { if (!mine) { e.preventDefault(); onReport() } }}
        onClick={() => { if (!mine) onToggleSelect() }}
        sx={{
          maxWidth: '75%',
          bgcolor: mine ? 'primary.main' : 'action.hover',
          color: mine ? '#fff' : 'text.primary',
          borderRadius: 3,
          borderBottomRightRadius: mine ? 4 : 3,
          borderBottomLeftRadius: mine ? 3 : 4,
          px: 1.75, py: 1,
          position: 'relative',
          '&:hover .report-message-btn': { opacity: 1 }
        }}
      >
        {/* Paylaşılan gönderi silinmişse backend sharedPost'u null döner. */}
        {m.sharedPost ? (
          <SharedPostPreview post={m.sharedPost} mine={mine} hasMoreContent={hasText || hasImage} onOpen={() => onOpenPost(m.sharedPost.id)} />
        ) : (!hasText && !hasImage && (
          <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
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
            sx={{ display: 'block', mb: hasText ? 0.75 : 0 }}
          >
            <Box component="img" src={m.attachmentUrl} alt="" loading="lazy" sx={{ maxWidth: '100%', borderRadius: 2, display: 'block' }} />
          </Box>
        )}
        {hasText && (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
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
              position: 'absolute', top: -10, right: -10, width: 24, height: 24,
              bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
              opacity: 0, transition: 'opacity 0.15s',
              '&:focus-visible': { opacity: 1 },
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            <FlagOutlined sx={{ fontSize: 13 }} />
          </IconButton>
        )}
      </Box>
      {!mine && selected && (
        <Button
          size="small"
          startIcon={<FlagOutlined sx={{ fontSize: 16 }} />}
          onClick={onReport}
          sx={{ mt: 0.5, minHeight: 36, color: 'text.secondary', display: { xs: 'inline-flex', sm: 'none' } }}
        >
          Mesajı şikayet et
        </Button>
      )}
    </Box>
  )
}
