import { useMemo } from 'react'
import { Box, keyframes } from '@mui/material'
import ChartTooltip from './ChartTooltip.jsx'
import { XLabels, YGrid } from './axes.jsx'
import { useChartColors } from './chartPalette.js'
import { formatDayLong, formatDayShort, formatNumber, niceTicks, pickTickIndexes, yAxisWidth } from './format.js'
import { useElementWidth, useIndexScrubber, useReducedMotion } from './hooks.js'

const draw = keyframes`from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; }`
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`

/**
 * Günlük zaman serisi için çizgi grafik (tek seride alan dolgulu).
 *
 * - Tek y ekseni, 0'dan başlar; ızgara kılcal ve geri planda.
 * - Çizgi 2px, yuvarlak birleşim; alan dolgusu seri renginin ~%10'u.
 * - Son noktada halkalı nokta (bugün nerede?).
 * - Fare/dokunma/klavye ile en yakın güne kilitlenen dikey çizgi ve o
 *   gündeki tüm serilerin değerini gösteren tek tooltip.
 * - Girişte çizgi bir kez soldan sağa çizilir (azaltılmış harekette yok).
 *
 * @param data   [{ date: 'YYYY-MM-DD', ...values }] - eskiden yeniye
 * @param series [{ key, label, color }]
 * @param area   tek seride alan dolgusu
 * @param height toplam yükseklik (x ekseni bandı dahil)
 */
export default function LineChart({ data, series, area = false, height = 200, ariaLabel, valueFormat = formatNumber }) {
  const colors = useChartColors()
  const reduced = useReducedMotion()
  const [wrapRef, width] = useElementWidth()
  const n = data.length

  const max = useMemo(() => Math.max(0, ...data.flatMap(d => series.map(s => d[s.key] || 0))), [data, series])
  const ticks = useMemo(() => niceTicks(max, height < 190 ? 3 : 4), [max, height])
  const top = ticks[ticks.length - 1]

  const m = { top: 10, right: 8, bottom: 26, left: yAxisWidth(ticks) }
  const plotW = Math.max(10, width - m.left - m.right)
  const plotH = height - m.top - m.bottom
  const x = (i) => m.left + (n <= 1 ? plotW / 2 : (i * plotW) / (n - 1))
  const y = (v) => m.top + plotH * (1 - (v || 0) / top)
  const xToIndex = (px) => (n <= 1 ? 0 : Math.min(n - 1, Math.max(0, Math.round(((px - m.left) / plotW) * (n - 1)))))

  const { index, rootRef, handlers } = useIndexScrubber(n, xToIndex)
  const tickIdx = pickTickIndexes(n, plotW, 50)

  const paths = series.map(s => {
    const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d[s.key]).toFixed(1)}`)
    const line = `M${pts.join('L')}`
    const fill = `${line}L${x(n - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`
    return { ...s, line, fill }
  })

  const anim = (kf, ms, delay = 0) => (reduced ? undefined : { animation: `${kf} ${ms}ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms both` })

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
            display: 'block', overflow: 'visible', touchAction: 'pan-y', cursor: 'crosshair',
            borderRadius: '8px', outline: 'none',
            '&:focus-visible': { boxShadow: (t) => `0 0 0 3px ${t.palette.brand.primarySoft}` },
          }}
        >
          <YGrid ticks={ticks} y={y} left={m.left} right={m.left + plotW} colors={colors} />
          <XLabels indexes={tickIdx} x={x} label={(i) => formatDayShort(data[i].date)} y={height - 6} minX={m.left - 4} maxX={width} colors={colors} />

          {area && paths.length === 1 && (
            <Box component="path" d={paths[0].fill} fill={paths[0].color} fillOpacity={0.1} sx={anim(fadeIn, 500, 250)} />
          )}
          {paths.map((p, si) => (
            <Box
              key={p.key}
              component="path"
              d={p.line}
              pathLength={1}
              fill="none"
              stroke={p.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={reduced ? undefined : 1}
              sx={anim(draw, 750, si * 120)}
            />
          ))}

          {/* Son gün: halkalı uç noktası */}
          {index == null && paths.map((p, si) => (
            <Box
              key={p.key}
              component="circle"
              cx={x(n - 1)} cy={y(data[n - 1][p.key])} r={4}
              fill={p.color} stroke={colors.surface} strokeWidth={2}
              sx={anim(fadeIn, 240, 650 + si * 120)}
            />
          ))}

          {index != null && (
            <g pointerEvents="none">
              <line x1={x(index)} x2={x(index)} y1={m.top} y2={y(0)} stroke={colors.axisText} strokeOpacity={0.55} strokeWidth={1} shapeRendering="crispEdges" />
              {paths.map(p => (
                <circle key={p.key} cx={x(index)} cy={y(data[index][p.key])} r={4.5} fill={p.color} stroke={colors.surface} strokeWidth={2} />
              ))}
            </g>
          )}
        </Box>
      )}

      {index != null && (
        <ChartTooltip
          title={formatDayLong(data[index].date)}
          anchorX={x(index)}
          top={0}
          containerWidth={width}
          rows={series.map(s => ({ key: s.key, label: s.label, color: s.color, kind: 'line', value: valueFormat(data[index][s.key] || 0) }))}
        />
      )}
    </Box>
  )
}
