// Hediye ikonları (game-spec §5). Her biri kare <svg viewBox="0 0 48 48">.
// Props: size (px, varsayılan 48), title (verilirse role="img" + aria-label).
import { memo } from 'react'
import { C, INK } from './palette.js'
import './styles.js'

const L = { stroke: INK, strokeOpacity: 0.3, strokeWidth: 1.2, strokeLinejoin: 'round', strokeLinecap: 'round' }

function Icon({ size = 48, title, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {children}
    </svg>
  )
}

function TulipHead({ x, y, c, r = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M-5 -6 L-5 0 Q0 5 5 0 L5 -6 L2.4 -2.6 L0 -7.6 L-2.4 -2.6Z" fill={c} {...L} />
      <path d="M-2.6 -1 Q-2 2 0 2.6" stroke="#fff" strokeWidth="1" fill="none" opacity="0.6" />
    </g>
  )
}

const Flower = memo(function Flower(p) {
  return (
    <Icon {...p}>
      <ellipse cx="24" cy="44" rx="11" ry="2.4" fill={INK} opacity="0.12" />
      <path d="M24 30 L17 15 M24 30 L24 12 M24 30 L31 15" stroke={C.leafDeep} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M22 26 Q12 22 11 13 Q19 16 23 24Z M26 26 Q36 22 37 13 Q29 16 25 24Z" fill={C.leaf} {...L} />
      <TulipHead x={17} y={15} c={C.rose} r={-16} />
      <TulipHead x={31} y={15} c={C.apricot} r={16} />
      <TulipHead x={24} y={12} c="#F2789A" />
      <path d="M13 26 L35 26 L27 44 L21 44Z" fill={C.cream} {...L} />
      <path d="M13 26 L21 44 L24 44 L18 26Z" fill="#fff" opacity="0.6" />
      <path d="M18.5 34 Q24 37 29.5 34" stroke={C.healing} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M24 35 l-4 4 M24 35 l4 4" stroke={C.healing} strokeWidth="2" strokeLinecap="round" />
    </Icon>
  )
})

const Tea = memo(function Tea(p) {
  return (
    <Icon {...p}>
      <ellipse cx="24" cy="40" rx="16" ry="5" fill={C.rose} {...L} />
      <ellipse cx="24" cy="39" rx="12" ry="3.4" fill="#fff" opacity="0.5" />
      <path d="M15.5 12 Q19 22 16.6 29 Q16 37 24 37.6 Q32 37 31.4 29 Q29 22 32.5 12Z" fill="#C8582C" />
      <path d="M15.5 12 Q19 22 16.6 29 Q16 37 24 37.6 Q32 37 31.4 29 Q29 22 32.5 12Z" fill="#fff" fillOpacity="0.12" {...L} />
      <path d="M16 14.6 L32 14.6" stroke="#E9A27E" strokeWidth="1.6" opacity="0.8" />
      <path d="M19 17 Q21 24 19.4 31" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
      <path className="sm-steam" d="M21 9 q-3 -3 0 -6" stroke={C.metal} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
      <path className="sm-steam sm-d1" d="M27 9 q3 -3 0 -6" stroke={C.metal} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
      <rect x="35" y="33" width="6" height="5" rx="1.2" fill="#fff" {...L} />
    </Icon>
  )
})

const Soup = memo(function Soup(p) {
  return (
    <Icon {...p}>
      <ellipse cx="24" cy="43" rx="15" ry="2.6" fill={INK} opacity="0.12" />
      <path d="M6 22 Q7 40 24 40 Q41 40 42 22Z" fill={C.mint} {...L} />
      <path d="M8 27 Q24 31 40 27" stroke="#fff" strokeWidth="1.8" fill="none" opacity="0.7" />
      <path d="M14 34 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l2 2" stroke={C.healingDeep} strokeWidth="1.1" fill="none" opacity="0.6" />
      <ellipse cx="24" cy="22" rx="18" ry="5" fill="#E9874F" {...L} />
      <ellipse cx="22" cy="21.4" rx="10" ry="2.4" fill="#F4A66E" opacity="0.8" />
      <circle cx="17" cy="21" r="0.9" fill={C.leafDeep} />
      <circle cx="28" cy="23" r="0.9" fill={C.leafDeep} />
      <circle cx="24" cy="20" r="0.8" fill="#B5442A" />
      {/* limon */}
      <path d="M31 21 L39 21 A4 4 0 0 1 31 21Z" fill="#F7E07A" {...L} />
      <path d="M35 21 L33 23.6 M35 21 L37 23.6 M35 21 L35 24.6" stroke="#E8C64A" strokeWidth="0.8" />
      {/* kaşık */}
      <path d="M13 20 L6 6" stroke="#C9CFCD" strokeWidth="2.6" strokeLinecap="round" />
      <path className="sm-steam" d="M20 14 q-3 -3 0 -6" stroke={C.metal} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.45" />
      <path className="sm-steam sm-d1" d="M27 14 q3 -3 0 -6" stroke={C.metal} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.45" />
    </Icon>
  )
})

