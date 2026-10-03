import { Stack, Typography } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'

// Gönderi sayfasındaki kompakt hatırlatma: görünür ama içeriği aşağı itmez.
export default function MedicalDisclaimer({ sx }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ color: 'text.secondary', ...sx }}>
      <InfoOutlined sx={{ fontSize: 16, mt: '3px', flexShrink: 0 }} />
      <Typography variant="caption" sx={{ lineHeight: 1.55 }}>
        Buradaki paylaşımlar kişisel deneyimlerdir, tıbbi tavsiye değildir.
        Sağlık kararların için bir uzmana danış.
      </Typography>
    </Stack>
  )
}
