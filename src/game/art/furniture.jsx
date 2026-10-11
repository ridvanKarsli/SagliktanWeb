// Oda mobilyaları (game-spec §3). Anahtarlar ve ayak izleri spec ile birebir.
// Yerel koordinat: (0,0) = ayak izinin üst köşesi; eşyaların "önü" +y yönüne
// (ekranda sol-aşağı) bakar, arka duvara (y=0) yaslanır. rot=1: scale(-1,1)
// ile aynalanır, ayak izi d×w olur ve ön +x'e (sağ-aşağı) döner.
import { memo } from 'react'
import { C, INK, shade } from './palette.js'
import { P, pt, LINE, Box, Cyl, Shadow, Blob, faceV, flat, onV, UNIT } from './primitives.jsx'
import './styles.js'

const S = LINE

function Legs({ spots, h, color = C.woodDeep, s = 0.07 }) {
  return spots.map(([u, v], i) => <Box key={i} u={u} v={v} w={s} d={s} h={h} color={color} />)
}

function TeaGlass({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0.5} rx={4.5} ry={1.8} fill={C.white} stroke={C.rose} strokeWidth="0.6" />
      <path d="M-2.6 -9 Q-1.2 -5 -2.2 -2.6 Q-1.6 0 0 0 Q1.6 0 2.2 -2.6 Q1.2 -5 2.6 -9Z" fill="#C2562A" opacity="0.92" />
      <path d="M-2.6 -9 Q-1.2 -5 -2.2 -2.6 Q-1.6 0 0 0 Q1.6 0 2.2 -2.6 Q1.2 -5 2.6 -9" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.8" />
    </g>
  )
}

// ------------------------------------------------------------ oturma
function Couch({ len, color }) {
  const deep = shade(color, -0.12)
  const cushions = []
  const n = len > 1 ? 2 : 1
  const span = (len - 0.12 - 0.56) / n
  for (let i = 0; i < n; i++) {
    const u = 0.34 + i * span
    cushions.push(<Box key={i} u={u + 0.01} v={0.34} w={span - 0.02} d={0.6} h={7} z={14} color={shade(color, 0.08)} />)
  }
  return (
    <g>
      <Shadow x={pt(len / 2, 0.5)[0]} y={pt(len / 2, 0.5)[1] + 2} rx={len * 22 + 6} ry={len * 6 + 8} o={0.14} />
      <Legs spots={[[0.1, 0.84], [len - 0.17, 0.84], [len - 0.17, 0.12]]} h={5} />
      <Box u={0.06} v={0.1} w={len - 0.12} d={0.85} h={10} z={4} color={deep} />
      <Box u={0.06} v={0.08} w={len - 0.12} d={0.26} h={30} z={10} color={color} />
      <Box u={0.06} v={0.1} w={0.28} d={0.85} h={14} z={10} color={color} />
      {cushions}
      {/* yastık */}
      <g transform={`translate(${pt(0.52, 0.42, 30)[0]} ${pt(0.52, 0.42, 30)[1]}) rotate(-14)`}>
        <rect x={-8} y={-8} width={16} height={14} rx={5} fill={C.apricotSoft} {...S} />
        <circle cx={0} cy={-1} r={2} fill={C.white} opacity="0.8" />
      </g>
      <Box u={len - 0.34} v={0.1} w={0.28} d={0.85} h={14} z={10} color={color} />
    </g>
  )
}

const Sofa = memo(function Sofa() {
  return <Couch len={2} color="#86D0B2" />
})

const Armchair = memo(function Armchair() {
  return <Couch len={1} color="#F4AE5E" />
})

const Beanbag = memo(function Beanbag() {
  return (
    <g transform="translate(0 16)">
      <Shadow x={2} y={8} rx={20} ry={8} o={0.14} />
      <path d="M-19 6 Q-22 -6 -10 -14 Q-2 -24 9 -15 Q21 -6 19 6 Q16 13 0 13 Q-16 13 -19 6Z" fill={C.lilac} {...S} />
      <path d="M19 6 Q16 13 0 13 Q-10 13 -16 9 Q0 10 10 2 Q16 -4 15 -10 Q21 -4 19 6Z" fill={shade(C.lilac, -0.15)} />
      <path d="M-10 -12 Q-4 -18 3 -16" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M-6 -4 Q0 -1 6 -5" stroke={shade(C.lilac, -0.25)} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>
  )
})

const Chair = memo(function Chair() {
  return (
    <g>
      <Shadow x={0} y={18} rx={16} ry={7} o={0.12} />
      <Legs spots={[[0.22, 0.24], [0.72, 0.24], [0.22, 0.74], [0.72, 0.74]]} h={18} />
      <Box u={0.2} v={0.22} w={0.6} d={0.6} h={3} z={18} color={C.wood} />
      <Box u={0.24} v={0.3} w={0.52} d={0.48} h={3} z={21} color={C.mint} />
      <Box u={0.2} v={0.2} w={0.08} d={0.06} h={26} z={18} color={C.wood} />
      <Box u={0.72} v={0.2} w={0.08} d={0.06} h={26} z={18} color={C.wood} />
      <Box u={0.2} v={0.2} w={0.6} d={0.06} h={8} z={36} color={C.wood} />
    </g>
  )
})