const Blanket = memo(function Blanket(p) {
  return (
    <Icon {...p}>
      <ellipse cx="24" cy="42" rx="17" ry="2.6" fill={INK} opacity="0.12" />
      <rect x="7" y="27" width="34" height="13" rx="5" fill={C.sky} {...L} />
      <path d="M7 33 L41 33" stroke="#fff" strokeWidth="1.6" strokeDasharray="2 2" opacity="0.8" />
      <rect x="9" y="14" width="30" height="14" rx="5" fill={C.rosePale} {...L} />
      <path d="M10 21 l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3" stroke={C.rose} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M9 18 Q24 15.4 39 18" stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.7" />
      <path d="M30 28 L30 34 L33 32 L36 34 L36 28" fill={C.apricot} {...L} />
      <path d="M37 9.4 C35.4 6.6 31.6 8 32.8 11 L37 14.6 L41.2 11 C42.4 8 38.6 6.6 37 9.4Z" fill={C.rose} {...L} />
    </Icon>
  )
})

const Book = memo(function Book(p) {
  return (
    <Icon {...p}>
      <ellipse cx="24" cy="43" rx="15" ry="2.4" fill={INK} opacity="0.12" />
      <path d="M11 8 L35 8 Q38 8 38 11 L38 40 L13 40 Q10 40 10 37 L10 9Z" fill={C.cream} {...L} />
      <path d="M13 40 Q10 40 10 37 Q10 34 13 34 L38 34 L38 40Z" fill="#fff" {...L} />
      <path d="M14 36.4 L36 36.4 M14 38.4 L36 38.4" stroke={C.creamDeep} strokeWidth="0.8" />
      <path d="M10 9 Q10 6 13 6 L37 6 Q40 6 40 9 L40 32 Q40 35 37 35 L13 35 Q10 35 10 37Z" fill={C.healing} {...L} />
      <path d="M14 6 L14 35" stroke={C.healingDeep} strokeWidth="1.4" opacity="0.6" />
      <circle cx="27" cy="20" r="7.5" fill={C.mint} />
      <path d="M27 26 L27 19 M27 21 C24 21 22 18 22.6 15.2 C25.6 15.2 27 17.6 27 21 M27 19 C27 16 29 13.4 32 13.6 C32.4 16.8 30 19 27 19" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
      <path d="M33 34 L33 44 L35.5 41.6 L38 44 L38 34Z" fill={C.apricot} {...L} />
    </Icon>
  )
})

const Lantern = memo(function Lantern(p) {
  return (
    <Icon {...p}>
      <circle className="sm-glow" cx="24" cy="24" r="17" fill="#FFE59A" opacity="0.6" />
      <path d="M14 8 Q24 4 34 8 L31 34 Q24 37 17 34Z" fill={C.apricot} {...L} />
      <path d="M24 5.6 L24 35.6 M18.6 6.6 Q19 22 20.4 35 M29.4 6.6 Q29 22 27.6 35" stroke="#E08A2A" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M15 9 Q20 22 18 33" stroke="#FFD58A" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round" />
      <path d="M17 34 Q24 37 31 34 L29.6 38 L18.4 38Z" fill="#F7C27A" {...L} />
      <path d="M21 38 L27 38 L24 42Z" fill={C.sun} />
      <path className="sm-flame" d="M24 44 Q21 41 24 38 Q27 41 24 44Z" fill="#FFF3C9" />
      <path d="M40 10 l1 2.4 l2.4 1 l-2.4 1 l-1 2.4 l-1 -2.4 l-2.4 -1 l2.4 -1Z" fill={C.sun} />
      <path d="M8 26 l0.8 1.8 l1.8 0.8 l-1.8 0.8 l-0.8 1.8 l-0.8 -1.8 l-1.8 -0.8 l1.8 -0.8Z" fill={C.sun} />
      <circle cx="9" cy="12" r="1.2" fill={C.sun} />
    </Icon>
  )
})

export const GIFT_ICONS = {
  flower: Flower,
  tea: Tea,
  soup: Soup,
  blanket: Blanket,
  book: Book,
  lantern: Lantern,
}

export const GIFT_KEYS = Object.keys(GIFT_ICONS)

export const GiftIcon = memo(function GiftIcon({ giftKey, size = 48, title }) {
  const Comp = GIFT_ICONS[giftKey] || Flower
  return <Comp size={size} title={title} />
})
