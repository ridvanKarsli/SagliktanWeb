// İzometrik koordinat sözleşmesi (game-spec §11). Tüm çizimler ve oyun motoru
// bu sabitleri/yardımcıları kullanır - burada değişen her şey spec'le birlikte değişmeli.

export const TILE_W = 64
export const TILE_H = 32
export const HALF_W = TILE_W / 2
export const HALF_H = TILE_H / 2

// Hücre (x,y) -> ekran: elmasın ÜST köşesi.
// Elmas: üst (sx,sy), sağ (sx+32,sy+16), alt (sx,sy+32), sol (sx-32,sy+16).
export function iso(x, y) {
  return { sx: (x - y) * HALF_W, sy: (x + y) * HALF_H }
}

// Hücre merkezi (karakterin ayak noktası).
export function isoCenter(x, y) {
  const { sx, sy } = iso(x, y)
  return { sx, sy: sy + HALF_H }
}

// w×d ayak izinin taban çokgeni: [üst, sağ, alt, sol] köşeleri.
// x,y verilmezse yerel koordinat (0,0 = ayak izinin üst köşesi).
export function footprintPolygon(w, d, x = 0, y = 0) {
  return [iso(x, y), iso(x + w, y), iso(x + w, y + d), iso(x, y + d)]
}

// [{sx,sy}] -> SVG points="..." metni.
export function toPoints(poly) {
  return poly.map(({ sx, sy }) => `${sx},${sy}`).join(' ')
}

// Ekran -> en yakın hücre (tıklama/dokunma için). Yuvarlamasız ondalık döner,
// çağıran Math.floor uygular.
export function screenToGrid(sx, sy) {
  const a = sx / HALF_W
  const b = sy / HALF_H
  return { x: (a + b) / 2, y: (b - a) / 2 }
}

// Derinlik sırası: (x + y) artan, eşitlikte x artan.
export function depthCompare(a, b) {
  return a.x + a.y - (b.x + b.y) || a.x - b.x
}
