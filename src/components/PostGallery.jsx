import { Suspense, lazy, useState } from 'react'
import { Box, ButtonBase } from '@mui/material'
import { focusRingSx } from '../design/focus.js'

// Lightbox (yet-another-react-lightbox + zoom eklentisi + CSS'i) yalnızca
// kullanıcı bir fotoğrafa dokunup büyütmek istediğinde yüklenir: akıştaki her
// kart bu bileşeni render ediyor ama büyütme nadir bir eylem; kütüphaneyi
// giriş paketine koymak her ziyarette boşuna indirtiyordu.
const LazyLightbox = lazy(() => import('./post/PostLightbox.jsx'))

/**
 * Gönderi fotoğrafları: CSS scroll-snap ile yatay kaydırmalı bir şerit
 * (backend sortOrder'a göre sıralı döner). Dokununca/Enter ile büyütülür;
 * lightbox pinch/çift-tık zoom, klavye gezinmesi ve odak tuzağını sağlar.
 *
 * Her görsel sabit 4:3 oranlı bir kutuda durur: fotoğraf gelmeden önce de
 * yer ayrılmış olur, yüklenince sayfa zıplamaz (CLS). Kutu yumuşak bir
 * zeminle (surfaceAlt) "yükleniyor" hissi verir.
 *
 * eagerFirst: detay sayfasında ilk fotoğraf çoğunlukla LCP öğesidir -
 * lazy yerine hemen yüklenir; akış kartlarında hepsi lazy kalır.
 */
export default function PostGallery({ attachments, eagerFirst = false }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  // Lightbox bir kez açıldıktan sonra ağaçta kalır: kapatıp tekrar açmak
  // yeniden chunk indirmesin / Suspense yanıp sönmesin.
  const [lightboxMounted, setLightboxMounted] = useState(false)

  if (!attachments || attachments.length === 0) return null

  const openAt = (i) => {
    setLightboxMounted(true)
    setLightboxIndex(i)
  }

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
            onClick={() => openAt(i)}
            aria-label={attachments.length > 1 ? `Fotoğraf ${i + 1} / ${attachments.length} - büyüt` : 'Fotoğrafı büyüt'}
            className="tap-scale"
            sx={{
              scrollSnapAlign: 'start',
              flex: '0 0 auto',
              width: attachments.length === 1 ? '100%' : '85%',
              aspectRatio: '4 / 3',
              maxHeight: 420,
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'brand.border',
              bgcolor: 'brand.surfaceAlt',
              cursor: 'zoom-in',
              '&.Mui-focusVisible': focusRingSx
            }}
          >
            <Box
              component="img"
              src={a.url}
              alt=""
              loading={eagerFirst && i === 0 ? 'eager' : 'lazy'}
              fetchPriority={eagerFirst && i === 0 ? 'high' : undefined}
              decoding="async"
              sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </ButtonBase>
        ))}
      </Box>

      {lightboxMounted && (
        // Chunk inene kadar hiçbir şey gösterme: dokunuştan sonra bir an boş
        // kalması, yarım bir overlay'den daha az rahatsız edici.
        <Suspense fallback={null}>
          <LazyLightbox
            open={lightboxIndex >= 0}
            index={lightboxIndex}
            attachments={attachments}
            onClose={() => setLightboxIndex(-1)}
          />
        </Suspense>
      )}
    </>
  )
}
