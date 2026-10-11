import { Box } from '@mui/material'
import SaglikLoader from './SaglikLoader.jsx'
import PageLoader from './PageLoader.jsx'

// Sayfa/bölüm yüklenirken ortada duran tek tip gösterge.
//   page: tam sayfa yüklemesi (PageLoader: büyük filiz + açıklama)
//   varsayılan: bir sekme/liste bölümü (orta boy filiz)
export default function CenteredSpinner({ page = false, size = 'md', py }) {
  if (page) return <PageLoader minHeight={300} sx={py != null ? { py } : undefined} />
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', py: py ?? 4 }}>
      <SaglikLoader size={size} />
    </Box>
  )
}
