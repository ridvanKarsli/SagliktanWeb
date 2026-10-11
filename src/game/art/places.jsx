// Sağlıktan'a bağlı yerler ve mola noktaları (EK v1.2): kahve, pano, kütüphane,
// postane, "Bugün nasılsın?" bankı, iskele ucu, bahçe kapısı; iyilik bahçesi.
// Hepsi ayak izi yerel koordinatında: (0,0) = ayak izinin üst köşesi.
// Yazılı tabelalar (Kütüphane, Postane, Bugün nasılsın?) rot=0 için çizilir;
// bu yerler haritada aynalanmadan (rot 0) kullanılmalı.
import { memo } from 'react'
import { C, INK, shade } from './palette.js'
import { P, pt, LINE, Box, Cyl, Shadow, Blob, faceV, faceU, flat, onV, onU, UNIT } from './primitives.jsx'
import './styles.js'

const S = LINE
const FONT = '"Baloo 2 Variable", "Baloo 2", "Nunito Variable", Nunito, sans-serif'

function Win({ v, u1, u2, h1, h2, lit, trim = C.white, curtain, books, arch }) {
  const W = (u2 - u1) * UNIT
  const H = h2 - h1
  const glass = lit ? '#FFDF94' : C.glass
  return (
    <g>
      {lit && <polygon className="sm-glow" points={faceV(v, u1 - 0.16, u2 + 0.16, h1 - 7, h2 + 7)} fill="#FFE29A" opacity="0.65" />}
      <g transform={onV(u1, v, h2)}>
        <path d={arch ? `M-2.4 ${H + 2.4} L-2.4 ${W / 2} Q-2.4 -3 ${W / 2} -3 Q${W + 2.4} -3 ${W + 2.4} ${W / 2} L${W + 2.4} ${H + 2.4}Z` : `M-2.4 -2.4 H${W + 2.4} V${H + 2.4} H-2.4Z`} fill={trim} {...S} />
        <path d={arch ? `M0 ${H} L0 ${W / 2} Q0 0 ${W / 2} 0 Q${W} 0 ${W} ${W / 2} L${W} ${H}Z` : `M0 0 H${W} V${H} H0Z`} fill={glass} />
        {books && [0.28, 0.62].map((t) => (
          <g key={t}>
            <rect x={1.5} y={H * t + 6} width={W - 3} height={1.6} fill={lit ? '#B9875A' : '#8C5E3C'} />
            {Array.from({ length: Math.floor((W - 3) / 3.2) }).map((_, i) => (
              <rect key={i} x={1.8 + i * 3.2} y={H * t - 1 + (i % 3)} width={2.4} height={7 - (i % 3)} fill={[C.rose, C.sky, C.apricot, C.healing, C.lilac, C.sun][i % 6]} opacity={lit ? 0.85 : 0.75} />
            ))}
          </g>
        ))}
        {curtain && <path d={`M0 ${H * 0.55} H${W} V${H} H0Z`} fill="#FFFDF8" opacity="0.85" />}
        {curtain && <path d={`M0 ${H * 0.55} ${Array.from({ length: 6 }).map((_, i) => `Q${(i + 0.5) * (W / 6)} ${H * 0.55 + 2.4} ${(i + 1) * (W / 6)} ${H * 0.55}`).join(' ')}`} fill="none" stroke="#E8E0D0" strokeWidth="0.8" />}
        {!books && <path d={`M${W / 2} ${arch ? W / 4 : 0} V${H} M0 ${H * 0.45} H${W}`} stroke={trim} strokeWidth="1.6" />}
        {!lit && <path d={`M2.5 ${H * 0.3} L6 ${H * 0.15}`} stroke="#fff" strokeWidth="1.4" opacity="0.7" strokeLinecap="round" />}
      </g>
    </g>
  )
}

function HipRoof({ a, b, c, d, eave, apexH, color }) {
  // dikdörtgen ayak izi (a..b u, c..d v) üstünde kırma çatı; mahya u boyunca
  const vm = (c + d) / 2
  const r1 = P(a + (vm - c), vm, apexH)
  const r2 = P(b - (vm - c), vm, apexH)
  return (
    <g>
      <polygon points={`${P(a, d, eave)} ${P(b, d, eave)} ${r2} ${r1}`} fill={color} {...S} />
      <polygon points={`${P(b, c, eave)} ${P(b, d, eave)} ${r2}`} fill={shade(color, -0.16)} {...S} />
      {[0.33, 0.66].map((t) => (
        <path key={t} d={`M${P(a + (vm - c) * t, d - (d - vm) * t, eave + (apexH - eave) * t)} L${P(b - (vm - c) * t, d - (d - vm) * t, eave + (apexH - eave) * t)}`} stroke={shade(color, -0.22)} strokeWidth="1.1" opacity="0.6" />
      ))}
      <polygon points={`${P(a, d, eave)} ${P(b, d, eave)} ${P(b, d, eave - 3)} ${P(a, d, eave - 3)}`} fill={shade(color, -0.3)} />
      <polygon points={`${P(b, c, eave)} ${P(b, d, eave)} ${P(b, d, eave - 3)} ${P(b, c, eave - 3)}`} fill={shade(color, -0.38)} />
    </g>
  )
}

function Lantern({ x, y, lit = true, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {lit && <circle className="sm-glow" cx={0} cy={-5} r={10} fill="#FFE59A" opacity="0.6" />}
      <path d="M-3.4 -10 L3.4 -10 L4 -1 L-4 -1Z" fill={lit ? '#FFE08A' : '#F3EEDD'} stroke={C.teal} strokeWidth="1" strokeLinejoin="round" />
      <path d="M-4.6 -10 L4.6 -10 L2 -13 L-2 -13Z" fill={C.teal} />
      <rect x={-4.4} y={-1.4} width={8.8} height={1.8} rx={0.9} fill={C.teal} />
      <path d="M0 -13 V-15" stroke={C.teal} strokeWidth="1" />
    </g>
  )
}

