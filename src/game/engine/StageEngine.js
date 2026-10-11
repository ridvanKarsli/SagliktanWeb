// Sahne motoru: karakterlerin yol boyunca yürümesi, derinlik yuvaları ve
// kamera. React'ten bağımsız, tek bir requestAnimationFrame döngüsü.
//
// Neden React state değil: 30 karakter saniyede 4 kare adım atarken her
// karede React render'ı tüm sahneyi yeniden çizer. Burada karakterler
// yalnızca kendi <g> öğelerinin transform özniteliği değiştirilerek taşınır;
// React yalnızca duruş (önden/arkadan, yürüyor mu) değişince, kare başına
// değil ADIM başına, o tek karakteri yeniden çizer.
//
// Derinlik: nesne katmanı (ObjectLayer) her tam sayı derinlik d = x+y için
// boş bir <g data-slot=d> "yuva" bırakır. Karakterin kendi <g>'si (host)
// bulunduğu hücrenin derinliğindeki yuvaya taşınır; böylece ağacın arkasında
// kalan karakteri ağaç örter, önündekini örtmez.
import { isoCenter, screenToGrid } from '../art/iso.js'
import { routeTo } from './pathfinding.js'

const SPEED = 4 // kare/sn
const PET_GAP = 0.9 // evcil dost ile sahibi arası (kare)
const CAMERA_EASE = 6
// Ad etiketi çakışması: üst üste binen etiketler bu kadar yukarı kaydırılır.
const LABEL_H = 19
const LABEL_STEP = 20
const LABEL_MAX_STACK = 4
// Bu sayıdan kalabalıksa yalnızca bana yakın (LABEL_NEAR kare) etiketler görünür.
const LABEL_CROWD = 16
const LABEL_NEAR = 5

const SVGNS = 'http://www.w3.org/2000/svg'

export function createHost() {
  return typeof document === 'undefined' ? null : document.createElementNS(SVGNS, 'g')
}

function poseFor(dx, dy, prev) {
  if (dx > 0) return { facing: 'front', flip: false }
  if (dy > 0) return { facing: 'front', flip: true }
  if (dx < 0) return { facing: 'back', flip: true }
  if (dy < 0) return { facing: 'back', flip: false }
  return { facing: prev.facing, flip: prev.flip }
}

export class StageEngine {
  constructor({ reducedMotion = false } = {}) {
    this.reducedMotion = reducedMotion
    this.grid = null
    this.actors = new Map()
    this.slotEls = []
    this.raf = 0
    this.last = 0
    this.onArrive = null
    this.onStep = null
    // kamera
    this.cameraEl = null
    this.view = { w: 390, h: 700 }
    this.zoom = 1
    this.cam = { x: 0, y: 0 }
    this.pan = { x: 0, y: 0 }
    this.follow = null
    this.fixedCenter = null
    this.bounds = null
    this.cameraSettled = false
    this.focusOffset = 0 // ekranın altını bir kart kaplıyorsa karakter o kadar yukarıda dursun (px)
    this.tick = this.tick.bind(this)
  }

  // ------------------------------------------------------------ sahne
  reset({ grid, bounds, fixedCenter = null }) {
    this.grid = grid
    this.bounds = bounds || null
    this.fixedCenter = fixedCenter
    this.pan = { x: 0, y: 0 }
    for (const a of this.actors.values()) {
      a.host?.remove()
      a.petHost?.remove()
    }
    this.actors.clear()
    this.slotEls = []
    this.cameraSettled = false
  }

  setGrid(grid) {
    this.grid = grid
  }

  setSlots(els) {
    this.slotEls = els || []
    for (const a of this.actors.values()) {
      a.slot = -1
      a.petSlot = -1
      this.render(a)
    }
  }

  slotFor(depth) {
    const n = this.slotEls.length
    if (!n) return null
    return this.slotEls[Math.max(0, Math.min(n - 1, Math.round(depth)))]
  }

  // ------------------------------------------------------------ kamera
  setCameraEl(el) {
    this.cameraEl = el
    this.applyCamera()
  }

  setViewport(w, h) {
    this.view = { w, h }
    this.applyCamera()
    this.kick()
  }

  setZoom(z) {
    this.zoom = z
    this.applyCamera()
    this.kick()
  }

  setFollow(id) {
    this.follow = id
    this.cameraSettled = false
    this.kick()
  }

  // Sürükleyerek kaydırma (ekran pikseli); takip hedefinden sapma olarak tutulur.
  panBy(dx, dy) {
    this.pan.x -= dx / this.zoom
    this.pan.y -= dy / this.zoom
    const t = this.cameraTarget(true)
    this.cam = t
    this.applyCamera()
  }

