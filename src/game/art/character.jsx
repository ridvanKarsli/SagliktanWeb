// Mahalle karakteri: yol arkadaşlarıyla aynı yüz dilinde (nokta göz, pembe yanak,
// küçük gülümseme) tombul bir "chibi" insan. (0,0) = ayak noktası, ~76 px boy.
// Katmanlar: gölge, (arka saç), bacak+ayakkabı, alt giyim, gövde/üst, kollar,
// boyun, baş, yüz (yalnızca önden), saç, aksesuar.
// Görünüm anahtarları game-spec §1 ile birebir.
import { memo, useId } from 'react'
import { INK, BLUSH, C, shade } from './palette.js'
import './styles.js'

export const SKINS = {
  s1: '#F8DCC8',
  s2: '#EDC09A',
  s3: '#D19A6E',
  s4: '#A56E49',
  s5: '#714833',
}

export const HAIR_COLORS = {
  black: '#332C2E',
  brown: '#6E4A33',
  auburn: '#A9542F',
  blonde: '#E9C47E',
  gray: '#BFBAB4',
}

export const HAIR_STYLES = ['short', 'long', 'bun', 'curly', 'bob', 'buzz']

export const TOPS = {
  tee_mint: { color: '#8FDCB8', sleeve: 'short' },
  hoodie_sky: { color: '#8CC6EE', sleeve: 'long' },
  sweater_cream: { color: '#F4E8D2', sleeve: 'long' },
  cardigan_rose: { color: '#F2A7B5', sleeve: 'long' },
  shirt_check: { color: '#E98A84', sleeve: 'long' },
  jacket_denim: { color: '#6F9DCC', sleeve: 'long' },
  raincoat_sun: { color: '#FFCB4A', sleeve: 'long', long: true },
  vest_knit: { color: '#C99A68', sleeve: 'long', sleeveColor: '#FFFDF8' },
}

export const BOTTOMS = {
  jeans: { color: '#5E86B8', kind: 'pants', shoe: '#FFFDF8', sole: '#D8D2C6' },
  chinos: { color: '#D8BD8C', kind: 'pants', shoe: '#8A5A3F', sole: '#6E4532' },
  skirt: { color: '#B5A4E8', kind: 'skirt', shoe: '#C25B6E', sole: '#9C4456' },
  shorts: { color: '#7DB9A8', kind: 'shorts', shoe: '#FFFDF8', sole: '#D8D2C6' },
  joggers: { color: '#8F93AC', kind: 'joggers', shoe: '#FFFDF8', sole: '#D8D2C6' },
  long_skirt: { color: '#E59C86', kind: 'long', shoe: '#8A5A3F', sole: '#6E4532' },
}

export const ACCESSORIES = ['glasses_round', 'sunhat', 'beanie', 'scarf', 'headphones', 'flower_pin', 'backpack', 'cap']

export const BODIES = ['female', 'male']

// Beden değişince oluşturucunun önerebileceği başlangıç görünümü (yalnızca kolaylık,
// kısıtlama değil; hepsi ücretsiz başlangıç parçaları).
export const DEFAULT_LOOK_BY_BODY = {
  female: { body: 'female', hair: 'long', hairColor: 'brown', top: 'sweater_cream', bottom: 'skirt', accessory: null },
  male: { body: 'male', hair: 'short', hairColor: 'black', top: 'hoodie_sky', bottom: 'chinos', accessory: null },
}

export const DEFAULT_APPEARANCE = { body: 'female', skin: 's2', hair: 'short', hairColor: 'brown', top: 'tee_mint', bottom: 'jeans', accessory: null }

const SOFT = { stroke: INK, strokeOpacity: 0.28, strokeWidth: 1, strokeLinejoin: 'round' }

const HEAD_Y = -57
const FX = 1.4 // yüz hafif sağa döner (3/4 bakış); flip ile sola

