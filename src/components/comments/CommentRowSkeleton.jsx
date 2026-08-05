import { Box, Skeleton, Stack } from '@mui/material'

// Yorum satırı yüklenirken gösterilen iskelet - CommentRow'un avatar+metin
// yerleşimini taklit eder, boş ekran yerine sayfanın taslağını gösterir.
// PostDetail.jsx'ten taşındı (bkz. clean-code audit).
export default function CommentRowSkeleton() {
  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1.5}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="30%" sx={{ fontSize: '0.875rem' }} />
          <Skeleton variant="text" width="90%" sx={{ mt: 0.5 }} />
          <Skeleton variant="text" width="60%" />
        </Box>
      </Stack>
    </Box>
  )
}