  setFocusOffset(px) {
    if (this.focusOffset === px) return
    this.focusOffset = px
    this.kick()
  }

  recenter() {
    this.pan = { x: 0, y: 0 }
    this.kick()
  }

  cameraTarget(clampPan = false) {
    let x = 0
    let y = 0
    const f = this.follow && this.actors.get(this.follow)
    if (this.fixedCenter) ({ x, y } = this.fixedCenter)
    else if (f) {
      const c = isoCenter(f.pos.x, f.pos.y)
      x = c.sx
      y = c.sy - 34
    }
    x += this.pan.x
    y += this.pan.y + this.focusOffset / this.zoom
    if (this.bounds) {
      // Görünür alan dünyanın dışına mümkün olduğunca taşmasın: sınır, ekranın
      // yarısı kadar içeri çekilir (dünya ekrandan küçükse ortalanır).
      const b = this.bounds
      const hw = this.view.w / 2 / this.zoom
      const hh = this.view.h / 2 / this.zoom
      const pad = 36 / this.zoom
      let minX = b.minX + hw - pad
      let maxX = b.maxX - hw + pad
      let minY = b.minY + hh - pad * 3
      let maxY = b.maxY - hh + pad * 3
      if (minX > maxX) minX = maxX = (b.minX + b.maxX) / 2
      if (minY > maxY) minY = maxY = (b.minY + b.maxY) / 2
      x = Math.max(minX, Math.min(maxX, x))
      y = Math.max(minY, Math.min(maxY, y))
      // sürükleme sınıra dayandıysa sapmayı da sınırla (geri dönüş gecikmesin)
      if (clampPan && !this.fixedCenter && f) {
        const c = isoCenter(f.pos.x, f.pos.y)
        this.pan.x = x - c.sx
        this.pan.y = y - (c.sy - 34) - this.focusOffset / this.zoom
      }
    }
    return { x, y }
  }