function TeaGlass({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0.4} rx={3.6} ry={1.4} fill={C.rose} />
      <path d="M-2.2 -7.4 Q-1 -4 -1.8 -2 Q-1.3 0 0 0 Q1.3 0 1.8 -2 Q1 -4 2.2 -7.4Z" fill="#C8582C" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.6" />
    </g>
  )
}

function CafeTable({ u, v }) {
  const [x, y] = pt(u, v)
  return (
    <g>
      <Shadow x={x} y={y + 1} rx={13} ry={5.5} o={0.12} />
      <Cyl x={x - 10} y={y - 1} r={3.6} h={8} color={C.healing} />
      <rect x={x - 1.2} y={y - 17} width={2.4} height={17} fill={C.woodDeep} />
      <ellipse cx={x} cy={y - 17} rx={9} ry={4.4} fill={C.white} {...S} />
      <ellipse cx={x} cy={y - 17} rx={6.4} ry={3} fill="none" stroke={C.rosePale} strokeWidth="0.8" />
      <TeaGlass x={x - 2.6} y={y - 17} s={0.8} />
      <TeaGlass x={x + 3} y={y - 16} s={0.8} />
      <Cyl x={x + 9} y={y + 3} r={3.6} h={8} color={C.healing} />
    </g>
  )
}

// ---------------------------------------------------------------- Soru-Cevap Kahvesi (3×2)
// Tebeşir tahtası (yarı A-çerçeve) ayak izinin önünde, kapının yanında: CafeSign oraya yazar.
const BOARD = { u1: 1.88, u2: 2.66, v: 1.78, h1: 3, h2: 27 }

export const CafeSign = memo(function CafeSign({ count = null }) {
  const W = (BOARD.u2 - BOARD.u1) * UNIT
  const H = BOARD.h2 - BOARD.h1
  const has = typeof count === 'number' && count >= 0
  const n = has ? (count > 99 ? '99+' : String(count)) : null
  return (
    <g transform={onV(BOARD.u1, BOARD.v, BOARD.h2)} aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <g fontFamily={FONT} fill="#F6F3E8" textAnchor="middle" fontWeight="700">
        {has ? (
          <>
            <text x={W / 2} y={H * 0.52} fontSize="11">{n}</text>
            <text x={W / 2} y={H * 0.86} fontSize="6.4">soru</text>
          </>
        ) : (
          <>
            <text x={W / 2} y={H * 0.44} fontSize="6.4">Soru-</text>
            <text x={W / 2} y={H * 0.78} fontSize="6.4">Cevap</text>
          </>
        )}
      </g>
      <path d={`M3 ${H - 3} q3 -1.6 6 0`} stroke="#F6F3E8" strokeWidth="0.7" fill="none" opacity="0.6" />
    </g>
  )
})

