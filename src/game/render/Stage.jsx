// İzometrik sahne: SVG + kamera + dokunma/sürükleme/yakınlaştırma.
// Katman sırası: arka plan (bölge kenarı ya da oda duvarı), zemin karoları,
// zemin katmanı (halı, dokunma işareti, yerleştirme izi), derinlik sıralı
// nesneler + karakter yuvaları, en üstte ad etiketleri ve balonlar.
//
// Dokunma ile sürükleme ayrımı: parmak/fare 10 px'ten fazla kayarsa
// sürükleme (kamera kayar), kaymazsa dokunma (yürü / seç).
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { ObjectLayer } from './layers.jsx'

const TAP_SLOP = 10

export default function Stage({
  engine, objects, maxDepth, background, tiles, floor, actors, overlay,
  onTap, onHover, onPinchZoom, onWheelZoom, sky = '#D7EEF3', ariaLabel, panEnabled = true, selectedIndex, tint, transparent = false,
  children,
}) {
  const wrapRef = useRef(null)
  const camRef = useRef(null)
  const pointers = useRef(new Map())
  const gesture = useRef(null)
  const pendingTap = useRef(null)

  useLayoutEffect(() => {
    engine.setCameraEl(camRef.current)
    return () => engine.setCameraEl(null)
  }, [engine])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const fit = () => engine.setViewport(el.clientWidth, el.clientHeight)
    fit()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', fit)
      return () => window.removeEventListener('resize', fit)
    }
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [engine])

  const onSlots = useCallback((els) => engine.setSlots(els), [engine])

  const local = (e) => {
    const r = wrapRef.current.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return
    const p = local(e)
    pointers.current.set(e.pointerId, p)
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      gesture.current = { pinch: true, dist: Math.hypot(a.x - b.x, a.y - b.y), moved: true }
    } else if (pointers.current.size === 1) {
      gesture.current = { start: p, last: p, moved: false, target: e.target }
    }
    try { wrapRef.current.setPointerCapture(e.pointerId) } catch { /* bazı tarayıcılar desteklemez */ }
  }

  const onPointerMove = (e) => {
    const p = local(e)
    if (!pointers.current.has(e.pointerId)) {
      if (e.pointerType === 'mouse') onHover?.(engine.screenToGrid(p.x, p.y))
      return
    }
    pointers.current.set(e.pointerId, p)
    const g = gesture.current
    if (!g) return
    if (g.pinch && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (g.dist > 0 && Math.abs(d / g.dist - 1) > 0.04) {
        onPinchZoom?.(d / g.dist)
        g.dist = d
      }
      return
    }
    if (!g.moved && Math.hypot(p.x - g.start.x, p.y - g.start.y) > TAP_SLOP) g.moved = true
    if (g.moved && panEnabled) {
      engine.panBy(p.x - g.last.x, p.y - g.last.y)
    }
    g.last = p
    if (e.pointerType === 'mouse') onHover?.(engine.screenToGrid(p.x, p.y))
  }

  const onPointerUp = (e) => {
    const g = gesture.current
    const had = pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) gesture.current = null
    if (!had || !g || g.moved || g.pinch) return
    const p = local(e)
    const gp = engine.screenToGrid(p.x, p.y)
    const t = g.target instanceof Element ? g.target : null
    const actorEl = t?.closest?.('[data-actor]')
    const objEl = t?.closest?.('[data-obj]')
    // Eylem "click"te çalışır: dokunmatikte pointerup'tan hemen sonra gelen
    // click, bu dokunuşla açılan bir sayfanın arka planına düşüp onu
    // kapatmasın (hayalet tıklama).
    pendingTap.current = {
      cell: { x: Math.floor(gp.x), y: Math.floor(gp.y) },
      actorId: actorEl?.getAttribute('data-actor') || null,
      objIndex: objEl ? Number(objEl.getAttribute('data-obj')) : null,
      at: Date.now(),
    }
  }

  const onClick = () => {
    const tap = pendingTap.current
    pendingTap.current = null
    if (!tap || Date.now() - tap.at > 800) return
    onTap?.(tap)
  }

  const onPointerCancel = (e) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) gesture.current = null
  }

  // Masaüstü tekerleği: yakınlaştır/uzaklaştır (sayfa kaymasın diye pasif değil)
  useEffect(() => {
    const el = wrapRef.current
    if (!el || !onWheelZoom) return undefined
    const onWheel = (e) => {
      e.preventDefault()
      onWheelZoom(e.deltaY < 0 ? 1 : -1)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheelZoom])

  return (
    <Box
      ref={wrapRef}
      role="group"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
      sx={{
        position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none', userSelect: 'none',
        WebkitUserSelect: 'none', WebkitTapHighlightColor: 'transparent',
        // gökyüzü ayrı katmanda çiziliyorsa (dünya) zemin şeffaf
        background: transparent ? 'transparent' : `radial-gradient(120% 90% at 50% 10%, #FFFFFF 0%, ${sky} 55%, ${sky} 100%)`,
        zIndex: transparent ? 1 : undefined,
        cursor: 'default',
      }}
    >
      <svg width="100%" height="100%" style={{ display: 'block' }} aria-hidden="true">
        <g ref={camRef}>
          {background}
          {tiles}
          {floor}
          <ObjectLayer objects={objects} maxDepth={maxDepth} onSlots={onSlots} selectedIndex={selectedIndex} />
          {tint}
          {overlay}
          {actors}
        </g>
      </svg>
      {children}
    </Box>
  )
}
