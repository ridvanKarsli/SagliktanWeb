// Oturma / uzanma yerleri ve efekt bağlama noktaları (saf JS).
//
// Tüm ofsetler eşyanın YEREL koordinatında, rot=0 için verilmiştir:
//   (0,0) = ayak izinin üst köşesi = iso(item.x, item.y).
// Motor karakteri şuraya koyar:
//   sx = iso(item.x,item.y).sx + (rot ? -dx : dx)
//   sy = iso(item.x,item.y).sy + dy
//   flip = rot ? !flip : flip            (aynalanan eşyada bakış da aynalanır)
//   hücre = rot ? (item.x + cell.y, item.y + cell.x) : (item.x + cell.x, item.y + cell.y)
//   derinlik yuvası = item.x + item.y + depth   (karakter eşyadan SONRA çizilsin)
// <Character pose="sit" seatHeight={seatHeight} facing={facing} flip={flip} />
// stool:true ise motor aynı noktaya karakterden önce <SeatStool height={seatHeight} /> çizer
// (aynalanan eşyada tabure simetrik olduğu için ek işlem yok).
// Piyano ve masada oturma yeri ayak izinin ÖNÜNDEKİ hücrededir (cell.y = 1): o hücre boş olmalı.

const at = (u, v, h = 0) => ({ dx: Math.round((u - v) * 32 * 10) / 10, dy: Math.round(((u + v) * 16 - h) * 10) / 10 })

export const SEAT_OFFSETS = {
  // oda
  sofa: [
    { ...at(0.55, 0.62, 21), facing: 'front', flip: true, seatHeight: 26, cell: { x: 0, y: 0 }, depth: 1 },
    { ...at(1.45, 0.62, 21), facing: 'front', flip: true, seatHeight: 26, cell: { x: 1, y: 0 }, depth: 2 },
  ],
  armchair: [{ ...at(0.5, 0.6, 21), facing: 'front', flip: true, seatHeight: 26, cell: { x: 0, y: 0 }, depth: 1 }],
  chair: [{ ...at(0.5, 0.55, 24), facing: 'front', flip: true, seatHeight: 28, cell: { x: 0, y: 0 }, depth: 1 }],
  beanbag: [{ dx: 0, dy: 10, facing: 'front', flip: true, seatHeight: 10, cell: { x: 0, y: 0 }, depth: 1 }],
  piano: [{ ...at(1.0, 1.25, 16), facing: 'back', flip: false, seatHeight: 16, stool: true, cell: { x: 1, y: 1 }, depth: 2 }],
  desk: [{ ...at(0.75, 1.25, 18), facing: 'back', flip: false, seatHeight: 18, stool: true, cell: { x: 0, y: 1 }, depth: 2 }],
  // dünya
  bench: [
    { ...at(0.6, 0.58, 17), facing: 'front', flip: true, seatHeight: 21, cell: { x: 0, y: 0 }, depth: 1 },
    { ...at(1.4, 0.58, 17), facing: 'front', flip: true, seatHeight: 21, cell: { x: 1, y: 0 }, depth: 2 },
  ],
  tea_table: [
    { ...at(0.15, 0.55, 9), facing: 'front', flip: false, seatHeight: 11, cell: { x: 0, y: 0 }, depth: 1 },
    { ...at(0.85, 0.5, 7), facing: 'back', flip: true, seatHeight: 11, cell: { x: 0, y: 0 }, depth: 1 },
  ],
}

// Uzanma: (0,0) = kalça noktası; gövde ızgaranın +y yönüne yatar (rot=1'de +x).
// <Character pose="lie" flip={flip} />
export const LIE_OFFSETS = {
  bed: [
    { ...at(0.55, 1.32, 25), flip: false, cell: { x: 0, y: 1 }, depth: 2 },
    { ...at(1.45, 1.32, 25), flip: false, cell: { x: 1, y: 1 }, depth: 2 },
  ],
  sun_lounger: [{ ...at(0.5, 1.25, 14), flip: false, cell: { x: 0, y: 1 }, depth: 1 }],
}

// Efektlerin eşya üzerindeki çıkış noktaları (yerel, rot=0; rot=1'de dx negatiflenir
// ve efekt de scale(-1,1) İLE ÇİZİLMEZ - efektler hep düz kalır).
export const FX_ANCHORS = {
  radio: { ...at(0.5, 0.45, 50), fx: 'MusicNotes' },
  piano: { ...at(1.2, 0.3, 64), fx: 'MusicNotes' },
  tv: { ...at(1.0, 0.4, 60), fx: null, glow: 'TvGlow' },
  aquarium: { ...at(0.5, 0.5, 56), fx: 'Bubbles' },
  fireplace: { ...at(1.0, 0.55, 36), fx: 'Sparkle' },
  floor_lamp: { dx: 0, dy: -56, fx: null },
  cat_bed: { dx: 0, dy: 2, fx: 'Hearts' },
  flower_vase: { dx: 0, dy: -34, fx: 'Sparkle' },
  easel: { ...at(0.5, 0.55, 58), fx: 'PaintStrokes' },
  bookshelf: { ...at(0.5, 0.5, 80), fx: null },
  // dünya
  fountain: { ...at(1.5, 1.5, 64), fx: 'Sparkle' },
  cat_sleeping: { dx: 0, dy: 4, fx: 'Hearts' },
  bed: { ...at(1, 0.4, 44), fx: 'Zzz' },
  sun_lounger: { ...at(0.5, 0.4, 34), fx: 'Zzz' },
}

// Karakter üzerindeki bağlama noktaları (karakter yerelinde; flip'te x negatiflenir).
// Erkek bedende baş MALE_LIFT (4 px) daha yukarıdadır: y -= MALE_LIFT (lie'da x += 3).
// head: baş üstü (Zzz, Hearts, MusicNotes için), hand: sağ el.
export const CHAR_ANCHORS = {
  stand: { head: { x: 0, y: -82 }, hand: { x: 13, y: -25 } },
  sit: { head: { x: 0, y: -61 }, hand: { x: 13, y: -5 } },
  lie: { head: { x: 32, y: -30 }, hand: null },
}
