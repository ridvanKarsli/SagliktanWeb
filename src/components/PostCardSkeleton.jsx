import { Box, Skeleton, Stack } from '@mui/material'

/**
 * PostCard ile aynı boyutlarda iskelet - içerik gelene kadar boş beyaz ekran
 * yerine sayfanın son halinin taslağını gösterir (algılanan hız için).
 */
export default function PostCardSkeleton() {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
        <Skeleton variant="circular" width={36} height={36} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Skeleton variant="text" width="40%" sx={{ fontSize: '0.875rem' }} />
          <Skeleton variant="text" width="25%" sx={{ fontSize: '0.75rem' }} />
        </Box>
      </Stack>
      <Skeleton variant="text" width="70%" sx={{ fontSize: '1.1rem', mb: 0.5 }} />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="60%" />
    </Box>
  )
}
