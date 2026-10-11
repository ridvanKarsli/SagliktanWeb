// İşlevli eşyalar (EK v1.1 §C): hangi eşyada hangi eylemler var, karakter
// nereye yürür, hangi duruşu alır. Saf JS (çizim yok).
//
// Eylem: { id, label, kind: 'sit'|'lie'|'stand'|'toggle', held?, fx?, fxAt?: 'item'|'char', heldMs? }
//  - sit/lie: SEAT_OFFSETS / LIE_OFFSETS'teki bir yere oturur/uzanır
//  - stand: eşyanın yanındaki boş kareye gidip ona döner (held/fx olabilir)
//  - toggle: eşyanın açık/kapalı durumu (yalnızca kendi odamda)
import { SEAT_OFFSETS, LIE_OFFSETS, FX_ANCHORS, iso } from '../art/index.js'
import { isWalkable, routeTo } from './pathfinding.js'

const sit = (label = 'Otur') => ({ id: 'sit', label, kind: 'sit' })

// on: eşyanın şu anki açık durumu (toggle etiketleri için)
export function roomActions(itemKey, { on = false, own = false } = {}) {
  const t = (onLabel, offLabel) => (own ? [{ id: 'toggle', label: on ? offLabel : onLabel, kind: 'toggle' }] : [])
  switch (itemKey) {
    case 'sofa': case 'armchair': case 'chair': case 'beanbag':
      return [sit()]
    case 'bed':
      return [{ id: 'lie', label: 'Uzan, dinlen', kind: 'lie', fx: 'Zzz', fxAt: 'char' }]
    case 'tv':
      return t('Televizyonu aç', 'Televizyonu kapat')
    case 'radio':
      return t('Müzik aç', 'Müziği kapat')
    case 'piano':
      return [{ id: 'play', label: 'Piyano çal', kind: 'sit', fx: 'MusicNotes', fxAt: 'item' }]
    case 'aquarium':
      return [{ id: 'watch', label: 'Balıkları izle', kind: 'stand', fx: 'Bubbles', fxAt: 'item' }, ...t('Akvaryum ışığını aç', 'Akvaryum ışığını kapat')]
    case 'fireplace':
      return t('Ateşi yak', 'Ateşi söndür')
    case 'floor_lamp':
      return t('Işığı aç', 'Işığı kapat')
    case 'bookshelf':
      return [{ id: 'read', label: 'Kitap oku', kind: 'read', held: 'book' }]
    case 'easel':
      return [{ id: 'paint', label: 'Resim yap', kind: 'stand', held: 'brush', fx: 'PaintStrokes', fxAt: 'item' }]
    case 'desk':
      return [{ id: 'work', label: 'Çalış', kind: 'sit' }]
    case 'cat_bed':
      return [{ id: 'pet', label: 'Kediyi sev', kind: 'stand', fx: 'Hearts', fxAt: 'item' }]
    case 'flower_vase':
      return [{ id: 'smell', label: 'Kokla', kind: 'stand', fx: 'Sparkle', fxAt: 'item' }]
    case 'dining_table': case 'coffee_table':
      return [{ id: 'tea', label: 'Çay iç', kind: 'stand', held: 'tea' }]
    default:
      return []
  }
}

export const WORLD_HELD_MS = 60000

export function worldActions(propKey) {
  switch (propKey) {
    case 'bench': case 'tea_table':
      return [sit()]
    case 'sun_lounger':
      return [{ id: 'lie', label: 'Uzan, dinlen', kind: 'lie', fx: 'Zzz', fxAt: 'char' }]
    case 'tea_kiosk':
      return [{ id: 'tea', label: 'Çay al', kind: 'stand', held: 'tea', heldMs: WORLD_HELD_MS }]
    case 'simit_cart':
      return [{ id: 'simit', label: 'Simit al', kind: 'stand', held: 'simit', heldMs: WORLD_HELD_MS }]
    case 'fountain':
      return [{ id: 'wish', label: 'Dilek tut', kind: 'stand', fx: 'Sparkle', fxAt: 'item' }]
    case 'cat_sleeping':
      return [{ id: 'pet', label: 'Kediyi sev', kind: 'stand', fx: 'Hearts', fxAt: 'item' }]
    default:
      return []
  }
}

export const WORLD_INTERACTIVE = new Set(['bench', 'tea_table', 'sun_lounger', 'tea_kiosk', 'simit_cart', 'fountain', 'cat_sleeping'])

export const PROP_NAMES = {
  bench: 'Bank', tea_table: 'Çay masası', sun_lounger: 'Şezlong', tea_kiosk: 'Çay ocağı',
  simit_cart: 'Simitçi', fountain: 'Çeşme', cat_sleeping: 'Uyuyan kedi',
}

// Oturma/uzanma yerleri: dünya koordinatında (rot uygulanmış).
// obj: { key, x, y, rot }
export function seatsOf(obj, kind) {
  const table = kind === 'lie' ? LIE_OFFSETS : SEAT_OFFSETS
  const list = table[obj.key] || []
  const o = iso(obj.x, obj.y)
  return list.map((s, i) => {
    const cell = obj.rot ? { x: obj.x + s.cell.y, y: obj.y + s.cell.x } : { x: obj.x + s.cell.x, y: obj.y + s.cell.y }
    return {
      index: i,
      kind: kind === 'lie' ? 'lie' : 'sit',
      sx: o.sx + (obj.rot ? -s.dx : s.dx),
      sy: o.sy + s.dy,
      slot: obj.x + obj.y + s.depth,
      cell,
      facing: s.facing || 'front',
      flip: obj.rot ? !s.flip : !!s.flip,
      seatHeight: s.seatHeight,
      stool: !!s.stool,
    }
  })
}

// Eşyanın efekt noktası (ekran, dünya koordinatı). Efektler aynalanmaz.
export function fxPointOf(obj) {
  const a = FX_ANCHORS[obj.key]
  if (!a) return null
  const o = iso(obj.x, obj.y)
  return { sx: o.sx + (obj.rot ? -a.dx : a.dx), sy: o.sy + a.dy, fx: a.fx }
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

// Bir hücre kümesinin yanındaki yürünebilir hücrelerden bana en yakını (yol uzunluğu).
export function bestApproach(grid, from, cells) {
  const own = new Set(cells.map((c) => `${c.x},${c.y}`))
  const cand = []
  for (const c of cells) {
    for (const [dx, dy] of DIRS) {
      const n = { x: c.x + dx, y: c.y + dy }
      if (own.has(`${n.x},${n.y}`) || !isWalkable(grid, n.x, n.y)) continue
      cand.push({ cell: n, target: c })
    }
  }
  if (!cand.length) return null
  let best = null
  for (const k of cand) {
    const d = k.cell.x === from.x && k.cell.y === from.y ? 0 : routeTo(grid, from, k.cell).length
    if (!best || d < best.d) best = { ...k, d }
  }
  return best
}

// Bir oturma yerine yaklaşma: yer yürünebilirse (piyano/masa önü) oranın kendisi,
// değilse yanındaki en yakın boş kare.
export function seatApproach(grid, from, seat) {
  if (isWalkable(grid, seat.cell.x, seat.cell.y)) return { cell: seat.cell, target: seat.cell }
  return bestApproach(grid, from, [seat.cell])
}

// Yaklaşma karesinden hedefe bakış yönü (dx,dy)
export function faceToward(from, to) {
  return { dx: Math.sign(to.x - from.x), dy: Math.sign(to.y - from.y) }
}
