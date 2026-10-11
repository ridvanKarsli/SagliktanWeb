// Bölge haritası doğrulaması: node scripts/check-zones.mjs
// Her bölgede spawn'dan BFS ile tüm kapılar, mağaza noktaları ve ev kapıları
// erişilebilir mi; nesneler sınırda/çakışmasız mı; kapı hedefleri geçerli mi.
import { ZONES, buildWalkable, propCells, portalAt } from '../src/game/world/zones.js'
import { PROP_META } from '../src/game/art/propMeta.js'
import { TILE_LEGEND } from '../src/game/art/legend.js'

const SPEC = { meydan: [26, 26], park: [30, 30], carsi: [26, 22], sahil: [34, 16], mahalle: [34, 14] }
const errors = []
const warn = []
const err = (z, m) => errors.push(`[${z}] ${m}`)

function bfs(grid, s) {
  const H = grid.length
  const W = grid[0].length
  const seen = grid.map((r) => r.map(() => false))
  const q = [s]
  seen[s.y][s.x] = true
  while (q.length) {
    const { x, y } = q.shift()
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen[ny][nx] || !grid[ny][nx]) continue
      seen[ny][nx] = true
      q.push({ x: nx, y: ny })
    }
  }
  return seen
}

const reach = {}
for (const [key, z] of Object.entries(ZONES)) {
  if (z.key !== key) err(key, `key alanı ${z.key}`)
  const [W, H] = SPEC[key] || []
  if (z.width !== W || z.height !== H) err(key, `boyut ${z.width}x${z.height}, spec ${W}x${H}`)
  if (z.tiles.length !== z.height) err(key, `satır sayısı ${z.tiles.length}`)
  z.tiles.forEach((row, y) => {
    if (row.length !== z.width) err(key, `satır ${y} uzunluğu ${row.length}`)
    for (const ch of row) if (!(ch in TILE_LEGEND)) err(key, `bilinmeyen karo '${ch}' satır ${y}`)
  })
  const occ = new Map()
  for (const p of z.props) {
    if (!PROP_META[p.key]) { err(key, `bilinmeyen nesne ${p.key}`); continue }
    for (const c of propCells(p)) {
      if (c.x < 0 || c.y < 0 || c.x >= z.width || c.y >= z.height) err(key, `${p.key}@${p.x},${p.y} sınır dışı`)
      const k = `${c.x},${c.y}`
      if (PROP_META[p.key].blocks) {
        if (occ.has(k)) err(key, `${p.key}@${p.x},${p.y} ile ${occ.get(k)} çakışıyor (${k})`)
        occ.set(k, `${p.key}@${p.x},${p.y}`)
      }
    }
  }
  const grid = buildWalkable(z)
  const s = z.spawn
  if (!grid[s.y]?.[s.x]) { err(key, `spawn ${s.x},${s.y} yürünemez`); continue }
  if (portalAt(z, s.x, s.y)) err(key, 'spawn bir kapının üstünde')
  const seen = bfs(grid, s)
  reach[key] = seen
  for (const p of z.portals) {
    let ok = false
    for (let dy = 0; dy < p.d; dy++) for (let dx = 0; dx < p.w; dx++) if (seen[p.y + dy]?.[p.x + dx]) ok = true
    if (!ok) err(key, `kapı → ${p.to} erişilemez`)
    if (!ZONES[p.to]) err(key, `kapı hedefi yok: ${p.to}`)
    const arch = z.props.find((q) => q.key === 'gate_arch' && q.x === p.x && q.y === p.y)
    if (!arch) warn.push(`[${key}] ${p.to} kapısında gate_arch yok`)
    else if (arch.to !== p.to) err(key, `gate_arch amblemi ${arch.to} ≠ ${p.to}`)
  }
  for (const sp of z.shopSpots || []) if (!seen[sp.y]?.[sp.x]) err(key, `mağaza noktası ${sp.kind} ${sp.x},${sp.y} erişilemez`)
  for (const d of z.houseDoors || []) if (!seen[d.y]?.[d.x]) err(key, `ev kapısı ${d.x},${d.y} erişilemez`)
  // yerler: anahtar geçerli, nesne yerinde, etkileşim karesi yürünür+erişilir ve nesneye bitişik
  for (const pl of z.places || []) {
    const prop = z.props.find((q) => q.key === pl.key && q.x === pl.x && q.y === pl.y)
    if (!prop) err(key, `yer ${pl.key}@${pl.x},${pl.y} için nesne yok`)
    const { x, y } = pl.interact
    if (!grid[y]?.[x]) err(key, `yer ${pl.key} etkileşim ${x},${y} yürünemez`)
    else if (!seen[y][x]) err(key, `yer ${pl.key} etkileşim ${x},${y} erişilemez`)
    if (prop) {
      const near = propCells(prop).some((c) => Math.abs(c.x - x) + Math.abs(c.y - y) === 1)
      if (!near) err(key, `yer ${pl.key} etkileşim ${x},${y} nesneye bitişik değil`)
    }
  }
  // bahçeler: sınırda, nesnelerle çakışmasız, kapı hücresi bahçe değil
  for (const gd of z.gardens || []) {
    for (let dy = 0; dy < gd.d; dy++) for (let dx = 0; dx < gd.w; dx++) {
      const k = `${gd.x + dx},${gd.y + dy}`
      if (gd.x + dx >= z.width || gd.y + dy >= z.height) err(key, `bahçe ${gd.doorIndex} sınır dışı`)
      if (occ.has(k)) err(key, `bahçe ${gd.doorIndex} ${k} ${occ.get(k)} ile çakışıyor`)
      if ((z.houseDoors || []).some((d) => `${d.x},${d.y}` === k)) err(key, `bahçe ${gd.doorIndex} bir kapıyı kapatıyor`)
    }
    if (!z.houseDoors?.[gd.doorIndex]) err(key, `bahçe ${gd.doorIndex} için kapı yok`)
  }
  // kapı sırası = motorun x'e göre kararlı ev sırası (zoneSetup.js)
  if (z.houseDoors) {
    const houses = z.props.filter((p) => p.key.startsWith('house_')).map((h, i) => ({ h, i })).sort((a, b) => a.h.x - b.h.x || a.i - b.i).map((q) => q.h)
    if (houses.length !== z.houseDoors.length) err(key, `ev sayısı ${houses.length} ≠ kapı sayısı ${z.houseDoors.length}`)
    houses.forEach((h, i) => {
      const d = z.houseDoors[i]
      if (!d || d.x !== h.x + 1 || d.y !== h.y + 3) err(key, `kapı ${i} ${h.key}@${h.x},${h.y} önünde değil`)
    })
  }
  let walk = 0
  let lost = []
  for (let y = 0; y < z.height; y++) for (let x = 0; x < z.width; x++) if (grid[y][x]) { walk++; if (!seen[y][x]) lost.push(`${x},${y}`) }
  if (lost.length) warn.push(`[${key}] spawn'dan ulaşılamayan ${lost.length} yürünür hücre: ${lost.slice(0, 12).join(' ')}`)
  console.log(`${key.padEnd(8)} ${z.width}x${z.height}  yürünür ${walk}  nesne ${z.props.length}  kapı ${z.portals.length}`)
}

