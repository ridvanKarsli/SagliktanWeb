import { Box, ButtonBase, Typography } from '@mui/material'

// Mesajla paylaşılan gönderinin kartı (başlık, kısa metin, küçük görsel).
export default function SharedPostPreview({ post, mine, hasMoreContent, onOpen }) {
  return (
    <ButtonBase
      onClick={(e) => { e.stopPropagation(); onOpen() }}
      aria-label={`Paylaşılan gönderi: ${post.title}`}
      sx={{
        display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left',
        borderRadius: 2, overflow: 'hidden', maxWidth: 260, width: '100%',
        mb: hasMoreContent ? 0.75 : 0,
        bgcolor: mine ? 'rgba(255,255,255,0.14)' : 'background.paper',
        border: '1px solid', borderColor: mine ? 'rgba(255,255,255,0.26)' : 'divider',
        p: 1
      }}
    >
      {post.thumbnailUrl && (
        <Box component="img" src={post.thumbnailUrl} alt="" loading="lazy" sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }} />
      )}
      <Box component="span" sx={{ display: 'block', minWidth: 0 }}>
        <Typography variant="caption" component="span" sx={{ fontWeight: 700, display: 'block' }} noWrap>
          {post.title}
        </Typography>
        {post.contentSnippet && (
          <Typography
            variant="caption"
            component="span"
            sx={{ opacity: 0.85, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {post.contentSnippet}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  )
}
