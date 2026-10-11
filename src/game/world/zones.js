// Sağlıktan Mahalle - açık dünya bölgeleri (game-spec §7 + EK v1.2 §E ölçüleri).
// Saf JS: Node'daki doğrulama betiği (scripts/check-zones.mjs) de bu dosyayı içe aktarır.
//
// tiles: her satır bir y, her karakter bir x hücresi. Karo karakterleri
// (src/game/art/legend.js):
//   '.' çim (grass)            ',' çiçekli çim (grass_flowers)
//   '-' taş yol (path)         '#' desenli meydan taşı (plaza)
//   ':' kum (sand)             '~' su (water, yürünmez)
//   'w' ahşap iskele (wood)    'X' çim görünümlü ama yürünmez
// props: { key, x, y, rot?, to? } - key PROPS kaydından; rot=1 ayak izini
//   d×w yapar (scale(-1,1) ile aynalanır); `to` yalnızca gate_arch amblemi için.
//   Yazılı tabelası olan yerler (qa_cafe, library, post_office, checkin_*) rot 0.
// portals: { x, y, w, d, to, toSpawn, label } - ayak izine basan oyuncu `to`
//   bölgesine geçer ve orada toSpawn hücresinde başlar.
// places: [{ key, x, y, interact: {x, y} }] - Sağlıktan'a bağlı yerler ve mola
//   noktaları; interact = oyuncunun durduğu (yürünür) hücre.
// shopSpots (çarşı): tezgâhın önündeki hücre; oraya gelince mağaza açılır.
// houseDoors (mahalle): kapının önündeki hücre. Sıra, motorun evleri x'e göre
//   (kararlı) sıraladığı sırayla AYNIDIR; ilk kapı oyuncunun kendi evi.
// gardens (mahalle): [{ x, y, w, d, doorIndex }] iyilik bahçesi yatakları (yürünmez).
import { PROP_META, propFootprint } from '../art/propMeta.js'
import { BLOCKED_TILES } from '../art/legend.js'

// ------------------------------------------------------------------ çizim yardımcıları
function canvas(w, h, ch = '.') {
  return Array.from({ length: h }, () => Array(w).fill(ch))
}
function rect(g, x, y, w, h, ch) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && g[j][i] !== undefined) g[j][i] = ch
}
function ellipse(g, cx, cy, rx, ry, ch, inner = 0) {
  for (let y = 0; y < g.length; y++) {
    for (let x = 0; x < g[0].length; x++) {
      const d = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry)
      if (d <= 1 && d >= inner) g[y][x] = ch
    }
  }
}
function dots(g, list, ch = ',') {
  for (const [x, y] of list) if (g[y] && g[y][x] === '.') g[y][x] = ch
}
const done = (g) => g.map((r) => r.join(''))

// ------------------------------------------------------------------ MEYDAN 26×26
function meydanTiles() {
  const g = canvas(26, 26)
  rect(g, 11, 0, 3, 26, '-')
  rect(g, 0, 11, 26, 3, '-')
  ellipse(g, 12.5, 12.5, 7.8, 7.8, '#')
  rect(g, 15, 6, 6, 2, '#') // kahve önü
  rect(g, 6, 6, 4, 2, '#') // pano önü
  rect(g, 16, 16, 6, 3, '#') // çay ocağı önü
  dots(g, [[2, 2], [3, 6], [6, 2], [20, 22], [22, 19], [5, 19], [3, 21], [7, 23], [21, 3], [23, 8], [18, 2], [2, 17], [24, 17], [17, 23], [8, 2]])
  return done(g)
}

