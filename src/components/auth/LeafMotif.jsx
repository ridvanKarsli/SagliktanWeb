import { Box } from '@mui/material'

// Sakin bir marka motifi: ortak bir kökten açılan üç yaprak (bir filiz).
// Karakter değil, soyut bir işaret; giriş/kayıt ekranlarında yol arkadaşları
// yerine kullanılır ki onlar avatar ve kutlama anlarına özel kalsın.
// Renkler temadan (brand.*) okunur; açık ve koyu temada kendiliğinden uyar.
const LEAF = 'M0 0 C -30 -26 -32 -66 0 -100 C 32 -66 30 -26 0 0Z'
const VEIN = 'M0 -6 L0 -84'

const LEAVES = [
  { rotate: -42, scale: 0.78, fill: 'primaryBright', opacity: 0.55 },
  { rotate: 40, scale: 0.7, fill: 'apricot', opacity: 0.7 },
  { rotate: 0, scale: 1, fill: 'primary', opacity: 0.92 },
]

export default function LeafMotif({ size = 96, sx }) {
  return (
    <Box
      component="svg"
      viewBox="-80 -110 160 120"
      aria-hidden
      sx={{ width: size, height: size * 0.75, display: 'block', overflow: 'visible', ...sx }}
    >
      {LEAVES.map((l) => (
        <g key={l.rotate} transform={`rotate(${l.rotate}) scale(${l.scale})`}>
          <Box component="path" d={LEAF} sx={{ fill: (t) => t.palette.brand[l.fill] || t.palette.primary.main, opacity: l.opacity }} />
          <Box component="path" d={VEIN} sx={{ fill: 'none', stroke: (t) => t.palette.background.paper, strokeWidth: 3, strokeLinecap: 'round', opacity: 0.55 }} />
        </g>
      ))}
    </Box>
  )
}
