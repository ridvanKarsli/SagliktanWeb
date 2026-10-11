// Gökyüzü ve hava katmanları. Hepsi EKRAN koordinatında çizilir (dünya değil):
// motor bunları sahnenin arkasına/önüne konmuş, pointer-events'siz bir
// <svg width height> içine koyar. Önerilen sıra:
//   arka:  <SkyBackdrop/>, <Stars/>, <SkyBody/>, <Clouds/>
//   dünya (kamera)
//   ön:    <WorldTint/>, <Fog/>, <Rain/> ya da <Snow/>
// Her bileşen birkaç DOM düğümüyle yetinir; hareket CSS ile, reduced-motion'da durur.
import { memo, useId } from 'react'
import { SKY, WEATHER } from './atmosphere.js'
import './styles.js'

const NONE = { pointerEvents: 'none' }
const safeId = (id) => id.replace(/[^a-zA-Z0-9_-]/g, '')
const GREY = new Set(['cloudy', 'rain', 'snow'])

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [x, y] = [p(a), p(b)]
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`
}

export const SkyBackdrop = memo(function SkyBackdrop({ timeOfDay = 'ogle', weather = 'clear', width, height }) {
  const id = `sm-sky-${safeId(useId())}`
  const s = SKY[timeOfDay] || SKY.ogle
  return (
    <g style={NONE} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={GREY.has(weather) ? mix(s.top, timeOfDay === 'gece' ? '#262B3A' : '#9DAAB5', 0.6) : s.top} />
          <stop offset="1" stopColor={GREY.has(weather) ? mix(s.bottom, timeOfDay === 'gece' ? '#343A4C' : '#C9D2D8', 0.6) : s.bottom} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} />
    </g>
  )
})

// Dünyanın üstüne serilen gün/hava tonu (multiply). Ekran katmanında (x=y=0) ya da
// tercihen kamera grubunun İÇİNDE dünya sınırlarını kaplayan dikdörtgen olarak
// (x,y,width,height = worldBounds) çizilir; böylece gök/ay tonlanmaz.
export const WorldTint = memo(function WorldTint({ timeOfDay = 'ogle', weather = 'clear', width, height, x = 0, y = 0 }) {
  const s = SKY[timeOfDay] || SKY.ogle
  const w = WEATHER[weather] || WEATHER.clear
  return (
    <g style={NONE} aria-hidden="true">
      {s.tintOpacity > 0 && <rect x={x} y={y} width={width} height={height} fill={s.tint} opacity={s.tintOpacity} style={{ mixBlendMode: 'multiply' }} />}
      {w.tint && <rect x={x} y={y} width={width} height={height} fill={w.tint} opacity={w.tintOpacity} style={{ mixBlendMode: 'multiply' }} />}
    </g>
  )
})

// Güneş ya da ay (gökyüzünde, sağ üst). Kapalı/yağışlı/sisli havada çizilmez.
export const SkyBody = memo(function SkyBody({ timeOfDay = 'ogle', weather = 'clear', width, height }) {
  if (GREY.has(weather) || weather === 'fog') return null
  const x = width * 0.82
  const y = Math.min(90, height * 0.16)
  if (timeOfDay === 'gece') {
    return (
      <g style={NONE} aria-hidden="true" transform={`translate(${x} ${y})`}>
        <circle r={40} fill="#F6F1D8" opacity="0.07" />
        <circle r={24} fill="#F6F1D8" opacity="0.12" />
        <circle r={14} fill="#F8F3DC" />
        <circle cx={-4} cy={-3} r={3} fill="#E6E0C4" />
        <circle cx={4} cy={4} r={2} fill="#E6E0C4" />
        <circle cx={5} cy={-5} r={1.3} fill="#E6E0C4" />
      </g>
    )
  }
  const low = timeOfDay === 'aksam'
  return (
    <g style={NONE} aria-hidden="true" transform={`translate(${low ? width * 0.15 : x} ${low ? height * 0.3 : y})`}>
      <circle r={40} fill={low ? '#FFC98A' : '#FFF3C4'} opacity="0.25" />
      <circle r={17} fill={low ? '#FFB067' : '#FFE07A'} />
    </g>
  )
})

function Cloud({ s = 1, o = 0.9, tone }) {
  const c = tone === 'night' ? '#4D5C84' : tone === 'storm' ? '#E4E9EE' : '#FFFFFF'
  const under = tone === 'night' ? '#3E4B70' : tone === 'storm' ? '#CBD4DC' : '#E8F2F7'
  return (
    <g transform={`scale(${s})`} opacity={o}>
      <ellipse cx={0} cy={0} rx={46} ry={14} fill={c} />
      <ellipse cx={-16} cy={-10} rx={20} ry={15} fill={c} />
      <ellipse cx={12} cy={-14} rx={24} ry={19} fill={c} />
      <ellipse cx={0} cy={6} rx={44} ry={7} fill={under} />
    </g>
  )
}

// density 0..1 -> 2..8 bulut; ekranı soldan sağa yavaşça geçerler.
// tone: 'day' | 'night' | 'storm' (yağmur/kar)
export const Clouds = memo(function Clouds({ density = 0.4, width, height, tone = 'day' }) {
  const n = Math.round(2 + Math.max(0, Math.min(1, density)) * 6)
  const span = width + 360
  const items = []
  for (let i = 0; i < n; i++) {
    const t = i / n
    const y = 30 + ((i * 53) % Math.max(60, height * 0.32))
    const dur = 70 + ((i * 37) % 50)
    const s = 0.6 + ((i * 29) % 7) / 10
    items.push(
      <g key={i} transform={`translate(-180 ${y})`}>
        <g
          className="sm-drift"
          transform={`translate(${t * span} 0)`}
          style={{ '--sm-dx': `${span}px`, '--sm-dur': `${dur}s`, animationDelay: `${-t * dur}s` }}
        >
          <Cloud s={s} o={0.75 + (i % 3) * 0.08} tone={tone} />
        </g>
      </g>,
    )
  }
  return <g style={NONE} aria-hidden="true">{items}</g>
})

// intensity 0..1. Desen tekrarlı tek dikdörtgen; iki katman (yakın/uzak).
export const Rain = memo(function Rain({ intensity = 0.6, width, height }) {
  const id = `sm-rain-${safeId(useId())}`
  const n = Math.round(3 + intensity * 7)
  const streaks = []
  for (let i = 0; i < n; i++) {
    const x = (i * 37) % 60
    const y = (i * 23) % 60
    streaks.push(<path key={i} d={`M${x} ${y} l-4 12`} stroke="#DCEBF5" strokeWidth="1.3" strokeLinecap="round" />)
  }
  return (
    <g style={NONE} aria-hidden="true">
      <defs>
        <pattern id={id} width="60" height="60" patternUnits="userSpaceOnUse">{streaks}</pattern>
      </defs>
      <rect className="sm-rain" x={0} y={-60} width={width} height={height + 60} fill={`url(#${id})`} opacity={0.35 + intensity * 0.35} />
      <rect className="sm-rain sm-slow" x={0} y={-60} width={width} height={height + 60} fill={`url(#${id})`} opacity={0.25} transform="scale(1.6)" />
      <rect width={width} height={height} fill="#5E7384" opacity={0.06 + intensity * 0.06} />
    </g>
  )
})