const meydan = {
  key: 'meydan',
  name: 'Meydan',
  width: 26,
  height: 26,
  tiles: meydanTiles(),
  props: [
    { key: 'gate_arch', x: 0, y: 12, rot: 1, to: 'park' },
    { key: 'gate_arch', x: 12, y: 0, to: 'carsi' },
    { key: 'gate_arch', x: 25, y: 12, rot: 1, to: 'sahil' },
    { key: 'gate_arch', x: 12, y: 25, to: 'mahalle' },
    { key: 'fountain', x: 11, y: 11 },
    // çeşme çevresi oturma halkası
    { key: 'bench', x: 8, y: 9 },
    { key: 'bench', x: 15, y: 9 },
    { key: 'bench', x: 8, y: 14, rot: 1 },
    { key: 'bench', x: 8, y: 7, rot: 1 },
    { key: 'flowerbed', x: 10, y: 9 },
    { key: 'flowerbed', x: 14, y: 9 },
    { key: 'flowerbed', x: 9, y: 16 },
    { key: 'flowerbed', x: 15, y: 16 },
    // Soru-Cevap Kahvesi ve önündeki masalar
    { key: 'qa_cafe', x: 16, y: 4 },
    { key: 'tea_table', x: 15, y: 7 },
    { key: 'tea_table', x: 20, y: 7 },
    { key: 'lamp_post', x: 21, y: 5 },
    // Mahalle Panosu
    { key: 'notice_board', x: 7, y: 5 },
    { key: 'bench', x: 5, y: 6 },
    { key: 'lamp_post', x: 9, y: 5 },
    // çay ocağı köşesi
    { key: 'tea_kiosk', x: 18, y: 14 },
    { key: 'tea_table', x: 17, y: 17 },
    { key: 'tea_table', x: 20, y: 17 },
    { key: 'simit_cart', x: 10, y: 18 },
    { key: 'signpost', x: 14, y: 18 },
    // köşe bahçeleri: çınarlar, ağaçlar
    { key: 'cinar', x: 2, y: 2 },
    { key: 'cinar', x: 21, y: 21 },
    { key: 'cinar', x: 3, y: 20 },
    { key: 'cinar', x: 22, y: 1 },
    { key: 'tree_round', x: 6, y: 1 },
    { key: 'tree_round', x: 1, y: 7 },
    { key: 'tree_round', x: 24, y: 8 },
    { key: 'tree_round', x: 18, y: 23 },
    { key: 'tree_round', x: 7, y: 23 },
    { key: 'pine', x: 0, y: 16 },
    { key: 'pine', x: 25, y: 18 },
    { key: 'pine', x: 16, y: 1 },
    { key: 'pine', x: 9, y: 24 },
    { key: 'bush', x: 4, y: 9 },
    { key: 'bush', x: 21, y: 9 },
    { key: 'bush', x: 5, y: 16 },
    { key: 'bush', x: 23, y: 15 },
    { key: 'bush', x: 15, y: 23 },
    { key: 'flowerbed', x: 2, y: 9 },
    { key: 'flowerbed', x: 23, y: 10 },
    { key: 'flowerbed', x: 4, y: 23 },
    { key: 'flowerbed', x: 20, y: 24 },
    // cadde fenerleri
    { key: 'lamp_post', x: 10, y: 3 },
    { key: 'lamp_post', x: 14, y: 3 },
    { key: 'lamp_post', x: 10, y: 22 },
    { key: 'lamp_post', x: 14, y: 22 },
    { key: 'lamp_post', x: 3, y: 10 },
    { key: 'lamp_post', x: 3, y: 14 },
    { key: 'lamp_post', x: 22, y: 10 },
    { key: 'lamp_post', x: 22, y: 14 },
    { key: 'cat_sleeping', x: 4, y: 15 },
    { key: 'bicycle', x: 21, y: 19 },
    { key: 'rock', x: 1, y: 24 },
  ],
  spawn: { x: 13, y: 16 },
  portals: [
    { x: 0, y: 12, w: 1, d: 2, to: 'park', toSpawn: { x: 27, y: 14 }, label: 'Park' },
    { x: 12, y: 0, w: 2, d: 1, to: 'carsi', toSpawn: { x: 13, y: 20 }, label: 'Çarşı' },
    { x: 25, y: 12, w: 1, d: 2, to: 'sahil', toSpawn: { x: 1, y: 8 }, label: 'Sahil' },
    { x: 12, y: 25, w: 2, d: 1, to: 'mahalle', toSpawn: { x: 1, y: 6 }, label: 'Mahalle' },
  ],
  places: [
    { key: 'fountain', x: 11, y: 11, interact: { x: 12, y: 14 } },
    { key: 'qa_cafe', x: 16, y: 4, interact: { x: 18, y: 6 } },
    { key: 'notice_board', x: 7, y: 5, interact: { x: 7, y: 6 } },
    { key: 'tea_table', x: 15, y: 7, interact: { x: 15, y: 8 } },
    { key: 'tea_table', x: 20, y: 7, interact: { x: 20, y: 8 } },
  ],
  ambience: { sky: '#D7EEF3', ground: '#AEDB8E' },
}

