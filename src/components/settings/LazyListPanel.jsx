import { Box, Button, Skeleton, Stack, Typography } from '@mui/material'

function RowSkeleton({ avatar }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.75 }}>
      {avatar && <Skeleton variant="circular" width={40} height={40} />}
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="50%" />
        {!avatar && <Skeleton variant="text" width="35%" sx={{ fontSize: '0.75rem' }} />}
      </Box>
      <Skeleton variant="rounded" width={96} height={38} sx={{ borderRadius: 999 }} />
    </Stack>
  )
}

// Açılır ayar panellerinin (engellenenler, oturumlar) ortak durum gösterimi:
// yükleniyor (iskelet) / hata + tekrar dene / boş / liste.
export default function LazyListPanel({ loading, error, onRetry, items, emptyText, renderItem, skeletonAvatar = false }) {
  let body
  if (loading) {
    body = (
      <Box aria-busy="true" aria-label="Yükleniyor">
        <RowSkeleton avatar={skeletonAvatar} />
        <RowSkeleton avatar={skeletonAvatar} />
      </Box>
    )
  } else if (error) {
    body = (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1 }}>
        <Typography variant="body2" sx={{ color: 'error.main', flex: 1, fontWeight: 600 }}>{error}</Typography>
        <Button size="small" onClick={onRetry}>Tekrar dene</Button>
      </Stack>
    )
  } else if (!items || items.length === 0) {
    body = <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>{emptyText}</Typography>
  } else {
    body = <Stack spacing={0.5} className="sg-stagger">{items.map(renderItem)}</Stack>
  }
  return <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 1.5, pl: { sm: 8 } }}>{body}</Box>
}