// ------------------------------------------------------------------ saç
function hairPaths(style, c, view) {
  const base = c
  const deep = shade(c, -0.18)
  const light = shade(c, 0.3)
  const S = { ...SOFT, strokeOpacity: 0.3 }
  if (view === 'back') {
    switch (style) {
      case 'long':
        return {
          front: (
            <g>
              <path d="M-18.5 -58 C-21 -73 -9 -77.5 0 -77.5 C9 -77.5 21 -73 18.5 -58 L20 -36 Q15 -33 10 -35 Q5 -32 0 -34 Q-5 -32 -10 -35 Q-15 -33 -20 -36Z" fill={base} {...S} />
              <path d="M0 -77 L0 -58 M-8 -50 Q-9 -42 -10 -36 M8 -50 Q9 -42 10 -36" stroke={deep} strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M-10 -72 Q-4 -75 2 -74" stroke={light} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
            </g>
          ),
        }
      case 'bun':
        return {
          front: (
            <g>
              <path d="M-17.6 -55 C-19 -71 -8 -75.5 0 -75.5 C8 -75.5 19 -71 17.6 -55 C17 -49 13 -45 8 -44.5 L-8 -44.5 C-13 -45 -17 -49 -17.6 -55Z" fill={base} {...S} />
              <path d="M-9 -47 Q0 -56 9 -47" stroke={deep} strokeWidth="1.1" fill="none" />
              <circle cx={0} cy={-77} r={8.5} fill={base} {...S} />
              <path d="M-5 -80 Q0 -84 5 -80" stroke={light} strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <path d="M-6 -71 Q0 -68 6 -71" stroke={C.apricot} strokeWidth="2.4" fill="none" strokeLinecap="round" />
            </g>
          ),
        }
      case 'curly': {
        const curls = [[-15, -62, 7], [-9, -70, 7.5], [0, -73, 7.5], [9, -70, 7.5], [15, -62, 7], [-16, -52, 6.5], [16, -52, 6.5], [-10, -47, 6.5], [0, -46, 7], [10, -47, 6.5], [-6, -58, 7], [6, -58, 7]]
        return {
          front: (
            <g>
              {curls.map(([x, y, r], i) => <circle key={`s${i}`} cx={x} cy={y} r={r} fill={base} {...S} />)}
              {curls.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r - 0.6} fill={base} />)}
              {curls.map(([x, y], i) => <path key={`c${i}`} d={`M${x - 2.5} ${y + 0.5} q2.5 -3 5 0`} stroke={deep} strokeWidth="1" fill="none" />)}
            </g>
          ),
        }
      }
      case 'bob':
        return {
          front: (
            <g>
              <path d="M-19 -57 C-20 -73 -8 -77 0 -77 C8 -77 20 -73 19 -57 L19.6 -44 Q10 -41.5 0 -42 Q-10 -41.5 -19.6 -44Z" fill={base} {...S} />
              <path d="M-9 -72 Q0 -76 7 -73" stroke={light} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
              <path d="M-12 -44 L-12 -52 M12 -44 L12 -52" stroke={deep} strokeWidth="1" />
            </g>
          ),
        }
      case 'buzz':
        return {
          front: <path d="M-17 -57 C-17 -71 -8 -74.5 0 -74.5 C8 -74.5 17 -71 17 -57 C16 -51 12 -48 0 -48 C-12 -48 -16 -51 -17 -57Z" fill={base} opacity="0.88" />,
        }
      default:
        return {
          front: (
            <g>
              <path d="M-17.8 -55 C-19 -71 -8 -76.5 0 -76.5 C8 -76.5 19 -71 17.8 -55 C17 -49 13 -45 8 -44.5 Q4 -46 0 -44.5 Q-4 -46 -8 -44.5 C-13 -45 -17 -49 -17.8 -55Z" fill={base} {...S} />
              <path d="M-6 -73 Q0 -76 6 -73 M-2 -62 q2 -3 4 0" stroke={light} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
            </g>
          ),
        }
    }
  }
  switch (style) {
    case 'long':
      return {
        back: <path d="M-18.5 -58 C-21 -73 -9 -77.5 0 -77.5 C9 -77.5 21 -73 18.5 -58 L20 -36 Q12 -32 0 -33 Q-12 -32 -20 -36Z" fill={deep} {...S} />,
        front: (
          <g>
            <path d="M-18 -54 C-19 -70 -8 -76.5 0 -76.5 C8 -76.5 19 -70 18 -54 C16 -60 10 -66 2 -67 L0 -63.5 L-2 -67 C-10 -66 -16 -60 -18 -54Z" fill={base} {...S} />
            <path d="M-18 -57 C-20.5 -48 -19.5 -41 -16 -36.5 L-12.5 -38.5 C-14.6 -45 -14.6 -52 -13.6 -60Z" fill={base} {...S} />
            <path d="M18 -57 C20.5 -48 19.5 -41 16 -36.5 L12.5 -38.5 C14.6 -45 14.6 -52 13.6 -60Z" fill={base} {...S} />
            <path d="M-11 -70 Q-6 -73 -1 -72" stroke={light} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          </g>
        ),
      }
    case 'bun':
      return {
        back: <circle cx={1} cy={-76} r={8} fill={deep} {...S} />,
        front: (
          <g>
            <path d="M-17.6 -55 C-18 -71 -8 -75.5 0 -75.5 C8 -75.5 18 -71 17.6 -55 C15.5 -63 9 -67.5 0 -67.5 C-9 -67.5 -15.5 -63 -17.6 -55Z" fill={base} {...S} />
            <path d="M-16.8 -58 Q-18.5 -52 -16 -48" stroke={base} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M-9 -72 Q-3 -74.5 3 -73.5" stroke={light} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
          </g>
        ),
      }
    case 'curly': {
      const back = [[-17, -60, 7], [-17, -50, 6.5], [17, -60, 7], [17, -50, 6.5], [-12, -70, 7.5], [12, -70, 7.5], [0, -74, 8]]
      const fringe = [[-14, -64, 5.6], [-7.5, -68, 6], [0, -69, 6], [7.5, -68, 6], [14, -64, 5.6]]
      return {
        back: (
          <g>
            {back.map(([x, y, r], i) => <circle key={`s${i}`} cx={x} cy={y} r={r} fill={deep} {...S} />)}
            {back.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r - 0.6} fill={deep} />)}
          </g>
        ),
        front: (
          <g>
            {fringe.map(([x, y, r], i) => <circle key={`s${i}`} cx={x} cy={y} r={r} fill={base} {...S} />)}
            {fringe.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r - 0.6} fill={base} />)}
            {fringe.map(([x, y], i) => <path key={`c${i}`} d={`M${x - 2.2} ${y + 0.6} q2.2 -2.6 4.4 0`} stroke={light} strokeWidth="1" fill="none" opacity="0.8" />)}
          </g>
        ),
      }
    }
    case 'bob':
      return {
        back: <path d="M-19 -57 C-20 -73 -8 -77 0 -77 C8 -77 20 -73 19 -57 L19.6 -44 Q16 -42.5 13 -43.5 L-13 -43.5 Q-16 -42.5 -19.6 -44Z" fill={deep} {...S} />,
        front: (
          <g>
            <path d="M-18 -52 C-19.5 -71 -8 -76.5 0 -76.5 C8 -76.5 19.5 -71 18 -52 L16.4 -52 L15.6 -62 Q0 -64 -15.6 -62 L-16.4 -52Z" fill={base} {...S} />
            <path d="M-10 -71 Q-4 -74 2 -73" stroke={light} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          </g>
        ),
      }
    case 'buzz':
      return {
        front: (
          <g>
            <path d="M-17 -60 C-16 -71 -8 -74.5 0 -74.5 C8 -74.5 16 -71 17 -60 C13 -64.5 7 -66.5 0 -66.5 C-7 -66.5 -13 -64.5 -17 -60Z" fill={base} opacity="0.9" />
            <path d="M-6 -71 Q0 -73 6 -71" stroke={light} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.6" />
          </g>
        ),
      }
    default:
      return {
        front: (
          <g>
            <path d="M-17.8 -54 C-19 -70 -8 -76.5 1 -76 C11 -75.5 19 -69 17.8 -54 C16.5 -59 14 -62.5 10 -64 C5 -60 -3 -59.6 -9.5 -62.4 C-12.5 -60.4 -15.4 -58 -17.8 -54Z" fill={base} {...S} />
            <path d="M-17.6 -55 L-16.6 -49 L-15.4 -54Z M17.6 -55 L16.6 -49 L15.4 -54Z" fill={base} />
            <path d="M-8 -71 Q-2 -74 4 -73" stroke={light} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          </g>
        ),
      }
  }
}

// ------------------------------------------------------------------ üst giyim
const TORSO = 'M-10 -44.5 Q-12.8 -44.5 -12.8 -40.5 L-12.2 -22 Q-12.2 -19.5 -9.6 -19.5 L9.6 -19.5 Q12.2 -19.5 12.2 -22 L12.8 -40.5 Q12.8 -44.5 10 -44.5Z'
const TORSO_LONG = 'M-10 -44.5 Q-12.8 -44.5 -12.8 -40.5 L-13 -16 Q-13 -14 -10.6 -14 L10.6 -14 Q13 -14 13 -16 L12.8 -40.5 Q12.8 -44.5 10 -44.5Z'
// kadın: belde hafif içe kavis (göğüs/kalça vurgusu yok)
const TORSO_F = 'M-10 -44.5 Q-12.8 -44.5 -12.8 -40.5 Q-10.4 -31 -12.2 -22 Q-12.2 -19.5 -9.6 -19.5 L9.6 -19.5 Q12.2 -19.5 12.2 -22 Q10.4 -31 12.8 -40.5 Q12.8 -44.5 10 -44.5Z'
const TORSO_LONG_F = 'M-10 -44.5 Q-12.8 -44.5 -12.8 -40.5 Q-10.6 -30 -13 -16 Q-13 -14 -10.6 -14 L10.6 -14 Q13 -14 13 -16 Q10.6 -30 12.8 -40.5 Q12.8 -44.5 10 -44.5Z'
// erkek: omuz köşeleri daha keskin
const TORSO_M = 'M-11.4 -44.5 Q-12.8 -44.5 -12.8 -42.6 L-12.4 -22 Q-12.4 -19.5 -9.8 -19.5 L9.8 -19.5 Q12.4 -19.5 12.4 -22 L12.8 -42.6 Q12.8 -44.5 11.4 -44.5Z'
const TORSO_LONG_M = 'M-11.4 -44.5 Q-12.8 -44.5 -12.8 -42.6 L-13 -16 Q-13 -14 -10.6 -14 L10.6 -14 Q13 -14 13 -16 L12.8 -42.6 Q12.8 -44.5 11.4 -44.5Z'
const torsoPath = (body, long) => (body === 'male' ? (long ? TORSO_LONG_M : TORSO_M) : long ? TORSO_LONG_F : TORSO_F)