// ------------------------------------------------------------------ PARK 30×30
function parkTiles() {
  const g = canvas(30, 30)
  // göl çevresi yürüyüş halkası (2 kare genişliğinde)
  ellipse(g, 14.5, 15.5, 10.6, 9.2, '-', 0.82)
  ellipse(g, 14.5, 15.5, 8.6, 7.4, '.')
  ellipse(g, 14.5, 15.5, 7.2, 5.8, ':') // kumlu kıyı
  ellipse(g, 14.5, 15.5, 6.2, 4.8, '~')
  // ahşap köprü göl üstünden
  rect(g, 8, 15, 13, 2, 'w')
  // doğu girişi
  rect(g, 23, 14, 7, 2, '-')
  // kuzeybatı çiçek bahçesi ve piknik çayırı yolları
  rect(g, 4, 3, 2, 4, '-')
  rect(g, 4, 3, 7, 2, '-')
  rect(g, 18, 25, 2, 5, '-')
  rect(g, 18, 27, 8, 2, '-')
  dots(g, [[2, 9], [3, 11], [1, 20], [6, 25], [8, 27], [12, 2], [14, 3], [22, 3], [26, 8], [27, 22], [24, 26], [11, 26], [2, 27], [27, 4], [7, 9], [21, 9], [9, 22], [20, 22]])
  rect(g, 7, 1, 4, 2, ',')
  return done(g)
}

const park = {
  key: 'park',
  name: 'Park',
  width: 30,
  height: 30,
  tiles: parkTiles(),
  props: [
    { key: 'gate_arch', x: 29, y: 14, rot: 1, to: 'meydan' },
    // "Bugün nasılsın?" bankı göle bakar
    { key: 'checkin_bench', x: 13, y: 4 },
    { key: 'bench', x: 9, y: 5 },
    { key: 'bench', x: 17, y: 5 },
    { key: 'bench', x: 2, y: 14, rot: 1 },
    { key: 'bench', x: 2, y: 17, rot: 1 },
    { key: 'lamp_post', x: 12, y: 4 },
    { key: 'lamp_post', x: 16, y: 4 },
    { key: 'lamp_post', x: 3, y: 12 },
    { key: 'lamp_post', x: 3, y: 20 },
    { key: 'lamp_post', x: 24, y: 13 },
    { key: 'lamp_post', x: 24, y: 16 },
    { key: 'lamp_post', x: 22, y: 24 },
    // göl kıyısı: sazlıklı gölet, kayalar, kayık
    { key: 'pond', x: 22, y: 4 },
    { key: 'rowboat', x: 11, y: 18 },
    { key: 'rock', x: 9, y: 12 },
    { key: 'rock', x: 20, y: 19 },
    { key: 'bush', x: 8, y: 19 },
    { key: 'bush', x: 21, y: 11 },
    // kuzeybatı çiçek bahçesi
    { key: 'flowerbed', x: 1, y: 2 },
    { key: 'flowerbed', x: 2, y: 2 },
    { key: 'flowerbed', x: 1, y: 5 },
    { key: 'flowerbed', x: 2, y: 5 },
    { key: 'flowerbed', x: 7, y: 5 },
    { key: 'flowerbed', x: 12, y: 1 },
    { key: 'cat_sleeping', x: 6, y: 1 },
    // güney piknik çayırı
    { key: 'tea_table', x: 21, y: 25 },
    { key: 'tea_table', x: 24, y: 25 },
    { key: 'tea_table', x: 21, y: 21 },
    { key: 'bench', x: 14, y: 26 },
    { key: 'bicycle', x: 17, y: 24 },
    // ağaçlar
    { key: 'cinar', x: 25, y: 20 },
    { key: 'cinar', x: 2, y: 25 },
    { key: 'cinar', x: 26, y: 1 },
    { key: 'cinar', x: 0, y: 8 },
    { key: 'tree_round', x: 6, y: 9 },
    { key: 'tree_round', x: 22, y: 9 },
    { key: 'tree_round', x: 5, y: 22 },
    { key: 'tree_round', x: 9, y: 27 },
    { key: 'tree_round', x: 27, y: 10 },
    { key: 'tree_round', x: 27, y: 27 },
    { key: 'tree_round', x: 19, y: 1 },
    { key: 'tree_round', x: 0, y: 21 },
    { key: 'pine', x: 0, y: 0 },
    { key: 'pine', x: 4, y: 28 },
    { key: 'pine', x: 13, y: 28 },
    { key: 'pine', x: 28, y: 6 },
    { key: 'pine', x: 28, y: 24 },
    { key: 'pine', x: 16, y: 0 },
    { key: 'pine', x: 8, y: 0 },
    { key: 'bush', x: 11, y: 26 },
    { key: 'bush', x: 26, y: 18 },
    { key: 'bush', x: 1, y: 11 },
    { key: 'flowerbed', x: 26, y: 12 },
    { key: 'flowerbed', x: 26, y: 17 },
    { key: 'signpost', x: 26, y: 16 },
  ],
  spawn: { x: 27, y: 15 },
  portals: [{ x: 29, y: 14, w: 1, d: 2, to: 'meydan', toSpawn: { x: 1, y: 13 }, label: 'Meydan' }],
  places: [{ key: 'checkin_bench', x: 13, y: 4, interact: { x: 14, y: 5 } }],
  ambience: { sky: '#DDF1E4', ground: '#A6D686' },
}

