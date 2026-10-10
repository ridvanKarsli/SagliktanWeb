import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { alpha } from '@mui/material/styles'
import { paletteFor } from '../../design/tokens.js'

// Lightbox her temada koyu (fotoğrafa odaklanılsın): gece çamı zemin.
const LIGHTBOX_BG = alpha(paletteFor('dark').background, 0.96)

// PostGallery'nin tembel yüklenen (lazy) büyütme katmanı - kütüphane ve CSS'i
// yalnızca bu dosya import eder, böylece ayrı bir chunk'a düşer.
export default function PostLightbox({ open, index, attachments, onClose }) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
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
      styles={{ container: { backgroundColor: LIGHTBOX_BG } }}
    />
  )
}
