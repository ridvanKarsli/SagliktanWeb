import { Box, CircularProgress } from '@mui/material'

// Sayfa/bölüm yüklenirken ortada duran tek tip gösterge.
//   page: tam sayfa yüklemesi (daha yüksek alan, daha büyük ikon)
//   varsayılan: bir sekme/liste bölümü
export default function CenteredSpinner({ page = false, size, py }) {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', py: py ?? (page ? 6 : 4), minHeight: page ? 300 : undefined }}>
      <CircularProgress size={size ?? (page ? 28 : 22)} aria-label="Yükleniyor" />
    </Box>
  )
}
