import { Box, Button, CircularProgress } from '@mui/material'
import { ExpandMoreRounded } from '@mui/icons-material'

// Sayfalı listelerin sonundaki ortak "Daha Fazla Yükle" düğmesi.
// dense: dialog içi gibi dar alanlar için küçük, kenarlıksız varyant.
export default function LoadMoreButton({ loading, onClick, label = 'Daha Fazla Yükle', dense = false, sx }) {
  if (dense) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5, ...sx }}>
        <Button size="small" onClick={onClick} disabled={loading} sx={{ minHeight: 44 }}>
          {loading ? <CircularProgress size={16} color="inherit" aria-label="Yükleniyor" /> : label}
        </Button>
      </Box>
    )
  }
  return (
    <Box sx={{ textAlign: 'center', py: 3, ...sx }}>
      <Button
        variant="outlined"
        onClick={onClick}
        disabled={loading}
        aria-busy={loading || undefined}
        endIcon={loading ? undefined : <ExpandMoreRounded />}
        sx={{ minWidth: 200, minHeight: 48, bgcolor: 'background.paper' }}
      >
        {loading ? <CircularProgress size={18} aria-label="Yükleniyor" /> : label}
      </Button>
    </Box>
  )
}
