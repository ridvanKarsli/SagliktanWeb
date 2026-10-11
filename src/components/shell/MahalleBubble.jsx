import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { focusRingSx } from '../../design/focus.js'
import { MOBILE_NAV_HEIGHT } from './MobileBottomNav.jsx'
import {
  MAHALLE_BUBBLE_EVENT, MAHALLE_BUBBLE_KEYS, isMahalleBubbleEnabled, readBubblePos, saveBubblePos,
} from '../../utils/mahalleBubblePrefs.js'

// iOS AssistiveTouch benzeri "Mahalle kısayolu": ekranın kenarında duran,
// sürüklenebilen, dokununca Mahalle'yi (/mahalle) açan küçük yuvarlak düğme.
//  - Bırakınca en yakın sol/sağ kenara yaylanarak yapışır; dikeyde üst bar ile
//    alt menü arasında kalır, sağda "Yeni gönderi" düğmesinin alanına girmez.
//  - (mobilde) 3 sn dokunulmazsa kenara yarı saklanır (küçülür, soluklaşır); dokunma,
//    üzerine gelme ya da klavye odağı onu geri getirir. Saklıyken de dokununca açar.
//  - Konum ve açık/kapalı tercihi bu cihazda saklanır (Ayarlar > Erişilebilirlik).
// Oyun koduna ve MUI Tooltip/Popper'a bağımlı DEĞİL: ana pakete ~2 KB ekler.

const SIZE = 56
const EDGE = 10 // kenardan boşluk (açıkken)
const TAP_SLOP = 6
const IDLE_MS = 3000
const TUCK_SHIFT = SIZE * 0.45 + EDGE // saklıyken kenarın dışına kayma (görünen ≥ 30 px)
const GAP = 12 // alt menü / FAB ile arası
const FAB = { mobile: { size: 60, bottom: 16, right: 16 }, desktop: { size: 56, bottom: 32 } }

function readInsets() {
  if (typeof document === 'undefined') return { top: 0, bottom: 0 }
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)'
  document.body.appendChild(probe)
  const cs = getComputedStyle(probe)
  const r = { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 }
  probe.remove()
  return r
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// Dikey sınırlar (px). Sağ kenarda FAB alanı da dışarıda kalır.
function verticalRange(vh, desktop, side, insets) {
  const top = desktop ? 16 : 56 + insets.top + GAP
  let bottom
  if (desktop) {
    bottom = vh - (side === 'right' ? FAB.desktop.bottom + FAB.desktop.size + GAP : 24) - SIZE
  } else {
    const nav = MOBILE_NAV_HEIGHT + insets.bottom
    bottom = vh - nav - (side === 'right' ? FAB.mobile.bottom + FAB.mobile.size + GAP : GAP) - SIZE
  }
  return { min: top, max: Math.max(top, bottom) }
}

// Ev + filiz: küçük satır içi SVG (ikon paketi gerektirmez)
function HouseSprout() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M6 15.2 L16 6.8 L26 15.2" fill="none" stroke="#C2703E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.6 14.2 V25 Q8.6 26.4 10 26.4 H22 Q23.4 26.4 23.4 25 V14.2" fill="#FFF4E0" stroke="#C2703E" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M16 26 V19.6" stroke="#2F8F78" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 21 C15.4 18.2 13.4 16.8 11.2 17 C11.4 19.4 13.2 21.1 16 21Z" fill="#4CB89F" />
      <path d="M16 20 C16.6 17.1 18.8 15.6 21 15.8 C20.8 18.4 18.8 20.1 16 20Z" fill="#8FDCB8" />
    </svg>
  )
}