function TopFront({ k, skin, body }) {
  const t = TOPS[k] || TOPS.tee_mint
  const c = t.color
  const d = shade(c, -0.16)
  const l = shade(c, 0.3)
  const torso = <path d={torsoPath(body, t.long)} fill={c} {...SOFT} />
  const sideShade = <path d={t.long ? 'M5 -44.5 L10 -44.5 Q12.8 -44.5 12.8 -40.5 L13 -16 Q13 -14 10.6 -14 L6 -14Z' : 'M5 -44.5 L10 -44.5 Q12.8 -44.5 12.8 -40.5 L12.2 -22 Q12.2 -19.5 9.6 -19.5 L6 -19.5Z'} fill={INK} opacity="0.07" />
  switch (k) {
    case 'hoodie_sky':
      return (
        <g>
          {torso}
          <path d="M-7 -30 L7 -30 L8.6 -22 L-8.6 -22Z" fill={d} opacity="0.55" />
          <path d="M-9.5 -44.5 Q0 -36 9.5 -44.5 Q9 -48 0 -47 Q-9 -48 -9.5 -44.5Z" fill={d} {...SOFT} />
          <path d="M-3 -41 L-3.4 -33 M3 -41 L3.4 -33" stroke={C.white} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx={-3.4} cy={-32.6} r={1} fill={C.white} />
          <circle cx={3.4} cy={-32.6} r={1} fill={C.white} />
          <path d="M-12.2 -22 L12.2 -22" stroke={d} strokeWidth="1.4" opacity="0.6" />
          {sideShade}
        </g>
      )
    case 'sweater_cream':
      return (
        <g>
          {torso}
          <path d="M-5 -44.5 Q0 -40.5 5 -44.5" stroke={d} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M-11 -33 l2.75 -2.5 l2.75 2.5 l2.75 -2.5 l2.75 2.5 l2.75 -2.5 l2.75 2.5 l2.75 -2.5 l2.75 2.5" stroke={C.apricot} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
          <path d="M-11 -29.6 l2.75 -2.5 l2.75 2.5 l2.75 -2.5 l2.75 2.5 l2.75 -2.5 l2.75 2.5 l2.75 -2.5 l2.75 2.5" stroke={C.healing} strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.8" />
          <rect x={-12.2} y={-23} width={24.4} height={3.5} rx={1.5} fill={d} opacity="0.5" />
          {sideShade}
        </g>
      )
    case 'cardigan_rose':
      return (
        <g>
          {torso}
          <path d="M-5 -44.5 L5 -44.5 L2.2 -19.5 L-2.2 -19.5Z" fill={C.white} />
          <path d="M-5 -44.5 L-2.2 -19.5 M5 -44.5 L2.2 -19.5" stroke={d} strokeWidth="1.2" />
          {[-37, -31, -25].map((y) => <circle key={y} cx={-3.2 - (y + 44) * 0.05} cy={y} r={1} fill={C.white} stroke={d} strokeWidth="0.5" />)}
          <path d="M5 -27 L10 -27 L10 -22 L5 -22Z" fill={d} opacity="0.5" />
          {sideShade}
        </g>
      )
    case 'shirt_check':
      return (
        <g>
          {torso}
          <g stroke={C.white} strokeOpacity="0.5" strokeWidth="1.3">
            <path d="M-8 -44 L-8 -20 M-3 -44 L-3 -20 M3 -44 L3 -20 M8 -44 L8 -20" />
            <path d="M-12.5 -38 L12.5 -38 M-12.4 -31.5 L12.4 -31.5 M-12.3 -25 L12.3 -25" />
          </g>
          <g stroke={d} strokeOpacity="0.55" strokeWidth="0.8">
            <path d="M-5.5 -44 L-5.5 -20 M5.5 -44 L5.5 -20 M-12.5 -35 L12.5 -35 M-12.3 -28 L12.3 -28" />
          </g>
          <path d="M-5.5 -44.5 L0 -40 L-1.6 -36.6 L-6.4 -41Z M5.5 -44.5 L0 -40 L1.6 -36.6 L6.4 -41Z" fill={l} {...SOFT} />
          {[-34, -28, -23].map((y) => <circle key={y} cx={0} cy={y} r={0.9} fill={C.white} />)}
          {sideShade}
        </g>
      )
    case 'jacket_denim':
      return (
        <g>
          {torso}
          <path d="M0 -40 L0 -19.5" stroke={d} strokeWidth="1.2" />
          <path d="M-6 -44.5 L0 -40 L-2.6 -35 L-8 -40Z M6 -44.5 L0 -40 L2.6 -35 L8 -40Z" fill={l} {...SOFT} />
          <rect x={-9.6} y={-35} width={6} height={5} rx={1} fill={d} opacity="0.55" />
          <rect x={3.6} y={-35} width={6} height={5} rx={1} fill={d} opacity="0.55" />
          <path d="M-12 -24 L12 -24" stroke={C.apricot} strokeWidth="0.9" strokeDasharray="1.6 1.4" />
          <circle cx={-1.8} cy={-30} r={0.9} fill={C.apricot} />
          <circle cx={-1.8} cy={-25.5} r={0.9} fill={C.apricot} />
          {sideShade}
        </g>
      )
    case 'raincoat_sun':
      return (
        <g>
          {torso}
          <path d="M-9.5 -44.5 Q0 -37 9.5 -44.5 Q9 -48 0 -47 Q-9 -48 -9.5 -44.5Z" fill={d} {...SOFT} />
          <path d="M0 -40 L0 -14" stroke={d} strokeWidth="1.2" />
          {[-35, -28, -21].map((y) => <rect key={y} x={-3.6} y={y - 0.9} width={7.2} height={1.8} rx={0.9} fill={C.woodDeep} />)}
          <path d="M-10.5 -26 L-4 -26 M4 -26 L10.5 -26" stroke={d} strokeWidth="1.6" strokeLinecap="round" />
          {sideShade}
        </g>
      )
    case 'vest_knit':
      return (
        <g>
          <path d={torsoPath(body, false)} fill={C.white} {...SOFT} />
          <path d="M-5.5 -44.5 L0 -40.5 L-1.8 -37.5 L-6.6 -41.4Z M5.5 -44.5 L0 -40.5 L1.8 -37.5 L6.6 -41.4Z" fill="#F1ECE2" {...SOFT} />
          <path d="M-10.5 -43 L-6 -43 L0 -31 L6 -43 L10.5 -43 Q12.8 -43 12.8 -39.5 L12.2 -22 Q12.2 -19.5 9.6 -19.5 L-9.6 -19.5 Q-12.2 -19.5 -12.2 -22 L-12.8 -39.5 Q-12.8 -43 -10.5 -43Z" fill={c} {...SOFT} />
          <path d="M-7.5 -36 q1.5 2 0 4 q-1.5 2 0 4 q1.5 2 0 4 M7.5 -36 q1.5 2 0 4 q-1.5 2 0 4 q1.5 2 0 4" stroke={l} strokeWidth="1.3" fill="none" />
          <rect x={-12.2} y={-23} width={24.4} height={3.5} rx={1.5} fill={d} opacity="0.5" />
          {sideShade}
        </g>
      )
    default:
      // tee_mint
      return (
        <g>
          {torso}
          <path d="M-5 -44.5 Q0 -39.5 5 -44.5Z" fill={skin} />
          <path d="M-5 -44.5 Q0 -39.5 5 -44.5" stroke={d} strokeWidth="1.4" fill="none" />
          <path d="M-6 -30 C-8.6 -31 -9 -34.4 -6.4 -35.6 C-6 -33.4 -5.6 -32 -6 -30Z M-6 -30 C-3.6 -31 -3.2 -34.4 -5.4 -36 C-6.4 -33.6 -6.4 -32 -6 -30Z" fill={C.white} opacity="0.9" />
          {sideShade}
        </g>
      )
  }
}

