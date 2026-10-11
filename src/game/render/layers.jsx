// Sahne katmanları: zemin karoları (statik, memo) ve derinlik sıralı nesneler.
import { memo, useLayoutEffect, useRef } from 'react'
import { IsoTile, TILE_LEGEND, iso, toPoints, footprintPolygon } from '../art/index.js'
import { objectDepth } from '../engine/depth.js'

// Zemin: her karo kendi yerinde. Yalnızca bölge değişince yeniden çizilir.
export const TileLayer = memo(function TileLayer({ tiles }) {
  const out = []
  for (let y = 0; y < tiles.length; y++) {
    const row = tiles[y]
    for (let x = 0; x < row.length; x++) {
      const kind = TILE_LEGEND[row[x]] || row[x]
      const { sx, sy } = iso(x, y)
      out.push(
        <g key={`${x},${y}`} transform={`translate(${sx} ${sy})`}>
          <IsoTile kind={kind} variant={(x * 7 + y * 13) % 4} />
        </g>,
      )
    }
  }
  return <g aria-hidden="true">{out}</g>
})

// Tek nesne: rot=1 -> translate(iso(x,y)) sonra scale(-1,1), ek kaydırma yok.
export const PlacedObject = memo(function PlacedObject({ obj, index, ghost, selected }) {
  const { sx, sy } = iso(obj.x, obj.y)
  const Comp = obj.Component
  return (
    <g
      transform={`translate(${sx} ${sy})`}
      data-obj={index}
      data-key={obj.key}
      className={ghost ? 'smg-ghost' : undefined}
      opacity={ghost ? 0.7 : undefined}
      style={obj.tappable ? { cursor: 'pointer' } : undefined}
    >
      <g transform={obj.rot ? 'scale(-1 1)' : undefined}>
        <Comp {...(obj.props || {})} />
      </g>
      {selected && (
        <polygon points={toPoints(footprintPolygon(obj.w, obj.d))} fill="none" stroke="#FFFDF8" strokeWidth="2.5" strokeDasharray="6 4" />
      )}
    </g>
  )
})

// Nesneler + her tam sayı derinlikte karakter yuvası.
export const ObjectLayer = memo(function ObjectLayer({ objects, maxDepth, onSlots, selectedIndex = -1 }) {
  const ref = useRef(null)
  const sorted = objects.map((o, i) => ({ o, i })).sort((a, b) => objectDepth(a.o) - objectDepth(b.o) || a.o.x - b.o.x)
  const out = []
  let k = 0
  for (let d = 0; d <= maxDepth; d++) {
    while (k < sorted.length && objectDepth(sorted[k].o) <= d) {
      const { o, i } = sorted[k]
      out.push(<PlacedObject key={`o${i}`} obj={o} index={i} selected={i === selectedIndex} />)
      k++
    }
    out.push(<g key={`s${d}`} data-slot={d} />)
  }
  while (k < sorted.length) {
    const { o, i } = sorted[k]
    out.push(<PlacedObject key={`o${i}`} obj={o} index={i} selected={i === selectedIndex} />)
    k++
  }
  useLayoutEffect(() => {
    onSlots?.(Array.from(ref.current?.querySelectorAll(':scope > [data-slot]') || []))
  }, [objects, maxDepth, onSlots])
  return <g ref={ref}>{out}</g>
})

// Dokunulan kareye yumuşak işaret
export function TapMarker({ x, y }) {
  const pts = toPoints(footprintPolygon(1, 1, x, y))
  return (
    <g pointerEvents="none" aria-hidden="true">
      <polygon points={pts} fill="#FFFDF8" opacity="0.35" />
      <polygon className="smg-marker" points={pts} fill="none" stroke="#FFFDF8" strokeWidth="2.5" strokeLinejoin="round" />
    </g>
  )
}
