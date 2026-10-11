import { Box, Button, Typography } from '@mui/material'
import { ExpandMoreRounded, RefreshRounded } from '@mui/icons-material'
import SaglikLoader from './SaglikLoader.jsx'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.js'

// Sayfalı listelerin sonu: görünüme yaklaşınca sonraki sayfayı kendisi
// yükler (bkz. useInfiniteScroll). Yüklenirken orta boy filiz döner.
//
// Kimse takılı kalmasın diye düğme yalnızca gerektiğinde çıkar:
//   - son otomatik yükleme başarısız olduysa: "Tekrar dene"
//   - tarayıcı IntersectionObserver desteklemiyorsa: "Daha fazla göster"
//
//   endMessage: liste bitince gösterilecek sakin satır (yalnızca akış gibi
//               anlamlı yerlerde; verilmezse sessiz).
//   status:     liste altındaki sayaç metni (ör. admin: "120 kayıttan 40'ı
//               gösteriliyor"); verilirse yükleme dışında görünür.
//   root:       kaydırma kabı (dialog içi), verilmezse viewport.
//   dense:      dar alanlar (dialog) için daha az boşluk.
export default function InfiniteScrollSentinel({
  hasMore, loading, onLoadMore, itemCount, endMessage, status, root, rootMargin, disabled = false, dense = false, sx,
}) {
  const { sentinelRef, stalled, supported, retry } = useInfiniteScroll({
    onLoadMore, hasMore, loading, itemCount, root, rootMargin, disabled,
  })

  if (disabled) return null
  if (!hasMore) {
    if (!endMessage && !status) return null
    return (
      <Box sx={{ textAlign: 'center', py: dense ? 1.5 : 3, px: 2, ...sx }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{endMessage || status}</Typography>
      </Box>
    )
  }

  const showButton = !loading && (stalled || !supported)
  return (
    <Box sx={{ display: 'grid', justifyItems: 'center', gap: 1, py: dense ? 1.5 : 3, minHeight: dense ? 56 : 88, ...sx }}>
      <Box ref={sentinelRef} aria-hidden="true" sx={{ width: '100%', height: '1px' }} />
      {loading && <SaglikLoader size="md" label="Daha fazla yükleniyor" />}
      {showButton && (
        <Button
          variant={dense ? 'text' : 'outlined'}
          size={dense ? 'small' : 'medium'}
          onClick={retry}
          startIcon={stalled ? <RefreshRounded /> : undefined}
          endIcon={stalled ? undefined : <ExpandMoreRounded />}
          sx={{ minHeight: 44, minWidth: dense ? undefined : 180, bgcolor: dense ? undefined : 'background.paper' }}
        >
          {stalled ? 'Tekrar dene' : 'Daha fazla göster'}
        </Button>
      )}
      {status && !loading && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{status}</Typography>
      )}
    </Box>
  )
}