function TopBack({ k, body }) {
  const t = TOPS[k] || TOPS.tee_mint
  const c = t.color
  const d = shade(c, -0.16)
  const torso = <path d={torsoPath(body, t.long)} fill={c} {...SOFT} />
  const sideShade = <path d={t.long ? 'M-5 -44.5 L-10 -44.5 Q-12.8 -44.5 -12.8 -40.5 L-13 -16 Q-13 -14 -10.6 -14 L-6 -14Z' : 'M-5 -44.5 L-10 -44.5 Q-12.8 -44.5 -12.8 -40.5 L-12.2 -22 Q-12.2 -19.5 -9.6 -19.5 L-6 -19.5Z'} fill={INK} opacity="0.07" />
  switch (k) {
    case 'hoodie_sky':
    case 'raincoat_sun':
      return (
        <g>
          {torso}
          <path d="M-9 -45 Q-10 -34 0 -33 Q10 -34 9 -45 Q0 -47 -9 -45Z" fill={d} {...SOFT} />
          <path d="M-5 -42 Q0 -37 5 -42" stroke={shade(c, -0.3)} strokeWidth="1" fill="none" />
          {sideShade}
        </g>
      )
    case 'vest_knit':
      return (
        <g>
          <path d={torsoPath(body, false)} fill={C.white} {...SOFT} />
          <path d="M-10.5 -44 L10.5 -44 Q12.8 -44 12.8 -40 L12.2 -22 Q12.2 -19.5 9.6 -19.5 L-9.6 -19.5 Q-12.2 -19.5 -12.2 -22 L-12.8 -40 Q-12.8 -44 -10.5 -44Z" fill={c} {...SOFT} />
          <rect x={-12.2} y={-23} width={24.4} height={3.5} rx={1.5} fill={d} opacity="0.5" />
          {sideShade}
        </g>
      )
    case 'shirt_check':
      return (
        <g>
          {torso}
          <g stroke={C.white} strokeOpacity="0.5" strokeWidth="1.3">
            <path d="M-8 -44 L-8 -20 M-3 -44 L-3 -20 M3 -44 L3 -20 M8 -44 L8 -20" />
            <path d="M-12.5 -38 L12.5 -38 M-12.4 -31.5 L12.4 -31.5 M-12.3 -25 L12.3 -25" />
          </g>
          <path d="M-6 -45 Q0 -42 6 -45 L6 -42.5 Q0 -40 -6 -42.5Z" fill={shade(c, 0.3)} />
          {sideShade}
        </g>
      )
    case 'jacket_denim':
      return (
        <g>
          {torso}
          <path d="M-12 -35 Q0 -32 12 -35 M-12 -24 L12 -24" stroke={C.apricot} strokeWidth="0.9" strokeDasharray="1.6 1.4" fill="none" />
          <path d="M-7 -45 Q0 -42 7 -45 L7 -42 Q0 -39 -7 -42Z" fill={shade(c, 0.25)} />
          {sideShade}
        </g>
      )
    case 'sweater_cream':
      return (
        <g>
          {torso}
          <rect x={-12.2} y={-23} width={24.4} height={3.5} rx={1.5} fill={d} opacity="0.5" />
          {sideShade}
        </g>
      )
    default:
      return (
        <g>
          {torso}
          {sideShade}
        </g>
      )
  }
}

// ------------------------------------------------------------------ kollar
function Arm({ side, top, skin, hand = 3.2 }) {
  const t = TOPS[top] || TOPS.tee_mint
  const sc = t.sleeveColor || t.color
  const x = side === 'l' ? -15.8 : 10.4
  const hx = side === 'l' ? -13.2 : 13.2
  const cls = side === 'l' ? 'sm-arm-l' : 'sm-arm-r'
  return (
    <g className={cls}>
      {t.sleeve === 'short' ? (
        <g>
          <rect x={x + 0.6} y={-36} width={4.2} height={10} rx={2.1} fill={skin} {...SOFT} />
          <rect x={x} y={-43.5} width={5.4} height={9} rx={2.6} fill={sc} {...SOFT} />
        </g>
      ) : (
        <g>
          <rect x={x} y={-43.5} width={5.4} height={17} rx={2.7} fill={sc} {...SOFT} />
          {(top === 'sweater_cream' || top === 'hoodie_sky') && <rect x={x} y={-29.4} width={5.4} height={3} rx={1.4} fill={shade(sc, -0.16)} />}
        </g>
      )}
      <circle cx={hx} cy={-25} r={hand} fill={skin} {...SOFT} />
    </g>
  )
}

// ------------------------------------------------------------------ alt giyim + bacak
function Leg({ side, bottom, skin, lift = 0, foot = 1 }) {
  const b = BOTTOMS[bottom] || BOTTOMS.jeans
  const x = side === 'l' ? -7.4 : 1.2
  const cls = side === 'l' ? 'sm-leg-l' : 'sm-leg-r'
  const legFill = b.kind === 'pants' || b.kind === 'joggers' ? b.color : skin
  const sx = side === 'l' ? -4.2 : 4.2
  return (
    <g className={cls}>
      <rect x={x} y={-25 - lift} width={6.2} height={22 + lift} rx={2.6} fill={legFill} {...SOFT} />
      {b.kind === 'shorts' && <rect x={x - 0.4} y={-25 - lift} width={7} height={10 + lift * 0.5} rx={2.4} fill={b.color} {...SOFT} />}
      {b.kind === 'joggers' && <rect x={x - 0.2} y={-8} width={6.6} height={3.4} rx={1.6} fill={shade(b.color, -0.2)} />}
      {bottom === 'jeans' && <path d={`M${x + 0.6} -7 L${x + 5.6} -7`} stroke={shade(b.color, 0.3)} strokeWidth="1" />}
      <g transform={foot !== 1 ? `translate(${sx} 0) scale(${foot}) translate(${-sx} 0)` : undefined}>
        <path d={`M${sx - 4.4} -3.6 Q${sx - 4.8} 0.4 ${sx} 0.4 Q${sx + 4.4} 0.4 ${sx + 4.4} -2.6 Q${sx + 4} -5.4 ${sx} -5.4 Q${sx - 4} -5.4 ${sx - 4.4} -3.6Z`} fill={b.shoe} {...SOFT} />
        <path d={`M${sx - 4.4} -1 Q${sx} 1 ${sx + 4.4} -1`} stroke={b.sole} strokeWidth="1.2" fill="none" />
      </g>
    </g>
  )
}

