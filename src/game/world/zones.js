// Sağlıktan Mahalle - açık dünya bölgeleri (game-spec §7). Saf JS: Node'daki
// doğrulama betiği (scripts/check-zones.mjs) de bu dosyayı içe aktarır.
//
// tiles: her satır bir y, her karakter bir x hücresi. Karo karakterleri
// (src/game/art/legend.js):
//   '.' çim (grass)            ',' çiçekli çim (grass_flowers)
//   '-' taş yol (path)         '#' desenli meydan taşı (plaza)
//   ':' kum (sand)             '~' su (water, yürünmez)
//   'w' ahşap iskele (wood)    'X' çim görünümlü ama yürünmez
// props: { key, x, y, rot?, to? } - key PROPS kaydından; rot=1 ayak izini
//   d×w yapar (scale(-1,1) ile aynalanır); `to` yalnızca gate_arch amblemi için.
// portals: { x, y, w, d, to, toSpawn, label } - ayak izine basan oyuncu `to`
//   bölgesine geçer ve orada toSpawn hücresinde başlar.
// shopSpots (yalnızca çarşı): tezgâhın önündeki hücre; oraya gelince mağaza açılır.
// houseDoors (yalnızca mahalle): kapının önündeki hücre; ilk kapı oyuncunun kendi evi,
//   diğerleri komşu listesini açar (arayüz kararı).
import { PROP_META, propFootprint } from '../art/propMeta.js'
import { BLOCKED_TILES } from '../art/legend.js'

const meydan = {
  key: 'meydan',
  name: 'Meydan',
  width: 16,
  height: 16,
  tiles: [
    '.,.....--....,..',
    '.......--.......',
    '..,....--.......',
    '....,..--.......',
    '.....######.....',
    '...,########,...',
    '....########....',
    '----########----',
    '----########----',
    '....########....',
    '...,########,...',
    '.....######.....',
    '.......--....,..',
    '..,....--.......',
    '.......--...,...',
    '.,.....--.......',
  ],
  props: [
    { key: 'gate_arch', x: 0, y: 7, rot: 1, to: 'park' },
    { key: 'gate_arch', x: 7, y: 0, to: 'carsi' },
    { key: 'gate_arch', x: 15, y: 7, rot: 1, to: 'sahil' },
    { key: 'gate_arch', x: 7, y: 15, to: 'mahalle' },
    { key: 'fountain', x: 6, y: 6 },
    { key: 'cinar', x: 1, y: 1 },
    { key: 'cinar', x: 12, y: 12 },
    { key: 'tea_kiosk', x: 11, y: 1 },
    { key: 'tea_table', x: 11, y: 3 },
    { key: 'tea_table', x: 13, y: 3 },
    { key: 'bench', x: 5, y: 4 },
    { key: 'bench', x: 9, y: 4 },
    { key: 'bench', x: 4, y: 5, rot: 1 },
    { key: 'bench', x: 4, y: 9, rot: 1 },
    { key: 'lamp_post', x: 4, y: 4 },
    { key: 'lamp_post', x: 11, y: 4 },
    { key: 'lamp_post', x: 4, y: 11 },
    { key: 'lamp_post', x: 11, y: 11 },
    { key: 'flowerbed', x: 2, y: 5 },
    { key: 'flowerbed', x: 2, y: 10 },
    { key: 'flowerbed', x: 13, y: 5 },
    { key: 'flowerbed', x: 13, y: 10 },
    { key: 'tree_round', x: 14, y: 1 },
    { key: 'tree_round', x: 1, y: 13 },
    { key: 'pine', x: 0, y: 4 },
    { key: 'pine', x: 15, y: 11 },
    { key: 'bush', x: 5, y: 1 },
    { key: 'bush', x: 10, y: 14 },
    { key: 'bush', x: 0, y: 11 },
    { key: 'bush', x: 15, y: 4 },
    { key: 'simit_cart', x: 6, y: 12 },
    { key: 'signpost', x: 9, y: 12 },
    { key: 'cat_sleeping', x: 3, y: 13 },
    { key: 'rock', x: 14, y: 15 },
  ],
  spawn: { x: 7, y: 10 },
  portals: [
    { x: 0, y: 7, w: 1, d: 2, to: 'park', toSpawn: { x: 15, y: 8 }, label: 'Park' },
    { x: 7, y: 0, w: 2, d: 1, to: 'carsi', toSpawn: { x: 6, y: 11 }, label: 'Çarşı' },
    { x: 15, y: 7, w: 1, d: 2, to: 'sahil', toSpawn: { x: 2, y: 5 }, label: 'Sahil' },
    { x: 7, y: 15, w: 2, d: 1, to: 'mahalle', toSpawn: { x: 2, y: 5 }, label: 'Mahalle' },
  ],
  ambience: { sky: '#D7EEF3', ground: '#AEDB8E' },
}

