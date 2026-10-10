import { Box, Typography } from '@mui/material'
import { WifiOffRounded } from '@mui/icons-material'

// İnce, kalıcı "çevrimdışısın" şeridi (bkz. useOnlineStatus). Hata rengi
// değil nötr-sıcak bir zemin: kullanıcının yapabileceği bir şey yok, panik
// yaratmaya gerek yok; bağlantı gelince kendiliğinden kaybolur ve açık
// listeler tazelenir (bkz. ResponsiveShell).
export default function OfflineBanner() {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
        px: 2, py: 0.75,
        pt: { xs: 'calc(6px + env(safe-area-inset-top))', md: 0.75 },
        // Yapışık şerit kaydırılan içeriğin ÜSTÜNDE durur: zemin opak olmalı
        // (apricotSoft yarı saydam, tek başına altındaki metni gösterirdi).
        bgcolor: 'background.default',
        backgroundImage: (t) => `linear-gradient(${t.palette.brand.apricotSoft}, ${t.palette.brand.apricotSoft})`,
        color: 'brand.apricotInk',
        borderBottom: '1px solid', borderColor: 'divider'
      }}
    >
      <WifiOffRounded sx={{ fontSize: 18 }} aria-hidden />
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        Çevrimdışısın – bağlantı gelince devam edeceğiz
      </Typography>
    </Box>
  )
}
