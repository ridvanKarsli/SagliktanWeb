// Zemin karoları ve oda duvarları. Her karo yerel koordinatta çizilir:
// (0,0) = elmasın üst köşesi; motor <g transform="translate(sx sy)"> ile yerleştirir.
// `variant` (0-3) aynı karonun küçük farklılıklarını seçer; motor için öneri:
// variant = (x * 7 + y * 13) % 4.
import { memo } from 'react'
import { C, INK, shade } from './palette.js'
import { P, LINE, faceV, faceU } from './primitives.jsx'
import { TILE_LEGEND } from './legend.js'
import './styles.js'

const DIAMOND = '0,0 32,16 0,32 -32,16'
// karo içi (a,b ∈ 0..1) -> ekran
const q = (a, b) => [(a - b) * 32, (a + b) * 16]

const JIT = [
  [0, 0], [0.06, -0.04], [-0.05, 0.05], [0.04, 0.06],
]

function Base({ fill }) {
  // aynı renkte ince kontur: komşu karolar arasında kenar yumuşatma çizgisi kalmasın
  return <polygon points={DIAMOND} fill={fill} stroke={fill} strokeWidth="1.2" strokeLinejoin="round" />
}

function Tuft({ a, b, color = C.grassDeep, s = 1 }) {
  const [x, y] = q(a, b)
  return (
    <path
      d={`M${x - 3 * s} ${y + 1} Q${x - 2.5 * s} ${y - 2 * s} ${x - 1 * s} ${y - 3.5 * s} M${x} ${y + 1} L${x + 0.3} ${y - 4.5 * s} M${x + 3 * s} ${y + 1} Q${x + 2.6 * s} ${y - 2 * s} ${x + 1.4 * s} ${y - 3.4 * s}`}
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
  )
}

function Grass({ variant }) {
  const v = variant % 4
  return (
    <g>
      <Base fill={C.grass} />
      {v === 0 && <ellipse cx={-6} cy={15} rx={9} ry={3.6} fill={C.grassLight} opacity="0.7" />}
      {v === 1 && <Tuft a={0.3} b={0.55} />}
      {v === 2 && (
        <>
          <ellipse cx={8} cy={17} rx={7} ry={2.8} fill={C.grassDeep} opacity="0.35" />
          <Tuft a={0.7} b={0.35} s={0.8} />
        </>
      )}
      {v === 3 && <Tuft a={0.55} b={0.7} s={0.9} />}
    </g>
  )
}

function Bloom({ a, b, color }) {
  const [x, y] = q(a, b)
  return (
    <g>
      <path d={`M${x} ${y + 3} L${x} ${y}`} stroke={C.leafDeep} strokeWidth="1" strokeLinecap="round" />
      <circle cx={x - 1.6} cy={y - 0.6} r={1.5} fill={color} />
      <circle cx={x + 1.6} cy={y - 0.6} r={1.5} fill={color} />
      <circle cx={x} cy={y - 2.2} r={1.5} fill={color} />
      <circle cx={x} cy={y + 0.9} r={1.5} fill={color} />
      <circle cx={x} cy={y - 0.6} r={1.1} fill={C.sun} />
    </g>
  )
}

function GrassFlowers({ variant }) {
  const v = variant % 4
  const sets = [
    [[0.3, 0.35, '#FFFFFF'], [0.65, 0.6, C.rosePale], [0.35, 0.75, '#FFFFFF']],
    [[0.6, 0.3, '#FFFFFF'], [0.3, 0.6, C.lilacPale], [0.72, 0.72, C.apricotPale]],
    [[0.45, 0.45, C.rosePale], [0.22, 0.25, '#FFFFFF'], [0.75, 0.5, '#FFFFFF']],
    [[0.5, 0.25, C.apricotPale], [0.4, 0.65, '#FFFFFF'], [0.75, 0.8, C.lilacPale]],
  ][v]
  return (
    <g>
      <Base fill={C.grass} />
      <ellipse cx={0} cy={16} rx={14} ry={5} fill={C.grassLight} opacity="0.55" />
      <Tuft a={0.55} b={0.2} s={0.7} />
      {sets.map(([a, b, c], i) => <Bloom key={i} a={a} b={b} color={c} />)}
    </g>
  )
}

function Cobble({ a, b, rx = 8.6, fill, edge }) {
  const [x, y] = q(a, b)
  return <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.5} fill={fill} stroke={edge} strokeWidth="0.8" strokeOpacity="0.55" />
}

