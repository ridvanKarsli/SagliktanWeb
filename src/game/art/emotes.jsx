// İfade ikonları (game-spec §7 emoteKey). Her biri kare <svg viewBox="0 0 48 48">.
// Props: size (px, varsayılan 48), title (verilirse role="img" + aria-label).
import { memo } from 'react'
import { C, INK, BLUSH } from './palette.js'
import './styles.js'

const L = { stroke: INK, strokeOpacity: 0.32, strokeWidth: 1.2, strokeLinejoin: 'round', strokeLinecap: 'round' }
const HAND = '#FFDDBE'

function Icon({ size = 48, title, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {children}
    </svg>
  )
}

function Hand({ transform }) {
  return (
    <g transform={transform}>
      <path d="M-8 4 L-8 -8 Q-8 -10.4 -6 -10.4 Q-4 -10.4 -4 -8 L-4 -14 Q-4 -16.4 -2 -16.4 Q0 -16.4 0 -14 L0 -15 Q0 -17.4 2 -17.4 Q4 -17.4 4 -15 L4 -13 Q4 -15.4 6 -15.4 Q8 -15.4 8 -13 L8 3 Q8 11 0 11 Q-5 11 -8 7 L-13 0 Q-14 -2.4 -12 -3.4 Q-10.4 -4 -9 -2.4Z" fill={HAND} {...L} />
      <path d="M-4 -4 L-4 1 M0 -5 L0 1 M4 -4 L4 1" stroke={INK} strokeOpacity="0.18" strokeWidth="1" strokeLinecap="round" />
    </g>
  )
}

const Wave = memo(function Wave(p) {
  return (
    <Icon {...p}>
      <circle cx="24" cy="25" r="19" fill={C.apricotPale} />
      <Hand transform="translate(25 28) rotate(14)" />
      <path d="M9 14 Q7 20 9 26 M13 11 Q10 18 12.4 25" stroke={C.apricot} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M39 14 Q41 20 39 26" stroke={C.apricot} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </Icon>
  )
})

function Buddy({ x, y, c, flip, eyesClosed }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <path d="M-11 12 C-12 0 -7 -9 0 -9 C7 -9 12 0 11 12 Q0 16 -11 12Z" fill={c} {...L} />
      {eyesClosed ? (
        <path d="M-5.5 0 q1.6 -1.6 3.2 0 M2.4 0 q1.6 -1.6 3.2 0" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      ) : (
        <g fill={INK}>
          <circle cx={-4} cy={0} r={1.4} />
          <circle cx={4} cy={0} r={1.4} />
        </g>
      )}
      <ellipse cx={-7} cy={3.4} rx={2.2} ry={1.3} fill={BLUSH} opacity="0.75" />
      <ellipse cx={7} cy={3.4} rx={2.2} ry={1.3} fill={BLUSH} opacity="0.75" />
      <path d="M-1.6 3 Q0 4.6 1.6 3" stroke={INK} strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </g>
  )
}

const Hug = memo(function Hug(p) {
  return (
    <Icon {...p}>
      <ellipse cx="24" cy="43" rx="17" ry="2.6" fill={INK} opacity="0.1" />
      <Buddy x={16} y={28} c={C.mint} eyesClosed />
      <Buddy x={32} y={28} c={C.apricotSoft} flip eyesClosed />
      <path d="M8 32 Q16 40 25 33" stroke={shade2(C.mint)} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M40 32 Q32 40 23 33" stroke={shade2(C.apricotSoft)} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M24 9.6 C22.6 7 19 8 20 11 L24 14.6 L28 11 C29 8 25.4 7 24 9.6Z" fill={C.rose} {...L} />
    </Icon>
  )
})

function shade2(c) {
  return c === C.mint ? '#6FC79F' : '#EFA651'
}

const Heart = memo(function Heart(p) {
  return (
    <Icon {...p}>
      <path d="M24 15 C20 6 6 7 6 19 C6 29 17 36 24 42 C31 36 42 29 42 19 C42 7 28 6 24 15Z" fill={C.rose} {...L} />
      <path d="M12 15 Q13 11 17 11" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M24 15 C22 10 18 9 15 10" stroke="#F38C9A" strokeWidth="1.4" fill="none" opacity="0.6" />
    </Icon>
  )
})

