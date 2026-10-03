import { Box, Skeleton, Stack } from '@mui/material'

/**
 * PostCard'ın birebir taslağı (aynı köşe, boşluk ve sıralama): içerik
 * gelene kadar boş ekran yerine sayfanın son hâli belirir.
 * `count` verilirse aralıklı bir liste döndürür.
 */
function OneSkeleton({ withMedia = false }) {
  return (
    <Box
      aria-hidden
      sx={{
        p: { xs: 2, sm: 2.5 }, pb: { xs: 1.25, sm: 1.5 },
        borderRadius: { xs: '20px', sm: '22px' },
        bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border', boxShadow: 1
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.75 }}>
        <Skeleton variant="circular" width={44} height={44} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Skeleton variant="text" width="42%" sx={{ fontSize: '0.95rem' }} />
          <Skeleton variant="text" width="58%" sx={{ fontSize: '0.8rem' }} />
        </Box>
      </Stack>
      <Skeleton variant="text" width="78%" sx={{ fontSize: '1.35rem', mb: 0.5 }} />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="94%" />
      <Skeleton variant="text" width="62%" />
      {withMedia && <Skeleton variant="rounded" height={150} sx={{ mt: 1.5, borderRadius: '14px' }} />}
      <Stack direction="row" spacing={1} sx={{ mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="rounded" width={56} height={30} sx={{ borderRadius: 999 }} />
        <Skeleton variant="rounded" width={48} height={30} sx={{ borderRadius: 999 }} />
        <Skeleton variant="rounded" width={48} height={30} sx={{ borderRadius: 999 }} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="circular" width={30} height={30} />
        <Skeleton variant="circular" width={30} height={30} />
      </Stack>
    </Box>
  )
}

export default function PostCardSkeleton({ count, withMedia }) {
  if (!count) return <OneSkeleton withMedia={withMedia} />
  return (
    <Box role="status" aria-label="Gönderiler yükleniyor" sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
      {Array.from({ length: count }).map((_, i) => <OneSkeleton key={i} withMedia={i === 1} />)}
    </Box>
  )
}