export const Snow = memo(function Snow({ width, height }) {
  const id = `sm-snow-${safeId(useId())}`
  const dots = []
  for (let i = 0; i < 9; i++) dots.push(<circle key={i} cx={(i * 31) % 80} cy={(i * 47) % 80} r={1.2 + (i % 3) * 0.6} fill="#FFFFFF" />)
  return (
    <g style={NONE} aria-hidden="true">
      <defs>
        <pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse">{dots}</pattern>
      </defs>
      <rect className="sm-snow" x={0} y={-80} width={width + 40} height={height + 80} fill={`url(#${id})`} opacity="0.9" />
      <rect className="sm-snow sm-slow" x={0} y={-80} width={width + 40} height={height + 80} fill={`url(#${id})`} opacity="0.55" transform="translate(23 31) scale(0.7)" />
    </g>
  )
})

export const Fog = memo(function Fog({ width, height }) {
  return (
    <g style={NONE} aria-hidden="true">
      <rect width={width} height={height} fill="#EEF2F2" opacity="0.22" />
      <g className="sm-fog">
        <ellipse cx={width * 0.25} cy={height * 0.55} rx={width * 0.4} ry={height * 0.12} fill="#FFFFFF" opacity="0.28" />
        <ellipse cx={width * 0.75} cy={height * 0.75} rx={width * 0.45} ry={height * 0.14} fill="#FFFFFF" opacity="0.24" />
        <ellipse cx={width * 0.5} cy={height * 0.35} rx={width * 0.5} ry={height * 0.1} fill="#FFFFFF" opacity="0.2" />
      </g>
    </g>
  )
})

// Gece yıldızları: ekranın üst yarısında, desenle (tek dikdörtgen) + birkaç ışıltılı.
export const Stars = memo(function Stars({ width, height }) {
  const id = `sm-stars-${safeId(useId())}`
  const dots = [[12, 18, 0.9], [70, 9, 0.7], [104, 52, 1], [40, 64, 0.6], [150, 30, 0.8], [130, 80, 0.6], [20, 92, 0.7]]
  const big = [[0.12, 0.08], [0.38, 0.16], [0.6, 0.06], [0.72, 0.22], [0.9, 0.12], [0.25, 0.3]]
  return (
    <g style={NONE} aria-hidden="true">
      <defs>
        <pattern id={id} width="170" height="110" patternUnits="userSpaceOnUse">
          {dots.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#FFF8E1" opacity="0.8" />)}
        </pattern>
      </defs>
      <rect width={width} height={height * 0.55} fill={`url(#${id})`} />
      {big.map(([fx, fy], i) => (
        <path
          key={i}
          className={`sm-twinkle${i % 2 ? ' sm-d1' : ''}`}
          transform={`translate(${fx * width} ${fy * height})`}
          d="M0 -4 Q0.6 -0.6 4 0 Q0.6 0.6 0 4 Q-0.6 0.6 -4 0 Q-0.6 -0.6 0 -4Z"
          fill="#FFF3C9"
        />
      ))}
    </g>
  )
})
