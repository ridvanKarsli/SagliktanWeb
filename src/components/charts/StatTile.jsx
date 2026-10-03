import { Box, Typography } from '@mui/material'
import { ArrowDownwardRounded, ArrowUpwardRounded, FiberNewOutlined, RemoveRounded } from '@mui/icons-material'
import { radius } from '../../design/tokens.js'
import Sparkline from './Sparkline.jsx'

const ICONS = { up: ArrowUpwardRounded, down: ArrowDownwardRounded, flat: RemoveRounded, new: FiberNewOutlined }
const TONES = {
  good: { color: 'brand.primary', bg: 'brand.primarySoft' },
  bad: { color: 'brand.rose', bg: 'brand.roseSoft' },
  neutral: { color: 'text.secondary', bg: 'brand.surfaceAlt' },
}

/**
 * KPI kutucuğu: etiket · değer · önceki döneme göre değişim · (ops.) eğilim.
 * Değer orantılı rakamlarla (tabular değil) ve gövde yazı ailesiyle yazılır.
 * Değişim rengi yön × "artış iyi mi" - ama her zaman ikon + işaretli metin
 * ile birlikte; ekran okuyucu tam cümleyi duyar.
 *
 * @param delta  computeDelta(...) sonucu
 * @param trend  { values: number[], color } - kutucuğu kendi grafiğine bağlayan renk
 * @param hint   değerin altında küçük açıklama (ör. "41 / 64 soru")
 */
export default function StatTile({ label, value, delta, trend, hint, higherIsBetter = true }) {
  const dir = delta?.direction
  const Icon = ICONS[dir]
  const good = dir === 'up' ? higherIsBetter : dir === 'down' ? !higherIsBetter : null
  const style = Icon ? TONES[good === true ? 'good' : good === false ? 'bad' : 'neutral'] : null

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 1.75 }, minWidth: 0,
        bgcolor: 'background.paper', borderRadius: `${radius.md}px`,
        border: '1px solid', borderColor: 'brand.border',
        display: 'flex', flexDirection: 'column', gap: 0.5,
      }}
    >
      <Typography variant="caption" component="h3" sx={{ color: 'text.secondary', fontWeight: 700, lineHeight: 1.3, m: 0, fontSize: '0.8125rem' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, minWidth: 0 }}>
        <Typography component="p" sx={{ m: 0, fontWeight: 800, fontSize: { xs: '1.6rem', sm: '1.75rem' }, lineHeight: 1.1, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
          {value}
        </Typography>
        {trend?.values?.length > 1 && (
          <Sparkline values={trend.values} color={trend.color} sx={{ flex: 1, minWidth: 36, maxWidth: 96, ml: 'auto', mb: 0.25, mr: 0.5 }} />
        )}
      </Box>
      {hint && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.3 }}>{hint}</Typography>
      )}
      {style && (
        <Box sx={{ mt: 'auto', pt: 0.25 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.25,
              px: 0.75, py: 0.125, borderRadius: 999,
              bgcolor: style.bg, color: style.color,
              fontSize: '0.8125rem', fontWeight: 800, lineHeight: 1.5, whiteSpace: 'nowrap',
            }}
          >
            <Icon aria-hidden sx={{ fontSize: 15 }} />
            <span aria-hidden="true">{delta.text}</span>
            <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{delta.srText}</Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
