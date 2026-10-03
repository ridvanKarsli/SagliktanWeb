import { Box, Skeleton, Stack } from '@mui/material'
import CommentRowSkeleton from '../comments/CommentRowSkeleton.jsx'
import { detailSurfaceSx } from './detailSurface.js'

// Gönderi detay sayfası yüklenirken: geri bağlantısı, gönderi kartı (yazar,
// başlık, metin, eylemler) ve yorum alanının birebir taslağı.
export default function PostDetailSkeleton() {
  return (
    <Box role="status" aria-label="Gönderi yükleniyor" sx={{ py: { xs: 2, md: 4 } }}>
      <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: 999, mb: 2 }} />
      <Box sx={{ ...detailSurfaceSx, mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={50} height={50} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="38%" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="text" width="52%" sx={{ fontSize: '0.8rem' }} />
          </Box>
        </Stack>
        <Skeleton variant="text" width="82%" sx={{ fontSize: '1.75rem' }} />
        <Skeleton variant="text" width="50%" sx={{ fontSize: '1.75rem', mb: 1 }} />
        <Skeleton variant="rounded" width={110} height={32} sx={{ borderRadius: 999, mb: 1.5 }} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="97%" />
        <Skeleton variant="text" width="92%" />
        <Skeleton variant="text" width="64%" />
        <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="rounded" width={64} height={36} sx={{ borderRadius: 999 }} />
          <Skeleton variant="rounded" width={48} height={36} sx={{ borderRadius: 999 }} />
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="circular" width={36} height={36} />
          <Skeleton variant="circular" width={36} height={36} />
        </Stack>
      </Box>
      <Skeleton variant="text" width={140} sx={{ fontSize: '1.6rem', mb: 1 }} />
      <Box sx={detailSurfaceSx}>
        <CommentRowSkeleton />
        <CommentRowSkeleton />
        <CommentRowSkeleton />
      </Box>
    </Box>
  )
}