const park = {
  key: 'park',
  name: 'Park',
  width: 18,
  height: 18,
  tiles: [
    '..................',
    '.,.......,........',
    '.......,.....,....',
    '..,...........,...',
    '...----------.....',
    '...-,,......-.....',
    '...-,.......-..,..',
    '...-........-.....',
    '...-........------',
    '...-........------',
    '...-.,......-.....',
    '...-,,,.....-..,..',
    '...-........-.....',
    '...----------.....',
    '.,............,...',
    '......,...........',
    '..,.......,....,..',
    '..................',
  ],
  props: [
    { key: 'gate_arch', x: 17, y: 8, rot: 1, to: 'meydan' },
    { key: 'pond', x: 6, y: 7 },
    { key: 'bench', x: 6, y: 5 },
    { key: 'bench', x: 4, y: 7, rot: 1 },
    { key: 'rock', x: 10, y: 6 },
    { key: 'flowerbed', x: 5, y: 11 },
    { key: 'flowerbed', x: 9, y: 11 },
    { key: 'bush', x: 11, y: 10 },
    { key: 'cinar', x: 14, y: 1 },
    { key: 'cinar', x: 0, y: 14 },
    { key: 'tree_round', x: 1, y: 1 },
    { key: 'tree_round', x: 7, y: 1 },
    { key: 'tree_round', x: 10, y: 2 },
    { key: 'tree_round', x: 16, y: 4 },
    { key: 'tree_round', x: 16, y: 12 },
    { key: 'tree_round', x: 6, y: 15 },
    { key: 'tree_round', x: 12, y: 16 },
    { key: 'tree_round', x: 1, y: 9 },
    { key: 'pine', x: 0, y: 5 },
    { key: 'pine', x: 1, y: 11 },
    { key: 'pine', x: 9, y: 15 },
    { key: 'pine', x: 15, y: 15 },
    { key: 'pine', x: 17, y: 2 },
    { key: 'pine', x: 3, y: 16 },
    { key: 'bush', x: 2, y: 6 },
    { key: 'bush', x: 13, y: 5 },
    { key: 'bush', x: 13, y: 13 },
    { key: 'bush', x: 4, y: 2 },
    { key: 'bush', x: 11, y: 15 },
    { key: 'bush', x: 17, y: 16 },
    { key: 'lamp_post', x: 13, y: 7 },
    { key: 'lamp_post', x: 13, y: 10 },
    { key: 'lamp_post', x: 2, y: 4 },
    { key: 'flowerbed', x: 15, y: 7 },
    { key: 'flowerbed', x: 15, y: 10 },
    { key: 'bicycle', x: 9, y: 3 },
    { key: 'cat_sleeping', x: 2, y: 13 },
    { key: 'signpost', x: 16, y: 10 },
  ],
  spawn: { x: 15, y: 9 },
  portals: [{ x: 17, y: 8, w: 1, d: 2, to: 'meydan', toSpawn: { x: 1, y: 8 }, label: 'Meydan' }],
  ambience: { sky: '#DDF1E4', ground: '#A6D686' },
}

