// Dünya nesneleri (ağaçlar, banklar, tezgâhlar, evler...). Her bileşen ayak izi
// yerel koordinatında çizilir: (0,0) = ayak izinin üst köşesi, yükseklik -y yönüne.
// Kayıt: PROPS[key] = { w, d, blocks, Component }. rot=1 için motor scale(-1,1) uygular.
import { memo } from 'react'
import { C, INK, shade } from './palette.js'
import { P, pt, LINE, Box, Cyl, Shadow, Blob, faceV, faceU, flat, onV, UNIT } from './primitives.jsx'
import { PROP_META } from './propMeta.js'
import './styles.js'

const S = LINE

// ------------------------------------------------------------------ bitkiler
function Trunk({ x = 0, y = 0, h, w = 7, color = C.trunk }) {
  return (
    <g>
      <path d={`M${x - w} ${y} Q${x - w * 0.6} ${y - h * 0.5} ${x - w * 0.55} ${y - h} L${x + w * 0.55} ${y - h} Q${x + w * 0.6} ${y - h * 0.5} ${x + w} ${y} Q${x} ${y + w * 0.5} ${x - w} ${y}Z`} fill={color} {...S} />
      <path d={`M${x + w * 0.15} ${y - 2} Q${x + w * 0.35} ${y - h * 0.5} ${x + w * 0.3} ${y - h}`} stroke={shade(color, -0.2)} strokeWidth={w * 0.5} fill="none" opacity="0.5" />
    </g>
  )
}

function PalmLeaf({ x, y, s = 1, color = C.leafLight, rot = 0 }) {
  return (
    <path
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      d="M0 4 C-3 2 -7 1 -8 -2 C-5 -2 -4 -3 -4 -6 C-2 -4 -1 -5 0 -8 C1 -5 2 -4 4 -6 C4 -3 5 -2 8 -2 C7 1 3 2 0 4Z"
      fill={color}
    />
  )
}

const Cinar = memo(function Cinar() {
  const cx = 0
  const cy = 32
  return (
    <g>
      <Shadow x={cx + 6} y={cy + 4} rx={60} ry={27} o={0.13} />
      {/* kökler */}
      <path d={`M${cx - 18} ${cy + 6} Q${cx - 10} ${cy + 2} ${cx - 8} ${cy - 8} M${cx + 19} ${cy + 7} Q${cx + 10} ${cy + 2} ${cx + 8} ${cy - 8}`} stroke="#B8A588" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* çınar gövdesi: alaca kabuk */}
      <path d={`M${cx - 11} ${cy + 4} C${cx - 9} ${cy - 30} ${cx - 12} ${cy - 50} ${cx - 22} ${cy - 76} L${cx - 10} ${cy - 80} C${cx - 4} ${cy - 62} ${cx + 2} ${cy - 62} ${cx + 8} ${cy - 84} L${cx + 20} ${cy - 80} C${cx + 12} ${cy - 54} ${cx + 9} ${cy - 30} ${cx + 12} ${cy + 4} Q${cx} ${cy + 10} ${cx - 11} ${cy + 4}Z`} fill="#D6C9AE" {...S} />
      <path d={`M${cx - 6} ${cy - 10} q5 -3 7 2 q-3 6 -7 -2Z M${cx + 3} ${cy - 30} q6 -2 6 4 q-5 3 -6 -4Z M${cx - 8} ${cy - 44} q4 -3 6 1 q-3 5 -6 -1Z M${cx + 4} ${cy + 0} q4 -1 5 3 q-4 2 -5 -3Z`} fill="#A99B7F" opacity="0.8" />
      <path d={`M${cx - 2} ${cy - 18} q5 -2 6 3 q-4 3 -6 -3Z M${cx - 12} ${cy - 62} q4 -2 5 2 q-3 3 -5 -2Z`} fill="#EEE6D5" />
      <path d={`M${cx + 6} ${cy + 4} C${cx + 4} ${cy - 30} ${cx + 6} ${cy - 50} ${cx + 13} ${cy - 76}`} stroke="#B5A485" strokeWidth="4" fill="none" opacity="0.6" />
      {/* taç */}
      <g transform={`translate(${cx} ${cy - 92})`}>
        <Blob fill={C.leafDeep} circles={[[-46, 14, 28], [44, 12, 28], [0, -22, 38], [-24, 28, 26], [24, 30, 26], [-28, -14, 26], [28, -16, 26], [0, 26, 24]]} />
        <Blob line={false} fill={C.leaf} circles={[[-40, 6, 24], [38, 4, 24], [0, -26, 32], [-20, 18, 24], [20, 20, 22], [-24, -18, 22], [26, -20, 20]]} />
        <Blob line={false} fill={C.leafLight} circles={[[-34, -4, 14], [-8, -36, 18], [18, -30, 12], [30, -4, 12], [-16, 8, 10]]} />
        <PalmLeaf x={-26} y={-30} s={0.8} color={C.leafPale} rot={-12} />
        <PalmLeaf x={8} y={-48} s={0.75} color={C.leafPale} rot={8} />
        <PalmLeaf x={36} y={-12} s={0.7} color={C.leafLight} rot={20} />
        <PalmLeaf x={-46} y={4} s={0.7} color={C.leafLight} rot={-24} />
        <PalmLeaf x={20} y={14} s={0.65} color={C.leafLight} rot={14} />
        <path d="M-40 18 q6 4 12 2 M18 34 q8 2 14 -4 M-6 32 q6 3 10 0" stroke={C.leafDeep} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        {/* çınar topçukları */}
        <circle cx={-12} cy={30} r={2.4} fill="#B8935A" />
        <circle cx={30} cy={22} r={2.4} fill="#B8935A" />
        <circle cx={-38} cy={20} r={2.2} fill="#B8935A" />
      </g>
    </g>
  )
})

const TreeRound = memo(function TreeRound() {
  return (
    <g>
      <Shadow x={2} y={17} rx={24} ry={11} o={0.14} />
      <Trunk x={0} y={18} h={34} w={5} />
      <g transform="translate(0 -36)">
        <Blob fill={C.leaf} circles={[[-14, 6, 16], [14, 6, 16], [0, -10, 20], [0, 12, 15]]} />
        <Blob line={false} fill={C.leafLight} circles={[[-10, -8, 10], [6, -18, 9]]} />
        {/* kayısılar */}
        {[[-14, 4], [12, -4], [4, 12], [-4, -16], [18, 10]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={3.2} fill={C.apricot} />
            <circle cx={x - 1} cy={y - 1} r={1} fill={C.apricotPale} />
          </g>
        ))}
      </g>
    </g>
  )
})

const Pine = memo(function Pine() {
  const tier = (y, w, h, c) => <path d={`M0 ${y - h} C${w * 0.3} ${y - h * 0.6} ${w * 0.8} ${y - h * 0.15} ${w} ${y} Q0 ${y + h * 0.28} ${-w} ${y} C${-w * 0.8} ${y - h * 0.15} ${-w * 0.3} ${y - h * 0.6} 0 ${y - h}Z`} fill={c} {...S} />
  return (
    <g>
      <Shadow x={2} y={17} rx={20} ry={9} o={0.14} />
      <Trunk x={0} y={18} h={14} w={4} />
      {tier(6, 22, 30, '#3E8C68')}
      {tier(-12, 18, 28, '#4C9E77')}
      {tier(-30, 13, 26, '#5BAF85')}
      <path d="M-6 -2 q4 -4 6 -10 M-5 -20 q3 -4 5 -9 M-3 -38 q2 -3 3 -7" stroke="#8FD3A0" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
    </g>
  )
})

const Bush = memo(function Bush() {
  return (
    <g>
      <Shadow x={0} y={18} rx={22} ry={9} o={0.13} />
      <Blob fill={C.leaf} circles={[[-11, 10, 11], [11, 10, 11], [0, 2, 13], [0, 14, 10]]} />
      <Blob line={false} fill={C.leafLight} circles={[[-6, 0, 6], [7, 4, 4]]} />
      {[[-12, 8], [9, 2], [2, 14], [-3, -4], [14, 12]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill={i % 2 ? '#FFFFFF' : C.rosePale} stroke={C.rose} strokeOpacity="0.3" strokeWidth="0.6" />
      ))}
    </g>
  )
})

function Tulip({ x, y, color, h = 12 }) {
  return (
    <g>
      <path d={`M${x} ${y} L${x} ${y - h}`} stroke={C.leafDeep} strokeWidth="1.3" />
      <path d={`M${x} ${y - 2} q-4 -3 -4 -7 q3 2 4 5`} fill={C.leaf} />
      <path d={`M${x - 3} ${y - h - 5} L${x - 3} ${y - h} Q${x} ${y - h + 2.6} ${x + 3} ${y - h} L${x + 3} ${y - h - 5} L${x + 1.4} ${y - h - 2.6} L${x} ${y - h - 5.6} L${x - 1.4} ${y - h - 2.6}Z`} fill={color} />
    </g>
  )
}

