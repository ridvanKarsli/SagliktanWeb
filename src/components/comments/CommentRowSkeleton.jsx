import { Box, Skeleton, Stack } from '@mui/material'

// Yorum satırı yüklenirken gösterilen iskelet - CommentRow'un kutusuz
// avatar+metin yerleşimini birebir taklit eder. compact: yanıt bloğu içi.
export default function CommentRowSkeleton({ compact = false }) {
  const size = compact ? 28 : 36
  return (
    <Box sx={{ py: compact ? 1 : 1.5 }}>
      <Stack direction="row" spacing={1.5}>
        <Skeleton variant="circular" width={size} height={size} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="35%" sx={{ fontSize: '0.875rem' }} />
          <Skeleton variant="text" width="92%" />
          <Skeleton variant="text" width="64%" />
        </Box>
      </Stack>
    </Box>
  )
}
