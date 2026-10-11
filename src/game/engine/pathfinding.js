// Izgara üzerinde yol bulma: 4 yönlü A* (izometrikte 4 yön doğal görünür).
// grid[y][x] === true -> yürünebilir. Izgaralar küçük (en fazla 20×20),
// bu yüzden basit dizi tabanlı açık liste yeterli ve hızlı.

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export function inBounds(grid, x, y) {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length
}

export function isWalkable(grid, x, y) {
  return inBounds(grid, x, y) && grid[y][x] === true
}

// Hedef yürünemezse (ağaca dokunuldu vb.) ona en yakın yürünebilir hücre;
// eşitlikte `from`a yakın olan seçilir ki karakter "öbür taraf"a dolaşmasın.
export function nearestWalkable(grid, tx, ty, from) {
  if (isWalkable(grid, tx, ty)) return { x: tx, y: ty }
  const H = grid.length
  const W = grid[0].length
  const seen = new Set([`${tx},${ty}`])
  let frontier = [{ x: Math.max(0, Math.min(W - 1, tx)), y: Math.max(0, Math.min(H - 1, ty)) }]
  for (let ring = 0; ring < W + H && frontier.length; ring++) {
    const found = frontier.filter((c) => isWalkable(grid, c.x, c.y))
    if (found.length) {
      if (!from) return found[0]
      return found.reduce((best, c) =>
        Math.abs(c.x - from.x) + Math.abs(c.y - from.y) < Math.abs(best.x - from.x) + Math.abs(best.y - from.y) ? c : best)
    }
    const next = []
    for (const c of frontier) {
      for (const [dx, dy] of DIRS) {
        const nx = c.x + dx
        const ny = c.y + dy
        const k = `${nx},${ny}`
        if (!inBounds(grid, nx, ny) || seen.has(k)) continue
        seen.add(k)
        next.push({ x: nx, y: ny })
      }
    }
    frontier = next
  }
  return null
}

// A*: başlangıç hücresi yürünemez olsa da (sunucu ortaya koymuş olabilir)
// oradan çıkılabilir. Dönen yol başlangıcı İÇERMEZ, hedefi içerir.
// Yol yoksa null. Dönüş başına küçük ceza: zikzak yerine düz çizgiler.
export function findPath(grid, start, goal) {
  if (!inBounds(grid, goal.x, goal.y) || !isWalkable(grid, goal.x, goal.y)) return null
  if (start.x === goal.x && start.y === goal.y) return []
  const W = grid[0].length
  const idx = (x, y) => y * W + x
  const g = new Map()
  const came = new Map()
  const dirOf = new Map()
  const open = [{ x: start.x, y: start.y, f: 0 }]
  const startI = idx(start.x, start.y)
  g.set(startI, 0)
  const closed = new Set()
  const h = (x, y) => Math.abs(x - goal.x) + Math.abs(y - goal.y)
  while (open.length) {
    let bi = 0
    for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i
    const cur = open[bi]
    open.splice(bi, 1)
    const ci = idx(cur.x, cur.y)
    if (closed.has(ci)) continue
    if (cur.x === goal.x && cur.y === goal.y) {
      const path = []
      let k = ci
      while (k !== startI) {
        path.push({ x: k % W, y: Math.floor(k / W) })
        k = came.get(k)
      }
      return path.reverse()
    }
    closed.add(ci)
    for (let d = 0; d < 4; d++) {
      const [dx, dy] = DIRS[d]
      const nx = cur.x + dx
      const ny = cur.y + dy
      if (!isWalkable(grid, nx, ny)) continue
      const ni = idx(nx, ny)
      if (closed.has(ni)) continue
      const turn = dirOf.has(ci) && dirOf.get(ci) !== d ? 0.001 : 0
      const ng = g.get(ci) + 1 + turn
      if (ng < (g.get(ni) ?? Infinity)) {
        g.set(ni, ng)
        came.set(ni, ci)
        dirOf.set(ni, d)
        open.push({ x: nx, y: ny, f: ng + h(nx, ny) })
      }
    }
  }
  return null
}

// Yol yoksa yedek: düz çizgi boyunca birim adımlar (engelleri yok sayar).
export function straightPath(start, goal) {
  const path = []
  let { x, y } = start
  while (x !== goal.x || y !== goal.y) {
    const dx = goal.x - x
    const dy = goal.y - y
    if (Math.abs(dx) >= Math.abs(dy)) x += Math.sign(dx)
    else y += Math.sign(dy)
    path.push({ x, y })
  }
  return path
}

// Yol bul; bulunamazsa düz çizgi.
export function routeTo(grid, start, goal) {
  const target = nearestWalkable(grid, goal.x, goal.y, start) || goal
  return findPath(grid, start, target) || straightPath(start, target)
}