function BottomOver({ bottom }) {
  const b = BOTTOMS[bottom] || BOTTOMS.jeans
  const d = shade(b.color, -0.16)
  if (b.kind === 'skirt') {
    return (
      <g>
        <path d="M-10 -25.5 L10 -25.5 L13.6 -12 Q0 -9 -13.6 -12Z" fill={b.color} {...SOFT} />
        <path d="M-4 -24 L-5.4 -11 M4 -24 L5.4 -11" stroke={d} strokeWidth="1" opacity="0.7" />
      </g>
    )
  }
  if (b.kind === 'long') {
    return (
      <g>
        <path d="M-10 -25.5 L10 -25.5 L13 -4.6 Q0 -2.4 -13 -4.6Z" fill={b.color} {...SOFT} />
        <path d="M-4 -24 L-6 -4 M4 -24 L6 -4" stroke={d} strokeWidth="1" opacity="0.7" />
        <path d="M-13 -9 Q0 -6.6 13 -9" stroke={C.white} strokeWidth="1.2" fill="none" opacity="0.6" />
      </g>
    )
  }
  return <rect x={-9.4} y={-26.5} width={18.8} height={7} rx={2.6} fill={b.color} {...SOFT} />
}

// ------------------------------------------------------------------ aksesuar
function AccessoryBehind({ k, view }) {
  if (k === 'backpack' && view === 'front') {
    return <rect x={-13.4} y={-42} width={26.8} height={18} rx={6} fill="#E8952F" {...SOFT} />
  }
  return null
}

function AccessoryBody({ k, view }) {
  if (k === 'backpack') {
    if (view === 'front') {
      return (
        <g stroke="#E8952F" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M-8.4 -44 Q-10 -36 -9 -28" />
          <path d="M8.4 -44 Q10 -36 9 -28" />
        </g>
      )
    }
    return (
      <g>
        <rect x={-11} y={-44} width={22} height={23} rx={7} fill={C.apricot} {...SOFT} />
        <path d="M-11 -36 Q0 -31 11 -36 L11 -38 Q11 -44 4 -44 L-4 -44 Q-11 -44 -11 -38Z" fill="#E8952F" {...SOFT} />
        <rect x={-6.5} y={-30} width={13} height={7} rx={3} fill="#F7B860" {...SOFT} />
        <circle cx={0} cy={-34.4} r={1.3} fill={C.white} />
      </g>
    )
  }
  return null
}

function AccessoryHead({ k, view }) {
  const fx = view === 'front' ? FX : 0
  switch (k) {
    case 'glasses_round':
      if (view === 'back') return <path d="M-17 -56 L-13 -55 M17 -56 L13 -55" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
      return (
        <g transform={`translate(${fx} 0)`}>
          <circle cx={-6} cy={-54} r={4.7} fill="#fff" fillOpacity="0.25" stroke={INK} strokeWidth="1.3" />
          <circle cx={6} cy={-54} r={4.7} fill="#fff" fillOpacity="0.25" stroke={INK} strokeWidth="1.3" />
          <path d="M-1.3 -54.6 Q0 -56 1.3 -54.6 M-10.7 -55 L-16 -56.5 M10.7 -55 L16 -56.5" stroke={INK} strokeWidth="1.2" fill="none" />
        </g>
      )
    case 'sunhat':
      return (
        <g>
          <ellipse cx={0} cy={-67} rx={27} ry={7.5} fill="#F0D69E" {...SOFT} />
          <ellipse cx={0} cy={-67.5} rx={21} ry={5} fill="none" stroke="#DDBC78" strokeWidth="1" />
          <path d="M-13.5 -67 C-14 -83 14 -83 13.5 -67Z" fill="#F4DDA9" {...SOFT} />
          <path d="M-13.6 -69.5 Q0 -66 13.6 -69.5 L13.5 -67 Q0 -63.5 -13.5 -67Z" fill={C.healing} />
          {view === 'front' && (
            <g transform="translate(-10 -68)">
              <circle r={2.6} fill={C.white} />
              <circle r={1.1} fill={C.sun} />
            </g>
          )}
        </g>
      )
    case 'beanie':
      return (
        <g>
          <path d="M-18 -60 C-19 -77 -8 -81.5 0 -81.5 C8 -81.5 19 -77 18 -60Z" fill={C.apricot} {...SOFT} />
          <rect x={-18.6} y={-64} width={37.2} height={6.5} rx={3.2} fill="#E8952F" {...SOFT} />
          <path d="M-12 -64 L-12 -58 M-6 -64 L-6 -57.6 M0 -64 L0 -57.5 M6 -64 L6 -57.6 M12 -64 L12 -58" stroke="#D88420" strokeWidth="1" />
          <path d="M-8 -66 L-8 -77 M0 -66 L0 -80 M8 -66 L8 -77" stroke="#E8952F" strokeWidth="1" opacity="0.7" />
          <circle cx={0} cy={-83} r={5} fill={C.cream} {...SOFT} />
        </g>
      )
    case 'scarf':
      return (
        <g>
          {view === 'back' && <path d="M-4 -41 L-7 -27 L-2 -26.4 L0 -40Z" fill="#D9505F" {...SOFT} />}
          <path d="M-12 -46 Q0 -41 12 -46 L12.4 -40.5 Q0 -35 -12.4 -40.5Z" fill={C.rose} {...SOFT} />
          <path d="M-6 -44 L-6 -38.5 M0 -42.8 L0 -37.4 M6 -44 L6 -38.5" stroke={C.white} strokeWidth="1.3" opacity="0.8" />
          {view === 'front' && (
            <g>
              <path d="M4 -40 L8 -25 L3.4 -24.2 L1 -38.6Z" fill={C.rose} {...SOFT} />
              <path d="M5 -32 L7 -32.6" stroke={C.white} strokeWidth="1.2" />
              <path d="M3.6 -24 L3.4 -22 M5.4 -24.4 L5.4 -22.4 M7.2 -24.8 L7.6 -22.8" stroke={C.rose} strokeWidth="1" strokeLinecap="round" />
            </g>
          )}
        </g>
      )
    case 'headphones':
      return (
        <g>
          <path d="M-17.5 -58 C-18.5 -82 18.5 -82 17.5 -58" stroke={C.teal} strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <rect x={-21.5} y={-62} width={7} height={12} rx={3.4} fill={C.apricot} {...SOFT} />
          <rect x={14.5} y={-62} width={7} height={12} rx={3.4} fill={C.apricot} {...SOFT} />
        </g>
      )
    case 'flower_pin': {
      const x = view === 'front' ? -11.5 : 11.5
      return (
        <g transform={`translate(${x} -67.5)`}>
          {[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx={0} cy={-2.8} rx={1.8} ry={2.8} fill={C.white} transform={`rotate(${a})`} {...SOFT} strokeOpacity="0.15" />)}
          <circle r={2} fill={C.sun} />
        </g>
      )
    }
    case 'cap':
      if (view === 'back') {
        return (
          <g>
            <path d="M-18 -60 C-18.5 -82 18.5 -82 18 -60Z" fill={C.healing} {...SOFT} />
            <path d="M-5 -61 Q0 -66 5 -61Z" fill={INK} opacity="0.25" />
            <circle cx={0} cy={-76} r={1.6} fill={C.healingDeep} />
          </g>
        )
      }
      return (
        <g>
          <path d="M-18 -60 C-18.5 -82 18.5 -82 18 -60Z" fill={C.healing} {...SOFT} />
          <path d="M-1 -76 L-1 -61" stroke={C.healingDeep} strokeWidth="0.9" opacity="0.6" />
          <path d="M-17.5 -61.5 Q2 -59 19 -63 Q24 -59 18 -56.5 Q0 -55 -17.5 -61.5Z" fill={C.healingDeep} {...SOFT} />
          <circle cx={-1} cy={-76.4} r={1.6} fill={C.healingDeep} />
        </g>
      )
    default:
      return null
  }
}