// ------------------------------------------------------------ yatak, halı
const Bed = memo(function Bed() {
  const duvet = '#9CCBEF'
  const dots = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      const [x, y] = pt(0.35 + i * 0.42, 1.05 + j * 0.3, 25)
      dots.push(
        <g key={`${i}${j}`} transform={`translate(${x} ${y})`}>
          <ellipse cx={0} cy={0} rx={3.2} ry={1.6} fill={C.white} opacity="0.75" />
          <ellipse cx={0} cy={0} rx={1.1} ry={0.6} fill={C.apricot} />
        </g>,
      )
    }
  }
  return (
    <g>
      <Shadow x={0} y={36} rx={60} ry={28} o={0.12} />
      <Box u={0.05} v={0.04} w={1.9} d={0.16} h={46} color={C.wood} />
      <polygon points={faceV(0.2, 0.25, 1.75, 26, 40)} fill={C.woodLight} opacity="0.6" />
      <Box u={0.05} v={0.2} w={1.9} d={1.74} h={12} color={C.woodDeep} top={C.wood} />
      <Box u={0.1} v={0.22} w={1.8} d={1.68} h={8} z={12} color={C.cream} />
      <Box u={0.2} v={0.3} w={0.7} d={0.36} h={6} z={20} color={C.white} />
      <Box u={1.1} v={0.3} w={0.7} d={0.36} h={6} z={20} color={C.white} />
      {/* yorgan */}
      <polygon points={faceV(1.94, 0.07, 1.93, 8, 25)} fill={duvet} {...S} />
      <polygon points={`${P(1.93, 0.78, 25)} ${P(1.93, 1.94, 25)} ${P(1.93, 1.94, 8)} ${P(1.93, 0.78, 14)}`} fill={shade(duvet, -0.15)} {...S} />
      <polygon points={flat(0.07, 0.78, 1.93, 1.94, 25)} fill={shade(duvet, 0.1)} {...S} />
      <polygon points={flat(0.07, 0.78, 1.93, 0.98, 26)} fill={C.white} {...S} />
      {dots}
    </g>
  )
})

const Rug = memo(function Rug() {
  const cx = 0
  const cy = 32
  const motifs = []
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2
    const x = cx + Math.cos(t) * 44
    const y = cy + Math.sin(t) * 22
    motifs.push(<polygon key={i} points={`${x},${y - 3} ${x + 4},${y} ${x},${y + 3} ${x - 4},${y}`} fill={i % 2 ? C.healing : C.white} />)
  }
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={60} ry={30} fill="#E5876C" />
      <ellipse cx={cx} cy={cy} rx={60} ry={30} fill="none" stroke={C.white} strokeWidth="1.4" strokeDasharray="1.5 3" opacity="0.8" />
      <ellipse cx={cx} cy={cy} rx={52} ry={26} fill={C.apricotPale} />
      <ellipse cx={cx} cy={cy} rx={48} ry={24} fill="#F2B880" />
      {motifs}
      <ellipse cx={cx} cy={cy} rx={36} ry={18} fill="#E5876C" />
      <ellipse cx={cx} cy={cy} rx={30} ry={15} fill={C.apricotPale} />
      <polygon points={`${cx},${cy - 11} ${cx + 22},${cy} ${cx},${cy + 11} ${cx - 22},${cy}`} fill={C.healing} opacity="0.85" />
      <polygon points={`${cx},${cy - 6} ${cx + 12},${cy} ${cx},${cy + 6} ${cx - 12},${cy}`} fill={C.apricotPale} />
      <ellipse cx={cx} cy={cy} rx={3} ry={1.5} fill={C.rose} />
    </g>
  )
})

// ------------------------------------------------------------ masalar
const CoffeeTable = memo(function CoffeeTable() {
  return (
    <g>
      <Shadow x={0} y={18} rx={18} ry={8} o={0.14} />
      {[[-9, 18], [9, 18], [0, 22]].map(([x, y], i) => <rect key={i} x={x - 1.6} y={y - 14} width={3.2} height={14} rx={1.4} fill={C.woodDeep} />)}
      <Cyl x={0} y={6} r={19} h={4} color={C.wood} top={C.woodLight} />
      <ellipse cx={0} cy={2} rx={14} ry={7} fill="none" stroke={C.wood} strokeWidth="1" opacity="0.6" />
      <TeaGlass x={-5} y={2} s={0.9} />
      <ellipse cx={6} cy={3} rx={7} ry={3.2} fill={C.white} {...S} />
      <circle cx={4} cy={2} r={1.8} fill="#E7C29F" />
      <circle cx={8} cy={2.6} r={1.8} fill="#E7C29F" />
    </g>
  )
})