// kapı hedefleri ve bağlantı şeması
for (const [key, z] of Object.entries(ZONES)) {
  for (const p of z.portals) {
    const t = ZONES[p.to]
    if (!t || !reach[p.to]) continue
    const g = buildWalkable(t)
    const { x, y } = p.toSpawn
    if (!g[y]?.[x]) err(key, `→${p.to} toSpawn ${x},${y} yürünemez`)
    else if (!reach[p.to][y][x]) err(key, `→${p.to} toSpawn ${x},${y} hedefte erişilemez`)
    if (portalAt(t, x, y)) err(key, `→${p.to} toSpawn bir kapının üstünde (döngü)`)
  }
}
const hubTargets = new Set(ZONES.meydan.portals.map((p) => p.to))
for (const k of Object.keys(ZONES)) {
  if (k === 'meydan') continue
  if (!hubTargets.has(k)) err('meydan', `${k} kapısı yok`)
  if (!ZONES[k].portals.some((p) => p.to === 'meydan')) err(k, 'meydana dönüş kapısı yok')
}
if (!ZONES.carsi.shopSpots?.some((s) => s.kind === 'clothing') || !ZONES.carsi.shopSpots?.some((s) => s.kind === 'furniture')) err('carsi', 'mağaza noktaları eksik')
if ((ZONES.mahalle.houseDoors?.length || 0) < 12) err('mahalle', 'en az 12 ev kapısı gerekli')
if ((ZONES.mahalle.gardens?.length || 0) !== ZONES.mahalle.houseDoors.length) err('mahalle', 'her kapının bir bahçesi olmalı')
const NEED = { meydan: ['fountain', 'qa_cafe', 'notice_board'], park: ['checkin_bench'], carsi: ['library', 'tea_table'], sahil: ['checkin_pier'], mahalle: ['post_office', 'garden_gate'] }
for (const [k, list] of Object.entries(NEED)) for (const p of list) if (!ZONES[k].places?.some((q) => q.key === p)) err(k, `yer eksik: ${p}`)

for (const w of warn) console.log('UYARI ' + w)
if (errors.length) {
  for (const e of errors) console.log('HATA  ' + e)
  process.exit(1)
}
console.log('Tüm bölgeler geçerli.')
