import { Box, CircularProgress } from '@mui/material'

// Oturum kontrolü sürerken (route guard'lar) tam ekran gösterge. Renkler
// temadan gelir - sabit koyu renk açık temada bir anlık koyu ekran
// "yanıp sönmesi" yaratıyordu.
export default function FullScreenLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <CircularProgress color="primary" aria-label="Yükleniyor" />
    </Box>
  )
}
