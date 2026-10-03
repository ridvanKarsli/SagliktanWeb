import { useCallback, useRef, useState } from 'react'
import { Box, Typography, keyframes } from '@mui/material'
import ChartTooltip from './ChartTooltip.jsx'
import { useChartColors } from './chartPalette.js'
import { formatNumber } from './format.js'
import { useDismissOnOutsideTap, useElementWidth, useReducedMotion } from './hooks.js'

const grow = keyframes`from { transform: scaleX(0); } to { transform: scaleX(1); }`

/**
 * Yatay yığılmış çubuk listesi - kategorileri (ör. gruplar) bir toplam
 * üzerinden karşılaştırmak, toplamın parçalarını (gönderi + yorum) göstermek için.
 * Uzun Türkçe grup adları mobilde sığsın diye ad çubuğun üstünde, toplam
 * sağda (çubuk ucu değeri) durur. Parçalar arasında 2px yüzey boşluğu var,
 * kenarlık çizilmez. Satıra dokunmak/gezmek parçaların dökümünü gösterir.
 *
 * rows:   [{ id, label, [seriesKey]: number }]  (büyükten küçüğe sıralı verin)
 * series: [{ key, label, color }]
 */
export default function StackedBarList({ rows, series, ariaLabel, valueFormat = formatNumber }) {
  const colors = useChartColors()
  const reduced = useReducedMotion()
  const [wrapRef, width] = useElementWidth()
  const rootRef = useRef(null)
  const [active, setActive] = useState(null) // { i, top }
  const dismiss = useCallback(() => setActive(null), [])
  useDismissOnOutsideTap(rootRef, active != null, dismiss)

  const total = (r) => series.reduce((s, x) => s + (r[x.key] || 0), 0)
  const max = Math.max(1, ...rows.map(total))

  const show = (i, e) => setActive({ i, top: e.currentTarget.offsetTop + e.currentTarget.offsetHeight + 4 })

  return (
    <Box ref={(el) => { wrapRef.current = el; rootRef.current = el }} sx={{ position: 'relative' }}>
      <Box component="ol" aria-label={ariaLabel} sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.5 }}>
        {rows.map((r, i) => {
          const t = total(r)
          return (
            <Box
              component="li"
              key={r.id ?? r.label}
              tabIndex={0}
              aria-label={`${r.label}: ${series.map(s => `${valueFormat(r[s.key] || 0)} ${s.label.toLocaleLowerCase('tr-TR')}`).join(', ')}`}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') show(i, e) }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActive(null) }}
              onPointerDown={(e) => show(i, e)}
              onFocus={(e) => show(i, e)}
              onBlur={() => setActive(null)}
              sx={{
                minWidth: 0, borderRadius: '8px', px: 0.5, mx: -0.5, py: 0.25, cursor: 'default', outline: 'none',
                bgcolor: active?.i === i ? colors.hoverWash : 'transparent',
                '&:focus-visible': { boxShadow: (th) => `0 0 0 3px ${th.palette.brand.primarySoft}` },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {valueFormat(t)}
                </Typography>
              </Box>
              <Box
                aria-hidden="true"
                sx={{
                  display: 'flex', gap: '2px', height: 12, width: `${(t / max) * 100}%`, minWidth: t > 0 ? 4 : 0,
                  transformOrigin: 'left',
                  animation: reduced ? undefined : `${grow} 620ms cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 60}ms both`,
                }}
              >
                {series.map((s, si) => {
                  const v = r[s.key] || 0
                  if (v <= 0) return null
                  const last = series.slice(si + 1).every(n => !(r[n.key] > 0))
                  return (
                    <Box
                      key={s.key}
                      sx={{
                        flex: `${v} 1 0`, minWidth: 2, bgcolor: s.color,
                        // veri ucu yuvarlak, taban düz
                        borderRadius: last ? '0 4px 4px 0' : 0,
                      }}
                    />
                  )
                })}
              </Box>
            </Box>
          )
        })}
      </Box>
      {active != null && rows[active.i] && (
        <ChartTooltip
          title={rows[active.i].label}
          anchorX={Math.min(width, (total(rows[active.i]) / max) * width)}
          top={active.top}
          containerWidth={width}
          rows={series.map(s => ({ key: s.key, label: s.label, color: s.color, kind: 'rect', value: valueFormat(rows[active.i][s.key] || 0) }))}
        />
      )}
    </Box>
  )
}