function Path({ variant }) {
  const [ja, jb] = JIT[variant % 4]
  return (
    <g>
      <Base fill="#E2CFAE" />
      <Cobble a={0.27 + ja} b={0.27} fill="#F1E4CC" edge="#C7AF88" />
      <Cobble a={0.74} b={0.26 + jb} rx={8} fill="#EEDFC3" edge="#C7AF88" />
      <Cobble a={0.26} b={0.74 - jb} rx={8} fill="#EFE1C7" edge="#C7AF88" />
      <Cobble a={0.73 - ja} b={0.73} fill="#F3E7D1" edge="#C7AF88" />
      {variant % 2 === 1 && <circle cx={2} cy={16} r={1.2} fill="#C7AF88" opacity="0.7" />}
    </g>
  )
}

function Plaza({ variant }) {
  const alt = variant % 2 === 1
  const base = alt ? '#EFE0C4' : C.plaza
  const [ax, ay] = q(0.5, 0)
  const [bx, by] = q(0.5, 1)
  const [cx, cy] = q(0, 0.5)
  const [dx, dy] = q(1, 0.5)
  const motif = alt ? C.healing : C.terracotta
  return (
    <g>
      <Base fill={base} />
      <polygon points="0,2.2 28,16 0,29.8 -28,16" fill="none" stroke="#D9C49F" strokeWidth="0.9" />
      <path d={`M${ax} ${ay + 1} L${bx} ${by - 1} M${cx + 1} ${cy} L${dx - 1} ${dy}`} stroke="#D9C49F" strokeWidth="0.8" opacity="0.8" />
      <g opacity="0.75">
        <polygon points="0,10 5,16 0,22 -5,16" fill={motif} opacity="0.55" />
        <polygon points="0,13 2.2,16 0,19 -2.2,16" fill={C.white} />
      </g>
    </g>
  )
}

function Sand({ variant }) {
  const v = variant % 4
  return (
    <g>
      <Base fill={C.sand} />
      <circle cx={-10} cy={14} r={0.9} fill={C.sandDeep} />
      <circle cx={6} cy={10} r={0.8} fill={C.sandDeep} />
      <circle cx={12} cy={19} r={0.9} fill={C.sandDeep} />
      <circle cx={-3} cy={23} r={0.8} fill={C.sandDeep} />
      {v === 1 && <path d="M-14 17 Q-7 13 0 17 T14 17" stroke={C.sandDeep} strokeWidth="1" fill="none" opacity="0.7" />}
      {v === 3 && (
        <g transform="translate(4 15)">
          <path d="M-3 1 Q0 -4 3 1 Z" fill="#FBD3C4" stroke="#E6A894" strokeWidth="0.6" />
          <path d="M-1.4 0.5 L0 -2.4 M1.4 0.5 L0 -2.4" stroke="#E6A894" strokeWidth="0.5" />
        </g>
      )}
    </g>
  )
}

function Water({ variant }) {
  const v = variant % 4
  const d = v === 1 ? 'sm-d1' : v === 2 ? 'sm-d2' : ''
  return (
    <g>
      <Base fill={C.water} />
      {v === 3 && <ellipse cx={0} cy={16} rx={16} ry={6} fill={C.waterDeep} opacity="0.25" />}
      <path className={`sm-shimmer ${d}`} d="M-14 14 q4 -2.4 8 0" stroke={C.waterLight} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path className={`sm-shimmer ${v === 0 ? 'sm-d2' : 'sm-d1'}`} d="M4 21 q4 -2.4 8 0" stroke={C.waterLight} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </g>
  )
}

function Wood() {
  // tahtalar x ekseni boyunca; aralarında koyu derz
  const seams = [0.25, 0.5, 0.75]
  return (
    <g>
      <Base fill={C.wood} />
      <polygon points={`${q(0, 0.25)} ${q(1, 0.25)} ${q(1, 0.5)} ${q(0, 0.5)}`} fill={C.woodLight} opacity="0.55" />
      <polygon points={`${q(0, 0.75)} ${q(1, 0.75)} ${q(1, 1)} ${q(0, 1)}`} fill={C.woodLight} opacity="0.4" />
      {seams.map((b) => {
        const [x1, y1] = q(0, b)
        const [x2, y2] = q(1, b)
        return <line key={b} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.woodDeep} strokeWidth="1" opacity="0.6" />
      })}
      {[0.375, 0.875].map((b) => {
        const [x, y] = q(0.12, b)
        const [x2, y2] = q(0.88, b)
        return (
          <g key={b} fill={C.woodDeep}>
            <circle cx={x} cy={y} r={0.8} />
            <circle cx={x2} cy={y2} r={0.8} />
          </g>
        )
      })}
    </g>
  )
}