const Flowerbed = memo(function Flowerbed() {
  const cols = [C.rose, C.apricot, '#F7D04A', C.lilac, '#FFFFFF']
  const spots = []
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) spots.push([0.25 + i * 0.25, 0.25 + j * 0.25, (i * 2 + j) % 5])
  return (
    <g>
      <Shadow x={0} y={18} rx={26} ry={11} o={0.1} />
      <Box u={0.08} v={0.08} w={0.84} d={0.84} h={7} color="#E2CFAE" />
      <polygon points={flat(0.16, 0.16, 0.84, 0.84, 7)} fill="#8B6A4E" />
      {spots.map(([a, b, c], i) => {
        const [x, y] = pt(a, b, 7)
        return <Tulip key={i} x={x} y={y} color={cols[c]} h={8 + ((i * 3) % 4)} />
      })}
    </g>
  )
})

// ------------------------------------------------------------------ sokak eşyası
const Bench = memo(function Bench() {
  const iron = C.teal
  const leg = (u) => (
    <g>
      <polygon points={faceU(u, 0.28, 0.34, 0, 32)} fill={iron} {...S} />
      <polygon points={faceU(u, 0.75, 0.81, 0, 14)} fill={iron} {...S} />
      <polygon points={faceU(u, 0.28, 0.81, 11, 14)} fill={iron} {...S} />
    </g>
  )
  return (
    <g>
      <Shadow x={16} y={26} rx={42} ry={15} o={0.12} />
      {leg(0.18)}
      <Box u={0.1} v={0.24} w={1.8} d={0.08} h={6} z={20} color={C.wood} />
      <Box u={0.1} v={0.24} w={1.8} d={0.08} h={6} z={28} color={C.wood} />
      <Box u={0.1} v={0.36} w={1.8} d={0.14} h={3} z={14} color={C.wood} />
      <Box u={0.1} v={0.52} w={1.8} d={0.14} h={3} z={14} color={C.woodLight} />
      <Box u={0.1} v={0.68} w={1.8} d={0.14} h={3} z={14} color={C.wood} />
      {leg(1.78)}
    </g>
  )
})

const LampPost = memo(function LampPost() {
  return (
    <g>
      <Shadow x={0} y={17} rx={10} ry={5} o={0.16} />
      <ellipse className="sm-glow" cx={0} cy={16} rx={26} ry={12} fill="#FFE7A6" opacity="0.5" />
      <Cyl x={0} y={17} r={6} h={6} color={C.teal} />
      <rect x={-1.8} y={-58} width={3.6} height={70} rx={1.8} fill={C.teal} {...S} />
      <path d="M1.8 -50 q8 0 8 -8 q0 -4 -4 -4" stroke={C.teal} strokeWidth="1.8" fill="none" />
      <path d="M-1.8 -50 q-8 0 -8 -8 q0 -4 4 -4" stroke={C.teal} strokeWidth="1.8" fill="none" />
      <circle className="sm-glow" cx={0} cy={-68} r={15} fill="#FFE7A6" opacity="0.6" />
      <path d="M-7 -60 L7 -60 L9 -74 L-9 -74Z" fill="#FFE59A" {...S} />
      <path d="M-2 -60 L2 -60 L3 -74 L-3 -74Z" fill="#FFF6CF" />
      <path d="M-10 -74 L10 -74 L4 -82 L-4 -82Z" fill={C.teal} {...S} />
      <rect x={-8} y={-61} width={16} height={3} rx={1.5} fill={C.teal} />
      <circle cx={0} cy={-84} r={2.4} fill={C.teal} />
    </g>
  )
})

const Fountain = memo(function Fountain() {
  const cx = 0
  const cy = 48
  const R = 66
  const tiles = []
  for (let i = 0; i < 11; i++) {
    const t = 0.08 * Math.PI + (i / 10) * 0.84 * Math.PI
    const x = cx + R * Math.cos(t)
    const y = cy + (R / 2) * Math.sin(t) - 7
    tiles.push(<polygon key={i} points={`${x},${y - 3.6} ${x + 3.2},${y} ${x},${y + 3.6} ${x - 3.2},${y}`} fill={i % 2 ? C.healing : C.terracotta} opacity="0.85" />)
  }
  return (
    <g>
      <Shadow x={cx} y={cy + 6} rx={R + 8} ry={(R + 8) / 2} o={0.12} />
      <Cyl x={cx} y={cy} r={R} h={15} color="#E6D6B8" top="#F4EBDA" />
      {tiles}
      <ellipse cx={cx} cy={cy - 15} rx={R - 8} ry={(R - 8) / 2} fill={C.water} />
      <ellipse cx={cx} cy={cy - 15} rx={R - 8} ry={(R - 8) / 2} fill="none" stroke={C.waterDeep} strokeWidth="3" opacity="0.5" />
      <ellipse className="sm-ripple" cx={cx} cy={cy - 15} rx={34} ry={17} fill="none" stroke={C.waterLight} strokeWidth="2" />
      <ellipse className="sm-ripple sm-d1" cx={cx} cy={cy - 15} rx={34} ry={17} fill="none" stroke={C.waterLight} strokeWidth="2" />
      <path className="sm-shimmer" d={`M${cx - 40} ${cy - 10} q5 -2.6 10 0`} stroke={C.waterLight} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path className="sm-shimmer sm-d1" d={`M${cx + 26} ${cy - 22} q5 -2.6 10 0`} stroke={C.waterLight} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* ayak + üst kâse */}
      <Cyl x={cx} y={cy - 14} r={9} h={30} color="#E6D6B8" top="#F4EBDA" />
      <path d={`M${cx - 26} ${cy - 46} Q${cx - 22} ${cy - 32} ${cx} ${cy - 31} Q${cx + 22} ${cy - 32} ${cx + 26} ${cy - 46}Z`} fill="#E6D6B8" {...S} />
      <ellipse cx={cx} cy={cy - 46} rx={26} ry={10} fill="#F4EBDA" {...S} />
      <ellipse cx={cx} cy={cy - 46} rx={21} ry={7.5} fill={C.water} />
      {/* fıskiye */}
      <Cyl x={cx} y={cy - 46} r={3.5} h={12} color="#E6D6B8" top="#F4EBDA" />
      <g fill="none" stroke="#E8F8FC" strokeWidth="2" strokeLinecap="round">
        <path className="sm-jet" d={`M${cx} ${cy - 60} Q${cx - 14} ${cy - 76} ${cx - 22} ${cy - 50}`} />
        <path className="sm-jet" d={`M${cx} ${cy - 60} Q${cx + 14} ${cy - 76} ${cx + 22} ${cy - 50}`} />
        <path className="sm-jet" d={`M${cx - 24} ${cy - 44} Q${cx - 32} ${cy - 36} ${cx - 36} ${cy - 18}`} />
        <path className="sm-jet" d={`M${cx + 24} ${cy - 44} Q${cx + 32} ${cy - 36} ${cx + 36} ${cy - 18}`} />
        <path className="sm-jet" d={`M${cx - 8} ${cy - 39} Q${cx - 10} ${cy - 30} ${cx - 12} ${cy - 16}`} opacity="0.7" />
        <path className="sm-jet" d={`M${cx + 8} ${cy - 39} Q${cx + 10} ${cy - 30} ${cx + 12} ${cy - 16}`} opacity="0.7" />
      </g>
      <circle cx={cx} cy={cy - 61} r={3} fill="#E8F8FC" />
    </g>
  )
})

