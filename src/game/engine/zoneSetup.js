// Bölge başına bir kez hesaplanan sahne verisi: yürünebilirlik ızgarası,
// kamera sınırları, çizilecek nesneler ve dokunulabilir nesnelerin eylemleri.
import { PROPS, propFootprint } from '../art/index.js'
import { buildWalkable, portalAt } from '../world/zones.js'
import { WORLD_INTERACTIVE } from './interactions.js'

const cache = new Map()

// Bölgenin ekran kutusu (elmasın çevreleyen dikdörtgeni + ön kenar kalınlığı;
// üstte uzun nesneler için pay).
export function worldBounds(width, height) {
  return {
    minX: -height * 32,
    maxX: width * 32,
    minY: -60,
    maxY: (width + height) * 16 + 18,
  }
}

function actionFor(zone, p, houseIndex) {
  if (p.key === 'gate_arch') {
    const portal = portalAt(zone, p.x, p.y)
    return portal ? { type: 'portal', spot: { x: p.x, y: p.y }, portal } : null
  }
  if (zone.key === 'carsi' && p.key === 'market_stall_fabric') {
    const s = zone.shopSpots?.find((x) => x.kind === 'clothing')
    return s ? { type: 'shop', tab: 'clothing', spot: { x: s.x, y: s.y } } : null
  }
  if (zone.key === 'carsi' && p.key === 'market_stall_furniture') {
    const s = zone.shopSpots?.find((x) => x.kind === 'furniture')
    return s ? { type: 'shop', tab: 'furniture', spot: { x: s.x, y: s.y } } : null
  }
  if (p.key.startsWith('house_') && zone.houseDoors && houseIndex >= 0) {
    const door = zone.houseDoors[houseIndex]
    return door ? { type: 'door', index: houseIndex, spot: door } : null
  }
  if (p.key === 'signpost') return { type: 'hint' }
  return null
}

export function setupFor(zone) {
  if (cache.has(zone.key)) return cache.get(zone.key)
  const houses = zone.props.filter((p) => p.key.startsWith('house_')).sort((a, b) => a.x - b.x)
  const objects = zone.props.map((p) => {
    const fp = propFootprint(p.key, p.rot) || { w: 1, d: 1 }
    const action = actionFor(zone, p, houses.indexOf(p))
    return {
      key: p.key,
      x: p.x,
      y: p.y,
      rot: p.rot || 0,
      w: fp.w,
      d: fp.d,
      Component: PROPS[p.key]?.Component || (() => null),
      props: p.key === 'gate_arch' ? { to: p.to } : undefined,
      action,
      interact: WORLD_INTERACTIVE.has(p.key),
      tappable: !!action || WORLD_INTERACTIVE.has(p.key),
    }
  })
  const s = {
    grid: buildWalkable(zone),
    bounds: worldBounds(zone.width, zone.height),
    objects,
    maxDepth: zone.width + zone.height,
  }
  cache.set(zone.key, s)
  return s
}

// Ayak basılan hücrenin özel anlamı (kapı, mağaza noktası, ev kapısı)
export function cellMeaning(zone, x, y) {
  const portal = portalAt(zone, x, y)
  if (portal) return { type: 'portal', portal }
  const shop = zone.shopSpots?.find((s) => s.x === x && s.y === y)
  if (shop) return { type: 'shop', tab: shop.kind }
  const di = zone.houseDoors?.findIndex((d) => d.x === x && d.y === y) ?? -1
  if (di >= 0) return { type: 'door', index: di }
  return null
}
