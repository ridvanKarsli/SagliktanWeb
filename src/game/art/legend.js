// Bölge haritalarındaki karo karakterleri (zones.js `tiles` satırları).
// Bir karakter = bir hücre. Saf JS: Node betikleri de içe aktarır.

export const TILE_LEGEND = {
  '.': 'grass',
  ',': 'grass_flowers',
  '-': 'path',
  '#': 'plaza',
  ':': 'sand',
  '~': 'water',
  w: 'wood',
  X: 'grass', // görünüşte çim ama yürünmez (sınır/çalılık arkası)
}

// Yürünemeyen karo karakterleri.
export const BLOCKED_TILES = new Set(['~', 'X'])
