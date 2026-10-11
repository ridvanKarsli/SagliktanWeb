// Etkileşim efektleri: küçük, döngülü CSS animasyonları. Hepsi <g> döner ve
// pointer-events almaz. (0,0) = bağlama noktası: karakterin baş üstü
// (CHAR_ANCHORS) ya da eşyanın efekt noktası (FX_ANCHORS). Efektler aynalanmaz.
// prefers-reduced-motion: hareket durur, öğeler dağınık ve sabit görünür.
import { memo } from 'react'
import { C, INK } from './palette.js'
import './styles.js'

const NONE = { pointerEvents: 'none' }

// Her öğe: dış <g> konum, iç <g> animasyon; iç <g>'nin transform özniteliği
// yalnızca animasyon kapalıyken (reduced-motion) görünen sabit duruşudur.
function Loop({ x = 0, y = 0, cls, delay = 0, rest = '', dur, children }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={cls} transform={rest} style={{ animationDelay: `${delay}s`, ...(dur ? { animationDuration: `${dur}s` } : null) }}>
        {children}
      </g>
    </g>
  )
}

function Note({ c, double }) {
  return double ? (
    <g fill={c}>
      <ellipse cx={-3.4} cy={0} rx={2.6} ry={2} transform="rotate(-20 -3.4 0)" />
      <ellipse cx={3.4} cy={-2} rx={2.6} ry={2} transform="rotate(-20 3.4 -2)" />
      <path d="M-1.2 0 L-1.2 -10 L5.6 -12 L5.6 -2" stroke={c} strokeWidth="1.4" fill="none" />
      <path d="M-1.2 -10 L5.6 -12 L5.6 -9.6 L-1.2 -7.6Z" />
    </g>
  ) : (
    <g fill={c}>
      <ellipse cx={0} cy={0} rx={2.7} ry={2.1} transform="rotate(-20)" />
      <path d="M2.2 -0.6 L2.2 -11 Q6 -9 5.6 -5" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  )
}

export const MusicNotes = memo(function MusicNotes() {
  return (
    <g style={NONE} aria-hidden="true">
      <Loop x={-8} cls="sm-fx-rise" delay={0} rest="translate(0 -6)"><Note c={C.healingDeep} /></Loop>
      <Loop x={4} cls="sm-fx-rise" delay={-0.9} rest="translate(2 -18)"><Note c={C.apricot} double /></Loop>
      <Loop x={12} cls="sm-fx-rise" delay={-1.8} rest="translate(0 -4)"><Note c={C.lilac} /></Loop>
    </g>
  )
})

function Z({ s = 1, c = C.skyDeep }) {
  return <path d={`M${-3 * s} ${-3 * s} h${6 * s} l${-6 * s} ${6 * s} h${6 * s}`} stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
}

export const Zzz = memo(function Zzz() {
  return (
    <g style={NONE} aria-hidden="true">
      <Loop cls="sm-fx-z" delay={0} rest="translate(0 0)"><Z s={0.8} /></Loop>
      <Loop cls="sm-fx-z" delay={-1} rest="translate(7 -10)"><Z s={1.05} /></Loop>
      <Loop cls="sm-fx-z" delay={-2} rest="translate(14 -21)"><Z s={1.3} c={C.lilac} /></Loop>
    </g>
  )
})

function Heart({ c }) {
  return <path d="M0 -2.4 C-1.4 -5.4 -6 -4.6 -5.2 -1 C-4.6 1.4 -1.8 3.2 0 4.6 C1.8 3.2 4.6 1.4 5.2 -1 C6 -4.6 1.4 -5.4 0 -2.4Z" fill={c} stroke={INK} strokeOpacity="0.2" strokeWidth="0.6" />
}