const Pond = memo(function Pond() {
  // 3×2 ayak izi: merkez (16, 40)
  const cx = 16
  const cy = 40
  const rim = []
  for (let i = 0; i < 22; i++) {
    const t = (i / 22) * Math.PI * 2
    const x = cx + Math.cos(t) * 70
    const y = cy + Math.sin(t) * 30
    rim.push(<ellipse key={i} cx={x} cy={y} rx={6 + (i % 3)} ry={3.4 + (i % 2)} fill={i % 2 ? '#D8CFC0' : '#E6DED0'} {...S} />)
  }
  const back = rim.filter((_, i) => i >= 11)
  const front = rim.filter((_, i) => i < 11)
  return (
    <g>
      <path d={`M${cx - 72} ${cy} C${cx - 70} ${cy - 30} ${cx + 66} ${cy - 34} ${cx + 72} ${cy} C${cx + 70} ${cy + 32} ${cx - 64} ${cy + 34} ${cx - 72} ${cy}Z`} fill={C.waterDeep} />
      <path d={`M${cx - 66} ${cy + 2} C${cx - 64} ${cy - 24} ${cx + 62} ${cy - 28} ${cx + 66} ${cy + 2} C${cx + 62} ${cy + 28} ${cx - 60} ${cy + 30} ${cx - 66} ${cy + 2}Z`} fill={C.water} />
      {back}
      <ellipse className="sm-ripple" cx={cx + 10} cy={cy + 4} rx={24} ry={10} fill="none" stroke={C.waterLight} strokeWidth="1.6" />
      <path className="sm-shimmer" d={`M${cx - 34} ${cy + 10} q5 -2.6 10 0`} stroke={C.waterLight} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path className="sm-shimmer sm-d1" d={`M${cx + 30} ${cy - 8} q5 -2.6 10 0`} stroke={C.waterLight} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* nilüferler */}
      {[[cx - 24, cy - 6, 0], [cx - 10, cy + 12, 1], [cx + 36, cy + 10, 0]].map(([x, y, f], i) => (
        <g key={i}>
          <path d={`M${x} ${y} m-8 0 a8 4 0 1 0 16 0 a8 4 0 1 0 -16 0 M${x} ${y} L${x + 7} ${y - 2}`} fill={C.leaf} stroke={C.leafDeep} strokeWidth="0.8" />
          {f === 0 && (
            <g>
              <ellipse cx={x - 1} cy={y - 2} rx={3.2} ry={2.4} fill={C.rosePale} />
              <ellipse cx={x - 1} cy={y - 3} rx={1.4} ry={1.2} fill={C.sun} />
            </g>
          )}
        </g>
      ))}
      {/* ördek */}
      <g className="sm-bob" transform={`translate(${cx + 14} ${cy - 10})`}>
        <ellipse cx={0} cy={2} rx={9} ry={4} fill={C.waterDeep} opacity="0.5" />
        <path d="M-8 -1 Q-8 4 0 4 Q8 4 7 -2 Q3 1 -2 -2 Q-6 -4 -8 -1Z" fill="#FFFDF8" {...S} />
        <circle cx={5} cy={-5} r={4} fill="#FFFDF8" {...S} />
        <path d="M8.5 -5.4 L12 -4.4 L8.6 -3.2Z" fill={C.apricot} />
        <circle cx={6} cy={-6} r={0.9} fill={INK} />
      </g>
      {/* sazlar */}
      <g className="sm-sway">
        {[[cx - 58, cy - 6, 30], [cx - 52, cy - 10, 36], [cx - 46, cy - 12, 26], [cx + 54, cy - 14, 28], [cx + 60, cy - 10, 22]].map(([x, y, h], i) => (
          <g key={i}>
            <path d={`M${x} ${y} Q${x + 2} ${y - h * 0.5} ${x + 1} ${y - h}`} stroke={C.leafDeep} strokeWidth="1.6" fill="none" />
            {i % 2 === 0 && <rect x={x - 1.4} y={y - h - 1} width={3.6} height={9} rx={1.8} fill="#9C6B46" />}
            <path d={`M${x} ${y} Q${x - 6} ${y - h * 0.4} ${x - 8} ${y - h * 0.6}`} stroke={C.leaf} strokeWidth="1.6" fill="none" />
          </g>
        ))}
      </g>
      {front}
    </g>
  )
})

// Tezgâh iskeleti: tahta tezgâh, dört direk, çizgili tente ve fistolu saçak.
function Stall({ a, b, children, back }) {
  const posts = [[0.12, 0.3], [1.82, 0.3], [0.12, 0.9], [1.82, 0.9]]
  const post = ([u, v], k) => <Box key={k} u={u} v={v} w={0.06} d={0.06} h={84} color={C.woodDeep} />
  // tente: arka (v=.2, h 92) -> ön (v=1.12, h 72)
  const N = 8
  const stripes = []
  for (let i = 0; i < N; i++) {
    const u1 = -0.06 + (i * 2.12) / N
    const u2 = -0.06 + ((i + 1) * 2.12) / N
    stripes.push(<polygon key={i} points={`${P(u1, 0.2, 92)} ${P(u2, 0.2, 92)} ${P(u2, 1.12, 72)} ${P(u1, 1.12, 72)}`} fill={i % 2 ? b : a} />)
  }
  const scallops = []
  for (let i = 0; i < N; i++) {
    const u1 = -0.06 + (i * 2.12) / N
    const u2 = -0.06 + ((i + 1) * 2.12) / N
    const [x1, y1] = pt(u1, 1.12, 72)
    const [x2, y2] = pt(u2, 1.12, 72)
    scallops.push(<path key={i} d={`M${x1} ${y1} L${x1} ${y1 + 4} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + 14} ${x2} ${y2 + 4} L${x2} ${y2}Z`} fill={i % 2 ? b : a} {...S} />)
  }
  return (
    <g>
      <Shadow x={16} y={28} rx={54} ry={20} o={0.12} />
      {post(posts[0], 0)}
      {post(posts[1], 1)}
      {back}
      <Box u={0.1} v={0.42} w={1.8} d={0.54} h={26} color={C.wood} top={C.woodLight} />
      <polygon points={faceV(0.96, 0.1, 1.9, 21, 26)} fill={C.woodLight} opacity="0.7" />
      <polygon points={faceV(0.96, 0.18, 1.82, 3, 17)} fill={C.woodDeep} opacity="0.35" />
      {children}
      {post(posts[2], 2)}
      {post(posts[3], 3)}
      <g>
        {stripes}
        <polygon points={`${P(-0.06, 0.2, 92)} ${P(2.06, 0.2, 92)} ${P(2.06, 1.12, 72)} ${P(-0.06, 1.12, 72)}`} fill="none" {...S} />
        {scallops}
      </g>
    </g>
  )
}

function FabricStack({ u, v, z, colors }) {
  return (
    <g>
      {colors.map((c, i) => (
        <Box key={i} u={u} v={v} w={0.32} d={0.26} h={4} z={z + i * 4} color={c} />
      ))}
    </g>
  )
}

function Shirt({ u, color }) {
  return (
    <g transform={onV(u, 0.36, 66)}>
      <path d="M-1 0 L1 0 M0 0 L0 2" stroke={C.metal} strokeWidth="1" />
      <path d="M-7 3 L-3 2 Q0 4 3 2 L7 3 L9 8 L6 9 L6 18 L-6 18 L-6 9 L-9 8Z" fill={color} {...S} />
    </g>
  )
}

const MarketStallFabric = memo(function MarketStallFabric() {
  return (
    <Stall
      a={C.apricot}
      b={C.cream}
      back={
        <g>
          <polygon points={`${P(0.15, 0.34, 66)} ${P(1.85, 0.34, 66)}`} stroke={C.woodDeep} strokeWidth="2" />
          <Shirt u={0.45} color={C.mint} />
          <Shirt u={0.8} color={C.sky} />
          <Shirt u={1.15} color={C.rosePale} />
          <Shirt u={1.5} color="#F7D04A" />
        </g>
      }
    >
      <FabricStack u={0.25} v={0.55} z={26} colors={[C.rose, C.cream, C.healing]} />
      <FabricStack u={0.85} v={0.55} z={26} colors={[C.sky, C.apricotPale, C.lilac, C.white]} />
      {/* kilim rulosu */}
      <g>
        <ellipse cx={pt(1.6, 0.62, 30)[0]} cy={pt(1.6, 0.62, 30)[1]} rx={6} ry={6} fill={C.terracotta} {...S} />
        <ellipse cx={pt(1.6, 0.62, 30)[0]} cy={pt(1.6, 0.62, 30)[1]} rx={3} ry={3} fill={C.apricotPale} />
      </g>
    </Stall>
  )
})

const MarketStallFurniture = memo(function MarketStallFurniture() {
  return (
    <Stall
      a={C.healing}
      b={C.cream}
      back={
        <g>
          {/* ayna */}
          <g transform={onV(1.35, 0.34, 66)}>
            <ellipse cx={8} cy={12} rx={9} ry={12} fill={C.woodLight} {...S} />
            <ellipse cx={8} cy={12} rx={6.5} ry={9} fill={C.glass} />
            <path d="M5 7 L8 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>
      }
    >
      {/* küçük koltuk */}
      <Box u={0.22} v={0.5} w={0.5} d={0.12} h={16} z={26} color={C.apricotSoft} />
      <Box u={0.22} v={0.6} w={0.5} d={0.3} h={7} z={26} color={C.apricot} />
      {/* abajur */}
      <g transform={`translate(${pt(1.05, 0.68, 26)[0]} ${pt(1.05, 0.68, 26)[1]})`}>
        <rect x={-1} y={-20} width={2} height={20} fill={C.ink} opacity="0.7" />
        <path d="M-7 -18 L7 -18 L5 -28 L-5 -28Z" fill={C.cream} {...S} />
        <ellipse cx={0} cy={0} rx={5} ry={2} fill={C.woodDeep} />
      </g>
      {/* saksı */}
      <g transform={`translate(${pt(1.55, 0.7, 26)[0]} ${pt(1.55, 0.7, 26)[1]})`}>
        <Blob fill={C.leaf} circles={[[-4, -14, 5], [4, -15, 5], [0, -20, 5]]} />
        <path d="M-5 -9 L5 -9 L4 0 L-4 0Z" fill={C.terracotta} {...S} />
      </g>
    </Stall>
  )
})

const MarketStallProduce = memo(function MarketStallProduce() {
  const fruit = (u, v, color, n = 5) => {
    const [x, y] = pt(u, v, 31)
    return (
      <g>
        <Box u={u - 0.18} v={v - 0.12} w={0.36} d={0.26} h={5} z={26} color={C.woodLight} />
        {Array.from({ length: n }).map((_, i) => (
          <circle key={i} cx={x - 6 + (i % 3) * 6} cy={y - 2 + Math.floor(i / 3) * 3 - (i % 2)} r={3.2} fill={color} {...S} />
        ))}
      </g>
    )
  }
  return (
    <Stall a={C.rose} b={C.cream}>
      {fruit(0.4, 0.62, C.apricot)}
      {fruit(0.9, 0.62, '#E9606F')}
      {fruit(1.4, 0.62, '#9ACB5A')}
      {fruit(1.65, 0.78, '#8F6BB5', 4)}
    </Stall>
  )
})