// ------------------------------------------------------------------ ÇARŞI 26×22
function carsiTiles() {
  const g = canvas(26, 22)
  rect(g, 11, 0, 4, 22, '#') // ana çarşı caddesi
  rect(g, 1, 8, 24, 3, '#') // ara sokak
  rect(g, 1, 7, 24, 1, '-') // tezgâh altı
  rect(g, 10, 1, 1, 6, '-')
  rect(g, 10, 11, 1, 10, '-')
  rect(g, 15, 16, 7, 2, '#') // kütüphane meydancığı
  rect(g, 2, 13, 7, 6, '-') // çay bahçesi
  rect(g, 19, 19, 7, 3, '-') // çay ocağı önü
  dots(g, [[1, 2], [4, 4], [7, 1], [18, 2], [22, 4], [24, 13], [20, 11], [1, 20], [6, 20], [16, 20], [23, 1], [3, 11]])
  return done(g)
}

const carsi = {
  key: 'carsi',
  name: 'Çarşı',
  width: 26,
  height: 22,
  tiles: carsiTiles(),
  props: [
    { key: 'gate_arch', x: 12, y: 21, to: 'meydan' },
    // ara sokağın kuzeyindeki tezgâhlar (güneye bakar)
    { key: 'market_stall_fabric', x: 2, y: 7 },
    { key: 'market_stall_produce', x: 5, y: 7 },
    { key: 'market_stall_spice', x: 8, y: 7 },
    { key: 'market_stall_furniture', x: 16, y: 7 },
    { key: 'market_stall_spice', x: 19, y: 7 },
    { key: 'market_stall_produce', x: 22, y: 7 },
    // ana caddenin batısındaki tezgâhlar (doğuya bakar)
    { key: 'market_stall_produce', x: 10, y: 1, rot: 1 },
    { key: 'market_stall_spice', x: 10, y: 4, rot: 1 },
    { key: 'market_stall_produce', x: 10, y: 12, rot: 1 },
    { key: 'market_stall_spice', x: 10, y: 15, rot: 1 },
    // kütüphane
    { key: 'library', x: 16, y: 12 },
    { key: 'flowerbed', x: 15, y: 15 },
    { key: 'flowerbed', x: 19, y: 15 },
    { key: 'bench', x: 17, y: 17 },
    // çay ocağı ve masalar
    { key: 'tea_kiosk', x: 21, y: 16 },
    { key: 'tea_table', x: 20, y: 20 },
    { key: 'tea_table', x: 23, y: 20 },
    // batı çay bahçesi
    { key: 'cinar', x: 4, y: 14 },
    { key: 'tea_table', x: 2, y: 13 },
    { key: 'tea_table', x: 7, y: 13 },
    { key: 'tea_table', x: 3, y: 17 },
    { key: 'tea_table', x: 7, y: 17 },
    { key: 'simit_cart', x: 9, y: 11 },
    { key: 'simit_cart', x: 15, y: 4 },
    // ağaçlar, fenerler
    { key: 'cinar', x: 2, y: 1 },
    { key: 'cinar', x: 20, y: 1 },
    { key: 'tree_round', x: 6, y: 2 },
    { key: 'tree_round', x: 17, y: 3 },
    { key: 'tree_round', x: 24, y: 4 },
    { key: 'tree_round', x: 1, y: 19 },
    { key: 'tree_round', x: 24, y: 12 },
    { key: 'bush', x: 8, y: 4 },
    { key: 'bush', x: 23, y: 14 },
    { key: 'bush', x: 8, y: 20 },
    { key: 'lamp_post', x: 15, y: 1 },
    { key: 'lamp_post', x: 15, y: 11 },
    { key: 'lamp_post', x: 10, y: 19 },
    { key: 'lamp_post', x: 1, y: 11 },
    { key: 'lamp_post', x: 24, y: 11 },
    { key: 'cat_sleeping', x: 22, y: 12 },
    { key: 'signpost', x: 15, y: 19 },
  ],
  spawn: { x: 13, y: 18 },
  portals: [{ x: 12, y: 21, w: 2, d: 1, to: 'meydan', toSpawn: { x: 12, y: 1 }, label: 'Meydan' }],
  // fabric tezgâhı (2,7) = giyim, furniture tezgâhı (16,7) = mobilya
  shopSpots: [
    { x: 3, y: 8, kind: 'clothing' },
    { x: 17, y: 8, kind: 'furniture' },
  ],
  places: [
    { key: 'library', x: 16, y: 12, interact: { x: 17, y: 15 } },
    { key: 'tea_table', x: 20, y: 20, interact: { x: 20, y: 19 } },
    { key: 'tea_table', x: 23, y: 20, interact: { x: 23, y: 19 } },
    { key: 'tea_table', x: 2, y: 13, interact: { x: 2, y: 14 } },
    { key: 'tea_table', x: 7, y: 13, interact: { x: 7, y: 14 } },
    { key: 'tea_table', x: 3, y: 17, interact: { x: 3, y: 18 } },
    { key: 'tea_table', x: 7, y: 17, interact: { x: 7, y: 18 } },
  ],
  ambience: { sky: '#F8EAD8', ground: '#AEDB8E' },
}