const carsi = {
  key: 'carsi',
  name: 'Çarşı',
  width: 14,
  height: 14,
  tiles: [
    '..,...........',
    '.....-##......',
    '...,.-##..,...',
    '.....-##......',
    '.-----##-----.',
    '.############.',
    '.############.',
    '......##......',
    '.....-##......',
    '..,..-##......',
    '......##...,..',
    '......##......',
    '.,....##......',
    '......##......',
  ],
  props: [
    { key: 'gate_arch', x: 6, y: 13, to: 'meydan' },
    { key: 'market_stall_fabric', x: 1, y: 4 },
    { key: 'market_stall_spice', x: 3, y: 4 },
    { key: 'market_stall_furniture', x: 9, y: 4 },
    { key: 'market_stall_produce', x: 11, y: 4 },
    { key: 'market_stall_produce', x: 5, y: 1, rot: 1 },
    { key: 'market_stall_spice', x: 5, y: 8, rot: 1 },
    { key: 'tea_kiosk', x: 10, y: 9 },
    { key: 'tea_table', x: 10, y: 11 },
    { key: 'tea_table', x: 12, y: 12 },
    { key: 'simit_cart', x: 8, y: 8 },
    { key: 'cinar', x: 11, y: 0 },
    { key: 'cinar', x: 1, y: 10 },
    { key: 'tree_round', x: 1, y: 1 },
    { key: 'tree_round', x: 12, y: 7 },
    { key: 'bush', x: 3, y: 0 },
    { key: 'bush', x: 9, y: 1 },
    { key: 'bush', x: 0, y: 7 },
    { key: 'bush', x: 13, y: 10 },
    { key: 'lamp_post', x: 8, y: 3 },
    { key: 'lamp_post', x: 5, y: 7 },
    { key: 'lamp_post', x: 8, y: 12 },
    { key: 'flowerbed', x: 4, y: 12 },
    { key: 'flowerbed', x: 3, y: 8 },
    { key: 'cat_sleeping', x: 9, y: 7 },
  ],
  spawn: { x: 6, y: 11 },
  portals: [{ x: 6, y: 13, w: 2, d: 1, to: 'meydan', toSpawn: { x: 7, y: 1 }, label: 'Meydan' }],
  // fabric tezgâhı (1,4) = giyim mağazası, furniture tezgâhı (9,4) = mobilya mağazası
  shopSpots: [
    { x: 2, y: 5, kind: 'clothing' },
    { x: 10, y: 5, kind: 'furniture' },
  ],
  ambience: { sky: '#F8EAD8', ground: '#AEDB8E' },
}

const sahil = {
  key: 'sahil',
  name: 'Sahil',
  width: 20,
  height: 12,
  tiles: [
    '......--::::~~~~~~~~',
    '.,....--:::::~~~~::~',
    '......--:::::~~~~::~',
    '..,...--:::::~~~~~~~',
    '......--:::::~~~~~~~',
    '--------:::::wwwwww~',
    '--------:::::wwwwww~',
    '......--::::::~~~~~~',
    '.,....--::::::~~~~~~',
    '......--:::::~~~~~~~',
    '..,...--:::::~~~~~~~',
    '......--::::~~~~~~~~',
  ],
  props: [
    { key: 'gate_arch', x: 0, y: 5, rot: 1, to: 'meydan' },
    { key: 'ferry', x: 14, y: 7 },
    { key: 'pier_post', x: 19, y: 5 },
    { key: 'pier_post', x: 19, y: 6 },
    { key: 'pier_post', x: 13, y: 4 },
    { key: 'pier_post', x: 16, y: 4 },
    { key: 'lighthouse_small', x: 18, y: 1 },
    { key: 'rock', x: 17, y: 2 },
    { key: 'bush', x: 18, y: 2 },
    { key: 'pier_post', x: 17, y: 1 },
    { key: 'rowboat', x: 15, y: 10 },
    { key: 'umbrella_beach', x: 9, y: 1 },
    { key: 'sun_lounger', x: 10, y: 1 },
    { key: 'umbrella_beach', x: 12, y: 3 },
    { key: 'umbrella_beach', x: 9, y: 8 },
    { key: 'sun_lounger', x: 10, y: 8 },
    { key: 'sun_lounger', x: 11, y: 8 },
    { key: 'bench', x: 5, y: 2, rot: 1 },
    { key: 'bench', x: 5, y: 8, rot: 1 },
    { key: 'lamp_post', x: 5, y: 4 },
    { key: 'lamp_post', x: 5, y: 7 },
    { key: 'lamp_post', x: 5, y: 10 },
    { key: 'simit_cart', x: 8, y: 3 },
    { key: 'tea_table', x: 3, y: 8 },
    { key: 'tree_round', x: 1, y: 1 },
    { key: 'pine', x: 0, y: 3 },
    { key: 'tree_round', x: 1, y: 9 },
    { key: 'pine', x: 3, y: 11 },
    { key: 'bush', x: 3, y: 2 },
    { key: 'bush', x: 4, y: 0 },
    { key: 'bush', x: 0, y: 8 },
    { key: 'signpost', x: 4, y: 4 },
    { key: 'cat_sleeping', x: 12, y: 10 },
  ],
  spawn: { x: 2, y: 6 },
  portals: [{ x: 0, y: 5, w: 1, d: 2, to: 'meydan', toSpawn: { x: 14, y: 8 }, label: 'Meydan' }],
  ambience: { sky: '#D2ECF8', ground: '#F4E0AE' },
}