const MarketStallSpice = memo(function MarketStallSpice() {
  // baharatçı: ağzı açık çuvallarda tepeleme baharat
  const sack = (u, v, color) => {
    const [x, y] = pt(u, v, 26)
    return (
      <g>
        <path d={`M${x - 8} ${y} Q${x - 9} ${y - 6} ${x - 7.4} ${y - 8} L${x + 7.4} ${y - 8} Q${x + 9} ${y - 6} ${x + 8} ${y}Z`} fill="#E3CFA6" {...S} />
        <path d={`M${x - 7.6} ${y - 8} Q${x - 3} ${y - 22} ${x} ${y - 22} Q${x + 3} ${y - 22} ${x + 7.6} ${y - 8} Q${x} ${y - 5} ${x - 7.6} ${y - 8}Z`} fill={color} {...S} />
        <path d={`M${x - 2} ${y - 18} Q${x} ${y - 20} ${x + 1.4} ${y - 19}`} stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d={`M${x - 7.6} ${y - 8} Q${x} ${y - 5} ${x + 7.6} ${y - 8}`} stroke="#C9B183" strokeWidth="1.8" fill="none" />
      </g>
    )
  }
  return (
    <Stall
      a={C.lilac}
      b={C.cream}
      back={
        <g>
          <polygon points={`${P(0.15, 0.34, 66)} ${P(1.85, 0.34, 66)}`} stroke={C.woodDeep} strokeWidth="2" />
          {[0.5, 0.95, 1.4].map((u, i) => (
            <g key={u} transform={onV(u, 0.36, 66)}>
              <path d="M0 0 L0 3" stroke={C.metal} strokeWidth="1" />
              <ellipse cx={0} cy={9} rx={3.4} ry={6} fill={[C.rose, C.apricot, C.leaf][i]} {...S} />
            </g>
          ))}
        </g>
      }
    >
      {sack(0.42, 0.66, '#D9542E')}
      {sack(0.85, 0.66, '#F2B632')}
      {sack(1.28, 0.66, '#8A5A3F')}
      {sack(1.68, 0.7, '#7FA650')}
    </Stall>
  )
})

const SimitCart = memo(function SimitCart() {
  const red = '#DE5B5E'
  const simit = (x, y) => (
    <g>
      <ellipse cx={x} cy={y} rx={6} ry={3.2} fill="#C98A4B" stroke="#9C6436" strokeWidth="0.6" />
      <ellipse cx={x} cy={y} rx={2.4} ry={1.1} fill="#F6EBD6" />
      <circle cx={x - 3} cy={y - 1} r={0.5} fill="#FFF4D8" />
      <circle cx={x + 2.4} cy={y - 1.6} r={0.5} fill="#FFF4D8" />
      <circle cx={x + 3.4} cy={y + 0.6} r={0.5} fill="#FFF4D8" />
    </g>
  )
  const [wx, wy] = pt(0.82, 0.68, 7)
  const [wx2, wy2] = pt(0.82, 0.3, 7)
  return (
    <g>
      <Shadow x={0} y={18} rx={22} ry={10} o={0.14} />
      <Box u={0.22} v={0.2} w={0.58} d={0.6} h={20} z={8} color={red} />
      <polygon points={faceV(0.8, 0.26, 0.76, 12, 24)} fill="#F2F2EA" opacity="0.9" />
      {/* cam vitrin */}
      <Box u={0.24} v={0.22} w={0.54} d={0.56} h={2} z={28} color="#F4EFE4" />
      <polygon points={flat(0.28, 0.26, 0.74, 0.74, 30)} fill="#F6E7C9" />
      {simit(pt(0.42, 0.42, 31)[0], pt(0.42, 0.42, 31)[1])}
      {simit(pt(0.6, 0.6, 31)[0], pt(0.6, 0.6, 31)[1])}
      {simit(pt(0.6, 0.38, 33)[0], pt(0.6, 0.38, 33)[1])}
      {simit(pt(0.4, 0.62, 33)[0], pt(0.4, 0.62, 33)[1])}
      {simit(pt(0.5, 0.5, 36)[0], pt(0.5, 0.5, 36)[1])}
      <polygon points={faceV(0.78, 0.24, 0.78, 30, 46)} fill={C.glass} opacity="0.45" {...S} />
      <polygon points={faceU(0.78, 0.22, 0.78, 30, 46)} fill={C.glass} opacity="0.35" {...S} />
      <polygon points={flat(0.24, 0.22, 0.78, 0.78, 46)} fill={C.glass} opacity="0.3" {...S} />
      <polygon points={`${P(0.24, 0.22, 46)} ${P(0.78, 0.22, 46)} ${P(0.78, 0.78, 46)} ${P(0.24, 0.78, 46)}`} fill="none" stroke={red} strokeWidth="2.4" strokeLinejoin="round" />
      <path d={`M${pt(0.3, 0.78, 32)} L${pt(0.45, 0.78, 44)}`} stroke="#fff" strokeWidth="1.6" opacity="0.7" />
      {/* tekerlekler */}
      <circle cx={wx} cy={wy} r={7} fill={INK} opacity="0.85" />
      <circle cx={wx} cy={wy} r={3} fill="#E6DED0" />
      <circle cx={wx2} cy={wy2} r={6} fill={INK} opacity="0.75" />
      {/* sap */}
      <path d={`M${pt(0.22, 0.5, 22)} L${pt(-0.05, 0.5, 30)}`} stroke={C.metal} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  )
})

function TeaGlass({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0.5} rx={4.5} ry={1.8} fill={C.rose} />
      <path d="M-2.6 -9 Q-1.2 -5 -2.2 -2.6 Q-1.6 0 0 0 Q1.6 0 2.2 -2.6 Q1.2 -5 2.6 -9Z" fill="#C2562A" opacity="0.92" />
      <path d="M-2.6 -9 Q-1.2 -5 -2.2 -2.6 Q-1.6 0 0 0 Q1.6 0 2.2 -2.6 Q1.2 -5 2.6 -9" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.8" />
      <path d="M-1.4 -7.4 Q-0.6 -5 -1.2 -3.2" stroke="#fff" strokeWidth="0.7" opacity="0.7" fill="none" />
    </g>
  )
}

const TeaKiosk = memo(function TeaKiosk() {
  const wall = '#F6EBD3'
  const apex = P(1, 0.8, 92)
  return (
    <g>
      <Shadow x={0} y={36} rx={56} ry={26} o={0.13} />
      <Box u={0.25} v={0.2} w={1.5} d={1.2} h={58} color={wall} />
      {/* ön pencere / tezgâh açıklığı */}
      <polygon points={faceV(1.4, 0.45, 1.55, 26, 50)} fill="#6E5440" />
      <polygon points={faceV(1.4, 0.45, 1.55, 44, 50)} fill={C.healing} />
      <g transform={onV(0.95, 1.4, 44)}>
        <line x1={0} y1={0} x2={0} y2={5} stroke={C.ink} strokeWidth="0.8" />
        <path d="M-4 5 L4 5 L2.4 9 L-2.4 9Z" fill={C.sun} />
        <circle className="sm-glow" cx={0} cy={10} r={5} fill="#FFE59A" opacity="0.5" />
      </g>
      {/* çaydanlık */}
      <g transform={`translate(${pt(1.25, 1.1, 28)[0]} ${pt(1.25, 1.1, 28)[1]})`}>
        <path d="M-6 0 Q-7 -6 0 -7 Q7 -6 6 0Z" fill="#D9DEDC" {...S} />
        <path d="M-4 -7 Q-5 -11 0 -12 Q5 -11 4 -7Z" fill="#E9EDEC" {...S} />
        <circle cx={0} cy={-13} r={1.2} fill={C.ink} />
        <path className="sm-steam" d="M2 -15 q-2 -3 0 -6" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </g>
      <Box u={0.35} v={1.4} w={1.3} d={0.22} h={3} z={26} color={C.woodDeep} top={C.wood} />
      <TeaGlass x={pt(0.6, 1.5, 29)[0]} y={pt(0.6, 1.5, 29)[1]} />
      <TeaGlass x={pt(0.95, 1.5, 29)[0]} y={pt(0.95, 1.5, 29)[1]} />
      <TeaGlass x={pt(1.4, 1.5, 29)[0]} y={pt(1.4, 1.5, 29)[1]} />
      {/* yan pencere */}
      <polygon points={faceU(1.75, 0.45, 1.1, 30, 48)} fill={C.glass} {...S} />
      <path d={`M${pt(1.75, 0.775, 30)} L${pt(1.75, 0.775, 48)}`} stroke="#fff" strokeWidth="1.6" />
      {/* çatı */}
      <polygon points={`${P(0.12, 1.55, 58)} ${P(1.88, 1.55, 58)} ${apex}`} fill={C.terracotta} {...S} />
      <polygon points={`${P(1.88, 0.06, 58)} ${P(1.88, 1.55, 58)} ${apex}`} fill={shade(C.terracotta, -0.16)} {...S} />
      {[0.33, 0.66].map((t) => {
        const a = pt(0.12 + (1 - 0.12) * t, 1.55 + (0.8 - 1.55) * t, 58 + 34 * t)
        const b = pt(1.88 + (1 - 1.88) * t, 1.55 + (0.8 - 1.55) * t, 58 + 34 * t)
        return <line key={t} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#B9663F" strokeWidth="1.2" />
      })}
      <circle cx={pt(1, 0.8, 92)[0]} cy={pt(1, 0.8, 92)[1] - 3} r={3} fill={C.apricot} {...S} />
      {/* tabureler */}
      <Cyl x={pt(0.5, 1.85, 0)[0]} y={pt(0.5, 1.85, 0)[1]} r={5} h={10} color={C.healing} />
      <Cyl x={pt(1.45, 1.85, 0)[0]} y={pt(1.45, 1.85, 0)[1]} r={5} h={10} color={C.healing} />
    </g>
  )
})