export default function MahalleBubble({ desktop }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const [enabled, setEnabled] = useState(isMahalleBubbleEnabled)
  const [pos, setPos] = useState(readBubblePos)
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  const [insets, setInsets] = useState({ top: 0, bottom: 0 })
  const [drag, setDrag] = useState(null) // { x, y } sürüklenirken
  const [tucked, setTucked] = useState(false)
  const [focused, setFocused] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [reduced] = useState(prefersReducedMotion)
  const gesture = useRef(null)
  const suppressClick = useRef(false)
  const idleTimer = useRef(0)

  // tercih değişince (Ayarlar ya da başka sekme) yeniden oku
  useEffect(() => {
    const sync = () => setEnabled(isMahalleBubbleEnabled())
    const onStorage = (e) => { if (!e.key || e.key === MAHALLE_BUBBLE_KEYS.ENABLED_KEY) sync() }
    window.addEventListener(MAHALLE_BUBBLE_EVENT, sync)
    window.addEventListener('storage', onStorage)
    return () => { window.removeEventListener(MAHALLE_BUBBLE_EVENT, sync); window.removeEventListener('storage', onStorage) }
  }, [])

  useLayoutEffect(() => {
    setInsets(readInsets())
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  // Tam ekran pencere (MUI Modal) açıkken gizlen: MUI gövdeye overflow:hidden koyar.
  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return undefined
    const check = () => setModalOpen(document.body.style.overflow === 'hidden')
    check()
    const mo = new MutationObserver(check)
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    return () => mo.disconnect()
  }, [])

  const wake = useCallback(() => {
    setTucked(false)
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setTucked(true), IDLE_MS)
  }, [])
  useEffect(() => {
    if (!enabled) return undefined
    idleTimer.current = setTimeout(() => setTucked(true), IDLE_MS)
    return () => clearTimeout(idleTimer.current)
  }, [enabled])

  if (!enabled) return null

  const range = verticalRange(vp.h, desktop, pos.side, insets)
  const restY = range.min + (range.max - range.min) * pos.frac
  const restX = pos.side === 'left' ? EDGE : vp.w - SIZE - EDGE
  // Masaüstünde saklanma yok: geniş ekranda yer derdi yok, yarı saklı soluk
  // düğme büyük ekranda gözden kaçıyordu. Saklanma yalnızca dokunmatik/mobilde.
  const showTucked = !desktop && tucked && !focused && !drag

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return
    wake()
    gesture.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: e.clientX - restX, oy: e.clientY - restY, moved: false }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* desteklenmiyor */ }
  }
  const onPointerMove = (e) => {
    const g = gesture.current
    if (!g || g.id !== e.pointerId) return
    if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < TAP_SLOP) return
    g.moved = true
    const x = Math.max(0, Math.min(vp.w - SIZE, e.clientX - g.ox))
    const y = Math.max(0, Math.min(vp.h - SIZE, e.clientY - g.oy))
    setDrag({ x, y })
  }
  const endDrag = (e) => {
    const g = gesture.current
    gesture.current = null
    if (!g || !g.moved || !drag) return
    // bırakıldı: en yakın kenara yapış, dikeyde izinli aralığa sığdır
    suppressClick.current = true
    const side = drag.x + SIZE / 2 < vp.w / 2 ? 'left' : 'right'
    const r = verticalRange(vp.h, desktop, side, insets)
    const y = Math.max(r.min, Math.min(r.max, drag.y))
    const next = { side, frac: r.max > r.min ? (y - r.min) / (r.max - r.min) : 0 }
    setPos(next)
    saveBubblePos(next)
    setDrag(null)
    wake()
    e?.preventDefault?.()
  }

  const onClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    navigate('/mahalle')
  }

  // Odaktayken ok tuşlarıyla yukarı/aşağı, sol/sağ ile kenar değiştir
  const onKeyDown = (e) => {
    const step = { ArrowUp: -0.08, ArrowDown: 0.08 }[e.key]
    if (step) {
      e.preventDefault()
      const next = { ...pos, frac: Math.min(1, Math.max(0, pos.frac + step)) }
      setPos(next)
      saveBubblePos(next)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = { ...pos, side: e.key === 'ArrowLeft' ? 'left' : 'right' }
      setPos(next)
      saveBubblePos(next)
    }
  }

  const x = drag ? drag.x : restX
  const y = drag ? drag.y : restY
  const shift = showTucked ? (pos.side === 'left' ? -TUCK_SHIFT : TUCK_SHIFT) : 0
  const motion = reduced || drag ? 'none'
    : 'left 420ms cubic-bezier(.34,1.56,.64,1), top 420ms cubic-bezier(.34,1.56,.64,1), transform 380ms cubic-bezier(.34,1.3,.64,1), opacity 300ms ease'

  return (
    <Box
      component="button"
      type="button"
      aria-label="Mahalle'ye git"
      title="Mahalle"
      data-testid="mahalle-bubble"
      data-tucked={showTucked ? 'true' : 'false'}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') wake() }}
      onFocus={() => { setFocused(true); wake() }}
      onBlur={() => { setFocused(false); wake() }}
      onContextMenu={(e) => e.preventDefault()}
      sx={{
        position: 'fixed',
        left: x,
        top: y,
        width: SIZE,
        height: SIZE,
        zIndex: theme.zIndex.speedDial,
        display: modalOpen ? 'none' : 'grid',
        placeItems: 'center',
        p: 0,
        m: 0,
        border: '2px solid rgba(255,255,255,0.9)',
        borderRadius: '50%',
        cursor: drag ? 'grabbing' : 'pointer',
        background: 'radial-gradient(circle at 35% 30%, #FFFDF8 0%, #E3F4EC 70%, #CDEFE3 100%)',
        boxShadow: drag
          ? '0 10px 26px rgba(18,60,50,0.28), 0 2px 6px rgba(18,60,50,0.18)'
          : '0 6px 16px rgba(18,60,50,0.20), 0 1px 3px rgba(18,60,50,0.16)',
        transform: `translateX(${shift}px) scale(${drag ? 1.06 : showTucked ? 0.9 : 1})`,
        opacity: showTucked ? 0.55 : 1,
        transition: motion,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        // Görünmez geniş dokunma alanı (yaşlı kullanıcılar için kolay hedef)
        '&::before': { content: '""', position: 'absolute', inset: -10, borderRadius: '50%' },
        '&:focus-visible': { ...focusRingSx, opacity: 1 },
      }}
    >
      {/* saklıyken simge görünen tarafa kayar: kenarda yarım ev değil, tam ev görünsün */}
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          display: 'grid',
          transform: `translateX(${showTucked ? (pos.side === 'left' ? 11 : -11) : 0}px)`,
          transition: reduced ? 'none' : 'transform 300ms ease',
        }}
      >
        <HouseSprout />
      </Box>
    </Box>
  )
}
