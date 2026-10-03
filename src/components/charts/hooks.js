import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Bir öğenin genişliğini ResizeObserver ile izler - SVG grafikler sabit
 * viewBox ile ölçeklenmek yerine gerçek piksel genişliğine göre çizilir
 * (yazılar her ekranda aynı boyda kalsın, etiket sayısı genişliğe uysun).
 * @returns [ref, width]
 */
export function useElementWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    setWidth(el.getBoundingClientRect().width)
    if (typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width
      if (w != null) setWidth(prev => (Math.abs(prev - w) < 0.5 ? prev : w))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

/** Kullanıcı hareketi azaltmayı tercih ediyor mu? (giriş animasyonları için) */
export function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches)
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return undefined
    const on = () => setReduced(mq.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return reduced
}

/**
 * Dokunmatik ekranda tooltip parmak kalktıktan sonra açık kalır; grafiğin
 * dışına dokunulunca kapanır. Fareyle ise imleç çıkınca kapanır.
 */
export function useDismissOnOutsideTap(ref, active, onDismiss) {
  useEffect(() => {
    if (!active) return undefined
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onDismiss() }
    document.addEventListener('pointerdown', h)
    return () => document.removeEventListener('pointerdown', h)
  }, [ref, active, onDismiss])
}

/**
 * Zaman serisi grafiklerinde "en yakın güne kilitlenen" etkileşim: fare
 * gezdirme, dokunup sürükleme (yatay; dikey kaydırma sayfaya kalır) ve
 * klavye (←/→, Home/End, Esc). Okuyucu 2px'lik çizgiye değil bir güne nişan alır.
 *
 * @param n          nokta sayısı
 * @param xToIndex   (yerel x piksel) → indeks
 * @returns { index, setIndex, rootRef, handlers } - handlers SVG'ye yayılır.
 */
export function useIndexScrubber(n, xToIndex) {
  const [index, setIndex] = useState(null)
  const rootRef = useRef(null)
  const pressed = useRef(false)

  const localIndex = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return xToIndex(e.clientX - rect.left)
  }
  const dismiss = useCallback(() => setIndex(null), [])
  useDismissOnOutsideTap(rootRef, index != null, dismiss)

  const handlers = {
    tabIndex: 0,
    onPointerDown: (e) => { pressed.current = true; setIndex(localIndex(e)) },
    onPointerMove: (e) => { if (e.pointerType === 'mouse' || pressed.current) setIndex(localIndex(e)) },
    onPointerUp: () => { pressed.current = false },
    onPointerCancel: () => { pressed.current = false },
    onPointerLeave: (e) => { pressed.current = false; if (e.pointerType === 'mouse') setIndex(null) },
    onFocus: () => setIndex(i => (i == null ? n - 1 : i)),
    onBlur: () => setIndex(null),
    onKeyDown: (e) => {
      const map = { ArrowLeft: -1, ArrowRight: 1 }
      if (e.key in map) { e.preventDefault(); setIndex(i => Math.min(n - 1, Math.max(0, (i ?? n - 1) + map[e.key]))) }
      else if (e.key === 'Home') { e.preventDefault(); setIndex(0) }
      else if (e.key === 'End') { e.preventDefault(); setIndex(n - 1) }
      else if (e.key === 'Escape') setIndex(null)
    },
  }
  return { index: index != null && index < n ? index : null, setIndex, rootRef, handlers }
}