const TeaTable = memo(function TeaTable() {
  const [x, y] = pt(0.5, 0.5, 0)
  return (
    <g>
      <Shadow x={x} y={y + 2} rx={20} ry={9} o={0.14} />
      <Cyl x={pt(0.15, 0.55)[0]} y={pt(0.15, 0.55)[1]} r={5} h={9} color={C.apricot} />
      <rect x={x - 1.6} y={y - 20} width={3.2} height={20} fill={C.woodDeep} />
      <ellipse cx={x} cy={y - 20} rx={14} ry={7} fill={C.woodLight} {...S} />
      <TeaGlass x={x - 4} y={y - 20} s={0.9} />
      <TeaGlass x={x + 5} y={y - 18} s={0.9} />
      <Cyl x={pt(0.85, 0.5)[0]} y={pt(0.85, 0.5)[1] + 2} r={5} h={9} color={C.apricot} />
    </g>
  )
})

// ------------------------------------------------------------------ sahil
const UmbrellaBeach = memo(function UmbrellaBeach() {
  const cy = -46
  const R = 34
  const ry = 14
  const wedges = []
  const n = 10
  const arr = []
  for (let i = 0; i < n; i++) arr.push(i)
  arr.sort((a, b) => Math.sin(((a + 0.5) / n) * Math.PI * 2) - Math.sin(((b + 0.5) / n) * Math.PI * 2))
  for (const i of arr) {
    const t1 = (i / n) * Math.PI * 2
    const t2 = ((i + 1) / n) * Math.PI * 2
    const a = [R * Math.cos(t1), cy + ry * Math.sin(t1)]
    const b = [R * Math.cos(t2), cy + ry * Math.sin(t2)]
    const m = [R * 1.02 * Math.cos((t1 + t2) / 2), cy + ry * 1.02 * Math.sin((t1 + t2) / 2) + 3]
    wedges.push(<path key={i} d={`M0 ${cy - 16} L${a[0]} ${a[1]} Q${m[0]} ${m[1]} ${b[0]} ${b[1]}Z`} fill={i % 2 ? C.white : C.rose} {...S} />)
  }
  return (
    <g>
      <ellipse cx={8} cy={20} rx={30} ry={13} fill={INK} opacity="0.1" />
      <rect x={-1.6} y={cy - 14} width={3.2} height={cy * -1 + 30} rx={1.6} fill={C.white} {...S} />
      {wedges}
      <circle cx={0} cy={cy - 17} r={2.6} fill={C.rose} />
    </g>
  )
})

const SunLounger = memo(function SunLounger() {
  // 1×2: v boyunca uzun
  return (
    <g>
      <Shadow x={pt(0.5, 1)[0]} y={pt(0.5, 1)[1] + 3} rx={30} ry={12} o={0.1} />
      <Box u={0.2} v={0.15} w={0.6} d={1.7} h={3} z={7} color={C.white} />
      {[0.25, 0.75].flatMap((u) => [0.25, 1.75].map((v) => <Box key={`${u}${v}`} u={u - 0.03} v={v - 0.03} w={0.06} d={0.06} h={7} color={C.woodDeep} />))}
      <Box u={0.24} v={0.75} w={0.52} d={1.05} h={3} z={10} color={C.mint} />
      {[0.95, 1.25, 1.55].map((v) => <polygon key={v} points={flat(0.24, v, 0.76, v + 0.12, 13.1)} fill={C.white} opacity="0.8" />)}
      {/* eğik sırtlık */}
      <polygon points={`${P(0.24, 0.2, 26)} ${P(0.76, 0.2, 26)} ${P(0.76, 0.75, 13)} ${P(0.24, 0.75, 13)}`} fill={C.mint} {...S} />
      <polygon points={`${P(0.76, 0.2, 26)} ${P(0.76, 0.75, 13)} ${P(0.76, 0.75, 10)} ${P(0.76, 0.2, 23)}`} fill={shade(C.mint, -0.2)} {...S} />
      <polygon points={`${P(0.3, 0.42, 23)} ${P(0.7, 0.42, 23)} ${P(0.7, 0.62, 18)} ${P(0.3, 0.62, 18)}`} fill={C.apricotPale} {...S} />
    </g>
  )
})

const PierPost = memo(function PierPost() {
  return (
    <g>
      <Cyl x={0} y={18} r={7} h={30} color={C.woodDeep} top={C.wood} />
      <Cyl x={0} y={4} r={7.6} h={5} color="#E8D9B5" top="#F3E8CC" line={false} />
      <path d="M-7 2 q7 4 14 0" stroke="#C9B48A" strokeWidth="1" fill="none" />
      {/* martı */}
      <g transform="translate(0 -14)">
        <path d="M-6 0 Q-6 -6 0 -6 Q5 -6 6 -2 L10 -1 L6 0Z" fill="#FFFDF8" {...S} />
        <path d="M-6 -2 Q-9 -2 -11 -5 Q-6 -5 -3 -3" fill="#B9C4C2" />
        <circle cx={1.5} cy={-9} r={3.6} fill="#FFFDF8" {...S} />
        <path d="M4.8 -9.4 L8.6 -8.4 L4.8 -7.6Z" fill={C.apricot} />
        <circle cx={2.6} cy={-9.6} r={0.8} fill={INK} />
        <path d="M-1 0 L-1 2 M2 0 L2 2" stroke={C.apricot} strokeWidth="1" />
      </g>
    </g>
  )
})

const Ferry = memo(function Ferry() {
  // 4×2: gövde u boyunca, burun +x yönünde
  const v0 = 0.25
  const v1 = 1.75
  const ub = 3.35
  const tip = [4.0, 1]
  const hull = (h1, h2, c) => (
    <g>
      <polygon points={`${P(0, v1, h1)} ${P(ub, v1, h1)} ${P(ub, v1, h2)} ${P(0, v1, h2)}`} fill={c} {...S} />
      <polygon points={`${P(ub, v1, h1)} ${P(tip[0], tip[1], h1)} ${P(tip[0], tip[1], h2 + 2)} ${P(ub, v1, h2)}`} fill={shade(c, -0.12)} {...S} />
    </g>
  )
  const windows = []
  for (let i = 0; i < 6; i++) {
    const u = 0.55 + i * 0.38
    windows.push(<polygon key={i} points={faceV(1.45, u, u + 0.24, 28, 36)} fill={C.glass} stroke={C.teal} strokeWidth="0.8" />)
  }
  const up = []
  for (let i = 0; i < 3; i++) {
    const u = 0.95 + i * 0.42
    up.push(<polygon key={i} points={faceV(1.35, u, u + 0.26, 44, 51)} fill={C.glass} stroke={C.teal} strokeWidth="0.8" />)
  }
  return (
    <g>
      <ellipse cx={pt(2.1, 1)[0]} cy={pt(2.1, 1)[1] + 10} rx={92} ry={34} fill={C.waterDeep} opacity="0.35" />
      {hull(-4, 8, C.teal)}
      {hull(8, 22, C.white)}
      <polygon points={`${P(0, v0, 22)} ${P(ub, v0, 22)} ${P(tip[0], tip[1], 24)} ${P(ub, v1, 22)} ${P(0, v1, 22)}`} fill="#E9E1CF" {...S} />
      <polygon points={`${P(0, v1, 18)} ${P(ub, v1, 18)} ${P(tip[0], tip[1], 20)} ${P(tip[0], tip[1], 18)} ${P(ub, v1, 16)} ${P(0, v1, 16)}`} fill={C.rose} opacity="0.9" />
      {/* can simidi */}
      <g transform={onV(0.35, v1, 15)}>
        <circle cx={0} cy={0} r={4.6} fill="none" stroke={C.apricot} strokeWidth="2.6" />
      </g>
      <Box u={0.4} v={0.55} w={2.65} d={0.9} h={20} z={22} color={C.cream} />
      {windows}
      <Box u={0.85} v={0.65} w={1.5} d={0.7} h={12} z={42} color={C.white} />
      {up}
      <Box u={0.8} v={0.6} w={1.6} d={0.8} h={2} z={54} color={C.teal} />
      {/* baca */}
      <Cyl x={pt(1.45, 1, 56)[0]} y={pt(1.45, 1, 56)[1]} r={7} h={22} color={C.white} />
      <Cyl x={pt(1.45, 1, 56)[0]} y={pt(1.45, 1, 56)[1] - 10} r={7.1} h={5} color={C.healing} line={false} />
      <Cyl x={pt(1.45, 1, 56)[0]} y={pt(1.45, 1, 56)[1] - 17} r={7.1} h={5} color="#3A4644" />
      {/* direk ve flama */}
      <path d={`M${pt(3.4, 1, 22)} L${pt(3.4, 1, 52)}`} stroke={C.metal} strokeWidth="1.6" />
      <path d={`M${pt(3.4, 1, 52)} l10 3 l-10 4Z`} fill={C.apricot} />
      {/* su çizgisi */}
      <path className="sm-shimmer" d={`M${pt(0.2, v1 + 0.25, 0)} q6 -3 12 0 t12 0 t12 0`} stroke={C.waterLight} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path className="sm-shimmer sm-d1" d={`M${pt(2.2, v1 + 0.25, 0)} q6 -3 12 0 t12 0`} stroke={C.waterLight} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  )
})