export const Hearts = memo(function Hearts() {
  return (
    <g style={NONE} aria-hidden="true">
      <Loop x={-7} cls="sm-fx-rise" delay={0} rest="translate(0 -8)"><Heart c={C.rose} /></Loop>
      <Loop x={6} cls="sm-fx-rise" delay={-0.9} rest="translate(2 -20)"><g transform="scale(0.8)"><Heart c="#F38C9A" /></g></Loop>
      <Loop x={0} cls="sm-fx-rise" delay={-1.8} rest="translate(-2 -2)"><g transform="scale(1.1)"><Heart c={C.rose} /></g></Loop>
    </g>
  )
})

function Star({ r, c }) {
  const k = r * 0.2
  return <path d={`M0 ${-r} Q${k} ${-k} ${r} 0 Q${k} ${k} 0 ${r} Q${-k} ${k} ${-r} 0 Q${-k} ${-k} 0 ${-r}Z`} fill={c} />
}

export const Sparkle = memo(function Sparkle() {
  const stars = [[-10, -4, 5, C.sun, 0], [8, -12, 4, '#FFFFFF', -0.5], [12, 4, 3.4, C.apricotSoft, -1], [-4, -18, 3, C.mint, -1.3]]
  return (
    <g style={NONE} aria-hidden="true">
      {stars.map(([x, y, r, c, d], i) => (
        <Loop key={i} x={x} y={y} cls="sm-fx-twinkle" delay={d}><Star r={r} c={c} /></Loop>
      ))}
    </g>
  )
})

export const Bubbles = memo(function Bubbles() {
  const b = [[-6, 2.2, 0], [0, 1.4, -0.7], [5, 1.8, -1.4], [2, 1.1, -1.9]]
  return (
    <g style={NONE} aria-hidden="true">
      {b.map(([x, r, d], i) => (
        <Loop key={i} x={x} cls="sm-fx-bub" delay={d} rest={`translate(0 ${-5 - i * 5})`}>
          <circle r={r} fill="#FFFFFF" fillOpacity="0.35" stroke="#FFFFFF" strokeWidth="0.9" />
        </Loop>
      ))}
    </g>
  )
})

export const PaintStrokes = memo(function PaintStrokes() {
  const s = [
    [-8, 0, C.rose, 'M-4 0 Q0 -3 4 0', 0],
    [4, -8, C.sky, 'M-3 1 Q0 -3 3 -1', -0.8],
    [8, 4, C.sun, 'M-3 0 Q0 2.4 3 0', -1.6],
  ]
  return (
    <g style={NONE} aria-hidden="true">
      {s.map(([x, y, c, d, delay], i) => (
        <Loop key={i} x={x} y={y} cls="sm-fx-pop" delay={delay}>
          <path d={d} stroke={c} strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <circle cx={5} cy={-3} r={1.2} fill={c} />
        </Loop>
      ))}
    </g>
  )
})

// TV'nin önüne düşen titrek ışık. (0,0) = tv'nin eşya kökeni (ayak izi üst köşesi);
// eşyayla AYNI dönüşümle (rot=1'de scale(-1,1)) zemin katmanına çizilir.
export const TvGlow = memo(function TvGlow({ on = true }) {
  if (!on) return null
  const p = (u, v) => `${(u - v) * 32},${(u + v) * 16}`
  return (
    <g style={NONE} aria-hidden="true">
      <polygon className="sm-tv-cast" points={`${p(0.2, 0.7)} ${p(1.8, 0.7)} ${p(2.6, 2.6)} ${p(-0.6, 2.6)}`} fill="#BFE6FF" opacity="0.24" />
      <polygon className="sm-tv-cast" points={`${p(0.5, 0.7)} ${p(1.5, 0.7)} ${p(1.9, 1.8)} ${p(0.1, 1.8)}`} fill="#E6F6FF" opacity="0.2" style={{ animationDelay: '-1s' }} />
    </g>
  )
})

export const FX = { MusicNotes, Zzz, Hearts, Sparkle, Bubbles, PaintStrokes, TvGlow }
