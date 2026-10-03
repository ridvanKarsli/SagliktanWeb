import { useMemo } from 'react'
import { Box, keyframes } from '@mui/material'
import ChartTooltip from './ChartTooltip.jsx'
import { XLabels, YGrid } from './axes.jsx'
import { useChartColors } from './chartPalette.js'
import { formatDayLong, formatDayShort, formatNumber, niceTicks, pickTickIndexes, textWidth, yAxisWidth } from './format.js'
import { useElementWidth, useIndexScrubber, useReducedMotion } from './hooks.js'

const grow = keyframes`from { transform: scaleY(0); } to { transform: scaleY(1); }`
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`

/** Üstü 4px yuvarlak, tabanı düz sütun yolu. */
function columnPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h)
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`
}

/**
 * Günlük ayrık sayılar için sütun grafik (tek seri).
 *
 * - Sütun en fazla 24px; komşular arasında ≥2px yüzey boşluğu.
 * - Yalnız en yüksek gün etiketlenir (seçici etiket); geri kalanı eksen,
 *   tooltip ve tablo taşır.
 * - Vurgulanan günün tüm sütun bandı isabet alanıdır (ince sütuna nişan
 *   almak gerekmez); bant hafifçe boyanır.
 *
 * @param data  [{ date, [valueKey]: number }]
 */
export default function ColumnChart({ data, valueKey, label, color, height = 200, ariaLabel, valueFormat = formatNumber }) {
  const colors = useChartColors()
  const reduced = useReducedMotion()
  const [wrapRef, width] = useElementWidth()
  const n = data.length

  const max = useMemo(() => Math.max(0, ...data.map(d => d[valueKey] || 0)), [data, valueKey])
  const ticks = useMemo(() => niceTicks(max, height < 190 ? 3 : 4), [max, height])
  const top = ticks[ticks.length - 1]

  const m = { top: 20, right: 4, bottom: 26, left: yAxisWidth(ticks) }
  const plotW = Math.max(10, width - m.left - m.right)
  const plotH = height - m.top - m.bottom
  const band = plotW / Math.max(1, n)
  const barW = Math.max(1, Math.min(24, band - 2, band * 0.72))
  const cx = (i) => m.left + band * i + band / 2
  const y = (v) => m.top + plotH * (1 - (v || 0) / top)
  const xToIndex = (px) => Math.min(n - 1, Math.max(0, Math.floor((px - m.left) / band)))

  const { index, rootRef, handlers } = useIndexScrubber(n, xToIndex)
  const tickIdx = pickTickIndexes(n, plotW, 50)
  const peak = max > 0 ? data.reduce((best, d, i) => ((d[valueKey] || 0) > (data[best][valueKey] || 0) ? i : best), 0) : -1
  // En yüksek değer etiketi, en son tepe günün üstünde
  const peakLabel = peak >= 0 ? valueFormat(data[peak][valueKey]) : ''
  const peakX = peak >= 0 ? Math.min(Math.max(cx(peak), m.left + textWidth(peakLabel) / 2), m.left + plotW - textWidth(peakLabel) / 2) : 0

  return (
    <Box
      ref={(el) => { wrapRef.current = el; rootRef.current = el }}
      sx={{ position: 'relative', width: '100%', height, userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
    >
      {width > 0 && n > 0 && (
        <Box
          component="svg"
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          aria-roledescription="grafik"
          {...handlers}
          sx={{
            display: 'block', overflow: 'visible', touchAction: 'pan-y', cursor: 'pointer',
            borderRadius: '8px', outline: 'none',
            '&:focus-visible': { boxShadow: (t) => `0 0 0 3px ${t.palette.brand.primarySoft}` },
          }}
        >
          {index != null && (
            <rect x={m.left + band * index} y={m.top} width={band} height={plotH} fill={colors.hoverWash} rx={Math.min(6, band / 2)} />
          )}
          <YGrid ticks={ticks} y={y} left={m.left} right={m.left + plotW} colors={colors} />
          <XLabels indexes={tickIdx} x={cx} label={(i) => formatDayShort(data[i].date)} y={height - 6} minX={m.left - 4} maxX={width} colors={colors} />

          <Box
            component="g"
            sx={reduced ? undefined : {
              transformBox: 'fill-box', transformOrigin: 'bottom',
              animation: `${grow} 620ms cubic-bezier(0.2, 0.8, 0.2, 1) both`,
            }}
          >
            {data.map((d, i) => {
              const v = d[valueKey] || 0
              if (v <= 0) return null
              const h = y(0) - y(v)
              return (
                <path
                  key={d.date}
                  d={columnPath(cx(i) - barW / 2, y(v), barW, h, barW >= 8 ? 4 : barW / 2)}
                  fill={color}
                  fillOpacity={index == null || index === i ? 1 : 0.55}
                />
              )
            })}
          </Box>

          {peak >= 0 && (
            <Box
              component="text"
              x={peakX} y={y(data[peak][valueKey]) - 6} textAnchor="middle"
              fontSize={11.5} fontWeight={800} fill={colors.textSoft}
              sx={reduced ? undefined : { animation: `${fadeIn} 240ms ease 560ms both` }}
              aria-hidden="true"
            >
              {peakLabel}
            </Box>
          )}
        </Box>
      )}

      {index != null && (
        <ChartTooltip
          title={formatDayLong(data[index].date)}
          anchorX={cx(index) + barW / 2}
          top={0}
          containerWidth={width}
          rows={[{ key: valueKey, label, color, kind: 'rect', value: valueFormat(data[index][valueKey] || 0) }]}
        />
      )}
    </Box>
  )
}