// ------------------------------------------------------------------ SAHİL 34×16
function sahilTiles() {
  const g = canvas(34, 16)
  rect(g, 9, 0, 2, 16, '-') // kordon
  rect(g, 0, 7, 9, 2, '-') // girişten kordona
  rect(g, 11, 0, 11, 16, ':')
  // girintili kıyı
  const coast = [20, 20, 21, 21, 20, 20, 21, 21, 21, 20, 19, 19, 20, 21, 21, 20]
  coast.forEach((cx, y) => rect(g, cx, y, 34 - cx, 1, '~'))
  rect(g, 20, 7, 10, 2, 'w') // mola iskelesi
  rect(g, 19, 12, 5, 2, 'w') // vapur iskelesi
  rect(g, 30, 1, 3, 2, ':') // fener adacığı
  dots(g, [[1, 1], [4, 3], [2, 11], [6, 13], [3, 15], [7, 5], [5, 10]])
  return done(g)
}

const sahil = {
  key: 'sahil',
  name: 'Sahil',
  width: 34,
  height: 16,
  tiles: sahilTiles(),
  props: [
    { key: 'gate_arch', x: 0, y: 7, rot: 1, to: 'meydan' },
    // mola iskelesinin ucu
    { key: 'checkin_pier', x: 30, y: 7 },
    { key: 'pier_post', x: 23, y: 6 },
    { key: 'pier_post', x: 27, y: 6 },
    { key: 'pier_post', x: 23, y: 9 },
    { key: 'pier_post', x: 27, y: 9 },
    // vapur
    { key: 'ferry', x: 20, y: 10 },
    { key: 'pier_post', x: 24, y: 12 },
    { key: 'pier_post', x: 24, y: 13 },
    { key: 'rowboat', x: 26, y: 14 },
    { key: 'rowboat', x: 25, y: 3 },
    // fener adacığı
    { key: 'lighthouse_small', x: 32, y: 1 },
    { key: 'rock', x: 30, y: 1 },
    { key: 'bush', x: 31, y: 2 },
    { key: 'pier_post', x: 30, y: 2 },
    { key: 'pier_post', x: 31, y: 1 },
    { key: 'pier_post', x: 32, y: 2 },
    // plaj
    { key: 'umbrella_beach', x: 12, y: 1 },
    { key: 'sun_lounger', x: 13, y: 1 },
    { key: 'sun_lounger', x: 14, y: 1 },
    { key: 'umbrella_beach', x: 16, y: 3 },
    { key: 'sun_lounger', x: 17, y: 3 },
    { key: 'umbrella_beach', x: 12, y: 11 },
    { key: 'sun_lounger', x: 13, y: 11 },
    { key: 'sun_lounger', x: 14, y: 11 },
    { key: 'umbrella_beach', x: 16, y: 13 },
    { key: 'sun_lounger', x: 17, y: 13 },
    { key: 'simit_cart', x: 11, y: 9 },
    { key: 'cat_sleeping', x: 18, y: 9 },
    // kordon: denize bakan banklar, fenerler
    { key: 'bench', x: 8, y: 1, rot: 1 },
    { key: 'bench', x: 8, y: 4, rot: 1 },
    { key: 'bench', x: 8, y: 10, rot: 1 },
    { key: 'bench', x: 8, y: 13, rot: 1 },
    { key: 'lamp_post', x: 8, y: 0 },
    { key: 'lamp_post', x: 8, y: 6 },
    { key: 'lamp_post', x: 8, y: 9 },
    { key: 'lamp_post', x: 8, y: 15 },
    // sahil parkı
    { key: 'tea_kiosk', x: 3, y: 2 },
    { key: 'tea_table', x: 2, y: 5 },
    { key: 'tea_table', x: 6, y: 4 },
    { key: 'cinar', x: 2, y: 11 },
    { key: 'tree_round', x: 0, y: 1 },
    { key: 'tree_round', x: 5, y: 14 },
    { key: 'pine', x: 0, y: 14 },
    { key: 'pine', x: 6, y: 0 },
    { key: 'bush', x: 0, y: 4 },
    { key: 'bush', x: 6, y: 11 },
    { key: 'flowerbed', x: 4, y: 9 },
    { key: 'flowerbed', x: 6, y: 9 },
    { key: 'signpost', x: 3, y: 9 },
  ],
  spawn: { x: 2, y: 8 },
  portals: [{ x: 0, y: 7, w: 1, d: 2, to: 'meydan', toSpawn: { x: 24, y: 13 }, label: 'Meydan' }],
  places: [{ key: 'checkin_pier', x: 30, y: 7, interact: { x: 29, y: 8 } }],
  ambience: { sky: '#D2ECF8', ground: '#F4E0AE' },
}

