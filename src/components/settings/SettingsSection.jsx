import { Box, Stack, Typography } from '@mui/material'

// Ayarlar ekranındaki başlıklı bölüm.
export default function SettingsSection({ title, children }) {
  return (
    <Box component="section" sx={{ px: { xs: 2, md: 0 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h3" sx={{ color: 'text.primary' }}>{title}</Typography>
      </Stack>
      {children}
    </Box>
  )
}

// Bölüm içindeki kenarlıklı kart; padded: iç boşluklu (form içerikleri için).
export function SettingsCard({ children, padded = false, sx }) {
  return (
    <Box
      sx={{
        borderRadius: 2, border: '1px solid', borderColor: 'divider',
        // Satır listeleri köşelere taşmasın; form içerikleri (padded) kırpılmasın.
        ...(padded ? { p: { xs: 2, sm: 2.5 } } : { overflow: 'hidden' }),
        ...sx
      }}
    >
      {children}
    </Box>
  )
}