const Lighthouse = memo(function Lighthouse() {
  const band = (y1, y2, c) => {
    const w = (y) => 13 - (-y / 96) * 5
    return <path d={`M${-w(y1)} ${y1} L${w(y1)} ${y1} L${w(y2)} ${y2} L${-w(y2)} ${y2}Z`} fill={c} />
  }
  return (
    <g>
      <Shadow x={4} y={18} rx={24} ry={10} o={0.15} />
      <Blob fill="#CFC6B6" circles={[[-12, 16, 8], [10, 18, 9], [0, 20, 9]]} />
      <path d="M-13 12 L13 12 L8 -84 L-8 -84Z" fill={C.white} {...S} />
      {band(-8, -28, C.rose)}
      {band(-48, -68, C.rose)}
      <path d="M2 12 L13 12 L8 -84 L2 -84Z" fill={INK} opacity="0.07" />
      <path d="M-3 -40 h5 v8 h-5Z" fill={C.teal} />
      <rect x={-12} y={-88} width={24} height={4} rx={2} fill={C.teal} {...S} />
      <ellipse className="sm-glow" cx={0} cy={-96} rx={22} ry={10} fill="#FFE59A" opacity="0.55" />
      <rect x={-7} y={-102} width={14} height={14} rx={2} fill="#FFE59A" {...S} />
      <path d="M-7 -96 h14 M0 -102 v14" stroke={C.teal} strokeWidth="1" />
      <path d="M-10 -102 Q0 -114 10 -102Z" fill={C.teal} {...S} />
      <circle cx={0} cy={-114} r={2} fill={C.teal} />
    </g>
  )
})

const Rowboat = memo(function Rowboat() {
  // 2×1 su üstünde küçük kayık
  return (
    <g className="sm-bob">
      <ellipse cx={pt(1, 0.5)[0]} cy={pt(1, 0.5)[1] + 4} rx={40} ry={14} fill={C.waterDeep} opacity="0.5" />
      <path d={`M${pt(0.1, 0.5, 8)} Q${pt(0.4, 0.95, 2)} ${pt(1, 0.92, 2)} Q${pt(1.6, 0.9, 2)} ${pt(1.95, 0.5, 10)} Q${pt(1.6, 0.1, 6)} ${pt(1, 0.08, 6)} Q${pt(0.4, 0.1, 6)} ${pt(0.1, 0.5, 8)}Z`} fill={C.sky} {...S} />
      <path d={`M${pt(0.25, 0.5, 8)} Q${pt(0.5, 0.82, 6)} ${pt(1, 0.8, 6)} Q${pt(1.5, 0.8, 6)} ${pt(1.8, 0.5, 9)} Q${pt(1.5, 0.22, 6)} ${pt(1, 0.2, 6)} Q${pt(0.5, 0.22, 6)} ${pt(0.25, 0.5, 8)}Z`} fill={C.woodLight} />
      <polygon points={flat(0.9, 0.22, 1.08, 0.8, 7)} fill={C.wood} {...S} />
      <path d={`M${pt(0.12, 0.5, 8)} Q${pt(0.4, 0.95, 2)} ${pt(1, 0.92, 2)} Q${pt(1.6, 0.9, 2)} ${pt(1.95, 0.5, 10)}`} stroke={C.white} strokeWidth="2" fill="none" opacity="0.7" />
    </g>
  )
})

// ------------------------------------------------------------------ evler
function WindowV({ v, u1, u2, h1, h2, shutters, box, glass = C.glass, trim = C.white }) {
  const um = (u1 + u2) / 2
  const hm = (h1 + h2) / 2
  return (
    <g>
      {shutters && <polygon points={faceV(v, u1 - 0.22, u1 - 0.02, h1, h2)} fill={shutters} {...S} />}
      {shutters && <polygon points={faceV(v, u2 + 0.02, u2 + 0.22, h1, h2)} fill={shutters} {...S} />}
      <polygon points={faceV(v, u1 - 0.05, u2 + 0.05, h1 - 3, h2 + 3)} fill={trim} {...S} />
      <polygon points={faceV(v, u1, u2, h1, h2)} fill={glass} />
      <path d={`M${P(um, v, h1)} L${P(um, v, h2)} M${P(u1, v, hm)} L${P(u2, v, hm)}`} stroke={trim} strokeWidth="1.6" />
      <path d={`M${P(u1 + 0.06, v, h2 - 3)} L${P(u1 + 0.16, v, h2 - 7)}`} stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      {box && (
        <g>
          <polygon points={faceV(v + 0.14, u1 - 0.08, u2 + 0.08, h1 - 7, h1 - 1)} fill={box} {...S} />
          {[0.15, 0.4, 0.65, 0.9].map((t, i) => {
            const [x, y] = pt(u1 + (u2 - u1) * t, v + 0.08, h1 - 1)
            return <circle key={i} cx={x} cy={y - 2} r={2.6} fill={[C.rose, '#FFFFFF', C.apricot, C.rosePale][i]} {...S} />
          })}
        </g>
      )}
    </g>
  )
}

function WindowU({ u, v1, v2, h1, h2, glass = C.glass, trim = C.white }) {
  const vm = (v1 + v2) / 2
  const hm = (h1 + h2) / 2
  return (
    <g>
      <polygon points={faceU(u, v1 - 0.05, v2 + 0.05, h1 - 3, h2 + 3)} fill={trim} {...S} />
      <polygon points={faceU(u, v1, v2, h1, h2)} fill={shade(glass, -0.08)} />
      <path d={`M${P(u, vm, h1)} L${P(u, vm, h2)} M${P(u, v1, hm)} L${P(u, v2, hm)}`} stroke={trim} strokeWidth="1.6" />
    </g>
  )
}

function Door({ v, color, trim = C.white, awning }) {
  const u1 = 1.2
  const u2 = 1.8
  return (
    <g>
      <g transform={onV(u1 - 0.06, v, 0)}>
        <path d={`M0 0 L0 -32 Q0 -${46} ${(u2 - u1 + 0.12) * UNIT * 0.5} -46 Q${(u2 - u1 + 0.12) * UNIT} -46 ${(u2 - u1 + 0.12) * UNIT} -32 L${(u2 - u1 + 0.12) * UNIT} 0Z`} fill={trim} {...S} />
      </g>
      <g transform={onV(u1, v, 0)}>
        <path d={`M0 0 L0 -30 Q0 -${42} ${(u2 - u1) * UNIT * 0.5} -42 Q${(u2 - u1) * UNIT} -42 ${(u2 - u1) * UNIT} -30 L${(u2 - u1) * UNIT} 0Z`} fill={color} {...S} />
        <path d={`M${(u2 - u1) * UNIT * 0.5} -40 L${(u2 - u1) * UNIT * 0.5} 0`} stroke={shade(color, -0.2)} strokeWidth="1" />
        <rect x={3} y={-26} width={(u2 - u1) * UNIT * 0.5 - 6} height={10} rx={2} fill={shade(color, 0.15)} />
        <rect x={(u2 - u1) * UNIT * 0.5 + 3} y={-26} width={(u2 - u1) * UNIT * 0.5 - 6} height={10} rx={2} fill={shade(color, 0.15)} />
        <circle cx={(u2 - u1) * UNIT * 0.5 + 4} cy={-14} r={1.5} fill={C.apricot} />
        <circle cx={(u2 - u1) * UNIT * 0.5 - 4} cy={-14} r={1.5} fill={C.apricot} />
      </g>
      {/* basamak */}
      <Box u={u1 - 0.12} v={v} w={u2 - u1 + 0.24} d={0.16} h={3} color="#E6DED0" />
      {awning && (
        <polygon points={`${P(u1 - 0.18, v, 52)} ${P(u2 + 0.18, v, 52)} ${P(u2 + 0.18, v + 0.3, 46)} ${P(u1 - 0.18, v + 0.3, 46)}`} fill={awning} {...S} />
      )}
    </g>
  )
}

