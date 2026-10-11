// Oda ızgarası ve yerleştirme kuralları (sunucu da aynısını doğrular,
// bkz. game-api.md "Yerleşim kuralları").
import { FURNITURE } from '../art/index.js'
import { nearestWalkable } from './pathfinding.js'

export const ROOM_SIZE = 8
export const MAX_PLACEMENTS = 40
// Sol duvardaki kapının önü (duvar kapısı v≈6.3–7.5): çıkış ve varış karesi
export const ROOM_DOOR = { x: 0, y: 7 }
export const ROOM_SPAWN = { x: 1, y: 6 }

export function footprintOf(item) {
  const f = FURNITURE[item.itemKey]
  if (!f) return { w: 1, d: 1 }
  return item.rot ? { w: f.d, d: f.w } : { w: f.w, d: f.d }
}

export const isFloorItem = (item) => !!FURNITURE[item.itemKey]?.floor

export function cellsOf(item) {
  const { w, d } = footprintOf(item)
  const out = []
  for (let dy = 0; dy < d; dy++) for (let dx = 0; dx < w; dx++) out.push({ x: item.x + dx, y: item.y + dy })
  return out
}

export function roomWalkable(items) {
  const grid = Array.from({ length: ROOM_SIZE }, () => Array(ROOM_SIZE).fill(true))
  for (const it of items) {
    if (isFloorItem(it)) continue
    for (const c of cellsOf(it)) if (grid[c.y]?.[c.x] !== undefined) grid[c.y][c.x] = false
  }
  return grid
}

// Yerleşim geçerli mi? ignoreIndex: taşınan/döndürülen eşyanın kendi kaydı.
export function checkPlacement(items, cand, { ignoreIndex = -1, owned = Infinity } = {}) {
  const { w, d } = footprintOf(cand)
  if (cand.x < 0 || cand.y < 0 || cand.x + w > ROOM_SIZE || cand.y + d > ROOM_SIZE) {
    return { ok: false, reason: 'Odanın dışına taşıyor' }
  }
  const floor = isFloorItem(cand)
  const mine = new Set(cellsOf(cand).map((c) => `${c.x},${c.y}`))
  for (let i = 0; i < items.length; i++) {
    if (i === ignoreIndex) continue
    const other = items[i]
    if (isFloorItem(other) !== floor) continue // halı zemin katmanı: diğer eşyalarla çakışabilir
    if (cellsOf(other).some((c) => mine.has(`${c.x},${c.y}`))) {
      return { ok: false, reason: 'Burada başka bir eşya var' }
    }
  }
  const placed = items.filter((it, i) => i !== ignoreIndex && it.itemKey === cand.itemKey).length
  if (placed + 1 > owned) return { ok: false, reason: 'Bu eşyadan elinde kalmadı' }
  const total = items.length - (ignoreIndex >= 0 ? 1 : 0) + 1
  if (total > MAX_PLACEMENTS) return { ok: false, reason: `En fazla ${MAX_PLACEMENTS} eşya yerleştirebilirsin` }
  return { ok: true }
}

// Yeni eşya için ilk uygun yer (önce orta, sonra tarama)
export function findFreeSpot(items, itemKey, rot = 0, owned = Infinity) {
  const order = []
  for (let r = 0; r < ROOM_SIZE; r++) for (let y = 0; y < ROOM_SIZE; y++) for (let x = 0; x < ROOM_SIZE; x++) {
    if (Math.max(Math.abs(x - 3), Math.abs(y - 3)) === r) order.push({ x, y })
  }
  for (const c of order) {
    const cand = { itemKey, x: c.x, y: c.y, rot }
    if (checkPlacement(items, cand, { owned }).ok) return cand
  }
  return { itemKey, x: 3, y: 3, rot }
}

export function safeCell(grid, cell) {
  return nearestWalkable(grid, cell.x, cell.y, cell) || cell
}
