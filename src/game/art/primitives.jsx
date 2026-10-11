// Çizim yardımcıları: ayak izi yerel koordinatında (0,0 = üst köşe) izometrik
// kutu, silindir ve yüz çokgenleri. Işık sol üstten: üst yüz en açık,
// sol-ön yüz (+y) orta, sağ-ön yüz (+x) en koyu.
import { INK, shade } from './palette.js'

// Izgara (u,v) + yükseklik h -> "sx,sy"
export function P(u, v, h = 0) {
  return `${(u - v) * 32},${(u + v) * 16 - h}`
}
export function pt(u, v, h = 0) {
  return [(u - v) * 32, (u + v) * 16 - h]
}

export const LINE = { stroke: INK, strokeOpacity: 0.26, strokeWidth: 1, strokeLinejoin: 'round', strokeLinecap: 'round' }

// +y'ye bakan yüzde (v = vf) dikdörtgen: u1..u2, h1..h2
export function faceV(vf, u1, u2, h1, h2) {
  return `${P(u1, vf, h1)} ${P(u2, vf, h1)} ${P(u2, vf, h2)} ${P(u1, vf, h2)}`
}
// +x'e bakan yüzde (u = uf) dikdörtgen: v1..v2, h1..h2
export function faceU(uf, v1, v2, h1, h2) {
  return `${P(uf, v1, h1)} ${P(uf, v2, h1)} ${P(uf, v2, h2)} ${P(uf, v1, h2)}`
}
// Yatay düzlemde (yükseklik h) dikdörtgen
export function flat(u1, v1, u2, v2, h = 0) {
  return `${P(u1, v1, h)} ${P(u2, v1, h)} ${P(u2, v2, h)} ${P(u1, v2, h)}`
}

export function Box({ u = 0, v = 0, w, d, h, z = 0, color, top, left, right, line = true }) {
  const t = top || shade(color, 0.12)
  const l = left || color
  const r = right || shade(color, -0.14)
  const s = line ? LINE : null
  return (
    <g>
      <polygon points={faceV(v + d, u, u + w, z, z + h)} fill={l} {...s} />
      <polygon points={faceU(u + w, v, v + d, z, z + h)} fill={r} {...s} />
      <polygon points={flat(u, v, u + w, v + d, z + h)} fill={t} {...s} />
    </g>
  )
}

// Dikey silindir: taban merkezi (x,y) ekran koordinatı, yarıçap r, yükseklik h.
export function Cyl({ x = 0, y = 0, r, h, color, top, line = true, ry }) {
  const e = ry ?? r / 2
  const s = line ? LINE : null
  return (
    <g>
      <path d={`M${x - r} ${y - h} L${x - r} ${y} A${r} ${e} 0 0 0 ${x + r} ${y} L${x + r} ${y - h} Z`} fill={color} {...s} />
      <path d={`M${x + r * 0.35} ${y - h} L${x + r * 0.35} ${y + e * 0.94} A${r} ${e} 0 0 0 ${x + r} ${y} L${x + r} ${y - h} Z`} fill={shade(color, -0.14)} />
      <ellipse cx={x} cy={y - h} rx={r} ry={e} fill={top || shade(color, 0.14)} {...s} />
    </g>
  )
}

// Yumuşak zemin gölgesi
export function Shadow({ x = 0, y = 0, rx, ry, o = 0.16 }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry ?? rx / 2} fill={INK} opacity={o} />
}

// Nokta göz + yanak + gülümseme (yol arkadaşlarıyla aynı yüz dili)
export function TinyFace({ x = 0, y = 0, s = 1, smile = true }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={-4} cy={0} rx={1.5} ry={1.7} fill={INK} />
      <ellipse cx={4} cy={0} rx={1.5} ry={1.7} fill={INK} />
      <ellipse cx={-7} cy={3} rx={2} ry={1.2} fill="#FF8FA3" opacity="0.7" />
      <ellipse cx={7} cy={3} rx={2} ry={1.2} fill="#FF8FA3" opacity="0.7" />
      {smile && <path d="M-2 2.6 Q0 4.4 2 2.6" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" />}
    </g>
  )
}

// Düzlemsel çizim: yan görünüşte (x sağa, y aşağı) çizilen bir şekli
// +y'ye bakan duvar düzlemine (v sabit) ya da +x'e bakan düzleme (u sabit) yatırır.
// 1 ızgara birimi = 35.78 px yan görünüş uzunluğu.
export const UNIT = Math.hypot(32, 16)
export function onV(u, v, h = 0) {
  const [x, y] = pt(u, v, h)
  return `matrix(0.8944 0.4472 0 1 ${x} ${y})`
}
export function onU(u, v, h = 0) {
  const [x, y] = pt(u, v, h)
  return `matrix(0.8944 -0.4472 0 1 ${x} ${y})`
}

// Daire kümesinden yumuşak kenarlı "bulut" kütlesi (ağaç tepesi, çalı).
// Önce konturlu, sonra konutursuz çizilir: yalnızca dış hat çizgili kalır.
export function Blob({ circles, fill, line = true, o = 1 }) {
  return (
    <g opacity={o}>
      {line && circles.map(([x, y, r], i) => <circle key={`s${i}`} cx={x} cy={y} r={r} fill={fill} stroke={INK} strokeOpacity="0.22" strokeWidth="2" />)}
      {circles.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={fill} />)}
    </g>
  )
}