const DiningTable = memo(function DiningTable() {
  const cloth = C.white
  const hem = []
  for (let i = 0; i < 8; i++) {
    const u1 = 0.32 + (i * 1.36) / 8
    const u2 = u1 + 1.36 / 8
    const [x1, y1] = pt(u1, 1.68, 18)
    const [x2, y2] = pt(u2, 1.68, 18)
    hem.push(<path key={`a${i}`} d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + 5} ${x2} ${y2}`} fill={cloth} stroke={C.rosePale} strokeWidth="1" />)
    const [a1, b1] = pt(1.68, u1, 18)
    const [a2, b2] = pt(1.68, u2, 18)
    hem.push(<path key={`b${i}`} d={`M${a1} ${b1} Q${(a1 + a2) / 2} ${(b1 + b2) / 2 + 5} ${a2} ${b2}`} fill="#EDE7DB" stroke={C.rosePale} strokeWidth="1" />)
  }
  const backChair = (
    <g>
      <Legs spots={[[0.8, 0.12], [1.15, 0.12]]} h={18} />
      <Box u={0.78} v={0.08} w={0.44} d={0.08} h={40} color={C.wood} />
      <Box u={0.78} v={0.1} w={0.44} d={0.32} h={3} z={18} color={C.wood} />
      <Box u={0.84} v={0.18} w={0.32} d={0.22} h={3} z={21} color={C.apricotSoft} />
    </g>
  )
  const sideChair = (
    <g>
      <Legs spots={[[0.12, 0.8], [0.12, 1.15]]} h={18} />
      <Box u={0.08} v={0.78} w={0.08} d={0.44} h={40} color={shade(C.wood, -0.05)} />
      <Box u={0.1} v={0.78} w={0.32} d={0.44} h={3} z={18} color={C.wood} />
      <Box u={0.18} v={0.84} w={0.22} d={0.32} h={3} z={21} color={C.apricotSoft} />
    </g>
  )
  return (
    <g>
      <Shadow x={0} y={36} rx={52} ry={24} o={0.12} />
      {backChair}
      {sideChair}
      <Legs spots={[[0.4, 0.4], [1.56, 0.4], [0.4, 1.56], [1.56, 1.56]]} h={28} s={0.08} />
      <Box u={0.32} v={0.32} w={1.36} d={1.36} h={3} z={28} color={C.wood} />
      <polygon points={faceV(1.68, 0.32, 1.68, 18, 31)} fill={cloth} {...S} />
      <polygon points={`${P(1.68, 0.32, 18)} ${P(1.68, 1.68, 18)} ${P(1.68, 1.68, 31)} ${P(1.68, 0.32, 31)}`} fill="#EDE7DB" {...S} />
      {hem}
      <polygon points={flat(0.32, 0.32, 1.68, 1.68, 31)} fill={cloth} {...S} />
      <polygon points={flat(0.55, 0.55, 1.45, 1.45, 31)} fill="none" stroke={C.rosePale} strokeWidth="1.2" />
      {/* çaydanlık + bardaklar + meyve */}
      <g transform={`translate(${pt(0.85, 0.8, 31)[0]} ${pt(0.85, 0.8, 31)[1]})`}>
        <path d="M-6 0 Q-7 -6 0 -7 Q7 -6 6 0Z" fill={C.healing} {...S} />
        <path d="M-4 -7 Q-5 -11 0 -12 Q5 -11 4 -7Z" fill={shade(C.healing, 0.2)} {...S} />
        <path d="M6 -3 L10 -6" stroke={C.healing} strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <TeaGlass x={pt(1.3, 0.9, 31)[0]} y={pt(1.3, 0.9, 31)[1]} />
      <TeaGlass x={pt(0.8, 1.35, 31)[0]} y={pt(0.8, 1.35, 31)[1]} />
      <g transform={`translate(${pt(1.25, 1.3, 31)[0]} ${pt(1.25, 1.3, 31)[1]})`}>
        <path d="M-9 -2 Q0 6 9 -2Z" fill={C.cream} {...S} />
        <circle cx={-4} cy={-4} r={3.2} fill={C.apricot} />
        <circle cx={2} cy={-5} r={3.2} fill="#E9606F" />
        <circle cx={5} cy={-2.6} r={2.8} fill="#9ACB5A" />
      </g>
    </g>
  )
})

const Desk = memo(function Desk() {
  return (
    <g>
      <Shadow x={16} y={28} rx={40} ry={14} o={0.12} />
      <Legs spots={[[0.08, 0.12], [0.08, 0.82]]} h={30} s={0.08} />
      <Box u={1.38} v={0.12} w={0.52} d={0.78} h={30} color={C.wood} />
      {[6, 16].map((h) => (
        <g key={h}>
          <polygon points={faceV(0.9, 1.44, 1.84, h, h + 8)} fill={C.woodLight} {...S} />
          <circle cx={pt(1.64, 0.9, h + 4)[0]} cy={pt(1.64, 0.9, h + 4)[1]} r={1.3} fill={C.apricot} />
        </g>
      ))}
      <Box u={0.04} v={0.08} w={1.92} d={0.86} h={3} z={30} color={C.woodLight} />
      {/* dizüstü */}
      <polygon points={flat(0.5, 0.45, 1.1, 0.8, 33.5)} fill="#D9DEDC" {...S} />
      <polygon points={`${P(0.5, 0.45, 33.5)} ${P(1.1, 0.45, 33.5)} ${P(1.1, 0.36, 50)} ${P(0.5, 0.36, 50)}`} fill="#C9D0CE" {...S} />
      <polygon points={`${P(0.55, 0.445, 36)} ${P(1.05, 0.445, 36)} ${P(1.05, 0.37, 48)} ${P(0.55, 0.37, 48)}`} fill={C.mint} />
      <path d={`M${P(0.62, 0.43, 44)} L${P(0.9, 0.43, 44)} M${P(0.62, 0.42, 41)} L${P(0.8, 0.42, 41)}`} stroke={C.white} strokeWidth="1.2" opacity="0.8" />
      {/* defter + kupa + saksı */}
      <polygon points={flat(1.2, 0.55, 1.5, 0.82, 33.5)} fill={C.rose} {...S} />
      <polygon points={flat(1.23, 0.58, 1.47, 0.79, 34)} fill={C.white} opacity="0.5" />
      <Cyl x={pt(1.7, 0.35, 33)[0]} y={pt(1.7, 0.35, 33)[1]} r={4} h={8} color={C.apricot} />
      <g transform={`translate(${pt(0.25, 0.3, 33)[0]} ${pt(0.25, 0.3, 33)[1]})`}>
        <path d="M-4 -7 L4 -7 L3 0 L-3 0Z" fill={C.terracotta} {...S} />
        <Blob line={false} fill={C.leaf} circles={[[-3, -10, 3.4], [3, -10, 3.4], [0, -13, 3.6]]} />
      </g>
    </g>
  )
})

// ------------------------------------------------------------ depolama, müzik
const Bookshelf = memo(function Bookshelf() {
  const colors = [C.rose, C.sky, C.apricot, C.healing, C.lilac, C.sun, C.cream, C.terracotta]
  const books = []
  const shelves = [[6, 24], [30, 48], [54, 72]]
  shelves.forEach(([h1], si) => {
    let u = 0.18
    let k = si * 3
    while (u < 0.78) {
      const w = 0.06 + ((k * 7) % 3) * 0.015
      const h = 13 + ((k * 5) % 4) * 1.6
      if (!(si === 1 && u > 0.55)) {
        books.push(<polygon key={`${si}-${k}`} points={faceV(0.5, u, u + w, h1, h1 + h)} fill={colors[k % colors.length]} stroke={INK} strokeOpacity="0.2" strokeWidth="0.6" />)
      }
      u += w + 0.008
      k += 1
    }
  })
  return (
    <g>
      <Shadow x={0} y={16} rx={20} ry={8} o={0.14} />
      <Box u={0.1} v={0.06} w={0.8} d={0.44} h={78} color={C.wood} />
      <polygon points={faceV(0.5, 0.15, 0.85, 4, 74)} fill="#8C5E3C" />
      {[24, 48].map((h) => <polygon key={h} points={faceV(0.5, 0.15, 0.85, h, h + 4)} fill={C.woodLight} />)}
      {books}
      {/* yatık kitap ve küçük vazo */}
      <polygon points={faceV(0.5, 0.58, 0.82, 30, 35)} fill={C.healing} stroke={INK} strokeOpacity="0.2" strokeWidth="0.6" />
      <polygon points={faceV(0.5, 0.6, 0.8, 35, 39)} fill={C.apricotPale} stroke={INK} strokeOpacity="0.2" strokeWidth="0.6" />
      <g transform={`translate(${pt(0.5, 0.28, 78)[0]} ${pt(0.5, 0.28, 78)[1]})`}>
        <path d="M-4 0 Q-6 -6 -2 -8 L2 -8 Q6 -6 4 0Z" fill={C.sky} {...S} />
        <Blob line={false} fill={C.leaf} circles={[[-3, -11, 3.6], [3, -12, 3.6], [0, -15, 3.6]]} />
      </g>
    </g>
  )
})

const Piano = memo(function Piano() {
  const body = '#8A5A3F'
  const keys = []
  for (let i = 0; i < 14; i++) {
    const u = 0.18 + i * 0.118
    if ([0, 1, 3, 4, 5, 7, 8, 10, 11, 12].includes(i)) {
      keys.push(<polygon key={i} points={flat(u + 0.07, 0.52, u + 0.12, 0.64, 32.5)} fill={INK} opacity="0.85" />)
    }
  }
  return (
    <g>
      <Shadow x={16} y={22} rx={42} ry={12} o={0.13} />
      <Box u={0.06} v={0.06} w={1.88} d={0.44} h={56} color={body} />
      <polygon points={faceV(0.5, 0.2, 1.8, 38, 52)} fill={shade(body, 0.1)} />
      {/* nota kâğıdı */}
      <polygon points={`${P(0.8, 0.5, 38)} ${P(1.2, 0.5, 38)} ${P(1.2, 0.46, 50)} ${P(0.8, 0.46, 50)}`} fill={C.cream} {...S} />
      <path d={`M${P(0.85, 0.49, 42)} L${P(1.15, 0.49, 42)} M${P(0.85, 0.48, 45)} L${P(1.15, 0.48, 45)}`} stroke={INK} strokeWidth="0.6" opacity="0.5" />
      <Legs spots={[[0.16, 0.72], [1.78, 0.72]]} h={28} color={body} />
      <Box u={0.1} v={0.5} w={1.8} d={0.3} h={4} z={28} color={body} />
      <polygon points={flat(0.16, 0.5, 1.84, 0.7, 32.1)} fill={C.white} {...S} />
      {keys}
      <Cyl x={pt(1.6, 0.28, 56)[0]} y={pt(1.6, 0.28, 56)[1]} r={5} h={10} color={C.apricotPale} />
      <Blob line={false} fill={C.rose} circles={[[pt(1.6, 0.28, 70)[0] - 3, pt(1.6, 0.28, 70)[1], 3], [pt(1.6, 0.28, 70)[0] + 3, pt(1.6, 0.28, 70)[1] - 1, 3]]} />
    </g>
  )
})

const Radio = memo(function Radio({ on = false }) {
  return (
    <g>
      <Shadow x={0} y={17} rx={15} ry={7} o={0.13} />
      <Legs spots={[[0.24, 0.24], [0.7, 0.24], [0.24, 0.7], [0.7, 0.7]]} h={20} s={0.06} />
      <Box u={0.2} v={0.2} w={0.6} d={0.6} h={3} z={20} color={C.wood} />
      <Box u={0.26} v={0.34} w={0.48} d={0.28} h={20} z={23} color={C.healing} />
      <polygon points={faceV(0.62, 0.3, 0.55, 26, 40)} fill={C.cream} />
      {[28, 31, 34, 37].map((h) => <path key={h} d={`M${P(0.32, 0.62, h)} L${P(0.53, 0.62, h)}`} stroke={C.creamDeep} strokeWidth="1" />)}
      <g transform={onV(0.64, 0.62, 33)}>
        {on && <circle className="sm-glow" cx={0} cy={0} r={7} fill="#FFD27A" opacity="0.7" />}
        <circle cx={0} cy={0} r={3.6} fill={on ? '#FFE59A' : C.apricotPale} {...S} />
        <path d={on ? 'M0 0 L2.4 -1.6' : 'M0 0 L1.6 -2.4'} stroke={C.rose} strokeWidth="1" />
        <circle cx={0} cy={7} r={1.6} fill={C.woodDeep} />
      </g>
      <path d={`M${P(0.64, 0.42, 43)} L${pt(0.64, 0.42, 43)[0] + 10} ${pt(0.64, 0.42, 43)[1] - 18}`} stroke={C.metal} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx={pt(0.64, 0.42, 43)[0] + 10} cy={pt(0.64, 0.42, 43)[1] - 18} r={1.4} fill={C.metal} />
      {/* açıkken küçük ışık; notalar fx.jsx MusicNotes ile */}
      {on && <circle cx={pt(0.66, 0.5, 42)[0]} cy={pt(0.66, 0.5, 42)[1]} r={1.4} fill={C.rose} className="sm-glow" />}
    </g>
  )
})

const Aquarium = memo(function Aquarium({ on = false }) {
  const fish = (u, h, c, flip) => {
    const [x, y] = pt(u, 0.72, h)
    return (
      <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
        <ellipse cx={0} cy={0} rx={4} ry={2.6} fill={c} />
        <path d="M-3.4 0 L-7 -2.6 L-7 2.6Z" fill={c} />
        <circle cx={2} cy={-0.6} r={0.7} fill={INK} />
      </g>
    )
  }
  return (
    <g>
      <Shadow x={0} y={17} rx={20} ry={8} o={0.14} />
      <Box u={0.12} v={0.16} w={0.76} d={0.66} h={24} color={C.woodDeep} top={C.wood} />
      <polygon points={faceV(0.82, 0.2, 0.8, 6, 18)} fill={C.wood} opacity="0.6" />
      {/* su gövdesi */}
      <Box u={0.14} v={0.18} w={0.72} d={0.62} h={30} z={24} color={on ? '#9EDCEF' : '#7FC9E2'} top={on ? '#CFF0F8' : '#A9DEEE'} left={on ? '#A6E1F1' : '#86CEE5'} right={on ? '#8AD2E7' : '#6DBBD6'} line={false} />
      {on && <polygon className="sm-glow" points={`${P(0.3, 0.8, 54)} ${P(0.7, 0.8, 54)} ${P(0.8, 0.8, 30)} ${P(0.2, 0.8, 30)}`} fill="#FFFBE0" opacity="0.5" />}
      <polygon points={faceV(0.8, 0.14, 0.86, 24, 30)} fill={C.sandDeep} />
      <polygon points={`${P(0.86, 0.18, 24)} ${P(0.86, 0.8, 24)} ${P(0.86, 0.8, 30)} ${P(0.86, 0.18, 30)}`} fill={shade(C.sandDeep, -0.1)} />
      <path d={`M${P(0.3, 0.8, 28)} q-2 -8 1 -16 M${P(0.36, 0.8, 28)} q3 -6 0 -12 M${P(0.75, 0.8, 28)} q-2 -6 1 -11`} stroke={C.leafDeep} strokeWidth="2" fill="none" strokeLinecap="round" />
      {fish(0.5, 42, C.apricot, false)}
      {fish(0.68, 34, C.rose, true)}
      <circle className="sm-bubble" cx={pt(0.45, 0.8, 36)[0]} cy={pt(0.45, 0.8, 36)[1]} r={1.3} fill="#fff" />
      <circle className="sm-bubble sm-d1" cx={pt(0.62, 0.8, 32)[0]} cy={pt(0.62, 0.8, 32)[1]} r={1} fill="#fff" />
      <circle className="sm-bubble sm-d2" cx={pt(0.36, 0.8, 30)[0]} cy={pt(0.36, 0.8, 30)[1]} r={0.9} fill="#fff" />
      {/* cam kenarları */}
      <polygon points={faceV(0.8, 0.14, 0.86, 24, 56)} fill="none" {...S} />
      <polygon points={`${P(0.86, 0.18, 24)} ${P(0.86, 0.8, 24)} ${P(0.86, 0.8, 56)} ${P(0.86, 0.18, 56)}`} fill="none" {...S} />
      <path d={`M${P(0.22, 0.8, 30)} L${P(0.22, 0.8, 50)}`} stroke="#fff" strokeWidth="1.6" opacity="0.6" strokeLinecap="round" />
      <polygon points={`${P(0.12, 0.16, 56)} ${P(0.88, 0.16, 56)} ${P(0.88, 0.82, 56)} ${P(0.12, 0.82, 56)}`} fill="none" stroke={C.teal} strokeWidth="2.6" strokeLinejoin="round" />
      {on && <ellipse className="sm-glow" cx={pt(0.5, 0.5, 57)[0]} cy={pt(0.5, 0.5, 57)[1]} rx={10} ry={4} fill="#FFFBE0" opacity="0.8" />}
    </g>
  )
})

const Fireplace = memo(function Fireplace({ on = true }) {
  const stone = '#E9DCC6'
  const L = 1 * UNIT
  return (
    <g>
      {on && <ellipse className="sm-glow" cx={pt(1, 0.85)[0]} cy={pt(1, 0.85)[1]} rx={44} ry={16} fill="#FFD27A" opacity="0.45" />}
      <Box u={0.08} v={0.06} w={1.84} d={0.48} h={50} color={stone} />
      {/* taş örgü */}
      {[12, 24, 36].map((h, i) => (
        <path key={h} d={`M${P(0.08, 0.54, h)} L${P(1.92, 0.54, h)}`} stroke="#D2C2A6" strokeWidth="1" opacity="0.7" strokeDasharray={i % 2 ? '10 3' : '14 3'} />
      ))}
      <g transform={onV(0.5, 0.54, 0)}>
        <path d={`M0 0 L0 -22 Q0 -34 ${L / 2} -34 Q${L} -34 ${L} -22 L${L} 0Z`} fill="#4A3A33" {...S} />
        <path d={`M3 0 L3 -21 Q3 -31 ${L / 2} -31 Q${L - 3} -31 ${L - 3} -21 L${L - 3} 0`} fill="none" stroke="#D2C2A6" strokeWidth="1.2" opacity="0.4" />
        <rect x={6} y={-6} width={L - 12} height={4} rx={2} fill={C.woodDeep} />
        <rect x={9} y={-9} width={L - 18} height={4} rx={2} fill={C.wood} />
        {on ? (
          <g>
            <path d={`M3 0 L3 -21 Q3 -31 ${L / 2} -31 Q${L - 3} -31 ${L - 3} -21 L${L - 3} 0Z`} fill="#7A4A2E" opacity="0.5" />
            <path className="sm-flame" d={`M${L / 2 - 9} -8 Q${L / 2 - 12} -18 ${L / 2 - 4} -26 Q${L / 2 - 3} -18 ${L / 2} -16 Q${L / 2 + 2} -24 ${L / 2 + 6} -28 Q${L / 2 + 13} -16 ${L / 2 + 9} -8Z`} fill={C.apricot} />
            <path className="sm-flame sm-d1" d={`M${L / 2 - 5} -8 Q${L / 2 - 6} -15 ${L / 2 - 1} -20 Q${L / 2 + 6} -14 ${L / 2 + 5} -8Z`} fill={C.sun} />
          </g>
        ) : (
          <g>
            <path d={`M8 -2 Q${L / 2} -10 ${L - 8} -2Z`} fill="#8E8781" />
            <circle cx={L / 2 - 4} cy={-5} r={1} fill={C.apricot} opacity="0.8" />
            <circle cx={L / 2 + 5} cy={-4} r={0.8} fill={C.apricot} opacity="0.6" />
          </g>
        )}
      </g>
      <Box u={0.0} v={0.0} w={2} d={0.66} h={5} z={50} color={C.wood} />
      {/* rafta: çerçeve, saksı, saat */}
      <g transform={onV(0.35, 0.36, 55)}>
        <rect x={0} y={-15} width={12} height={15} rx={1.5} fill={C.woodLight} {...S} />
        <rect x={2.4} y={-12.6} width={7.2} height={10.2} fill={C.skyPale} />
        <circle cx={6} cy={-7} r={2.2} fill={C.blush} opacity="0.8" />
      </g>
      <g transform={`translate(${pt(1.05, 0.35, 55)[0]} ${pt(1.05, 0.35, 55)[1]})`}>
        <circle cx={0} cy={-8} r={7} fill={C.cream} {...S} />
        <path d="M0 -8 L0 -12 M0 -8 L3 -7" stroke={INK} strokeWidth="1" strokeLinecap="round" />
      </g>
      <g transform={`translate(${pt(1.65, 0.35, 55)[0]} ${pt(1.65, 0.35, 55)[1]})`}>
        <path d="M-4 0 L4 0 L3.4 -7 L-3.4 -7Z" fill={C.terracotta} {...S} />
        <path d="M0 -7 Q-6 -12 -8 -20 M0 -7 Q2 -14 0 -22 M0 -7 Q6 -12 8 -17" stroke={C.leaf} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </g>
    </g>
  )
})

// ------------------------------------------------------------ bitkiler, ışık
function MonsteraLeaf({ x, y, r, s = 1, c = C.leaf }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C-11 -3 -15 -15 -8 -24 C-4 -28 4 -28 8 -24 C15 -15 11 -3 0 0Z" fill={c} {...S} />
      <path d="M0 -1 L0 -24 M0 -8 L-9 -12 M0 -14 L-10 -19 M0 -8 L9 -12 M0 -14 L10 -19" stroke={shade(c, -0.25)} strokeWidth="1.3" strokeLinecap="round" />
    </g>
  )
}

const Monstera = memo(function Monstera() {
  return (
    <g>
      <Shadow x={0} y={18} rx={16} ry={7} o={0.15} />
      <path d="M-2 0 Q-6 -16 -14 -26 M0 0 Q0 -20 4 -36 M2 0 Q8 -14 16 -22" stroke={C.leafDeep} strokeWidth="1.8" fill="none" transform="translate(0 4)" />
      <MonsteraLeaf x={-13} y={-18} r={-40} s={0.9} c={C.leafDeep} />
      <MonsteraLeaf x={14} y={-15} r={44} s={0.85} c={C.leafDeep} />
      <MonsteraLeaf x={4} y={-28} r={8} s={1} />
      <MonsteraLeaf x={-6} y={-6} r={-70} s={0.8} />
      <MonsteraLeaf x={8} y={-4} r={66} s={0.8} c={C.leafLight} />
      <Cyl x={0} y={18} r={10} h={15} color="#F1E6D4" top="#8B6A4E" />
      <path d="M-10 9 A10 5 0 0 0 10 9" stroke={C.healing} strokeWidth="2.2" fill="none" />
    </g>
  )
})

const Cactus = memo(function Cactus() {
  const g = '#6DB98A'
  return (
    <g>
      <Shadow x={0} y={18} rx={12} ry={5} o={0.15} />
      <path d="M-5 6 L-5 -26 Q-5 -32 0 -32 Q5 -32 5 -26 L5 6Z" fill={g} {...S} />
      <path d="M-5 -8 L-9 -8 Q-12 -8 -12 -12 L-12 -18 Q-12 -21 -9.5 -21 Q-7 -21 -7 -18 L-7 -13 L-5 -13" fill={g} {...S} />
      <path d="M5 -12 L9 -12 Q12 -12 12 -16 L12 -22 Q12 -25 9.5 -25 Q7 -25 7 -22 L7 -17 L5 -17" fill={g} {...S} />
      <path d="M0 -30 L0 4 M-2.6 -28 L-2.6 4" stroke={shade(g, -0.2)} strokeWidth="0.9" opacity="0.6" />
      <path d="M1.8 -29 L1.8 4" stroke={shade(g, 0.35)} strokeWidth="1.2" opacity="0.7" />
      <g transform="translate(0 -33)">
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-2.4} rx={1.6} ry={2.6} fill={C.rosePale} transform={`rotate(${a})`} />)}
        <circle r={1.4} fill={C.sun} />
      </g>
      <Cyl x={0} y={18} r={9} h={12} color={C.terracotta} top="#8B6A4E" />
      <path d="M-9 8 A9 4.5 0 0 0 9 8" stroke={C.apricotPale} strokeWidth="1.6" fill="none" />
    </g>
  )
})

const FlowerVase = memo(function FlowerVase() {
  const blue = '#3E6FB5'
  return (
    <g>
      <Shadow x={0} y={18} rx={11} ry={5} o={0.15} />
      {/* çiçekler */}
      <path d="M0 -14 Q-6 -26 -10 -34 M0 -14 Q0 -28 1 -40 M0 -14 Q6 -26 11 -32" stroke={C.leafDeep} strokeWidth="1.4" fill="none" />
      <path d="M-2 -18 q-8 -4 -9 -12 q6 4 9 10Z M2 -18 q8 -4 8 -12 q-5 4 -8 10Z" fill={C.leaf} />
      {[[-10, -34, C.rose], [1, -40, C.apricot], [11, -32, C.rosePale]].map(([x, y, c], i) => (
        <path key={i} d={`M${x - 3.4} ${y - 5} L${x - 3.4} ${y} Q${x} ${y + 3} ${x + 3.4} ${y} L${x + 3.4} ${y - 5} L${x + 1.6} ${y - 2.6} L${x} ${y - 6} L${x - 1.6} ${y - 2.6}Z`} fill={c} {...S} />
      ))}
      <g transform="translate(-5 -28)">
        {[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx={0} cy={-2.6} rx={1.5} ry={2.6} fill="#fff" transform={`rotate(${a})`} />)}
        <circle r={1.5} fill={C.sun} />
      </g>
      {/* İznik desenli vazo */}
      <path d="M-4 -14 L4 -14 L3.4 -8 Q12 -4 11 6 Q10 16 0 18 Q-10 16 -11 6 Q-12 -4 -3.4 -8Z" fill={blue} {...S} />
      <path d="M3.4 -8 Q12 -4 11 6 Q10 16 0 18 L2 -8Z" fill={INK} opacity="0.12" />
      <ellipse cx={0} cy={-14} rx={4.4} ry={1.6} fill={shade(blue, 0.3)} />
      <path d="M-6 2 q3 -5 6 0 q3 -5 6 0" stroke="#fff" strokeWidth="1.3" fill="none" />
      <circle cx={-6} cy={9} r={1.3} fill={C.rose} />
      <circle cx={0} cy={11} r={1.3} fill="#fff" />
      <circle cx={6} cy={9} r={1.3} fill={C.rose} />
      <path d="M-7 -2 Q-7 -6 -4 -7" stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.6" strokeLinecap="round" />
    </g>
  )
})

const FloorLamp = memo(function FloorLamp({ on = true }) {
  return (
    <g>
      {on && <ellipse className="sm-glow" cx={0} cy={16} rx={34} ry={16} fill="#FFE7A6" opacity="0.45" />}
      <ellipse cx={0} cy={17} rx={8} ry={4} fill={C.woodDeep} {...S} />
      <rect x={-1.3} y={-48} width={2.6} height={64} rx={1.3} fill={C.woodDeep} />
      {on && <circle className="sm-glow" cx={0} cy={-54} r={26} fill="#FFE7A6" opacity="0.4" />}
      {on && <circle cx={0} cy={-54} r={15} fill="#FFF0BF" opacity="0.6" />}
      {on && <path d="M-11 -46 L11 -46 L22 4 L-22 4Z" fill="#FFF3C9" opacity="0.18" />}
      <path d="M-12 -46 L12 -46 L8 -64 L-8 -64Z" fill={on ? '#FFF6DC' : C.creamDeep} {...S} />
      <path d="M-11.2 -49 L11.2 -49" stroke={C.apricot} strokeWidth="2" />
      <path d="M2 -46 L12 -46 L8 -64 L2 -64Z" fill={on ? C.apricotPale : '#D9C7A6'} opacity="0.6" />
      <ellipse cx={0} cy={-46} rx={12} ry={3} fill={on ? '#FFF3C9' : '#CDBFA6'} opacity="0.9" />
    </g>
  )
})

// ------------------------------------------------------------ evcil ve sanat
const CatBed = memo(function CatBed() {
  return (
    <g>
      <Shadow x={0} y={18} rx={20} ry={8} o={0.13} />
      <Cyl x={0} y={18} r={19} ry={9.5} h={9} color={C.rosePale} top="#FBDADC" />
      <ellipse cx={0} cy={9} rx={14} ry={6.6} fill="#F6B6BD" />
      {/* uyuyan yavru */}
      <g transform="translate(1 8)">
        <path d="M-10 0 Q-12 -8 -2 -9 Q8 -9 10 -2 Q10 2 5 2 L-7 2 Q-10 2 -10 0Z" fill={C.white} {...S} />
        <path d="M6 -6 Q13 -4 10 2 Q4 5 -4 3" stroke="#E6DFD8" strokeWidth="3" fill="none" strokeLinecap="round" />
        <g transform="translate(-7 -4)">
          <path d="M-4.4 -2.6 L-4.4 -7.6 L-1 -5Z M2.6 -5 L5.6 -7.6 L5.6 -2.6Z" fill={C.white} {...S} />
          <ellipse cx={0.6} cy={0} rx={6} ry={4.8} fill={C.white} {...S} />
          <path d="M-2.6 -0.2 q1.2 1 2.4 0 M1.8 -0.2 q1.2 1 2.4 0" stroke={INK} strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <ellipse cx={-3} cy={2} rx={1.4} ry={0.8} fill={C.blush} opacity="0.7" />
          <ellipse cx={4.4} cy={2} rx={1.4} ry={0.8} fill={C.blush} opacity="0.7" />
        </g>
      </g>
      <circle cx={16} cy={16} r={3} fill={C.sky} {...S} />
      <path d="M13.4 15 Q16 17 18.6 15" stroke="#fff" strokeWidth="0.8" fill="none" />
    </g>
  )
})

const Easel = memo(function Easel() {
  const W = 0.62 * UNIT
  return (
    <g>
      <Shadow x={0} y={18} rx={16} ry={6} o={0.12} />
      <path d={`M${P(0.5, 0.25, 0)} L${pt(0.5, 0.42, 66)[0]} ${pt(0.5, 0.42, 66)[1]}`} stroke={C.woodDeep} strokeWidth="2.6" strokeLinecap="round" />
      <path d={`M${P(0.2, 0.62, 0)} L${pt(0.48, 0.5, 64)[0]} ${pt(0.48, 0.5, 64)[1]} M${P(0.8, 0.62, 0)} L${pt(0.52, 0.5, 64)[0]} ${pt(0.52, 0.5, 64)[1]}`} stroke={C.wood} strokeWidth="2.8" strokeLinecap="round" />
      <g transform={onV(0.19, 0.55, 20)}>
        <rect x={-1} y={-1} width={W + 2} height={4} rx={1.5} fill={C.woodDeep} />
        <rect x={0} y={-36} width={W} height={34} rx={1} fill={C.white} {...S} />
        <rect x={2.4} y={-33.6} width={W - 4.8} height={29} fill={C.skyPale} />
        <circle cx={W - 8} cy={-26} r={3.6} fill={C.sun} />
        <path d={`M2.4 -12 Q${W / 3} -22 ${W / 1.6} -14 T${W - 2.4} -15 L${W - 2.4} -4.6 L2.4 -4.6Z`} fill={C.leafLight} />
        <path d={`M2.4 -8 Q${W / 2} -14 ${W - 2.4} -8 L${W - 2.4} -4.6 L2.4 -4.6Z`} fill={C.leaf} />
        <circle cx={7} cy={-14} r={2} fill={C.rose} />
      </g>
      {/* palet */}
      <g transform={`translate(${pt(0.78, 0.86, 0)[0]} ${pt(0.78, 0.86, 0)[1]})`}>
        <ellipse cx={0} cy={0} rx={8} ry={4} fill={C.woodLight} {...S} />
        <circle cx={-3} cy={-1} r={1.3} fill={C.rose} />
        <circle cx={0.5} cy={-1.8} r={1.3} fill={C.sky} />
        <circle cx={3.6} cy={-0.6} r={1.3} fill={C.sun} />
      </g>
    </g>
  )
})

// ------------------------------------------------------------ televizyon
const Tv = memo(function Tv({ on = false }) {
  const cab = '#E8D3B4'
  return (
    <g>
      <Shadow x={16} y={22} rx={40} ry={12} o={0.12} />
      {on && <polygon className="sm-tv-cast" points={`${P(0.3, 0.42, 0)} ${P(1.7, 0.42, 0)} ${P(2.2, 1.6, 0)} ${P(-0.2, 1.6, 0)}`} fill="#BFE6FF" opacity="0.22" />}
      <Legs spots={[[0.16, 0.56], [1.78, 0.56]]} h={4} />
      <Box u={0.1} v={0.12} w={1.8} d={0.52} h={18} z={4} color={cab} />
      <polygon points={faceV(0.64, 0.18, 0.98, 7, 19)} fill={shade(cab, 0.08)} {...S} />
      <polygon points={faceV(0.64, 1.02, 1.82, 7, 19)} fill={shade(cab, 0.08)} {...S} />
      <circle cx={pt(0.92, 0.64, 13)[0]} cy={pt(0.92, 0.64, 13)[1]} r={1.1} fill={C.woodDeep} />
      <circle cx={pt(1.08, 0.64, 13)[0]} cy={pt(1.08, 0.64, 13)[1]} r={1.1} fill={C.woodDeep} />
      {/* ayak + ekran */}
      <Box u={0.85} v={0.3} w={0.3} d={0.16} h={2} z={22} color={C.ink} />
      <Box u={0.97} v={0.34} w={0.06} d={0.06} h={6} z={22} color={C.ink} />
      <polygon points={faceV(0.4, 0.28, 1.72, 26, 58)} fill="#2E3A39" {...S} />
      <polygon points={`${P(1.72, 0.37, 26)} ${P(1.72, 0.4, 26)} ${P(1.72, 0.4, 58)} ${P(1.72, 0.37, 58)}`} fill="#1E2726" />
      {on ? (
        <g>
          <polygon className="sm-tv-a" points={faceV(0.41, 0.34, 1.66, 29, 55)} fill="#9FD8F5" />
          <polygon className="sm-tv-b" points={`${P(0.34, 0.41, 29)} ${P(1.66, 0.41, 29)} ${P(1.66, 0.41, 38)} ${P(1.2, 0.41, 44)} ${P(0.8, 0.41, 37)} ${P(0.34, 0.41, 41)}`} fill="#8FD3A0" />
          <circle className="sm-tv-c" cx={pt(1.35, 0.41, 49)[0]} cy={pt(1.35, 0.41, 49)[1]} r={4} fill={C.sun} />
          <polygon points={faceV(0.41, 0.34, 1.66, 29, 55)} fill="#fff" opacity="0.08" />
        </g>
      ) : (
        <g>
          <polygon points={faceV(0.41, 0.34, 1.66, 29, 55)} fill="#33403F" />
          <path d={`M${P(0.45, 0.41, 50)} L${P(0.75, 0.41, 54)}`} stroke="#fff" strokeWidth="2" opacity="0.12" strokeLinecap="round" />
        </g>
      )}
      <circle cx={pt(1.6, 0.41, 27.5)[0]} cy={pt(1.6, 0.41, 27.5)[1]} r={0.8} fill={on ? C.mint : C.rose} />
      {/* dolap üstü: küçük saksı */}
      <g transform={`translate(${pt(1.6, 0.3, 22)[0]} ${pt(1.6, 0.3, 22)[1]})`}>
        <path d="M-3 -5 L3 -5 L2.4 0 L-2.4 0Z" fill={C.terracotta} {...S} />
        <Blob line={false} fill={C.leaf} circles={[[-2.4, -7.6, 2.8], [2.4, -7.6, 2.8], [0, -10, 3]]} />
      </g>
    </g>
  )
})

// Piyano/masa başında oturan için alçak tabure (SEAT_OFFSETS'te stool:true).
// (0,0) = oturma noktası; motor karakterden ÖNCE aynı noktaya çizer.
export const SeatStool = memo(function SeatStool({ height = 16 }) {
  return (
    <g>
      <ellipse cx={0} cy={height + 1} rx={10} ry={4.6} fill={INK} opacity="0.12" />
      <path d={`M-6 1 L-7 ${height} M6 1 L7 ${height} M0 2 L0 ${height + 2}`} stroke={C.woodDeep} strokeWidth="2.2" strokeLinecap="round" />
      <Cyl x={0} y={2} r={9} ry={4.4} h={3} color={C.wood} top={C.apricotSoft} />
    </g>
  )
})

// --------------------------------------------------------------------- kayıt
export const FURNITURE = {
  sofa: { w: 2, d: 1, floor: false, Component: Sofa },
  armchair: { w: 1, d: 1, floor: false, Component: Armchair },
  bed: { w: 2, d: 2, floor: false, Component: Bed },
  rug: { w: 2, d: 2, floor: true, Component: Rug },
  coffee_table: { w: 1, d: 1, floor: false, Component: CoffeeTable },
  bookshelf: { w: 1, d: 1, floor: false, Component: Bookshelf },
  floor_lamp: { w: 1, d: 1, floor: false, Component: FloorLamp, toggle: true, defaultOn: true },
  monstera: { w: 1, d: 1, floor: false, Component: Monstera },
  cactus: { w: 1, d: 1, floor: false, Component: Cactus },
  cat_bed: { w: 1, d: 1, floor: false, Component: CatBed },
  aquarium: { w: 1, d: 1, floor: false, Component: Aquarium, toggle: true, defaultOn: false },
  piano: { w: 2, d: 1, floor: false, Component: Piano },
  desk: { w: 2, d: 1, floor: false, Component: Desk },
  chair: { w: 1, d: 1, floor: false, Component: Chair },
  radio: { w: 1, d: 1, floor: false, Component: Radio, toggle: true, defaultOn: false },
  flower_vase: { w: 1, d: 1, floor: false, Component: FlowerVase },
  beanbag: { w: 1, d: 1, floor: false, Component: Beanbag },
  dining_table: { w: 2, d: 2, floor: false, Component: DiningTable },
  fireplace: { w: 2, d: 1, floor: false, Component: Fireplace, toggle: true, defaultOn: true },
  tv: { w: 2, d: 1, floor: false, Component: Tv, toggle: true, defaultOn: false },
  easel: { w: 1, d: 1, floor: false, Component: Easel },
}

export const FURNITURE_KEYS = Object.keys(FURNITURE)