const mahalle = {
  key: 'mahalle',
  name: 'Mahalle sokağı',
  width: 20,
  height: 10,
  tiles: [
    '.,..X...X...X...X...',
    '....X...X...X...X...',
    '....X...X...X...X...',
    '####################',
    '--------------------',
    '--------------------',
    '####################',
    '..,.......,.....,...',
    '.,....,.......,.....',
    '...,.........,....,.',
  ],
  props: [
    { key: 'gate_arch', x: 0, y: 4, rot: 1, to: 'meydan' },
    { key: 'house_a', x: 1, y: 0 },
    { key: 'house_b', x: 5, y: 0 },
    { key: 'house_c', x: 9, y: 0 },
    { key: 'house_d', x: 13, y: 0 },
    { key: 'house_b', x: 17, y: 0 },
    { key: 'bush', x: 4, y: 1 },
    { key: 'tree_round', x: 8, y: 0 },
    { key: 'bush', x: 12, y: 1 },
    { key: 'tree_round', x: 16, y: 0 },
    { key: 'mailbox', x: 4, y: 3 },
    { key: 'mailbox', x: 12, y: 3 },
    { key: 'flowerbed', x: 8, y: 3 },
    { key: 'flowerbed', x: 16, y: 3 },
    { key: 'lamp_post', x: 6, y: 6 },
    { key: 'lamp_post', x: 14, y: 6 },
    { key: 'signpost', x: 1, y: 6 },
    { key: 'bicycle', x: 11, y: 6 },
    { key: 'cat_sleeping', x: 18, y: 6 },
    { key: 'cinar', x: 9, y: 7 },
    { key: 'bench', x: 7, y: 7, rot: 1 },
    { key: 'tree_round', x: 3, y: 7 },
    { key: 'tree_round', x: 16, y: 7 },
    { key: 'pine', x: 12, y: 7 },
    { key: 'bush', x: 5, y: 8 },
    { key: 'bush', x: 14, y: 8 },
    { key: 'flowerbed', x: 1, y: 8 },
    { key: 'flowerbed', x: 18, y: 8 },
    ...[0, 1, 2, 3, 4, 5, 6].map((x) => ({ key: 'fence', x, y: 9 })),
    ...[13, 14, 15, 16, 17, 18, 19].map((x) => ({ key: 'fence', x, y: 9 })),
  ],
  spawn: { x: 2, y: 5 },
  portals: [{ x: 0, y: 4, w: 1, d: 2, to: 'meydan', toSpawn: { x: 7, y: 14 }, label: 'Meydan' }],
  // soldan sağa: house_a (oyuncunun kendi evi), sonra komşu kapıları
  houseDoors: [
    { x: 2, y: 3 },
    { x: 6, y: 3 },
    { x: 10, y: 3 },
    { x: 14, y: 3 },
    { x: 18, y: 3 },
  ],
  ambience: { sky: '#EAE6F8', ground: '#AEDB8E' },
}

export const ZONES = { meydan, park, carsi, sahil, mahalle }
export const ZONE_KEYS = Object.keys(ZONES)

// Ayak izi hücreleri (rot dikkate alınır)
export function propCells(p) {
  const fp = propFootprint(p.key, p.rot)
  if (!fp) return []
  const cells = []
  for (let dy = 0; dy < fp.d; dy++) for (let dx = 0; dx < fp.w; dx++) cells.push({ x: p.x + dx, y: p.y + dy })
  return cells
}

// grid[y][x] === true -> yürünebilir.
// Su ve 'X' karoları ile blocks:true nesnelerin ayak izi kapalı; kapılar her zaman açık.
export function buildWalkable(zone) {
  const grid = []
  for (let y = 0; y < zone.height; y++) {
    const row = []
    for (let x = 0; x < zone.width; x++) row.push(!BLOCKED_TILES.has(zone.tiles[y]?.[x]))
    grid.push(row)
  }
  for (const p of zone.props) {
    if (!PROP_META[p.key]?.blocks) continue
    for (const c of propCells(p)) if (grid[c.y]?.[c.x] !== undefined) grid[c.y][c.x] = false
  }
  for (const pt of zone.portals) {
    for (let dy = 0; dy < pt.d; dy++) for (let dx = 0; dx < pt.w; dx++) grid[pt.y + dy][pt.x + dx] = true
  }
  return grid
}

// Hücre bir kapının ayak izinde mi? (motor geçişi tetiklemek için)
export function portalAt(zone, x, y) {
  return zone.portals.find((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.d) || null
}
