import { Box } from '@mui/material'

/**
 * Gönderi fotoğrafları - Faz 2 adım 4. `attachments` backend'den zaten
 * sortOrder'a göre sıralı geliyor (bkz. PostAttachmentResponse). Ayrı bir
 * carousel kütüphanesi eklemeden CSS scroll-snap ile yatay kaydırmalı bir
 * şerit - tek fotoğrafta da aynı bileşen kullanılabiliyor (width: 100%).
 */
export default function PostGallery({ attachments }) {
  if (!attachments || attachments.length === 0) return null

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        mb: 1.5,
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none'
      }}
    >
      {attachments.map(a => (
        <Box
          key={a.id}
          component="img"
          src={a.url}
          alt=""
          loading="lazy"
          sx={{
            scrollSnapAlign: 'start',
            flex: '0 0 auto',
            width: attachments.length === 1 ? '100%' : '85%',
            maxHeight: 420,
            borderRadius: 2,
            objectFit: 'cover',
            border: '1px solid',
            borderColor: 'divider'
          }}
        />
      ))}
    </Box>
  )
}