// ------------------------------------------------------------------ MAHALLE 34×14
const NORTH_HOUSES = [2, 6, 10, 14, 18, 22, 26]
const SOUTH_HOUSES = [4, 8, 12, 16, 20, 24, 28]
const HOUSE_KEYS = ['house_a', 'house_b', 'house_c', 'house_d']

function mahalleTiles() {
  const g = canvas(34, 14)
  rect(g, 0, 3, 34, 2, '#') // kuzey kaldırımı (kapılar)
  rect(g, 0, 5, 34, 3, '-') // sokak
  rect(g, 0, 8, 34, 1, '#') // güney kaldırımı
  rect(g, 0, 12, 34, 2, '#') // arka sokak (güney evlerinin kapıları)
  for (const x of [1, 5, 9, 13, 17, 21, 25, 29]) rect(g, x, 0, 1, 3, 'X') // ev araları (çit/çalı)
  for (const x of [7, 11, 15, 19, 23, 27]) rect(g, x, 9, 1, 3, '-') // güney evleri arası geçitler
  rect(g, 31, 9, 3, 3, '-')
  rect(g, 0, 9, 4, 3, '-')
  dots(g, [[33, 0], [32, 1]])
  return done(g)
}

function mahalleHouses() {
  const north = NORTH_HOUSES.map((x, i) => ({ key: HOUSE_KEYS[i % 4], x, y: 0 }))
  const south = SOUTH_HOUSES.map((x, i) => ({ key: HOUSE_KEYS[(i + 2) % 4], x, y: 9 }))
  return [...north, ...south]
}

