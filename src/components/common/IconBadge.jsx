import { Box } from '@mui/material'

// Yumuşak, marka renginde bir daire içinde tek ikon. Boş durumlar, başarı
// ekranları ve özellik listeleri bunu kullanır; yol arkadaşları (karakterler)
// yalnızca avatar ve kutlama anlarına ayrılır, böylece özel kalırlar.
// tone: brand paletindeki *Soft zemin + uyumlu ikon rengi.
const TONES = {
  primary: { bg: 'brand.primarySoft', fg: 'primary.main' },
  apricot: { bg: 'brand.apricotSoft', fg: 'brand.apricotInk' },
  sky: { bg: 'brand.skySoft', fg: 'brand.sky' },
}

export default function IconBadge({ icon: Icon, size = 64, tone = 'primary', className, sx }) {
  const t = TONES[tone] || TONES.primary
  return (
    <Box
      aria-hidden
      className={className}
      sx={{
        width: size, height: size, flexShrink: 0, borderRadius: '50%',
        display: 'grid', placeItems: 'center', bgcolor: t.bg, color: t.fg, ...sx
      }}
    >
      {Icon && <Icon sx={{ fontSize: Math.round(size * 0.47) }} />}
    </Box>
  )
}
