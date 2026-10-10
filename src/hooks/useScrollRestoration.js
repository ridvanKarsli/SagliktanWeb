import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Geri/ileri (POP) gezinmede sayfanın bırakıldığı kaydırma konumuna dön;
// yeni bir sayfaya gidişte (PUSH/REPLACE) en üstten başla. Tarayıcının kendi
// geri yüklemesi SPA'da işe yaramaz (içerik henüz yokken çalışır), bu yüzden
// elle: her location.key için son scrollY saklanır, POP'ta içerik yüksekliği
// yetince geri sarılır (lazy route + önbellekten gelen liste birkaç frame
// sonra oturabilir - kısa bir süre denemeye devam eder).
//
// Kaydırma kabı viewport'tur (bkz. index.css üstündeki not).
const positions = new Map()
const MAX_RESTORE_ATTEMPTS = 20 // ~330ms @60fps

export function useScrollRestoration() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const lastYRef = useRef(0)
  const keyRef = useRef(location.key)

  // Tarayıcı kendi başına geri sarmaya kalkmasın (çift hareket, yanlış konum).
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      try { window.history.scrollRestoration = 'manual' } catch { /* bazı WebView'lar salt okunur */ }
    }
  }, [])

  // Konumu sürekli izle: location değiştiği anda içerik çoktan değişmiş ve
  // document kısalmış olabilir, o anda scrollY okumak yanlış değer verir.
  useLayoutEffect(() => {
    const onScroll = () => { lastYRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Aynı key ile tekrar çalışma (ör. useDialogHistory'nin pushState/back'i
  // router'ı POP ile yeniden render eder ama sayfa değişmez): kaydırma.
  const handledKeyRef = useRef(null)

  useLayoutEffect(() => {
    if (handledKeyRef.current === location.key) return undefined
    handledKeyRef.current = location.key
    // Önceki sayfanın konumunu kaydet.
    if (keyRef.current !== location.key) {
      positions.set(keyRef.current, lastYRef.current)
      keyRef.current = location.key
    }

    const scrollTo = (top) => {
      try { window.scrollTo({ top, left: 0, behavior: 'instant' }) } catch { window.scrollTo(0, top) }
    }

    if (navigationType !== 'POP') {
      scrollTo(0)
      lastYRef.current = 0
      return undefined
    }

    const target = positions.get(location.key) ?? 0
    let attempts = 0
    let raf = 0
    const tryRestore = () => {
      const maxTop = document.documentElement.scrollHeight - window.innerHeight
      if (maxTop >= target || attempts >= MAX_RESTORE_ATTEMPTS) {
        scrollTo(Math.min(target, Math.max(0, maxTop)))
        lastYRef.current = window.scrollY
        return
      }
      attempts += 1
      raf = requestAnimationFrame(tryRestore)
    }
    tryRestore()
    return () => cancelAnimationFrame(raf)
  }, [location.key, navigationType])

  return navigationType
}
