import { Box } from '@mui/material'
import { useChartColors } from './chartPalette.js'

/**
 * Stat kutucuğu için küçük eğilim çizgisi. Çizgi geri planda (vurgusuz gri),
 * yalnız son değer (bugün) metriğin rengindeki noktayla vurgulanır.
 * Genişliğe esner (viewBox + non-scaling-stroke); eksen/etiket yok,
 * dekoratif sayılır (aria-hidden) - değerler tabloda.
 */
export default function Sparkline({ values, color, height = 28, sx }) {
  const colors = useChartColors()
  const n = values.length
  if (n < 2) return null
  const W = 100
  const H = height
  const pad = 3.5
  const max = Math.max(1, ...values)
  const x = (i) => (i * W) / (n - 1)
  const y = (v) => pad + (H - pad * 2) * (1 - v / max)
  const d = `M${values.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join('L')}`
  return (
    <Box sx={{ position: 'relative', height, ...sx }} aria-hidden="true">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
        <path d={d} fill="none" stroke={colors.deemphasis} strokeOpacity={0.7} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* Uç noktası SVG dışında: preserveAspectRatio="none" daireyi basık çizerdi */}
      <Box
        sx={{
          position: 'absolute', right: -4, top: y(values[n - 1]) - 4,
          width: 8, height: 8, borderRadius: '50%', bgcolor: color,
          boxShadow: `0 0 0 2px ${colors.surface}`,
        }}
      />
    </Box>
  )
}
