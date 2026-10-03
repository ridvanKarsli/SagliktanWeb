import { Box, Typography } from '@mui/material'
import { radius } from '../../design/tokens.js'

// Ayarlar ekranındaki başlıklı bölüm; description verilirse başlığın altında kısa açıklama.
export default function SettingsSection({ title, description, children }) {
  return (
    <Box component="section">
      <Box sx={{ mb: 1.25, px: 0.5 }}>
        <Typography variant="h5" component="h2">{title}</Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>{description}</Typography>
        )}
      </Box>
      {children}
    </Box>
  )
}

// Bölüm içindeki yüzey kartı; padded: iç boşluklu (form içerikleri için).
export function SettingsCard({ children, padded = false, sx }) {
  return (
    <Box
      sx={{
        borderRadius: `${radius.lg}px`, border: '1px solid', borderColor: 'brand.border', bgcolor: 'background.paper',
        // Satır listeleri köşelere taşmasın; form içerikleri (padded) kırpılmasın.
        ...(padded ? { p: { xs: 2, sm: 2.5 } } : { overflow: 'hidden', p: 0.75 }),
        ...sx
      }}
    >
      {children}
    </Box>
  )
}