function Roof({ a, b, c, eave, apexH, color }) {
  // kare kırma çatı (piramit): a..b ayak izi, apex merkezde
  const apex = P(c, c, apexH)
  const rows = []
  for (let i = 1; i < 4; i++) {
    const t = i / 4
    const h = eave + (apexH - eave) * t
    const l = a + (c - a) * t
    const r = b - (b - c) * t
    rows.push(<path key={`f${i}`} d={`M${P(l, r, h)} L${P(r, r, h)}`} stroke={shade(color, -0.22)} strokeWidth="1.2" opacity="0.6" />)
    rows.push(<path key={`s${i}`} d={`M${P(r, l, h)} L${P(r, r, h)}`} stroke={shade(color, -0.32)} strokeWidth="1.2" opacity="0.6" />)
  }
  return (
    <g>
      <polygon points={`${P(a, b, eave)} ${P(b, b, eave)} ${apex}`} fill={color} {...S} />
      <polygon points={`${P(b, a, eave)} ${P(b, b, eave)} ${apex}`} fill={shade(color, -0.15)} {...S} />
      {rows}
      <polygon points={`${P(a, b, eave)} ${P(b, b, eave)} ${P(b, b, eave - 3)} ${P(a, b, eave - 3)}`} fill={shade(color, -0.3)} />
      <polygon points={`${P(b, a, eave)} ${P(b, b, eave)} ${P(b, b, eave - 3)} ${P(b, a, eave - 3)}`} fill={shade(color, -0.38)} />
    </g>
  )
}

function House({ wall, trim = C.white, door, roof = C.terracotta, shutters, boxes, variant }) {
  const a = 0.18
  const b = variant === 'cumba' ? 2.55 : 2.82
  const H = 92
  return (
    <g>
      <Shadow x={pt(1.5, 1.5)[0] + 10} y={pt(1.5, 1.5)[1] + 4} rx={92} ry={42} o={0.12} />
      {/* baca (arka) */}
      <Box u={0.7} v={0.6} w={0.32} d={0.32} h={30} z={H + 6} color="#D8CFC0" />
      <Box u={a} v={a} w={b - a} d={b - a} h={H} color={wall} />
      {/* kat silmesi + taban */}
      <polygon points={faceV(b, a, b, 44, 48)} fill={trim} opacity="0.85" />
      <polygon points={faceU(b, a, b, 44, 48)} fill={shade(trim, -0.1)} opacity="0.85" />
      <polygon points={faceV(b, a, b, 0, 7)} fill={shade(wall, -0.18)} />
      <polygon points={faceU(b, a, b, 0, 7)} fill={shade(wall, -0.3)} />
      {/* yan pencereler */}
      <WindowU u={b} v1={0.55} v2={1.05} h1={16} h2={36} trim={trim} />
      <WindowU u={b} v1={1.6} v2={2.1} h1={16} h2={36} trim={trim} />
      <WindowU u={b} v1={0.55} v2={1.05} h1={58} h2={80} trim={trim} />
      <WindowU u={b} v1={1.6} v2={2.1} h1={58} h2={80} trim={trim} />
      {/* ön cephe */}
      <WindowV v={b} u1={0.45} u2={0.9} h1={16} h2={36} shutters={shutters} trim={trim} />
      <WindowV v={b} u1={2.1} u2={2.55} h1={16} h2={36} shutters={shutters} trim={trim} />
      <Door v={b} color={door} trim={trim} awning={variant === 'balcony' ? C.apricot : null} />
      {variant === 'cumba' ? (
        <g>
          {/* cumba: üst katta öne çıkan ahşap cumba */}
          <polygon points={`${P(0.7, b, 44)} ${P(0.9, b + 0.3, 50)} ${P(0.9, b, 50)}`} fill={C.woodDeep} />
          <polygon points={`${P(2.3, b, 44)} ${P(2.1, b + 0.3, 50)} ${P(2.1, b, 50)}`} fill={C.woodDeep} />
          <Box u={0.7} v={b} w={1.6} d={0.32} h={38} z={50} color={trim === C.white ? C.wood : trim} />
          <WindowV v={b + 0.32} u1={0.85} u2={1.4} h1={60} h2={80} trim={C.woodLight} />
          <WindowV v={b + 0.32} u1={1.6} u2={2.15} h1={60} h2={80} trim={C.woodLight} />
          <WindowU u={2.3} v1={b + 0.06} v2={b + 0.26} h1={60} h2={80} trim={C.woodLight} />
          <polygon points={`${P(0.66, b, 88)} ${P(2.34, b, 88)} ${P(2.34, b + 0.38, 88)} ${P(0.66, b + 0.38, 88)}`} fill={shade(roof, -0.1)} {...S} />
        </g>
      ) : (
        <g>
          <WindowV v={b} u1={0.45} u2={0.9} h1={58} h2={80} shutters={shutters} box={boxes ? C.woodDeep : null} trim={trim} />
          <WindowV v={b} u1={1.27} u2={1.73} h1={58} h2={80} shutters={shutters} box={boxes ? C.woodDeep : null} trim={trim} />
          <WindowV v={b} u1={2.1} u2={2.55} h1={58} h2={80} shutters={shutters} box={boxes ? C.woodDeep : null} trim={trim} />
        </g>
      )}
      {variant === 'balcony' && (
        <g>
          <Box u={0.9} v={b} w={1.2} d={0.3} h={3} z={50} color="#E6DED0" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const u = 0.92 + i * 0.193
            return <path key={i} d={`M${P(u, b + 0.3, 53)} L${P(u, b + 0.3, 64)}`} stroke={C.teal} strokeWidth="1.3" />
          })}
          <path d={`M${P(0.9, b + 0.3, 64)} L${P(2.1, b + 0.3, 64)} L${P(2.1, b, 64)}`} stroke={C.teal} strokeWidth="2" fill="none" />
          <g transform={`translate(${pt(1.95, b + 0.15, 53)[0]} ${pt(1.95, b + 0.15, 53)[1]})`}>
            <path d="M-3 -6 L3 -6 L2 0 L-2 0Z" fill={C.terracotta} />
            <Blob line={false} fill={C.leaf} circles={[[0, -9, 4], [-3, -11, 3], [3, -11, 3]]} />
          </g>
        </g>
      )}
      <Roof a={a - 0.14} b={b + 0.14 + (variant === 'cumba' ? 0 : 0)} c={(a + b) / 2} eave={H} apexH={H + 44} color={roof} />
      {variant === 'round' && (
        <g transform={`translate(${pt(1.5, b + 0.14, 108)[0]} ${pt(1.5, b + 0.14, 108)[1]})`}>
          <circle r={7} fill={trim} {...S} />
          <circle r={5} fill={C.glass} />
          <path d="M-5 0 H5 M0 -5 V5" stroke={trim} strokeWidth="1.2" />
        </g>
      )}
    </g>
  )
}

const HouseA = memo(function HouseA() {
  return <House wall="#F7DE9E" door={C.healing} shutters={null} boxes variant="plain" />
})
const HouseB = memo(function HouseB() {
  return <House wall="#B4E0CB" door={C.woodDeep} roof="#CF7E5A" variant="cumba" />
})
const HouseC = memo(function HouseC() {
  return <House wall="#F5C3B8" door={C.wood} shutters={C.healing} variant="round" roof="#B9705A" />
})
const HouseD = memo(function HouseD() {
  return <House wall="#B7D7EF" door={C.rose} roof={C.terracotta} variant="balcony" />
})

// ------------------------------------------------------------------ küçük nesneler
const Signpost = memo(function Signpost() {
  const board = (h, dir, color, icon) => (
    <g transform={`translate(0 ${-h}) ${dir < 0 ? 'scale(-1 1)' : ''} skewY(${dir > 0 ? 18 : 18})`}>
      <path d="M-1 -5 L18 -5 L23 0 L18 5 L-1 5Z" fill={color} {...S} />
      <g transform={`translate(10 0) ${dir < 0 ? 'scale(-1 1)' : ''}`}>{icon}</g>
    </g>
  )
  return (
    <g>
      <Shadow x={0} y={17} rx={10} ry={5} o={0.15} />
      <rect x={-2.2} y={-56} width={4.4} height={72} rx={2} fill={C.woodDeep} {...S} />
      {board(48, 1, C.healing, <path d="M0 3 C-4 0 -3 -4 0 -4 C3 -4 4 0 0 3Z" fill="#fff" />)}
      {board(36, -1, C.sky, <path d="M-5 0 q2.5 -3 5 0 t5 0" stroke="#fff" strokeWidth="1.6" fill="none" />)}
      {board(24, 1, C.apricot, <path d="M-4 3 L-4 -1 L0 -4 L4 -1 L4 3Z" fill="#fff" />)}
      <circle cx={0} cy={-57} r={3} fill={C.wood} {...S} />
    </g>
  )
})

const Fence = memo(function Fence() {
  // u boyunca, v=0.5 hattında beyaz çit
  const pickets = []
  for (let i = 0; i < 5; i++) {
    const u = 0.06 + i * 0.22
    pickets.push(
      <g key={i} transform={onV(u, 0.5, 0)}>
        <path d="M0 0 L0 -20 L2.5 -24 L5 -20 L5 0Z" fill={C.white} {...S} />
      </g>,
    )
  }
  return (
    <g>
      <polygon points={faceV(0.5, 0, 1, 0, 2)} fill={INK} opacity="0.08" />
      <polygon points={faceV(0.48, 0, 1, 6, 9)} fill="#EDE6D6" {...S} />
      <polygon points={faceV(0.48, 0, 1, 14, 17)} fill="#EDE6D6" {...S} />
      {pickets}
    </g>
  )
})

