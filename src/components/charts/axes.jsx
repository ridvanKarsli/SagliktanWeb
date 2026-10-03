import { formatCompact, textWidth } from './format.js'

// Eksen parçaları: kılcal, düz (kesikli değil), yüzeyden bir ton farklı
// ızgara; tek bir y ekseni; günleri çakışmadan etiketleyen x ekseni.

const AXIS_FONT = 11.5

export function YGrid({ ticks, y, left, right, colors }) {
  return (
    <g aria-hidden="true">
      {ticks.map(t => (
        <g key={t}>
          <line
            x1={left} x2={right} y1={y(t)} y2={y(t)}
            stroke={t === 0 ? colors.baseline : colors.grid}
            strokeWidth={1}
            shapeRendering="crispEdges"
          />
          <text
            x={left - 8} y={y(t)} dy="0.34em" textAnchor="end"
            fontSize={AXIS_FONT} fontWeight={600} fill={colors.axisText}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatCompact(t)}
          </text>
        </g>
      ))}
    </g>
  )
}

/** indexes: etiketlenecek nokta indeksleri; x(i): piksel; label(i): metin. */
export function XLabels({ indexes, x, label, y, minX, maxX, colors }) {
  return (
    <g aria-hidden="true">
      {indexes.map(i => {
        const text = label(i)
        const half = textWidth(text) / 2
        const cx = x(i)
        // Kenardaki etiket kesilmesin: kenara yaslanır.
        const anchor = cx - half < minX ? 'start' : cx + half > maxX ? 'end' : 'middle'
        const tx = anchor === 'start' ? Math.max(minX, cx - 4) : anchor === 'end' ? Math.min(maxX, cx + 4) : cx
        return (
          <text key={i} x={tx} y={y} textAnchor={anchor} fontSize={AXIS_FONT} fontWeight={600} fill={colors.axisText}>
            {text}
          </text>
        )
      })}
    </g>
  )
}
