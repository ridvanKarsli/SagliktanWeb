import { Box } from '@mui/material'
import SaglikLoader from './SaglikLoader.jsx'

// Tam sayfa / route yüklemesi: ortada büyük filiz + kısa açıklama.
//   fullScreen: oturum kontrolü gibi kabuk henüz yokken tüm ekranı kaplar
//               (zemin temadan - açık temada koyu "yanıp sönme" olmasın).
//   minHeight:  kabuk içindeki sayfalarda ayrılan alan.
export default function PageLoader({ caption = 'Yükleniyor…', fullScreen = false, minHeight = 320, sx }) {
  return (
    <Box
      sx={{
        display: 'grid', placeItems: 'center', px: 2,
        minHeight: fullScreen ? '100dvh' : minHeight,
        py: fullScreen ? 0 : 6,
        bgcolor: fullScreen ? 'background.default' : undefined,
        ...sx,
      }}
    >
      <SaglikLoader size="lg" caption={caption} />
    </Box>
  )
}