// ------------------------------------------------------------------ yüz
function Face({ skin, male, hairColor, sleep }) {
  const dark = skin === SKINS.s4 || skin === SKINS.s5
  const brow = shade(hairColor, -0.12)
  return (
    <g transform={`translate(${FX} 0)`}>
      {sleep ? (
        <path d="M-8.2 -53.6 Q-6 -51.4 -3.8 -53.6 M3.8 -53.6 Q6 -51.4 8.2 -53.6" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <ellipse cx={-6} cy={-54} rx={2.1} ry={2.45} fill={INK} />
          <ellipse cx={6} cy={-54} rx={2.1} ry={2.45} fill={INK} />
          <circle cx={-6.6} cy={-54.9} r={0.75} fill="#fff" />
          <circle cx={5.4} cy={-54.9} r={0.75} fill="#fff" />
          {/* kadın: göz başına iki-üç kirpik */}
          {!male && <path d="M-7.9 -55.2 L-10 -56.2 M-7.2 -56.2 L-8.6 -58 M-5.8 -56.5 L-6.2 -58.4 M7.9 -55.2 L10 -56.2 M7.2 -56.2 L8.6 -58 M5.8 -56.5 L6.2 -58.4" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />}
        </g>
      )}
      {/* kaşlar: kadında ince kavisli, erkekte biraz daha kalın ve düz */}
      {male ? (
        <path d="M-9.2 -60.2 L-3.4 -60.8 M3.4 -60.8 L9.2 -60.2" stroke={brow} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M-8.2 -59.4 Q-6 -61.2 -3.8 -59.4 M3.8 -59.4 Q6 -61.2 8.2 -59.4" stroke={brow} strokeWidth="1.15" fill="none" strokeLinecap="round" />
      )}
      <ellipse cx={-10.4} cy={-49.6} rx={male ? 2.6 : 3.3} ry={male ? 1.5 : 1.9} fill={BLUSH} opacity={male ? (dark ? 0.4 : 0.45) : dark ? 0.7 : 0.85} />
      <ellipse cx={10.4} cy={-49.6} rx={male ? 2.6 : 3.3} ry={male ? 1.5 : 1.9} fill={BLUSH} opacity={male ? (dark ? 0.4 : 0.45) : dark ? 0.7 : 0.85} />
      <path d={sleep ? 'M-1.8 -48.8 Q0 -47.6 1.8 -48.8' : 'M-2.8 -49.6 Q0 -47 2.8 -49.6'} stroke={INK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </g>
  )
}

// erkek baş: çene hattı biraz daha düz/geniş; kadın: yuvarlak
const HEAD_MALE = 'M-17.6 -58 C-17.6 -68.4 -9.6 -73.6 0 -73.6 C9.6 -73.6 17.6 -68.4 17.6 -58 L17.3 -50.4 Q16.6 -42.6 9 -41 L-9 -41 Q-16.6 -42.6 -17.3 -50.4Z'

function Head({ skin, male }) {
  return (
    <g>
      <rect x={male ? -4.4 : -3.2} y={-48} width={male ? 8.8 : 6.4} height={6} rx={2} fill={shade(skin, -0.1)} />
      <ellipse cx={-17} cy={-54} rx={3} ry={3.6} fill={skin} {...SOFT} />
      <ellipse cx={17} cy={-54} rx={3} ry={3.6} fill={skin} {...SOFT} />
      {male ? <path d={HEAD_MALE} fill={skin} {...SOFT} /> : <ellipse cx={0} cy={HEAD_Y} rx={17.8} ry={16.6} fill={skin} {...SOFT} />}
      <path d="M11 -66 Q15 -60 14.6 -52" stroke={shade(skin, -0.12)} strokeWidth="2.4" fill="none" opacity="0.35" strokeLinecap="round" />
    </g>
  )
}

// ------------------------------------------------------------------ elde tutulan
// Kolların omuz etrafında dönüşü (derece) ve eşyanın çizim katmanı.
const HELD_POSE = {
  tea: { l: 0, r: 32 },
  simit: { l: 0, r: 10 },
  book: { l: -28, r: 28 },
  brush: { l: 0, r: -38 },
}
export const HELD_ITEMS = Object.keys(HELD_POSE)

function TeaInHand() {
  return (
    <g transform="translate(4.4 -24.6)">
      <ellipse cx={0} cy={0.4} rx={3.6} ry={1.3} fill={C.rose} />
      <path d="M-2.3 -8 Q-1 -4.4 -1.9 -2.3 Q-1.4 0 0 0 Q1.4 0 1.9 -2.3 Q1 -4.4 2.3 -8Z" fill="#C8582C" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.7" />
      <path d="M-1.2 -6.6 Q-0.5 -4.4 -1 -2.8" stroke="#fff" strokeWidth="0.6" opacity="0.7" fill="none" />
      <path className="sm-steam" d="M0 -10 q-1.6 -2 0 -4" stroke="#fff" strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  )
}

function SimitInHand() {
  return (
    <g transform="translate(10.6 -18.6)">
      <circle r={6.4} fill="none" stroke="#C98A4B" strokeWidth="4" />
      <circle r={6.4} fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="0.8" />
      <circle r={4.2} fill="none" stroke="#B57538" strokeWidth="0.6" opacity="0.6" />
      {[[-5, -3], [4, -4.4], [6, 1.6], [-3, 5.2], [1.6, 6.2], [-6.2, 1.8]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={0.55} fill="#FFF4D8" />)}
    </g>
  )
}

function BookInHand() {
  return (
    <g transform="translate(0 -30)">
      <path d="M-9.5 -5 Q-4.5 -7 0 -5 Q4.5 -7 9.5 -5 L9.5 4 Q4.5 2.4 0 4 Q-4.5 2.4 -9.5 4Z" fill={C.healing} {...SOFT} />
      <path d="M-8.4 -5.4 Q-4.2 -7 0 -5.2 L0 3 Q-4.2 1.4 -8.4 2.6Z M8.4 -5.4 Q4.2 -7 0 -5.2 L0 3 Q4.2 1.4 8.4 2.6Z" fill={C.white} />
      <path d="M-6.6 -3.4 L-2 -3.6 M-6.6 -1.4 L-2 -1.6 M2 -3.6 L6.6 -3.4 M2 -1.6 L6.6 -1.4" stroke={C.metal} strokeWidth="0.5" opacity="0.6" />
      <path d="M0 -5.2 L0 3" stroke={INK} strokeOpacity="0.25" strokeWidth="0.8" />
    </g>
  )
}

function BrushInHand() {
  return (
    <g transform="translate(23.6 -28.6) rotate(28)">
      <rect x={-1} y={-15} width={2} height={15} rx={1} fill={C.wood} />
      <rect x={-1.3} y={-18} width={2.6} height={3.4} fill={C.metal} />
      <path d="M-1.4 -18 Q0 -24 1.4 -18Z" fill={C.rose} />
    </g>
  )
}

// ------------------------------------------------------------------ oturma bacakları
function Capsule({ x1, y1, x2, y2, w, fill }) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  return <rect transform={`translate(${x1} ${y1}) rotate(${ang})`} x={-w / 2} y={-w / 2} width={len + w} height={w} rx={w / 2} fill={fill} {...SOFT} />
}

