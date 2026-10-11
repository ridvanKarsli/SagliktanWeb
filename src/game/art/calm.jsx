// Mola anları (EK v1.2 §D): nefes çemberi ve sakin dalga görünümü. Ses yok.
// İkisi de kendi <svg>'sini çizer; yazı/etiket arayüze bırakılır (label prop'u isteğe bağlı).
// prefers-reduced-motion: dalgalar durur, nefes çemberi geçiş animasyonsuz güncellenir.
import { memo, useId } from 'react'
import { C } from './palette.js'
import './styles.js'

const sid = (id) => id.replace(/[^a-zA-Z0-9_-]/g, '')

// phase: 'in' (4 sn al) | 'hold' (4 sn tut) | 'out' (6 sn ver); progress 0..1 (arayüz sürer)
export const BreathingCircle = memo(function BreathingCircle({ phase = 'in', progress = 0, size = 240, label, title }) {
  const id = sid(useId())
  const p = Math.max(0, Math.min(1, progress))
  const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2
  const f = phase === 'in' ? 0.55 + 0.45 * ease(p) : phase === 'hold' ? 1 : 1 - 0.45 * ease(p)
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <radialGradient id={`bc-${id}`} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#E8FBF2" />
          <stop offset="0.55" stopColor="#A6E3C8" />
          <stop offset="1" stopColor="#7CC9D9" />
        </radialGradient>
      </defs>
      <circle r={96} fill={C.mint} opacity="0.1" />
      <circle r={84} fill="none" stroke={C.healing} strokeOpacity="0.25" strokeWidth="1.4" strokeDasharray="2 6" />
      <circle r={70} fill="none" stroke={C.healing} strokeOpacity="0.18" strokeWidth="1" />
      <g className="sm-breathe" style={{ transform: `scale(${f})` }}>
        <circle r={78} fill={C.mint} opacity={phase === 'hold' ? 0.22 : 0.14} />
        <circle r={70} fill={`url(#bc-${id})`} />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx={0} cy={-46} rx={14} ry={24} fill="#FFFFFF" opacity="0.12" transform={`rotate(${a})`} />
        ))}
        <circle r={22} fill="#FFFFFF" opacity="0.35" />
        <ellipse cx={-24} cy={-30} rx={14} ry={8} fill="#FFFFFF" opacity="0.35" transform="rotate(-30 -24 -30)" />
      </g>
      {label && (
        <text y={6} textAnchor="middle" fontFamily='"Baloo 2 Variable", "Nunito Variable", sans-serif' fontWeight="800" fontSize="17" fill="#1F5A4E">{label}</text>
      )}
    </svg>
  )
})

// Sakin deniz ve ufuk; dalgalar yavaşça kayar. Bulunduğu kutuyu doldurur.
export const WavesView = memo(function WavesView({ width = '100%', height = '100%', title }) {
  const id = sid(useId())
  const wave = (y, amp, len, color, op, cls, dur) => {
    let d = `M-160 ${y}`
    for (let x = -160; x < 600; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`
    d += ` V260 H-160Z`
    return <path className={cls} style={{ animationDuration: `${dur}s`, '--sm-wl': `${-len}px` }} d={d} fill={color} opacity={op} />
  }
  return (
    <svg width={width} height={height} viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFDDF0" />
          <stop offset="0.7" stopColor="#FCE3CC" />
          <stop offset="1" stopColor="#FBD7B8" />
        </linearGradient>
        <linearGradient id={`sea-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8EC9DD" />
          <stop offset="1" stopColor="#4F9FBF" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#sky-${id})`} />
      {/* güneş ve bulutlar */}
      <circle cx="248" cy="104" r="36" fill="#FFE6B8" opacity="0.5" />
      <circle cx="248" cy="104" r="17" fill="#FFD48A" />
      <g fill="#FFFFFF" opacity="0.75">
        <ellipse cx="88" cy="46" rx="34" ry="8" />
        <ellipse cx="104" cy="40" rx="18" ry="9" />
        <ellipse cx="220" cy="64" rx="26" ry="6" />
      </g>
      {/* uzak adalar */}
      <path d="M0 118 Q30 106 62 112 Q92 100 128 113 L150 118Z" fill="#9AA9C9" opacity="0.7" />
      <path d="M196 118 Q214 110 236 114 Q250 108 266 116 L272 118Z" fill="#A7B3D0" opacity="0.65" />
      {/* deniz */}
      <rect y="117" width="400" height="123" fill={`url(#sea-${id})`} />
      <rect y="116.5" width="400" height="1.4" fill="#FFF3DD" opacity="0.7" />
      {/* güneş yansıması */}
      <g fill="#FFF3D0">
        {[[240, 124, 16], [246, 132, 22], [238, 141, 14], [250, 150, 26], [242, 162, 18], [248, 176, 30]].map(([x, y, w], i) => (
          <rect key={i} className={`sm-twinkle${i % 2 ? ' sm-d1' : ''}`} x={x - w / 2} y={y} width={w} height="1.6" rx="0.8" opacity="0.8" />
        ))}
      </g>
      {/* yelkenli */}
      <g transform="translate(150 114)"><g className="sm-bob">
        <path d="M0 0 L0 -16 L9 -2Z" fill="#FFFDF8" />
        <path d="M-1 -12 L-1 -1 L-7 -1Z" fill="#F4E9DA" />
        <path d="M-9 0 H11 L8 3 H-6Z" fill="#6E5440" />
      </g></g>
      {/* martılar */}
      <path d="M60 78 q5 -5 10 0 q5 -5 10 0 M330 58 q4 -4 8 0 q4 -4 8 0" stroke="#5E6F7E" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* dalgalar */}
      {wave(140, 3, 80, '#7FC0D8', 0.55, 'sm-wave', 14)}
      {wave(160, 4, 96, '#6DB4CF', 0.6, 'sm-wave sm-rev', 18)}
      {wave(184, 5, 120, '#5FA8C6', 0.65, 'sm-wave', 22)}
      {/* kıyı ve köpük */}
      <path d="M-10 222 Q120 206 240 214 Q330 220 410 208 V250 H-10Z" fill="#F4E0AE" />
      <path className="sm-foam" d="M-10 220 Q120 204 240 212 Q330 218 410 206" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
      <path d="M40 232 q6 -3 12 0 M300 228 q5 -2.6 10 0" stroke="#E6CB8C" strokeWidth="1.4" fill="none" />
    </svg>
  )
})