function FloorRoom({ variant }) {
  // sıcak parke: v ekseni boyunca şeritler, şaşırtmalı derzler
  const strips = [0, 0.25, 0.5, 0.75]
  const off = variant % 2 ? 0.5 : 0
  return (
    <g>
      <Base fill="#D9A877" />
      {strips.map((a, i) => {
        const tone = i % 2 ? '#DFB080' : '#D9A877'
        const seam = (off + i * 0.37) % 1
        return (
          <g key={a}>
            <polygon points={`${q(a, 0)} ${q(a + 0.25, 0)} ${q(a + 0.25, 1)} ${q(a, 1)}`} fill={tone} />
            <line x1={q(a, seam)[0]} y1={q(a, seam)[1]} x2={q(a + 0.25, seam)[0]} y2={q(a + 0.25, seam)[1]} stroke="#B98656" strokeWidth="0.8" opacity="0.6" />
            <line x1={q(a, 0)[0]} y1={q(a, 0)[1]} x2={q(a, 1)[0]} y2={q(a, 1)[1]} stroke="#BE8B5C" strokeWidth="0.7" opacity="0.45" />
          </g>
        )
      })}
    </g>
  )
}

const TILE_COMPONENTS = {
  grass: Grass,
  grass_flowers: GrassFlowers,
  path: Path,
  plaza: Plaza,
  sand: Sand,
  water: Water,
  wood: Wood,
  floor_room: FloorRoom,
}

export const TILE_KINDS = Object.keys(TILE_COMPONENTS)

// <IsoTile kind="grass" variant={0..3} />
export const IsoTile = memo(function IsoTile({ kind, variant = 0 }) {
  const Comp = TILE_COMPONENTS[kind] || Grass
  return <Comp variant={variant} />
})

// Kayık/iskele altında suya düşen gölge vb. için düz renk lazım olursa
export const TILE_BASE_COLOR = {
  grass: C.grass, grass_flowers: C.grass, path: '#E2CFAE', plaza: C.plaza, sand: C.sand,
  water: C.water, wood: C.wood, floor_room: '#D9A877',
}

const EDGE = {
  grass: { side: C.soil, lip: C.grassDeep },
  grass_flowers: { side: C.soil, lip: C.grassDeep },
  path: { side: '#C8AE86', lip: '#D6BF98' },
  plaza: { side: '#CFB88F', lip: '#E0CDA8' },
  sand: { side: C.sandDeep, lip: '#EBD39C' },
  water: { side: C.waterDeep, lip: '#74C4DE' },
  wood: { side: C.woodDeep, lip: C.wood },
  floor_room: { side: '#B98656', lip: '#C8956A' },
}

// Bölgenin ön iki kenarına toprak/su kalınlığı: harita "ada" gibi durur.
// tiles: zones.js satırları. Motor, karolardan ÖNCE (altta) çizer; dünya koordinatında.
export const ZoneEdge = memo(function ZoneEdge({ tiles, depth = 18 }) {
  const H = tiles.length
  const W = tiles[0].length
  const kindAt = (x, y) => TILE_LEGEND[tiles[y][x]] || 'grass'
  const L = (x, y) => [(x - y) * 32, (x + y) * 16]
  const out = []
  for (let x = 0; x < W; x++) {
    const e = EDGE[kindAt(x, H - 1)]
    const [x1, y1] = L(x, H)
    const [x2, y2] = L(x + 1, H)
    out.push(
      <g key={`l${x}`}>
        <polygon points={`${x1},${y1} ${x2},${y2} ${x2},${y2 + depth} ${x1},${y1 + depth}`} fill={e.side} stroke={e.side} strokeWidth="0.8" />
        <polygon points={`${x1},${y1} ${x2},${y2} ${x2},${y2 + 4} ${x1},${y1 + 4}`} fill={e.lip} />
      </g>,
    )
  }
  for (let y = 0; y < H; y++) {
    const e = EDGE[kindAt(W - 1, y)]
    const [x1, y1] = L(W, y)
    const [x2, y2] = L(W, y + 1)
    out.push(
      <g key={`r${y}`}>
        <polygon points={`${x1},${y1} ${x2},${y2} ${x2},${y2 + depth} ${x1},${y1 + depth}`} fill={shade(e.side, -0.12)} stroke={shade(e.side, -0.12)} strokeWidth="0.8" />
        <polygon points={`${x1},${y1} ${x2},${y2} ${x2},${y2 + 4} ${x1},${y1 + 4}`} fill={shade(e.lip, -0.08)} />
      </g>,
    )
  }
  // alt kenarda yumuşak taş/kök şeridi
  const [bx, by] = L(W, H)
  return (
    <g>
      {out}
      <path d={`M${L(0, H)[0]} ${L(0, H)[1] + depth} L${bx} ${by + depth} L${L(W, 0)[0]} ${L(W, 0)[1] + depth}`} stroke={INK} strokeOpacity="0.18" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
    </g>
  )
})