// Motor evleri x'e göre kararlı sıralar (zoneSetup.js); kapı sırası da aynı.
function mahalleDoorsAndGardens(houses) {
  const sorted = houses.map((h, i) => ({ h, i })).sort((a, b) => a.h.x - b.h.x || a.i - b.i).map((q) => q.h)
  const houseDoors = sorted.map((h) => ({ x: h.x + 1, y: h.y + 3 }))
  const gardens = sorted.map((h, doorIndex) => ({ x: h.x + 2, y: h.y + 3, w: 2, d: 1, doorIndex }))
  return { houseDoors, gardens }
}

const MAHALLE_HOUSES = mahalleHouses()
const MAHALLE_DG = mahalleDoorsAndGardens(MAHALLE_HOUSES)

const mahalle = {
  key: 'mahalle',
  name: 'Mahalle sokağı',
  width: 34,
  height: 14,
  tiles: mahalleTiles(),
  props: [
    { key: 'gate_arch', x: 0, y: 5, rot: 1, to: 'meydan' },
    ...MAHALLE_HOUSES,
    { key: 'post_office', x: 30, y: 1 },
    { key: 'garden_gate', x: 2, y: 3 },
    // sokak fenerleri ve ağaçlar
    ...[5, 13, 21, 29].map((x) => ({ key: 'lamp_post', x, y: 4 })),
    ...[5, 13, 21, 29].map((x) => ({ key: 'lamp_post', x, y: 8 })),
    { key: 'bench', x: 31, y: 9, rot: 1 },
    { key: 'tree_round', x: 33, y: 10 },
    { key: 'bush', x: 1, y: 9 },
    { key: 'tree_round', x: 0, y: 10 },
    { key: 'mailbox', x: 32, y: 4 },
    { key: 'bicycle', x: 9, y: 8 },
    { key: 'cat_sleeping', x: 25, y: 8 },
    { key: 'signpost', x: 1, y: 4 },
    { key: 'tree_round', x: 33, y: 1 },
    ...[1, 5, 9, 13, 17, 21, 25, 29].map((x) => ({ key: 'bush', x, y: 2 })),
  ],
  spawn: { x: 2, y: 6 },
  portals: [{ x: 0, y: 5, w: 1, d: 2, to: 'meydan', toSpawn: { x: 12, y: 24 }, label: 'Meydan' }],
  houseDoors: MAHALLE_DG.houseDoors,
  gardens: MAHALLE_DG.gardens,
  places: [
    { key: 'post_office', x: 30, y: 1, interact: { x: 31, y: 3 } },
    { key: 'garden_gate', x: 2, y: 3, interact: { x: 2, y: 4 } },
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
// Su ve 'X' karoları, blocks:true nesnelerin ayak izi ve bahçe yatakları kapalı;
// kapılar her zaman açık.
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
  for (const g of zone.gardens || []) {
    for (let dy = 0; dy < g.d; dy++) for (let dx = 0; dx < g.w; dx++) if (grid[g.y + dy]?.[g.x + dx] !== undefined) grid[g.y + dy][g.x + dx] = false
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

// Hücre bir yerin etkileşim karesi mi?
export function placeAt(zone, x, y) {
  return zone.places?.find((p) => p.interact.x === x && p.interact.y === y) || null
}