  applyCamera() {
    if (!this.cameraEl) return
    const { w, h } = this.view
    const z = this.zoom
    const tx = w / 2 - this.cam.x * z
    const ty = h / 2 - this.cam.y * z
    this.cameraEl.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${z})`)
  }

  // Ekran (kap içi piksel) -> ondalık ızgara koordinatı
  screenToGrid(px, py) {
    const { w, h } = this.view
    const z = this.zoom
    const wx = (px - (w / 2 - this.cam.x * z)) / z
    const wy = (py - (h / 2 - this.cam.y * z)) / z
    return screenToGrid(wx, wy)
  }

  // Dünya noktası -> ekran (HUD'da konum göstermek için)
  worldToScreen(sx, sy) {
    const { w, h } = this.view
    const z = this.zoom
    return { x: w / 2 + (sx - this.cam.x) * z, y: h / 2 + (sy - this.cam.y) * z }
  }

  // ------------------------------------------------------------ karakterler
  ensure(id, x, y) {
    let a = this.actors.get(id)
    if (!a) {
      a = {
        id,
        pos: { x, y },
        cell: { x, y },
        from: { x, y },
        to: { x, y },
        t: 0,
        path: [],
        moving: false,
        pose: { facing: 'front', flip: false, walking: false },
        pet: { x: x - 0.75, y: y + 0.35, flip: false },
        host: null,
        petHost: null,
        label: null,
        onPose: null,
        slot: -1,
        petSlot: -1,
      }
      this.actors.set(id, a)
    }
    return a
  }

  attach(id, { x, y, host, petHost, label, labelWidth, onPose }) {
    const a = this.ensure(id, x, y)
    a.labelW = labelWidth || 60
    a.host = host
    a.petHost = petHost || null
    a.label = label || null
    a.labelK = -1
    a.labelHidden = false
    a.onPose = onPose || null
    this.labelsDirty = true
    a.slot = -1
    a.petSlot = -1
    if (a.host && this.reducedMotion) a.host.style.transition = 'opacity 160ms linear'
    if (a.petHost && !a.moving) a.pet = { x: a.pos.x - 0.75, y: a.pos.y + 0.35, flip: false }
    this.render(a)
    a.onPose?.(a.pose)
    if (id === this.follow) {
      this.cam = this.cameraTarget()
      this.applyCamera()
    }
    this.kick()
  }

  // Bileşen ayrıldı: çizim öğeleri bırakılır, konum durumu kalır (ör. evcil
  // dost değişince yeniden bağlanan karakter yerinden sıçramasın).
  detach(id) {
    const a = this.actors.get(id)
    if (!a) return
    a.host?.remove()
    a.petHost?.remove()
    a.host = null
    a.petHost = null
    a.label = null
    a.onPose = null
  }

  // Oyuncu bölgeden ayrıldı: durumu da sil.
  remove(id) {
    this.detach(id)
    this.actors.delete(id)
    this.labelsDirty = true
    this.kick()
  }

  setLabelWidth(id, w) {
    const a = this.actors.get(id)
    if (!a) return
    a.labelW = w
    this.labelsDirty = true
    this.kick()
  }

  // Ad etiketleri: önce benimki, sonra ekranda öndekiler (aşağıdakiler) yerinde
  // kalır; çakışan etiket boş bir yer bulana kadar yukarı kaydırılır. Çok
  // kalabalıkta uzaktakilerin etiketi gizlenir (Buradakiler listesi hep var).
  layoutLabels() {
    this.labelsDirty = false
    const list = []
    for (const a of this.actors.values()) if (a.label && a.sx != null) list.push(a)
    const me = this.follow && this.actors.get(this.follow)
    const crowded = list.length > LABEL_CROWD && me
    list.sort((p, q) => (p === me ? -1 : q === me ? 1 : q.sy - p.sy))
    const placed = []
    for (const a of list) {
      const far = crowded && a !== me && Math.abs(a.pos.x - me.pos.x) + Math.abs(a.pos.y - me.pos.y) > LABEL_NEAR
      if (far) {
        if (a.labelHidden !== true) { a.label.style.display = 'none'; a.labelHidden = true }
        continue
      }
      if (a.labelHidden) { a.label.style.display = ''; a.labelHidden = false }
      const half = a.labelW / 2 + 3
      let k = 0
      for (; k < LABEL_MAX_STACK; k++) {
        const y = a.sy - k * LABEL_STEP
        if (!placed.some((r) => a.sx - half < r.x2 && a.sx + half > r.x1 && Math.abs(y - r.y) < LABEL_H)) break
      }
      const y = a.sy - k * LABEL_STEP
      placed.push({ x1: a.sx - half, x2: a.sx + half, y })
      if (a.labelK !== k || a.labelX !== a.sx || a.labelY !== a.sy) {
        a.labelK = k
        a.labelX = a.sx
        a.labelY = a.sy
        a.label.setAttribute('transform', `translate(${a.sx.toFixed(2)} ${y.toFixed(2)})`)
      }
    }
  }

  has(id) {
    return this.actors.has(id)
  }

  // Bulunduğu (ya da adım attığı) kare.
  cellOf(id) {
    const a = this.actors.get(id)
    if (!a) return null
    return a.moving ? { ...a.to } : { ...a.cell }
  }

  // Son hedef (yürüyorsa yolun sonu)
  destinationOf(id) {
    const a = this.actors.get(id)
    if (!a) return null
    if (a.path.length) return { ...a.path[a.path.length - 1] }
    return a.moving ? { ...a.to } : { ...a.cell }
  }

  place(id, x, y) {
    const a = this.ensure(id, x, y)
    a.pos = { x, y }
    a.cell = { x, y }
    a.from = { x, y }
    a.to = { x, y }
    a.t = 0
    a.path = []
    a.moving = false
    a.pet = { x: x - 0.75, y: y + 0.35, flip: false }
    this.setPose(a, { ...a.pose, walking: false })
    this.render(a)
    if (id === this.follow) {
      this.pan = { x: 0, y: 0 }
      this.cam = this.cameraTarget()
      this.applyCamera()
    }
    this.kick()
  }

  // Yol bulup yürü. Dönen değer: varılacak kare (yürünemez hedefte en yakın kare).
  walkTo(id, x, y) {
    const a = this.actors.get(id)
    if (!a || !this.grid) return null
    const start = a.moving ? a.to : a.cell
    const path = routeTo(this.grid, start, { x, y })
    if (!path.length) {
      if (!a.moving) {
        this.onArrive?.(id, { ...a.cell })
        return { ...a.cell }
      }
      a.path = []
      return { ...a.to }
    }
    const dest = path[path.length - 1]
    if (this.reducedMotion) {
      // Hareket azaltma: anında yerine geç, kısa bir solma ile.
      this.place(id, dest.x, dest.y)
      if (a.host) {
        a.host.style.opacity = '0.2'
        requestAnimationFrame(() => { if (a.host) a.host.style.opacity = '1' })
      }
      this.onArrive?.(id, dest)
      return dest
    }
    if (a.moving) {
      a.path = path
    } else {
      a.from = { ...a.cell }
      a.to = path.shift()
      a.path = path
      a.t = 0
      a.moving = true
      this.setPose(a, { ...poseFor(a.to.x - a.from.x, a.to.y - a.from.y, a.pose), walking: true })
    }
    if (id === this.follow) this.pan = { x: 0, y: 0 }
    this.kick()
    return dest
  }

  setPose(a, pose) {
    if (pose.facing === a.pose.facing && pose.flip === a.pose.flip && pose.walking === a.pose.walking) return
    a.pose = pose
    a.onPose?.(pose)
  }

  // Durağan haldeyken yüzünü bir yöne çevir (ör. tezgâha bak)
  face(id, dx, dy) {
    const a = this.actors.get(id)
    if (!a || a.moving) return
    this.setPose(a, { ...poseFor(dx, dy, a.pose), walking: false })
  }

  // ------------------------------------------------------------ döngü
  kick() {
    if (this.raf || typeof window === 'undefined') return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  tick(now) {
    this.raf = 0
    const dt = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    let busy = false
    for (const a of this.actors.values()) {
      if (this.step(a, dt)) busy = true
    }
    // kamera
    const t = this.cameraTarget()
    const dx = t.x - this.cam.x
    const dy = t.y - this.cam.y
    if (this.reducedMotion || !this.cameraSettled && Math.hypot(dx, dy) > 600) {
      this.cam = t
    } else {
      const k = 1 - Math.exp(-dt * CAMERA_EASE)
      this.cam = { x: this.cam.x + dx * k, y: this.cam.y + dy * k }
    }
    this.cameraSettled = true
    if (Math.hypot(t.x - this.cam.x, t.y - this.cam.y) > 0.4) busy = true
    else this.cam = t
    this.applyCamera()
    if (this.labelsDirty) this.layoutLabels()
    if (busy) this.raf = requestAnimationFrame(this.tick)
  }

  step(a, dt) {
    let busy = false
    if (a.moving) {
      busy = true
      a.t += dt * SPEED
      while (a.t >= 1) {
        a.cell = { ...a.to }
        this.onStep?.(a.id, a.cell)
        const next = a.path.shift()
        if (!next) {
          a.moving = false
          a.t = 0
          a.from = { ...a.cell }
          this.setPose(a, { ...a.pose, walking: false })
          this.onArrive?.(a.id, { ...a.cell })
          break
        }
        a.t -= 1
        a.from = { ...a.cell }
        a.to = next
        this.setPose(a, { ...poseFor(a.to.x - a.from.x, a.to.y - a.from.y, a.pose), walking: true })
      }
      const k = a.moving ? a.t : 0
      a.pos = { x: a.from.x + (a.to.x - a.from.x) * k, y: a.from.y + (a.to.y - a.from.y) * k }
    }
    // evcil dost: ip mesafesinde sahibini izler
    if (a.petHost) {
      const ex = a.pos.x - a.pet.x
      const ey = a.pos.y - a.pet.y
      const d = Math.hypot(ex, ey)
      if (d > PET_GAP + 0.01) {
        const m = (d - PET_GAP) / d
        a.pet.x += ex * m
        a.pet.y += ey * m
        const sdx = (ex - ey) // ekran yatayı ~ (x - y)
        if (Math.abs(sdx) > 0.05) a.pet.flip = sdx < 0
        busy = busy || a.moving
      }
    }
    this.render(a)
    return busy
  }

  render(a) {
    const c = isoCenter(a.pos.x, a.pos.y)
    if (a.host) {
      a.host.setAttribute('transform', `translate(${c.sx.toFixed(2)} ${c.sy.toFixed(2)})`)
      const depth = a.moving ? Math.max(a.from.x + a.from.y, a.to.x + a.to.y) : a.cell.x + a.cell.y
      const slot = Math.round(depth)
      if (slot !== a.slot || !a.host.isConnected) {
        const el = this.slotFor(slot)
        if (el) {
          el.appendChild(a.host)
          a.slot = slot
        }
      }
    }
    // etiket konumu layoutLabels'ta (çakışma önleme ile) uygulanır
    if (a.sx !== c.sx || a.sy !== c.sy) {
      a.sx = c.sx
      a.sy = c.sy
      this.labelsDirty = true
    }
    if (a.petHost) {
      const p = isoCenter(a.pet.x, a.pet.y)
      a.petHost.setAttribute('transform', `translate(${p.sx.toFixed(2)} ${p.sy.toFixed(2)}) scale(${a.pet.flip ? -1 : 1} 1)`)
      const ps = Math.floor(a.pet.x + a.pet.y + 0.5)
      if (ps !== a.petSlot || !a.petHost.isConnected) {
        const el = this.slotFor(ps)
        if (el) {
          // aynı yuvada sahibinin arkasında kalsın
          if (a.host && a.host.parentNode === el) el.insertBefore(a.petHost, a.host)
          else el.appendChild(a.petHost)
          a.petSlot = ps
        }
      }
    }
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
  }
}