// ---------------------------------------------------------------- oda duvarları
const WALL_H = 116
const T = 0.2 // duvar kalınlığı (ızgara birimi)

function Curtain({ u1, u2, side }) {
  // pencere kenarında dalgalı perde (v=0 duvar düzlemi)
  const pts = []
  const n = 6
  for (let i = 0; i <= n; i++) {
    const h = 96 - (i / n) * 62
    const sway = Math.sin(i * 1.3) * 0.05
    pts.push(P((side === 'l' ? u2 : u1) + sway + (side === 'l' ? -0.02 * i : 0.02 * i), 0.01, h))
  }
  const edge = side === 'l' ? u1 : u2
  return (
    <polygon
      points={`${P(edge, 0.01, 96)} ${pts.join(' ')} ${P(edge, 0.01, 34)}`}
      fill={C.apricotPale}
      {...LINE}
    />
  )
}

export const RoomWalls = memo(function RoomWalls({ size = 8 }) {
  const S = size
  const H = WALL_H
  const paperR = '#EEF5EC' // +y'ye bakan (sağ ekran) duvar, ışık alır
  const paperL = '#DDEBE2'
  const stripes = []
  for (let i = 1; i < S * 2; i++) {
    const a = i / 2
    stripes.push(<line key={`r${i}`} x1={pt0(a, 0, 10)[0]} y1={pt0(a, 0, 10)[1]} x2={pt0(a, 0, H)[0]} y2={pt0(a, 0, H)[1]} stroke="#CFE2D3" strokeWidth="1.4" />)
    stripes.push(<line key={`l${i}`} x1={pt0(0, a, 10)[0]} y1={pt0(0, a, 10)[1]} x2={pt0(0, a, H)[0]} y2={pt0(0, a, H)[1]} stroke="#C9DDD0" strokeWidth="1.4" />)
  }
  // küçük yaprak motifleri
  const motifs = []
  for (let i = 0; i < S * 2; i++) {
    for (let j = 0; j < 3; j++) {
      const a = i / 2 + 0.25
      const h = 30 + j * 28 + (i % 2) * 14
      const [rx, ry] = pt0(a, 0, h)
      const [lx, ly] = pt0(0, a, h)
      motifs.push(<path key={`mr${i}${j}`} d={`M${rx} ${ry} q2.5 -3.5 0 -6 q-2.5 2.5 0 6`} fill="#BFDCC6" />)
      motifs.push(<path key={`ml${i}${j}`} d={`M${lx} ${ly} q2.5 -3.5 0 -6 q-2.5 2.5 0 6`} fill="#B6D4BF" />)
    }
  }
  const wu1 = S * 0.52
  const wu2 = S * 0.52 + 2
  return (
    <g>
      {/* duvar yüzeyleri */}
      <polygon points={faceU(0, 0, S, 0, H)} fill={paperL} />
      <polygon points={faceV(0, 0, S, 0, H)} fill={paperR} />
      {stripes}
      {motifs}
      {/* köşede yumuşak gölge */}
      <polygon points={`${P(0, 0, 0)} ${P(0.5, 0, 0)} ${P(0.5, 0, H)} ${P(0, 0, H)}`} fill={INK} opacity="0.05" />
      {/* süpürgelik */}
      <polygon points={faceU(0, 0, S, 0, 10)} fill={C.woodDeep} />
      <polygon points={faceV(0, 0, S, 0, 10)} fill={C.wood} />
      <polygon points={faceU(0, 0, S, 10, 12)} fill={C.woodLight} />
      <polygon points={faceV(0, 0, S, 10, 12)} fill={C.woodLight} />

      {/* pencere (sağ duvar) */}
      <polygon points={faceV(0, wu1 - 0.12, wu2 + 0.12, 34, 98)} fill={C.white} {...LINE} />
      <polygon points={faceV(0, wu1, wu2, 40, 92)} fill="#BFE3F5" />
      <polygon points={faceV(0, wu1, wu2, 40, 56)} fill="#9ED3A4" />
      <path d={`M${pt0(wu1, 0, 56)} Q${pt0(wu1 + 0.6, 0, 66)} ${pt0(wu1 + 1.1, 0, 58)} T${pt0(wu2, 0, 60)}`} fill="#9ED3A4" />
      <path d={`M${pt0(wu1, 0, 52)} Q${pt0(wu1 + 1, 0, 62)} ${pt0(wu2, 0, 54)} L${pt0(wu2, 0, 40)} L${pt0(wu1, 0, 40)} Z`} fill="#86C690" />
      <circle cx={pt0(wu2 - 0.45, 0, 80)[0]} cy={pt0(wu2 - 0.45, 0, 80)[1]} r="6" fill={C.sun} opacity="0.9" />
      <ellipse cx={pt0(wu1 + 0.6, 0, 82)[0]} cy={pt0(wu1 + 0.6, 0, 82)[1]} rx="9" ry="3.6" fill="#fff" opacity="0.85" />
      <path d={`M${pt0((wu1 + wu2) / 2, 0, 40)} L${pt0((wu1 + wu2) / 2, 0, 92)} M${pt0(wu1, 0, 66)} L${pt0(wu2, 0, 66)}`} stroke={C.white} strokeWidth="3" />
      <polygon points={faceV(0, wu1, wu2, 40, 92)} fill="none" stroke={C.white} strokeWidth="2.5" />
      <Curtain u1={wu1 - 0.35} u2={wu1 + 0.1} side="r" />
      <Curtain u1={wu2 - 0.1} u2={wu2 + 0.35} side="l" />
      <polygon points={faceV(0, wu1 - 0.45, wu2 + 0.45, 96, 99)} fill={C.woodDeep} />
      {/* pencere pervazı */}
      <polygon points={`${P(wu1 - 0.2, 0, 34)} ${P(wu2 + 0.2, 0, 34)} ${P(wu2 + 0.2, 0.25, 34)} ${P(wu1 - 0.2, 0.25, 34)}`} fill={C.white} {...LINE} />
      <polygon points={faceV(0.25, wu1 - 0.2, wu2 + 0.2, 30, 34)} fill="#E8E2D4" {...LINE} />

      {/* tablo (sol duvar): deniz ve vapur */}
      <polygon points={faceU(0, 1.4, 3.1, 52, 86)} fill={C.wood} {...LINE} />
      <polygon points={faceU(0, 1.55, 2.95, 56, 82)} fill="#CDEBF6" />
      <polygon points={faceU(0, 1.55, 2.95, 56, 66)} fill={C.waterDeep} />
      <polygon points={`${P(0, 2.0, 66)} ${P(0, 2.6, 66)} ${P(0, 2.5, 70)} ${P(0, 2.1, 70)}`} fill={C.white} />
      <polygon points={`${P(0, 2.38, 70)} ${P(0, 2.48, 70)} ${P(0, 2.48, 75)} ${P(0, 2.38, 75)}`} fill={C.ink} />
      <circle cx={pt0(0, 1.85, 76)[0]} cy={pt0(0, 1.85, 76)[1]} r="3" fill={C.sun} />

      {/* kapı (sol duvar) */}
      <polygon points={faceU(0, S - 1.75, S - 0.45, 0, 76)} fill={C.white} {...LINE} />
      <polygon points={faceU(0, S - 1.62, S - 0.58, 0, 70)} fill={C.wood} {...LINE} />
      <polygon points={faceU(0, S - 1.5, S - 0.7, 38, 64)} fill={C.woodLight} opacity="0.6" />
      <polygon points={faceU(0, S - 1.5, S - 0.7, 8, 32)} fill={C.woodLight} opacity="0.6" />
      <circle cx={pt0(0, S - 0.75, 36)[0]} cy={pt0(0, S - 0.75, 36)[1]} r="2.2" fill={C.apricot} {...LINE} />

      {/* duvar kalınlığı */}
      <polygon points={`${P(-T, -T, H)} ${P(S, -T, H)} ${P(S, 0, H)} ${P(0, 0, H)}`} fill="#F7F1E4" {...LINE} />
      <polygon points={`${P(-T, -T, H)} ${P(0, 0, H)} ${P(0, S, H)} ${P(-T, S, H)}`} fill="#F7F1E4" {...LINE} />
      <polygon points={faceU(S, -T, 0, 0, H)} fill="#E4DCCB" {...LINE} />
      <polygon points={faceV(S, -T, 0, 0, H)} fill="#EFE8D9" {...LINE} />
    </g>
  )
})

function pt0(u, v, h) {
  return [(u - v) * 32, (u + v) * 16 - h]
}
