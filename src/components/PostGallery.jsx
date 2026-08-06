import { useState } from 'react'
import { Box } from '@mui/material'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

/**
 * Gönderi fotoğrafları - Faz 2 adım 4. `attachments` backend'den zaten
 * sortOrder'a göre sıralı geliyor (bkz. PostAttachmentResponse). Ayrı bir
 * carousel kütüphanesi eklemeden CSS scroll-snap ile yatay kaydırmalı bir
 * şerit - tek fotoğrafta da aynı bileşen kullanılabiliyor (width: 100%).
 *
 * Tıklayınca büyütme/yakınlaştırma (bkz. görüşme: "LinkedIn'in linki gibi
 * düşün") - yet-another-react-lightbox kullanıldı: pinch/scroll/çift-tık
 * zoom, klavye navigasyonu ve odak tuzağı (focus trap) hazır geliyor; bunu
 * elle (özellikle dokunmatik pinch-zoom) doğru yazmak kayda değer bir efor
 * ve WCAG denetiminde (bkz. e2e/accessibility.spec.js) risk olurdu. Sadece
 * PostCard/PostDetail üzerinden, her ikisi de lazy route (bkz. App.jsx),
 * kullanılıyor - kütüphane ana pakete hiç girmiyor, LCP'yi etkilemiyor.
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
          <Box
            key={a.id}
            component="img"
            src={a.url}
            alt=""
            loading="lazy"
            className="tap-scale"
            onClick={() => setLightboxIndex(i)}
            sx={{
              scrollSnapAlign: 'start',
              flex: '0 0 auto',
              width: attachments.length === 1 ? '100%' : '85%',
              maxHeight: 420,
              borderRadius: 2,
              objectFit: 'cover',
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'zoom-in'
            }}
          />
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
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: 'rgba(20, 17, 14, 0.94)' } }}
      />
    </>
  )
}
