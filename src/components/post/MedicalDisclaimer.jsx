import { Stack, Typography } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'

// Gönderi sayfasındaki kompakt yasal uyarı: görünür ama içeriği aşağı itmez.
export default function MedicalDisclaimer() {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2, px: 0.5, color: 'text.secondary' }}>
      <InfoOutlined sx={{ fontSize: 16, mt: '2px', flexShrink: 0 }} />
      <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
        Buradaki paylaşımlar kişisel deneyimlerdir, tıbbi tavsiye değildir.
        Sağlık kararlarınız için bir uzmana danışın.
      </Typography>
    </Stack>
  )
}
