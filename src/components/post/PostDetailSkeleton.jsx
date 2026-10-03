import { Box, Skeleton, Stack } from '@mui/material'
import CommentRowSkeleton from '../comments/CommentRowSkeleton.jsx'

// Gönderi detay sayfası yüklenirken: gönderi kartı + iki yorum iskeleti.
export default function PostDetailSkeleton() {
  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="35%" sx={{ fontSize: '0.875rem' }} />
            <Skeleton variant="text" width="20%" sx={{ fontSize: '0.75rem' }} />
          </Box>
        </Stack>
        <Skeleton variant="text" width="55%" sx={{ fontSize: '1.5rem', mb: 1 }} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
      </Box>
      <Stack spacing={1}>
        <CommentRowSkeleton />
        <CommentRowSkeleton />
      </Stack>
    </Box>
  )
}