export const QaCafe = memo(function QaCafe({ lit = false, count }) {
  const wall = '#F4E7CF'
  const teal = '#2F7F74'
  const N = 8
  const awning = []
  for (let i = 0; i < N; i++) {
    const u1 = 0.18 + (i * 2.64) / N
    const u2 = u1 + 2.64 / N
    awning.push(<polygon key={i} points={`${P(u1, 0.96, 56)} ${P(u2, 0.96, 56)} ${P(u2, 1.3, 49)} ${P(u1, 1.3, 49)}`} fill={i % 2 ? C.cream : teal} />)
  }
  const scallops = []
  for (let i = 0; i < N; i++) {
    const u1 = 0.18 + (i * 2.64) / N
    const u2 = u1 + 2.64 / N
    const [x1, y1] = pt(u1, 1.3, 49)
    const [x2, y2] = pt(u2, 1.3, 49)
    scallops.push(<path key={i} d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + 4.5} ${x2} ${y2}Z`} fill={i % 2 ? C.cream : teal} {...S} />)
  }
  return (
    <g>
      <Shadow x={pt(1.5, 1)[0] + 6} y={pt(1.5, 1)[1]} rx={90} ry={34} o={0.12} />
      {lit && <ellipse className="sm-glow" cx={pt(1.5, 1.5)[0]} cy={pt(1.5, 1.5)[1]} rx={70} ry={26} fill="#FFE7A6" opacity="0.45" />}
      <Box u={0.12} v={0.06} w={2.76} d={0.9} h={78} color={wall} />
      <polygon points={faceV(0.96, 0.12, 2.88, 0, 12)} fill={teal} opacity="0.85" />
      <polygon points={faceU(2.88, 0.06, 0.96, 0, 12)} fill={shade(teal, -0.15)} opacity="0.85" />
      {/* tabela: çay bardağı amblemi */}
      <polygon points={faceV(0.96, 0.62, 2.38, 61, 74)} fill={teal} {...S} />
      <g transform={onV(1.5, 0.96, 72.4)}>
        <path d="M-2.6 0.6 Q-1.2 4 -2.1 6.2 Q-1.5 8.4 0 8.4 Q1.5 8.4 2.1 6.2 Q1.2 4 2.6 0.6Z" fill="#FFD27A" />
        <ellipse cx={0} cy={8.8} rx={4} ry={1.1} fill={C.cream} />
        {[-14, -9, 9, 14].map((x) => <circle key={x} cx={x} cy={5} r={1.2} fill={C.cream} opacity="0.85" />)}
      </g>
      {/* pencereler + kapı */}
      <Win v={0.96} u1={0.3} u2={1.0} h1={14} h2={46} lit={lit} trim={C.cream} curtain />
      <Win v={0.96} u1={2.0} u2={2.7} h1={14} h2={46} lit={lit} trim={C.cream} curtain />
      <polygon points={faceV(0.96, 1.18, 1.82, 0, 46)} fill={C.cream} {...S} />
      <polygon points={faceV(0.96, 1.24, 1.76, 0, 43)} fill={C.wood} {...S} />
      <polygon points={faceV(0.96, 1.3, 1.7, 22, 39)} fill={lit ? '#FFDF94' : C.glass} />
      <circle cx={pt(1.68, 0.96, 20)[0]} cy={pt(1.68, 0.96, 20)[1]} r={1.3} fill={C.apricot} />
      <polygon points={faceU(2.88, 0.28, 0.78, 18, 44)} fill={lit ? '#F5C878' : shade(C.glass, -0.08)} {...S} />
      {/* tente */}
      {awning}
      {scallops}
      {/* çatı (öne eğimli, kiremit) */}
      <polygon points={`${P(0.02, -0.04, 96)} ${P(2.98, -0.04, 96)} ${P(2.98, 1.06, 80)} ${P(0.02, 1.06, 80)}`} fill={C.terracotta} {...S} />
      <polygon points={`${P(2.98, -0.04, 96)} ${P(2.98, 1.06, 80)} ${P(2.98, 1.06, 76)} ${P(2.98, -0.04, 92)}`} fill={shade(C.terracotta, -0.3)} {...S} />
      <polygon points={`${P(0.02, 1.06, 80)} ${P(2.98, 1.06, 80)} ${P(2.98, 1.06, 76)} ${P(0.02, 1.06, 76)}`} fill={shade(C.terracotta, -0.22)} />
      {[0.35, 0.7].map((t) => <path key={t} d={`M${P(0.02, -0.04 + 1.1 * t, 96 - 16 * t)} L${P(2.98, -0.04 + 1.1 * t, 96 - 16 * t)}`} stroke={shade(C.terracotta, -0.2)} strokeWidth="1.1" opacity="0.6" />)}
      {/* kapı önü saksılar */}
      {[1.08, 1.92].map((u) => (
        <g key={u} transform={`translate(${pt(u, 1.12)[0]} ${pt(u, 1.12)[1]})`}>
          <path d="M-3.4 -6 L3.4 -6 L2.6 0 L-2.6 0Z" fill={C.terracotta} {...S} />
          <Blob line={false} fill={C.leaf} circles={[[-2.6, -9, 3], [2.6, -9, 3], [0, -12, 3.2]]} />
          <circle cx={1} cy={-11} r={1.2} fill={C.rose} />
        </g>
      ))}
      {/* dış masalar */}
      <CafeTable u={0.62} v={1.58} />
      {/* tebeşir tahtası (A-çerçeve) */}
      <g>
        <polygon points={`${P(BOARD.u1 + 0.05, BOARD.v - 0.3, 0)} ${P(BOARD.u1 + 0.05, BOARD.v, 0)} ${P(BOARD.u1 + 0.05, BOARD.v - 0.12, BOARD.h2)}`} fill={C.woodDeep} />
        <polygon points={faceV(BOARD.v, BOARD.u1 - 0.06, BOARD.u2 + 0.06, BOARD.h1 - 3, BOARD.h2 + 3)} fill={C.wood} {...S} />
        <polygon points={faceV(BOARD.v, BOARD.u1, BOARD.u2, BOARD.h1, BOARD.h2)} fill="#33463F" />
        <path d={`M${P(BOARD.u1 + 0.08, BOARD.v, BOARD.h2 - 3)} L${P(BOARD.u2 - 0.1, BOARD.v, BOARD.h2 - 3)}`} stroke="#F6F3E8" strokeWidth="0.6" opacity="0.4" strokeDasharray="2 2" />
      </g>
      {count !== undefined && <CafeSign count={count} />}
    </g>
  )
})

// ---------------------------------------------------------------- Mahalle Panosu (1×1)
export const NoticeBoard = memo(function NoticeBoard() {
  const notes = [
    [0.12, 0.3, 18, 30, C.cream, C.rose],
    [0.36, 0.56, 14, 28, C.mint, C.apricot],
    [0.62, 0.86, 18, 31, C.apricotPale, C.healing],
    [0.2, 0.48, 3, 12, C.skyPale, C.rose],
    [0.56, 0.82, 4, 13, C.white, C.sky],
  ]
  return (
    <g>
      <Shadow x={0} y={17} rx={22} ry={8} o={0.14} />
      <Box u={0.06} v={0.42} w={0.08} d={0.08} h={44} color={C.woodDeep} />
      <Box u={0.86} v={0.42} w={0.08} d={0.08} h={44} color={C.woodDeep} />
      <g transform={`translate(0 ${-14})`}>
        <polygon points={faceV(0.5, 0.02, 0.98, 0, 32)} fill={C.wood} {...S} />
        <polygon points={faceV(0.5, 0.06, 0.94, 2, 30)} fill="#D9B48A" />
        {notes.map(([u1, u2, h1, h2, c, pin], i) => (
          <g key={i}>
            <polygon points={faceV(0.505, u1, u2, h1, h2)} fill={c} {...S} transform={`rotate(${(i % 2 ? -3 : 3)} ${pt((u1 + u2) / 2, 0.5, (h1 + h2) / 2)[0]} ${pt((u1 + u2) / 2, 0.5, (h1 + h2) / 2)[1]})`} />
            <path d={`M${P(u1 + 0.05, 0.505, h2 - 4)} L${P(u2 - 0.05, 0.505, h2 - 4)} M${P(u1 + 0.05, 0.505, h2 - 7)} L${P(u2 - 0.08, 0.505, h2 - 7)}`} stroke={C.metal} strokeWidth="0.6" opacity="0.5" />
            <circle cx={pt((u1 + u2) / 2, 0.505, h2 - 1)[0]} cy={pt((u1 + u2) / 2, 0.505, h2 - 1)[1]} r={1.3} fill={pin} />
          </g>
        ))}
        {/* küçük çatı */}
        <polygon points={`${P(-0.04, 0.3, 36)} ${P(1.04, 0.3, 36)} ${P(1.04, 0.66, 30)} ${P(-0.04, 0.66, 30)}`} fill={C.terracotta} {...S} />
      </g>
    </g>
  )
})

// ---------------------------------------------------------------- Kütüphane (3×3)
export const Library = memo(function Library({ lit = false }) {
  const wall = '#EDC9A6'
  const quoin = '#F6E3CC'
  const a = 0.15
  const b = 2.55
  const H = 88
  return (
    <g>
      <Shadow x={pt(1.5, 1.5)[0] + 10} y={pt(1.5, 1.5)[1] + 4} rx={96} ry={44} o={0.12} />
      {lit && <ellipse className="sm-glow" cx={pt(1.5, 2.9)[0]} cy={pt(1.5, 2.9)[1]} rx={60} ry={22} fill="#FFE7A6" opacity="0.45" />}
      <Box u={a} v={a} w={2.85 - a} d={b - a} h={H} color={wall} />
      {/* köşe taşları */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <polygon points={faceV(b, 2.7 - 0.14 * (i % 2), 2.85, i * 14 + 2, i * 14 + 12)} fill={quoin} />
          <polygon points={faceV(b, a, a + 0.15 + 0.14 * (i % 2), i * 14 + 2, i * 14 + 12)} fill={quoin} />
        </g>
      ))}
      <polygon points={faceV(b, a, 2.85, 0, 8)} fill={shade(wall, -0.2)} />
      <polygon points={faceU(2.85, a, b, 0, 8)} fill={shade(wall, -0.32)} />
      <polygon points={faceV(b, a, 2.85, H - 6, H)} fill={quoin} />
      {/* yan pencereler */}
      {[0.5, 1.5].map((v) => (
        <polygon key={v} points={faceU(2.85, v, v + 0.55, 26, 60)} fill={lit ? '#F5C878' : shade(C.glass, -0.08)} {...S} />
      ))}
      {/* ön: kemerli kitaplı pencereler */}
      <Win v={b} u1={0.42} u2={1.02} h1={18} h2={66} lit={lit} trim={C.white} books arch />
      <Win v={b} u1={1.98} u2={2.58} h1={18} h2={66} lit={lit} trim={C.white} books arch />
      {/* kapı */}
      <g transform={onV(1.16, b, 0)}>
        <path d={`M-3 0 V-40 Q-3 -${54} ${0.68 * UNIT / 2} -54 Q${0.68 * UNIT + 3} -54 ${0.68 * UNIT + 3} -40 V0Z`} fill={C.white} {...S} />
        <path d={`M0 0 V-38 Q0 -50 ${0.68 * UNIT / 2} -50 Q${0.68 * UNIT} -50 ${0.68 * UNIT} -38 V0Z`} fill={C.healingDeep} {...S} />
        <path d={`M${0.68 * UNIT / 2} -50 V0`} stroke={shade(C.healingDeep, -0.2)} strokeWidth="1" />
        <path d={`M3 -36 Q3 -46 ${0.68 * UNIT / 2 - 1} -46 V-36Z M${0.68 * UNIT - 3} -36 Q${0.68 * UNIT - 3} -46 ${0.68 * UNIT / 2 + 1} -46 V-36Z`} fill={lit ? '#FFDF94' : C.glass} opacity="0.8" />
        <circle cx={0.68 * UNIT / 2 - 3} cy={-20} r={1.3} fill={C.sun} />
        <circle cx={0.68 * UNIT / 2 + 3} cy={-20} r={1.3} fill={C.sun} />
      </g>
      {/* basamaklar */}
      <Box u={0.95} v={b} w={1.1} d={0.22} h={4} color="#E6DED0" />
      <Box u={1.02} v={b + 0.22} w={0.96} d={0.16} h={2} color="#EEE8DC" />
      {/* levha: Kütüphane */}
      <polygon points={faceV(b, 0.82, 2.18, 66, 78)} fill={C.cream} {...S} />
      <g transform={onV(0.82, b, 78)}>
        <text x={1.36 * UNIT / 2} y={9.2} textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="8.2" fill={C.healingDeep}>Kütüphane</text>
      </g>
      {/* kapı yanı saksı ağaçları */}
      {[0.72, 2.28].map((u) => (
        <g key={u} transform={`translate(${pt(u, b + 0.2)[0]} ${pt(u, b + 0.2)[1]})`}>
          <Cyl x={0} y={0} r={5} h={8} color={C.terracotta} top="#8B6A4E" />
          <rect x={-0.8} y={-20} width={1.6} height={12} fill={C.trunkDeep} />
          <Blob fill={C.leaf} circles={[[0, -24, 7], [-4, -20, 5], [4, -20, 5]]} />
        </g>
      ))}
      <HipRoof a={a - 0.12} b={2.97} c={a - 0.12} d={b + 0.12} eave={H} apexH={H + 34} color="#5E9C8F" />
      {/* çatıda küçük kitap amblemi (cephe üstü alınlık) */}
      <g transform={onV(1.28, b + 0.12, H + 16)}>
        <path d="M0 6 Q4 3 8.6 6 Q13 3 17.2 6 V14 Q13 11 8.6 14 Q4 11 0 14Z" fill={C.cream} {...S} />
        <path d="M8.6 6 V14" stroke={C.healingDeep} strokeWidth="0.8" />
      </g>
    </g>
  )
})

// ---------------------------------------------------------------- Postane (2×2)
// PostBadge: tabelanın sağ üst köşesinde küçük kırmızı rozet.
const BADGE_AT = pt(1.74, 1.5, 62)

export const PostBadge = memo(function PostBadge({ count }) {
  if (!count || count <= 0) return null
  const n = count > 9 ? '9+' : String(count)
  return (
    <g transform={`translate(${BADGE_AT[0]} ${BADGE_AT[1]})`} aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <circle r={7.4} fill={C.rose} stroke="#fff" strokeWidth="1.6" />
      <text y={3} textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="8.4" fill="#fff">{n}</text>
    </g>
  )
})

export const PostOffice = memo(function PostOffice({ lit = false, count }) {
  const wall = '#C3DDF0'
  const b = 1.5
  return (
    <g>
      <Shadow x={pt(1, 1)[0] + 6} y={pt(1, 1)[1] + 3} rx={64} ry={28} o={0.12} />
      {lit && <ellipse className="sm-glow" cx={pt(1, 1.9)[0]} cy={pt(1, 1.9)[1]} rx={42} ry={16} fill="#FFE7A6" opacity="0.45" />}
      <Box u={0.15} v={0.15} w={1.7} d={b - 0.15} h={64} color={wall} />
      <polygon points={faceV(b, 0.15, 1.85, 0, 7)} fill={shade(wall, -0.22)} />
      <polygon points={faceU(1.85, 0.15, b, 0, 7)} fill={shade(wall, -0.34)} />
      <polygon points={faceV(b, 0.15, 1.85, 56, 60)} fill={C.white} opacity="0.85" />
      <polygon points={faceU(1.85, 0.4, 0.95, 16, 38)} fill={lit ? '#F5C878' : shade(C.glass, -0.08)} {...S} />
      <Win v={b} u1={0.28} u2={0.7} h1={14} h2={36} lit={lit} />
      {/* kapı */}
      <polygon points={faceV(b, 0.92, 1.58, 0, 40)} fill={C.white} {...S} />
      <polygon points={faceV(b, 0.98, 1.52, 0, 37)} fill={C.terracotta} {...S} />
      <polygon points={faceV(b, 1.04, 1.46, 22, 33)} fill={lit ? '#FFDF94' : C.glass} />
      <circle cx={pt(1.46, b, 17)[0]} cy={pt(1.46, b, 17)[1]} r={1.2} fill={C.sun} />
      {/* tabela: zarf + Postane */}
      <polygon points={faceV(b, 0.36, 1.64, 43, 58)} fill={C.cream} {...S} />
      <g transform={onV(0.36, b, 58)}>
        <rect x={4} y={3.4} width={11} height={8} rx={1} fill="#fff" stroke={C.rose} strokeWidth="1" />
        <path d="M4 3.4 L9.5 8.4 L15 3.4" stroke={C.rose} strokeWidth="1" fill="none" />
        <text x={29.5} y={10.6} textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="7.6" fill={C.tealDeep}>Postane</text>
      </g>
      {/* çatı */}
      <polygon points={`${P(0.04, b + 0.12, 64)} ${P(1.96, b + 0.12, 64)} ${P(1.6, 0.82, 86)} ${P(0.4, 0.82, 86)}`} fill={C.terracotta} {...S} />
      <polygon points={`${P(1.96, 0.04, 64)} ${P(1.96, b + 0.12, 64)} ${P(1.6, 0.82, 86)}`} fill={shade(C.terracotta, -0.16)} {...S} />
      {/* posta kutusu */}
      <g transform={`translate(${pt(1.72, 1.82)[0]} ${pt(1.72, 1.82)[1]})`}>
        <Shadow x={0} y={1} rx={7} ry={3} o={0.15} />
        <rect x={-1.4} y={-10} width={2.8} height={10} fill={C.ink} opacity="0.8" />
        <path d="M-6 -10 V-22 Q-6 -27 0 -27 Q6 -27 6 -22 V-10Z" fill={C.rose} {...S} />
        <rect x={-3.6} y={-21} width={7.2} height={1.6} rx={0.8} fill={INK} opacity="0.7" />
        <path d="M-6 -14 H6" stroke="#fff" strokeWidth="1" opacity="0.7" />
      </g>
      <PostBadge count={count} />
    </g>
  )
})

// ---------------------------------------------------------------- "Bugün nasılsın?" bankı (2×1)
function SignPost({ u, v, h = 34, lines, w = 0.9, color = C.wood }) {
  const W = w * UNIT
  return (
    <g>
      <Box u={u - 0.03} v={v - 0.03} w={0.06} d={0.06} h={h} color={C.woodDeep} />
      <g transform={onV(u - w / 2, v + 0.05, h + 2)}>
        <path d={`M0 0 H${W} V${lines.length * 7 + 4} H0Z`} fill={color} {...S} />
        <path d={`M1.6 1.6 H${W - 1.6} V${lines.length * 7 + 2.4} H1.6Z`} fill={C.cream} />
        {lines.map((l, i) => (
          <text key={i} x={W / 2} y={7.4 + i * 7} textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="6" fill={C.tealDeep}>{l}</text>
        ))}
      </g>
    </g>
  )
}

function Hook({ u, v, lit }) {
  const [x, y] = pt(u, v)
  return (
    <g>
      <path d={`M${x} ${y} V${y - 46} Q${x} ${y - 52} ${x + 6} ${y - 52} Q${x + 10} ${y - 52} ${x + 10} ${y - 48}`} stroke={C.teal} strokeWidth="2" fill="none" strokeLinecap="round" />
      <Lantern x={x + 10} y={y - 30} lit={lit} s={1.05} />
      <path d={`M${x + 10} ${y - 48} V${y - 45}`} stroke={C.teal} strokeWidth="1" />
    </g>
  )
}

export const CheckinBench = memo(function CheckinBench({ lit = true }) {
  const iron = C.healingDeep
  const leg = (u) => (
    <g>
      <polygon points={faceU(u, 0.28, 0.34, 0, 32)} fill={iron} {...S} />
      <polygon points={faceU(u, 0.75, 0.81, 0, 14)} fill={iron} {...S} />
      <polygon points={faceU(u, 0.28, 0.81, 11, 14)} fill={iron} {...S} />
    </g>
  )
  return (
    <g>
      <Shadow x={16} y={26} rx={44} ry={15} o={0.12} />
      {lit && <ellipse className="sm-glow" cx={pt(0.1, 0.4)[0] + 10} cy={pt(0.1, 0.4)[1]} rx={30} ry={13} fill="#FFE7A6" opacity="0.5" />}
      <Hook u={0.04} v={0.16} lit={lit} />
      {leg(0.18)}
      <Box u={0.1} v={0.24} w={1.8} d={0.08} h={6} z={20} color={C.mint} />
      <Box u={0.1} v={0.24} w={1.8} d={0.08} h={6} z={28} color={C.mint} />
      <Box u={0.1} v={0.36} w={1.8} d={0.14} h={3} z={14} color={C.apricotSoft} />
      <Box u={0.1} v={0.52} w={1.8} d={0.14} h={3} z={14} color={C.mint} />
      <Box u={0.1} v={0.68} w={1.8} d={0.14} h={3} z={14} color={C.apricotSoft} />
      {/* minder ve kalp oyması */}
      <g transform={onV(0.95, 0.32, 33)}>
        <path d="M0 2 C-1.6 -1 -5 0 -3.6 2.6 L0 5.4 L3.6 2.6 C5 0 1.6 -1 0 2Z" fill={C.rose} opacity="0.8" />
      </g>
      {leg(1.78)}
      <SignPost u={1.96} v={0.9} h={30} lines={['Bugün', 'nasılsın?']} w={0.9} />
    </g>
  )
})

// ---------------------------------------------------------------- İskele ucu (2×2): denize (+x) bakan bank
export const CheckinPier = memo(function CheckinPier({ lit = true }) {
  const planks = []
  for (let i = 1; i < 8; i++) planks.push(<path key={i} d={`M${P(0, i * 0.25, 6)} L${P(2, i * 0.25, 6)}`} stroke={C.woodDeep} strokeWidth="0.9" opacity="0.6" />)
  return (
    <g>
      <ellipse cx={pt(1, 1)[0]} cy={pt(1, 1)[1] + 6} rx={70} ry={30} fill={C.waterDeep} opacity="0.35" />
      {[[0.05, 1.85], [1.85, 1.85], [1.85, 0.05]].map(([u, v], i) => <Box key={i} u={u} v={v} w={0.12} d={0.12} h={10} z={-6} color={C.woodDeep} />)}
      <Box u={0} v={0} w={2} d={2} h={4} z={2} color={C.wood} top={C.woodLight} />
      {planks}
      {/* korkuluk (kuzey ve batı kenar) */}
      {[0.05, 0.7, 1.35, 1.95].map((u) => <Box key={`n${u}`} u={u - 0.03} v={0.02} w={0.06} d={0.06} h={18} z={6} color={C.woodDeep} />)}
      <polygon points={`${P(0, 0.02, 24)} ${P(2, 0.02, 24)} ${P(2, 0.06, 22)} ${P(0, 0.06, 22)}`} fill={C.wood} {...S} />
      <path d={`M${P(0.05, 0.05, 15)} Q${P(0.4, 0.05, 11)} ${P(0.7, 0.05, 15)} Q${P(1.0, 0.05, 11)} ${P(1.35, 0.05, 15)} Q${P(1.65, 0.05, 11)} ${P(1.95, 0.05, 15)}`} stroke="#E8D9B5" strokeWidth="1.4" fill="none" />
      {/* tabela + fener */}
      <Hook u={0.2} v={0.25} lit={lit} />
      {lit && <ellipse className="sm-glow" cx={pt(0.2, 0.25)[0] + 10} cy={pt(0.2, 0.25)[1]} rx={26} ry={11} fill="#FFE7A6" opacity="0.45" />}
      {/* denize bakan bank: sırt u=0.98, oturak u 1.08..1.5 */}
      <Box u={0.96} v={0.35} w={0.08} d={1.3} h={6} z={24} color={C.sky} />
      <Box u={0.96} v={0.35} w={0.08} d={1.3} h={6} z={32} color={C.sky} />
      <Box u={0.94} v={0.4} w={0.06} d={0.06} h={32} z={6} color={C.teal} />
      <Box u={0.94} v={1.55} w={0.06} d={0.06} h={32} z={6} color={C.teal} />
      <Box u={1.4} v={0.42} w={0.06} d={0.06} h={12} z={6} color={C.teal} />
      <Box u={1.4} v={1.53} w={0.06} d={0.06} h={12} z={6} color={C.teal} />
      <Box u={1.06} v={0.35} w={0.14} d={1.3} h={3} z={18} color={C.white} />
      <Box u={1.22} v={0.35} w={0.14} d={1.3} h={3} z={18} color={C.sky} />
      <Box u={1.38} v={0.35} w={0.14} d={1.3} h={3} z={18} color={C.white} />
      {/* can simidi */}
      <g transform={onU(2, 1.1, 18)}>
        <circle r={5} fill="none" stroke={C.apricot} strokeWidth="3" />
        <circle r={5} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="3.9 3.9" />
      </g>
      <SignPost u={0.45} v={1.8} h={28} lines={['Biraz', 'dinlen']} w={0.66} />
      <path className="sm-shimmer" d={`M${P(2.2, 0.4)} q5 -2.6 10 0`} stroke={C.waterLight} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  )
})

// ---------------------------------------------------------------- Bahçe kapısı (1×1)
export const GardenGate = memo(function GardenGate() {
  const L = UNIT
  return (
    <g>
      <Shadow x={0} y={17} rx={20} ry={7} o={0.12} />
      <g transform={onV(0.02, 0.5, 0)}>
        <rect x={0} y={-34} width={4} height={34} rx={1.4} fill={C.wood} {...S} />
        <rect x={L - 4} y={-34} width={4} height={34} rx={1.4} fill={C.wood} {...S} />
        <path d={`M2 -32 Q${L / 2} -46 ${L - 2} -32`} stroke={C.woodDeep} strokeWidth="2.4" fill="none" />
        {/* kapı kanatları (çit) */}
        {[6, 11, 16, 21, 26].map((x) => <path key={x} d={`M${x} -2 V-20 L${x + 1.6} -22.6 L${x + 3.2} -20 V-2Z`} fill={C.white} {...S} />)}
        <path d="M5 -7 H30 M5 -16 H30" stroke="#E6DED0" strokeWidth="2" />
        {/* tırmanan gül */}
        {[[3, -36, C.rose], [10, -41, C.rosePale], [L / 2, -43, C.rose], [L - 10, -41, C.rosePale], [L - 3, -36, C.rose]].map(([x, y, c], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={2.8} fill={C.leaf} />
            <circle cx={x + 1} cy={y - 1} r={1.8} fill={c} />
          </g>
        ))}
        {/* küçük tabela */}
        <rect x={L / 2 - 9} y={-31} width={18} height={7.4} rx={1.6} fill={C.cream} {...S} />
        <text x={L / 2} y={-25.6} textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="5.6" fill={C.healingDeep}>Bahçe</text>
      </g>
    </g>
  )
})

// ---------------------------------------------------------------- İyilik bahçesi
// Çiçekler hep aynı sırayla açar (dengeli dağılım), türler dönüşümlü.
const SPECIES = ['tulip', 'daisy', 'lavender', 'rose', 'poppy', 'sunny', 'bell', 'carnation']
const PALETTE = {
  tulip: ['#E9606F', '#F2A33A', '#F7D04A', '#F2789A'],
  daisy: ['#FFFFFF'],
  lavender: ['#A792E0'],
  rose: ['#F2789A', '#E9606F', '#FFB4A8'],
  poppy: ['#F05A4A'],
  sunny: ['#FFC531'],
  bell: ['#8CC6EE', '#B5A4E8'],
  carnation: ['#F7A6C0', '#FFFFFF'],
}

function Flower({ x, y, kind, c, h }) {
  const stem = <path d={`M${x} ${y} Q${x + 0.8} ${y - h / 2} ${x} ${y - h}`} stroke={C.leafDeep} strokeWidth="1.1" fill="none" />
  const leaf = <path d={`M${x} ${y - 2} q-3.4 -1.6 -4 -5 q3 1 4 3.4`} fill={C.leaf} />
  const top = y - h
  switch (kind) {
    case 'tulip':
      return <g>{stem}{leaf}<path d={`M${x - 2.6} ${top - 4.4} L${x - 2.6} ${top} Q${x} ${top + 2.2} ${x + 2.6} ${top} L${x + 2.6} ${top - 4.4} L${x + 1.2} ${top - 2.2} L${x} ${top - 4.8} L${x - 1.2} ${top - 2.2}Z`} fill={c} stroke={INK} strokeOpacity="0.2" strokeWidth="0.5" /></g>
    case 'daisy':
      return <g>{stem}{[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx={x} cy={top - 2.2} rx={1.1} ry={2.2} fill={c} transform={`rotate(${a} ${x} ${top})`} />)}<circle cx={x} cy={top} r={1.2} fill={C.sun} /></g>
    case 'lavender':
      return <g>{stem}{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={x + (i % 2 ? 0.6 : -0.6)} cy={top - i * 1.8} rx={1.2} ry={1.1} fill={c} />)}</g>
    case 'rose':
      return <g>{stem}{leaf}<circle cx={x} cy={top} r={2.6} fill={c} stroke={INK} strokeOpacity="0.2" strokeWidth="0.5" /><path d={`M${x - 1.2} ${top} q1.2 -1.4 2.4 0 q-1.2 1.2 -2.4 0`} stroke={shade(c, -0.25)} strokeWidth="0.6" fill="none" /></g>
    case 'poppy':
      return <g>{stem}<path d={`M${x - 3} ${top} Q${x - 3} ${top - 3.4} ${x} ${top - 3} Q${x + 3} ${top - 3.4} ${x + 3} ${top} Q${x} ${top + 1.6} ${x - 3} ${top}Z`} fill={c} /><circle cx={x} cy={top - 1} r={0.9} fill={INK} /></g>
    case 'sunny':
      return <g>{stem}{leaf}{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <ellipse key={a} cx={x} cy={top - 2.6} rx={1} ry={1.9} fill={c} transform={`rotate(${a} ${x} ${top})`} />)}<circle cx={x} cy={top} r={1.6} fill="#8B5A2B" /></g>
    case 'bell':
      return <g>{stem}<path d={`M${x} ${top - 2} q-2.6 0.4 -2.6 3.4 h5.2 q0 -3 -2.6 -3.4Z`} fill={c} /><path d={`M${x + 1} ${top - 5} q-2 0.4 -2 2.6 h4 q0 -2.2 -2 -2.6Z`} fill={c} opacity="0.85" /></g>
    default:
      return <g>{stem}<circle cx={x} cy={top} r={2.4} fill={c} /><path d={`M${x - 2.4} ${top} l1.2 -1 l1.2 1 l1.2 -1 l1.2 1`} stroke={shade(c, -0.2)} strokeWidth="0.6" fill="none" /></g>
  }
}

function Sprout({ x, y }) {
  return (
    <g>
      <path d={`M${x} ${y} v-3`} stroke={C.leafDeep} strokeWidth="0.9" />
      <path d={`M${x} ${y - 3} q-2.4 -0.4 -2.6 -2.2 q2 0 2.6 2.2 M${x} ${y - 3} q2.4 -0.4 2.6 -2.2 q-2 0 -2.6 2.2`} fill={C.leafLight} />
    </g>
  )
}

// Yatağın içindeki çiçek yuvaları: önce ön-orta, sonra iki yana ve arkaya dengeli yayılır
// (sağ/sol dönüşümlü), böylece az çiçek de "özenle dikilmiş" görünür.
function slotOrder(cols, rows) {
  const cc = (cols - 1) / 2
  const slots = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) slots.push({ c, r })
  const score = ({ c, r }) => Math.abs(c - cc) * 1.0 + (rows - 1 - r) * 0.85 + (c < cc ? 0.05 : 0) + ((c + r) % 2) * 0.3
  return slots.sort((a, b) => score(a) - score(b))
}

// <Garden flowers={0..24} lanterns={0..6} width={w} depth={d} />
// Ayak izi w×d (yerel; (0,0) üst köşe). Bloklayıcı bir çiçek yatağıdır.
export const Garden = memo(function Garden({ flowers = 0, lanterns = 0, width = 2, depth = 1 }) {
  const w = width
  const d = depth
  const nF = Math.max(0, Math.min(24, Math.round(flowers)))
  const nL = Math.max(0, Math.min(6, Math.round(lanterns)))
  const cols = Math.max(4, Math.round(w * 4))
  const rows = Math.max(2, Math.round((24 / cols) + 0.49))
  const order = slotOrder(cols, rows)
  const m = 0.14
  const pos = (c, r) => {
    const u = m + ((c + 0.5) / cols) * (w - 2 * m) + (r % 2 ? 0.04 : -0.04)
    const v = m + ((r + 0.5) / rows) * (d - 2 * m)
    return pt(u, v, 6)
  }
  const blooms = order.slice(0, nF).map((s, i) => {
    const kind = SPECIES[i % SPECIES.length]
    const pal = PALETTE[kind]
    const [x, y] = pos(s.c, s.r)
    return { x, y, kind, c: pal[(i >> 3) % pal.length], h: 8 + ((i * 5) % 4) }
  }).sort((a, b) => a.y - b.y)
  // fenerler: arka kenar boyunca ve köşelerde
  const lanternSpots = [[0.12, 0.12], [w - 0.12, 0.12], [w / 2, 0.1], [0.1, d - 0.12], [w - 0.1, d - 0.12], [w * 0.25, 0.1]]
  const sprouts = nF === 0 ? [[0.3, 0.5], [0.75, 0.35], [1.2, 0.6], [1.6, 0.4]].filter(([u]) => u < w - 0.1) : []
  return (
    <g>
      <Box u={0.04} v={0.04} w={w - 0.08} d={d - 0.08} h={6} color={C.woodLight} />
      <polygon points={flat(0.12, 0.12, w - 0.12, d - 0.12, 6)} fill="#8B6A4E" />
      <polygon points={flat(0.12, 0.12, w - 0.12, d - 0.12, 6)} fill="#A07B5A" opacity="0.4" transform="translate(0 0.6)" />
      {sprouts.map(([u, v], i) => {
        const [x, y] = pt(u, v * d, 6)
        return <Sprout key={i} x={x} y={y} />
      })}
      {nF === 0 && [[0.5, 0.3], [1.4, 0.55]].filter(([u]) => u < w).map(([u, v], i) => {
        const [x, y] = pt(u, v * d, 6)
        return <ellipse key={`p${i}`} cx={x} cy={y} rx={1.4} ry={0.8} fill="#6E5440" />
      })}
      {lanternSpots.slice(0, nL).map(([u, v], i) => {
        const [x, y] = pt(u, v, 6)
        return (
          <g key={`l${i}`}>
            <path d={`M${x} ${y} v-10`} stroke={C.teal} strokeWidth="1.2" />
            <Lantern x={x} y={y - 8} s={0.62} />
          </g>
        )
      })}
      {blooms.map((f, i) => <Flower key={i} {...f} />)}
    </g>
  )
})

// Odanın pencere pervazındaki saksı sırası (RoomWalls ile aynı koordinat: oda kökeni).
export const RoomPlanters = memo(function RoomPlanters({ flowers = 0, lanterns = 0, size = 8 }) {
  const wu1 = size * 0.52
  const wu2 = wu1 + 2
  const nF = Math.max(0, Math.min(24, Math.round(flowers)))
  const nL = Math.max(0, Math.min(6, Math.round(lanterns)))
  const cols = 12
  const order = slotOrder(cols, 2)
  const blooms = order.slice(0, nF).map((s, i) => {
    const kind = SPECIES[i % SPECIES.length]
    const pal = PALETTE[kind]
    const u = wu1 - 0.05 + ((s.c + 0.5) / cols) * 2.1
    const v = 0.08 + s.r * 0.07
    const [x, y] = pt(u, v, 41)
    return { x, y, kind, c: pal[(i >> 3) % pal.length], h: 6 + ((i * 5) % 4) }
  }).sort((a, b) => a.y - b.y)
  return (
    <g>
      {/* iki uzun saksı */}
      <Box u={wu1 - 0.12} v={0.03} w={1.02} d={0.2} h={7} z={34} color={C.terracotta} />
      <Box u={wu1 + 1.1} v={0.03} w={1.02} d={0.2} h={7} z={34} color={C.terracotta} />
      <polygon points={faceV(0.23, wu1 - 0.12, wu1 + 0.9, 37, 39)} fill={C.apricotPale} opacity="0.7" />
      <polygon points={faceV(0.23, wu1 + 1.1, wu1 + 2.12, 37, 39)} fill={C.apricotPale} opacity="0.7" />
      {nF === 0 && [0.4, 1.0, 1.6].map((t) => {
        const [x, y] = pt(wu1 + t, 0.12, 41)
        return <Sprout key={t} x={x} y={y} />
      })}
      {blooms.map((f, i) => <Flower key={i} {...f} />)}
      {nL > 0 && (
        <path d={`M${P(wu1 - 0.3, 0.06, 95)} Q${P(wu1 + 1, 0.06, 84)} ${P(wu2 + 0.3, 0.06, 95)}`} stroke={C.woodDeep} strokeWidth="0.8" fill="none" opacity="0.7" />
      )}
      {Array.from({ length: nL }).map((_, i) => {
        const t = (i + 0.5) / 6
        const u = wu1 - 0.3 + t * 2.6
        const sag = 95 - 11 * (1 - (2 * t - 1) ** 2)
        const [x, y] = pt(u, 0.06, sag)
        return (
          <g key={i}>
            <path d={`M${x} ${y} v4`} stroke={C.woodDeep} strokeWidth="0.6" />
            <Lantern x={x} y={y + 13} s={0.5} />
          </g>
        )
      })}
    </g>
  )
})