const Mailbox = memo(function Mailbox() {
  return (
    <g>
      <Shadow x={0} y={17} rx={9} ry={4} o={0.15} />
      <rect x={-2} y={-18} width={4} height={34} fill={C.woodDeep} {...S} />
      <g transform="translate(0 -26)">
        <path d="M-10 6 L-10 -2 Q-10 -9 -3 -9 L4 -9 Q11 -9 11 -2 L11 6Z" fill={C.healing} {...S} />
        <path d="M4 -9 Q11 -9 11 -2 L11 6 L4 6Z" fill={C.healingDeep} opacity="0.5" />
        <rect x={-6} y={-3} width={7} height={1.8} rx={0.9} fill={C.white} />
        <path d="M12 -6 L12 -16 L18 -14 L12 -12" fill={C.apricot} stroke={C.apricot} strokeWidth="1.2" strokeLinejoin="round" />
      </g>
    </g>
  )
})

const Bicycle = memo(function Bicycle() {
  // yan görünüş, v=0.5 düzlemine yatırılmış
  return (
    <g>
      <Shadow x={0} y={18} rx={24} ry={7} o={0.12} />
      <g transform={onV(0.05, 0.55, 0)}>
        <g fill="none" stroke={INK} strokeOpacity="0.75" strokeWidth="2">
          <circle cx={7} cy={-9} r={8} />
          <circle cx={31} cy={-9} r={8} />
        </g>
        <circle cx={7} cy={-9} r={1.4} fill={INK} opacity="0.6" />
        <circle cx={31} cy={-9} r={1.4} fill={INK} opacity="0.6" />
        <path d="M7 -9 L15 -9 L27 -22 L31 -9 M15 -9 L12 -22 L27 -22 M12 -22 L10 -26" stroke={C.healing} strokeWidth="2.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M7 -26 L13 -26" stroke={C.woodDeep} strokeWidth="3" strokeLinecap="round" />
        <path d="M27 -22 L28 -29 L24 -30" stroke={C.metal} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* sepet ve çiçekler */}
        <path d="M30 -27 L38 -27 L37 -20 L31 -20Z" fill={C.woodLight} {...S} />
        <circle cx={32} cy={-29} r={2} fill={C.rose} />
        <circle cx={35.5} cy={-30} r={2} fill="#FFFFFF" />
        <circle cx={34} cy={-27.5} r={1.6} fill={C.sun} />
      </g>
    </g>
  )
})

const CatSleeping = memo(function CatSleeping() {
  return (
    <g transform="translate(0 16)">
      <Shadow x={0} y={2} rx={14} ry={5} o={0.14} />
      <path d="M-12 0 Q-14 -10 -2 -11 Q10 -11 12 -2 Q12 2 6 2 L-8 2 Q-12 2 -12 0Z" fill="#F4B26A" {...S} />
      <path d="M8 -8 Q16 -6 12 2 Q4 6 -6 3" stroke="#E0954A" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <path d="M-4 -10 Q-2 -6 -4 -2 M2 -11 Q4 -7 2 -3" stroke="#E0954A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <g transform="translate(-9 -5)">
        <path d="M-5 -3 L-5 -9 L-1 -6Z M3 -6 L6 -9 L6 -3Z" fill="#F4B26A" {...S} />
        <ellipse cx={0} cy={0} rx={7} ry={5.6} fill="#F4B26A" {...S} />
        <path d="M-4 -0.5 q1.4 1.2 2.8 0 M1.4 -0.5 q1.4 1.2 2.8 0" stroke={INK} strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <ellipse cx={-4.4} cy={2.2} rx={1.6} ry={0.9} fill="#FF8FA3" opacity="0.7" />
        <ellipse cx={4.6} cy={2.2} rx={1.6} ry={0.9} fill="#FF8FA3" opacity="0.7" />
      </g>
      <path d="M8 -20 h4 l-4 4.5 h4 M14 -26 h3 l-3 3.4 h3" stroke={C.metal} strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </g>
  )
})

const Rock = memo(function Rock() {
  return (
    <g>
      <Shadow x={2} y={19} rx={20} ry={8} o={0.13} />
      <path d="M-16 16 Q-18 4 -8 0 Q0 -6 10 -2 Q18 2 17 14 Q8 22 -16 16Z" fill="#CBC3B4" {...S} />
      <path d="M-8 2 Q0 -3 8 0" stroke="#E4DED2" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M17 14 Q8 22 -16 16 Q-4 16 6 10 Q12 8 17 14Z" fill="#B3AA99" />
      <path d="M-14 15 q3 -5 6 -1" stroke={C.leaf} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  )
})

// Bölge kapısı: iki direk + kemer; `to` hedef bölgeye göre küçük amblem.
const EMBLEMS = {
  meydan: (
    <g>
      <path d="M-6 3 Q0 0 6 3 L4 5 L-4 5Z" fill="#fff" />
      <path d="M0 2 L0 -5 M0 -5 q-3 1 -4 4 M0 -5 q3 1 4 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  park: <path d="M0 6 L0 0 M0 1 C-6 0 -6 -7 0 -7 C6 -7 6 0 0 1Z" fill="#fff" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />,
  carsi: (
    <g>
      <path d="M-6 -2 L-5 -5 L5 -5 L6 -2 Q4.5 0 3 -2 Q1.5 0 0 -2 Q-1.5 0 -3 -2 Q-4.5 0 -6 -2Z" fill="#fff" />
      <rect x={-5} y={-1} width={10} height={6} fill="#fff" opacity="0.8" />
    </g>
  ),
  sahil: <path d="M-6 0 q3 -4 6 0 t6 0 M-6 4 q3 -4 6 0 t6 0" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />,
  mahalle: <path d="M-5 5 L-5 -1 L0 -5 L5 -1 L5 5 L1.5 5 L1.5 1 L-1.5 1 L-1.5 5Z" fill="#fff" />,
}
const EMBLEM_COLOR = { meydan: C.terracotta, park: C.healing, carsi: C.apricot, sahil: C.skyDeep, mahalle: C.rose }

const GateArch = memo(function GateArch({ to }) {
  const L = 2 * UNIT
  const color = EMBLEM_COLOR[to] || C.healing
  return (
    <g>
      <ellipse cx={pt(1, 0.5)[0]} cy={pt(1, 0.5)[1]} rx={40} ry={12} fill={color} opacity="0.12" />
      <g transform={onV(0, 0.5, 0)}>
        {/* direkler */}
        <rect x={2} y={-62} width={8} height={62} rx={2} fill={C.cream} {...S} />
        <rect x={L - 10} y={-62} width={8} height={62} rx={2} fill={C.cream} {...S} />
        <rect x={0} y={-6} width={12} height={6} rx={1.5} fill="#E2D2B4" {...S} />
        <rect x={L - 12} y={-6} width={12} height={6} rx={1.5} fill="#E2D2B4" {...S} />
        {/* kemer */}
        <path d={`M2 -60 Q${L / 2} -98 ${L - 2} -60 L${L - 10} -60 Q${L / 2} -86 10 -60Z`} fill={C.cream} {...S} />
        <path d={`M6 -61 Q${L / 2} -93 ${L - 6} -61`} stroke={color} strokeWidth="2.4" fill="none" opacity="0.8" />
        {/* flamalar */}
        <path d={`M10 -54 Q${L / 2} -40 ${L - 10} -54`} stroke={C.metal} strokeWidth="0.8" fill="none" />
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((t, i) => {
          const x = 10 + (L - 20) * t
          const y = -54 + 4 * (1 - (2 * t - 1) ** 2) * 3.5
          return <path key={i} d={`M${x - 3.5} ${y - 1} L${x + 3.5} ${y - 1} L${x} ${y + 6}Z`} fill={[C.apricot, C.mint, C.rose, C.sky, C.sun][i]} />
        })}
        {/* amblem */}
        <circle cx={L / 2} cy={-86} r={11} fill={color} stroke={C.white} strokeWidth="2.2" />
        <g transform={`translate(${L / 2} -86)`}>{EMBLEMS[to] || EMBLEMS.meydan}</g>
      </g>
    </g>
  )
})

// --------------------------------------------------------------------- kayıt
export const PROPS = Object.fromEntries(
  Object.entries({
    cinar: Cinar,
    tree_round: TreeRound,
    pine: Pine,
    bush: Bush,
    flowerbed: Flowerbed,
    bench: Bench,
    lamp_post: LampPost,
    fountain: Fountain,
    pond: Pond,
    market_stall_fabric: MarketStallFabric,
    market_stall_furniture: MarketStallFurniture,
    market_stall_produce: MarketStallProduce,
    market_stall_spice: MarketStallSpice,
    simit_cart: SimitCart,
    tea_kiosk: TeaKiosk,
    tea_table: TeaTable,
    umbrella_beach: UmbrellaBeach,
    sun_lounger: SunLounger,
    pier_post: PierPost,
    ferry: Ferry,
    rowboat: Rowboat,
    house_a: HouseA,
    house_b: HouseB,
    house_c: HouseC,
    house_d: HouseD,
    signpost: Signpost,
    fence: Fence,
    mailbox: Mailbox,
    bicycle: Bicycle,
    cat_sleeping: CatSleeping,
    rock: Rock,
    gate_arch: GateArch,
    lighthouse_small: Lighthouse,
  }).map(([key, Component]) => [key, { ...PROP_META[key], Component }]),
)

export const PROP_KEYS = Object.keys(PROPS)