// Oturuş bacakları (önden). (0,0) = oturma noktası (kalça). Uyluklar izleyiciye doğru
// (ekranda sağ-aşağı, flip'te sol-aşağı) kısaltılmış uzanır, dizden kırılır; baldırlar
// kısa ve sarkık, ayaklar yan yana. Alçak koltukta (seatHeight < 14) dizler yukarıda.
function sitGeometry(seatHeight, male) {
  const low = seatHeight < 14
  const a = ((low ? -26 : 24) * Math.PI) / 180
  const T = male ? 11 : 10
  const hips = [{ x: -3.8, y: -2.2 }, { x: 2.2, y: -0.8 }]
  return hips.map((h) => {
    const k = { x: h.x + T * Math.cos(a), y: h.y + T * Math.sin(a) }
    const S = Math.max(4, Math.min(male ? 11 : 10, seatHeight - k.y - 3))
    return { h, k, f: { x: k.x + (low ? 0.6 : 1.6), y: k.y + S } }
  })
}

function SitShoe({ x, y, b, foot }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${foot})`}>
      <path d="M-3.2 -2.8 Q5.6 -3.6 6.4 0 Q6.2 2.2 -0.6 2.2 Q-3.8 1.8 -3.2 -2.8Z" fill={b.shoe} {...SOFT} />
      <path d="M-3 1.2 Q2 2.8 6.2 0.6" stroke={b.sole} strokeWidth="1.1" fill="none" />
    </g>
  )
}

function SitLegs({ bottom, skin, seatHeight, foot = 1, male }) {
  const b = BOTTOMS[bottom] || BOTTOMS.jeans
  const pants = b.kind === 'pants' || b.kind === 'joggers'
  const thighC = pants || b.kind === 'shorts' ? b.color : skin
  const shinC = pants ? b.color : skin
  const g = sitGeometry(seatHeight, male)
  const [L, R] = g
  const leg = ({ h, k, f }, i) => (
    <g key={i}>
      <Capsule x1={k.x} y1={k.y} x2={f.x} y2={f.y - 2} w={5.2} fill={shinC} />
      {b.kind === 'joggers' && <rect x={f.x - 3} y={f.y - 5.4} width={6} height={2.8} rx={1.3} fill={shade(b.color, -0.2)} />}
      <Capsule x1={h.x} y1={h.y} x2={k.x} y2={k.y} w={6.6} fill={thighC} />
      <ellipse cx={k.x + 1.2} cy={k.y - 0.6} rx={2} ry={1.4} fill="#fff" opacity="0.22" />
      <SitShoe x={f.x} y={f.y} b={b} foot={foot} />
    </g>
  )
  return (
    <g>
      {leg(L, 0)}
      {leg(R, 1)}
      {b.kind === 'skirt' && (
        <path d={`M-11 -4 L9.6 -4 L${R.k.x + 3.6} ${R.k.y - 1.2} Q${R.k.x + 4.4} ${R.k.y + 3} ${R.k.x + 1} ${R.k.y + 3.6} L${L.k.x - 1} ${L.k.y + 3.8} Q-8 ${L.k.y + 3} -11.6 2.4Z`} fill={b.color} {...SOFT} />
      )}
      {b.kind === 'long' && (
        <path d={`M-11 -4 L9.6 -4 L${R.k.x + 3.6} ${R.k.y - 1.2} L${R.f.x + 4} ${R.f.y - 3} Q${(R.f.x + L.f.x) / 2} ${R.f.y} ${L.f.x - 2.4} ${L.f.y - 2.6} L-12 4Z`} fill={b.color} {...SOFT} />
      )}
    </g>
  )
}

// Oturuş (arkadan): basık, yayılmış kalça ve gövdenin altında kalan topuklar.
function SitBack({ bottom, skin, seatHeight, foot = 1 }) {
  const b = BOTTOMS[bottom] || BOTTOMS.jeans
  const hipC = b.color
  const shinC = b.kind === 'pants' || b.kind === 'joggers' ? b.color : skin
  const S = Math.max(3, Math.min(6, seatHeight * 0.35))
  return (
    <g>
      {[-4.2, 4.2].map((x) => (
        <g key={x}>
          <rect x={x - 2.5} y={0} width={5} height={S} rx={2.4} fill={shinC} {...SOFT} />
          <g transform={`translate(${x} ${S}) scale(${foot})`}>
            <path d="M-3.2 -1.4 Q-3.4 1.8 0 1.8 Q3.4 1.8 3.2 -1.4 Q0 -2.6 -3.2 -1.4Z" fill={b.shoe} {...SOFT} />
          </g>
        </g>
      ))}
      <ellipse cx={0} cy={-0.6} rx={12.4} ry={4.4} fill={hipC} {...SOFT} />
      <path d="M0 -4 L0 2.6" stroke={shade(hipC, -0.2)} strokeWidth="1" opacity="0.6" />
    </g>
  )
}

// ------------------------------------------------------------------ karakter
function normalize(a) {
  const ap = a || {}
  return {
    body: ap.body === 'male' ? 'male' : 'female',
    skin: SKINS[ap.skin] ? ap.skin : DEFAULT_APPEARANCE.skin,
    hair: HAIR_STYLES.includes(ap.hair) ? ap.hair : DEFAULT_APPEARANCE.hair,
    hairColor: HAIR_COLORS[ap.hairColor] ? ap.hairColor : DEFAULT_APPEARANCE.hairColor,
    top: TOPS[ap.top] ? ap.top : DEFAULT_APPEARANCE.top,
    bottom: BOTTOMS[ap.bottom] ? ap.bottom : DEFAULT_APPEARANCE.bottom,
    accessory: ACCESSORIES.includes(ap.accessory) ? ap.accessory : null,
  }
}

// Üst gövde (bel ve yukarısı). Ayakta (0,0)=ayak; oturuşta motor kaydırır.
function Upper({ a, view, held, sleep, sitting }) {
  const skin = SKINS[a.skin]
  const hc = HAIR_COLORS[a.hairColor]
  const male = a.body === 'male'
  const hair = hairPaths(a.hair, hc, view)
  const acc = a.accessory
  const hatOn = acc === 'sunhat' || acc === 'beanie' || acc === 'cap'
  // otururken eller kucakta (kollar hafif içe)
  const hp = HELD_POSE[held] || (sitting ? { l: -14, r: 16 } : { l: 0, r: 0 })
  // beden: erkekte omuz/gövde belirgin geniş ve köşeli, kollar dışarıda, eller iri;
  // kadında omuz dar, belde hafif kavis. Erkek MALE_LIFT px daha uzun.
  const torsoT = male ? 'scale(1.24 1)' : 'scale(0.9 1)'
  const armOff = male ? 3.1 : -1.3
  const hand = male ? 3.7 : 3
  const lift = male ? MALE_LIFT : 0
  const front = view === 'front'
  return (
    <g transform={lift ? `translate(0 ${-lift})` : undefined}>
      {front && <AccessoryBehind k={acc} view={view} />}
      {front && hair.back && !(hatOn && a.hair === 'bun') && hair.back}
      {held === 'simit' && <g transform={`translate(${armOff} 0)`}><SimitInHand /></g>}
      {!(sitting && (BOTTOMS[a.bottom]?.kind === 'skirt' || BOTTOMS[a.bottom]?.kind === 'long')) && <BottomOver bottom={a.bottom} />}
      <g transform={torsoT}>{front ? <TopFront k={a.top} skin={skin} body={a.body} /> : <TopBack k={a.top} body={a.body} />}</g>
      {front && held === 'book' && <BookInHand />}
      <g transform={`translate(${-armOff} 0) rotate(${hp.l} -13.1 -42)`}>
        <Arm side="l" top={a.top} skin={skin} hand={hand} />
      </g>
      <g transform={`translate(${armOff} 0) rotate(${hp.r} 13.1 -42)`}>
        <Arm side="r" top={a.top} skin={skin} hand={hand} />
      </g>
      {front && held === 'tea' && <g transform={`translate(${armOff} 0)`}><TeaInHand /></g>}
      {held === 'brush' && <g transform={`translate(${armOff} 0)`}><BrushInHand /></g>}
      {front && <g transform={torsoT}><AccessoryBody k={acc} view={view} /></g>}
      <Head skin={skin} male={male} />
      {front && <Face skin={skin} male={male} hairColor={hc} sleep={sleep} />}
      {view === 'back' && hatOn && a.hair === 'bun' ? hairPaths('short', hc, 'back').front : hair.front}
      {view === 'back' && <g transform={torsoT}><AccessoryBody k={acc} view={view} /></g>}
      <AccessoryHead k={acc} view={view} />
    </g>
  )
}

// Erkek beden bu kadar px daha uzun (bacak + üst gövde kayması). Baş üstü
// bağlama noktaları (CHAR_ANCHORS) erkekte bu kadar yukarıdadır.
export const MALE_LIFT = 4

// Oturuşta üst gövdenin aşağı kayması: bel çizgisi (y≈-24) oturma noktasına (y≈-3.5) iner.
const SIT_DROP = 20.5
// Uzanışta gövde ekseni ızgaranın +y yönüne (ekranda sol-aşağı) yatar; (0,0) = kalça.
const LIE_ANGLE = 63.43

function CharacterBody({ appearance, facing = 'front', walking = false, shadow = true, pose = 'stand', held = null, seatHeight = 22 }) {
  const a = normalize(appearance)
  const skin = SKINS[a.skin]
  const view = facing === 'back' ? 'back' : 'front'
  const h = pose === 'lie' ? null : HELD_POSE[held] ? held : null
  const male = a.body === 'male'
  if (pose === 'lie') {
    return (
      <g transform={`rotate(${LIE_ANGLE}) translate(0 24)`}>
        <Leg side="l" bottom={a.bottom} skin={skin} lift={male ? MALE_LIFT : 0} foot={male ? 1.12 : 1} />
        <Leg side="r" bottom={a.bottom} skin={skin} lift={male ? MALE_LIFT : 0} foot={male ? 1.12 : 1} />
        <Upper a={a} view="front" sleep />
      </g>
    )
  }
  if (pose === 'sit') {
    const lowSeat = seatHeight < 14
    return (
      <g>
        {view === 'front' && !lowSeat && <SitLegs bottom={a.bottom} skin={skin} seatHeight={seatHeight} foot={male ? 1.12 : 1} male={male} />}
        <g transform={`translate(0 ${SIT_DROP + (male ? MALE_LIFT : 0)})`}>
          <Upper a={a} view={view} held={h} sitting={view === 'front'} />
        </g>
        {view === 'front' && lowSeat && <SitLegs bottom={a.bottom} skin={skin} seatHeight={seatHeight} foot={male ? 1.12 : 1} male={male} />}
        {view === 'back' && <SitBack bottom={a.bottom} skin={skin} seatHeight={seatHeight} foot={male ? 1.12 : 1} />}
      </g>
    )
  }
  return (
    <g className={walking ? 'sm-walk' : undefined}>
      {shadow && <ellipse cx={0} cy={0} rx={14} ry={5} fill={INK} opacity="0.16" />}
      <Leg side="l" bottom={a.bottom} skin={skin} lift={male ? MALE_LIFT : 0} foot={male ? 1.12 : 1} />
      <Leg side="r" bottom={a.bottom} skin={skin} lift={male ? MALE_LIFT : 0} foot={male ? 1.12 : 1} />
      <g className="sm-upper">
        <Upper a={a} view={view} held={h} />
      </g>
    </g>
  )
}

// <Character appearance facing flip walking scale pose held seatHeight />
//  pose: 'stand' (varsayılan, (0,0)=ayak noktası) | 'sit' ((0,0)=oturma noktası,
//  seatHeight=oturma noktasından zemine px, ayaklar oraya iner; arkadan bakışta bacak çizilmez)
//  | 'lie' ((0,0)=kalça, gövde ızgaranın +y yönüne yatar, flip ile +x yönüne; gözler kapalı)
//  held: 'tea' | 'simit' | 'book' | 'brush' | null (stand ve sit'te)
export const Character = memo(function Character({ appearance, facing = 'front', flip = false, walking = false, scale = 1, pose = 'stand', held = null, seatHeight = 22 }) {
  const sx = (flip ? -1 : 1) * scale
  return (
    <g transform={`scale(${sx} ${scale})`}>
      <CharacterBody appearance={appearance} facing={facing} walking={walking && pose === 'stand'} pose={pose} held={held} seatHeight={seatHeight} />
    </g>
  )
})

// Kart/avatar için baş-omuz görünümü. Kendi <svg>'sini çizer (daire içine sığar).
// bg: daire zemin rengi (false = zeminsiz)
export const CharacterBust = memo(function CharacterBust({ appearance, size = 64, bg = '#CDEFE3', title }) {
  const clip = `sm-bust-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg width={size} height={size} viewBox="-28 -86 56 56" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <clipPath id={clip}>
          <path d="M-28 -86 H28 V-58 A28 28 0 0 1 -28 -58Z" />
        </clipPath>
      </defs>
      {bg && <circle cx={0} cy={-58} r={28} fill={bg} />}
      <g clipPath={`url(#${clip})`}>
        <g transform={`translate(0 ${appearance?.body === 'male' ? 2 + MALE_LIFT : 2})`}>
          <CharacterBody appearance={appearance} facing="front" shadow={false} />
        </g>
      </g>
    </svg>
  )
})
