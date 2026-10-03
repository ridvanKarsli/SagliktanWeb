import { useLayoutEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { radius } from '../../design/tokens.js'

/**
 * Grafik üstü değer kutusu. Konumu grafiğin içinde kalacak şekilde
 * hesaplanır: işaretçinin sağına sığmıyorsa soluna geçer, hiçbir zaman
 * kartın dışına taşmaz (mobilde 360px'te de).
 *
 * rows: [{ key, label, value, color, kind: 'line' | 'rect' }]
 * Değer önde ve güçlü, seri adı ikincil; seri anahtarı kısa bir çizgi/kare.
 */
export default function ChartTooltip({ title, rows, anchorX, top = 0, containerWidth, gap = 12 }) {
  const ref = useRef(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    if (ref.current) setW(ref.current.offsetWidth)
  }, [title, rows])

  let left = anchorX + gap
  if (w && left + w > containerWidth) left = anchorX - gap - w
  if (left < 0) left = Math.max(0, Math.min(containerWidth - w, anchorX - w / 2))

  return (
    <Box
      ref={ref}
      role="status"
      aria-live="polite"
      sx={{
        position: 'absolute', top, left, zIndex: 2, pointerEvents: 'none',
        visibility: w ? 'visible' : 'hidden',
        minWidth: 120, maxWidth: Math.max(140, containerWidth - 8),
        px: 1.25, py: 1, borderRadius: `${radius.sm}px`,
        bgcolor: 'brand.surfaceRaised', color: 'text.primary',
        border: '1px solid', borderColor: 'brand.border',
        boxShadow: 3,
      }}
    >
      <Typography variant="caption" component="div" sx={{ color: 'text.secondary', fontWeight: 700, lineHeight: 1.3, mb: 0.5, whiteSpace: 'nowrap' }}>
        {title}
      </Typography>
      {rows.map(r => (
        <Box key={r.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, lineHeight: 1.35 }}>
          <SeriesKey color={r.color} kind={r.kind} />
          <Box component="span" sx={{ fontWeight: 800, fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>{r.value}</Box>
          <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.label}</Box>
        </Box>
      ))}
    </Box>
  )
}

/** Lejant/tooltip seri anahtarı: çizgi grafikler için kısa çizgi, çubuklar için kare. */
export function SeriesKey({ color, kind = 'line' }) {
  return kind === 'rect'
    ? <Box component="span" aria-hidden sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: color, flexShrink: 0 }} />
    : <Box component="span" aria-hidden sx={{ width: 14, height: 3, borderRadius: 2, bgcolor: color, flexShrink: 0 }} />
}
