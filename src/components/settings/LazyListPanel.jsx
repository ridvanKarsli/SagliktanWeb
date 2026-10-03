import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'

// Açılır ayar panellerinin (engellenenler, oturumlar) ortak durum gösterimi:
// yükleniyor / hata + tekrar dene / boş / liste.
export default function LazyListPanel({ loading, error, onRetry, items, emptyText, renderItem }) {
  let body
  if (loading) {
    body = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} aria-label="Yükleniyor" />
      </Box>
    )
  } else if (error) {
    body = (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1 }}>
        <Typography variant="body2" sx={{ color: 'error.main', flex: 1 }}>{error}</Typography>
        <Button size="small" onClick={onRetry} sx={{ minHeight: 36 }}>Tekrar dene</Button>
      </Stack>
    )
  } else if (!items || items.length === 0) {
    body = <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>{emptyText}</Typography>
  } else {
    body = <Stack spacing={1}>{items.map(renderItem)}</Stack>
  }
  return <Box sx={{ px: 1.5, pb: 1.5 }}>{body}</Box>
}
