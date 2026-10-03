import { useState } from 'react'
import { Box, ButtonBase } from '@mui/material'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

/**
 * Gönderi fotoğrafları: CSS scroll-snap ile yatay kaydırmalı bir şerit
 * (backend sortOrder'a göre sıralı döner). Dokununca/Enter ile büyütülür;
 * lightbox pinch/çift-tık zoom, klavye gezinmesi ve odak tuzağını sağlar.
 */
export default function PostGallery({ attachments }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  if (!attachments || attachments.length === 0) return null

  return (
    <>
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
        {attachments.map((a, i) => (
          <ButtonBase
            key={a.id}
            onClick={() => setLightboxIndex(i)}
            aria-label={attachments.length > 1 ? `Fotoğraf ${i + 1} / ${attachments.length} - büyüt` : 'Fotoğrafı büyüt'}
            className="tap-scale"
            sx={{
              scrollSnapAlign: 'start',
              flex: '0 0 auto',
              width: attachments.length === 1 ? '100%' : '85%',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'zoom-in',
              '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
            }}
          >
            <Box
              component="img"
              src={a.url}
              alt=""
              loading="lazy"
              sx={{ display: 'block', width: '100%', maxHeight: 420, objectFit: 'cover' }}
            />
          </ButtonBase>
        ))}
      </Box>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={attachments.map(a => ({ src: a.url }))}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 4,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          scrollToZoom: true
        }}
        // closeOnPullDown: iOS Fotoğraflar'daki gibi aşağı sürükleyerek kapatma.
        controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
        styles={{ container: { backgroundColor: 'rgba(20, 17, 14, 0.94)' } }}
      />
    </>
  )
}