const Laugh = memo(function Laugh(p) {
  return (
    <Icon {...p}>
      <circle cx="24" cy="25" r="18" fill={C.sun} {...L} />
      <path d="M14 21 q3 -4 6 0 M28 21 q3 -4 6 0" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M15 28 Q24 29 33 28 Q32 37 24 37 Q16 37 15 28Z" fill={INK} />
      <path d="M18.4 33.6 Q24 31 29.6 33.6 Q27 36.4 24 36.4 Q21 36.4 18.4 33.6Z" fill="#FF8FA3" />
      <ellipse cx="12" cy="27" rx="3" ry="1.8" fill={BLUSH} opacity="0.75" />
      <ellipse cx="36" cy="27" rx="3" ry="1.8" fill={BLUSH} opacity="0.75" />
      <path d="M41 9 l1 2.4 l2.4 1 l-2.4 1 l-1 2.4 l-1 -2.4 l-2.4 -1 l2.4 -1Z" fill={C.apricot} />
      <path d="M7 10 l0.8 1.8 l1.8 0.8 l-1.8 0.8 l-0.8 1.8 l-0.8 -1.8 l-1.8 -0.8 l1.8 -0.8Z" fill={C.apricot} />
    </Icon>
  )
})

const Clap = memo(function Clap(p) {
  return (
    <Icon {...p}>
      <Hand transform="translate(19 30) rotate(-22)" />
      <Hand transform="translate(29 29) rotate(22) scale(-1 1)" />
      <path d="M24 9 L24 4 M15 11 L12 7 M33 11 L36 7 M10 18 L5 17 M38 18 L43 17" stroke={C.apricot} strokeWidth="2.2" strokeLinecap="round" />
    </Icon>
  )
})

const TeaEmote = memo(function TeaEmote(p) {
  return (
    <Icon {...p}>
      <circle cx="24" cy="25" r="19" fill={C.rosePale} opacity="0.6" />
      <ellipse cx="24" cy="38" rx="12" ry="4" fill={C.rose} {...L} />
      <path d="M17 14 Q20 22 18 28 Q17.6 35 24 35.4 Q30.4 35 30 28 Q28 22 31 14Z" fill="#C8582C" {...L} />
      <path d="M17.4 16.4 L30.6 16.4" stroke="#E9A27E" strokeWidth="1.4" />
      <path d="M20 19 Q21.6 25 20.4 30" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.55" />
      <path className="sm-steam" d="M21 10 q-3 -3 0 -6" stroke={C.metal} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
      <path className="sm-steam sm-d1" d="M27 10 q3 -3 0 -6" stroke={C.metal} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
    </Icon>
  )
})

const Sleepy = memo(function Sleepy(p) {
  return (
    <Icon {...p}>
      <path d="M28 8 C18 8 10 16 10 26 C10 36 18 43 28 43 C33 43 37 41 40 37 C30 38 21 31 21 21 C21 15 24 11 28 8Z" fill="#B9AEEA" {...L} />
      <path d="M15 30 q2 -2 4 0" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <ellipse cx="15" cy="34" rx="2.2" ry="1.3" fill={BLUSH} opacity="0.7" />
      <path d="M28 12 h6 l-6 7 h6 M37 22 h5 l-5 5.6 h5" stroke={C.skyDeep} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="40" cy="10" r="1.4" fill={C.sun} />
    </Icon>
  )
})

function Star4({ x, y, r, c }) {
  return <path d={`M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z`} fill={c} {...L} />
}

const Sparkle = memo(function Sparkle(p) {
  return (
    <Icon {...p}>
      <Star4 x={21} y={25} r={15} c={C.sun} />
      <Star4 x={37} y={11} r={7} c={C.apricotSoft} />
      <Star4 x={38} y={35} r={5} c={C.mint} />
      <path d="M16 20 Q18 18 20 18.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
    </Icon>
  )
})

export const EMOTE_ICONS = {
  wave: Wave,
  hug: Hug,
  heart: Heart,
  laugh: Laugh,
  clap: Clap,
  tea: TeaEmote,
  sleepy: Sleepy,
  sparkle: Sparkle,
}

export const EMOTE_KEYS = Object.keys(EMOTE_ICONS)

export const EmoteIcon = memo(function EmoteIcon({ emoteKey, size = 48, title }) {
  const Comp = EMOTE_ICONS[emoteKey] || Heart
  return <Comp size={size} title={title} />
})
