import { useEffect, useRef, useState } from 'react'

// Basit, bağımlılıksız pull-to-refresh - kontrol listesi "Pull-to-refresh
// desteği" maddesi için eklendi (bkz. Sagliktan_Mobil_Uyum_Raporu.docx).
// Sadece sayfa zaten en üstteyken (window.scrollY === 0) başlayan bir aşağı
// çekme jestini izler; index.css'teki overscroll-behavior-y: contain native
// "lastik" efektini kapattığı için görsel geri bildirimi burada elle veriyoruz.
const PULL_THRESHOLD = 70 // bu mesafeyi (piksel) geçince bırakınca refresh tetiklenir
// Eskiden Math.min(delta * 0.5, 110) idi - delta 220px'i geçince gösterge
// aniden bir "duvara" çarpmış gibi sabitleniyordu (Apple fluid-interfaces
// ilkesi #9: sert durma "donmuş" hissettirir, sürekli/azalan direnç
// "duyarlı ama burada daha fazlası yok" hissettirir). Şimdi Apple'ın
// rubber-band formülüyle: mesafe arttıkça direnç sürekli artıyor, RUBBER_
// LIMIT'e hiç ulaşmadan asimptotik olarak yaklaşıyor - sert bir sınır yok.
// RUBBER_CONSTANT, delta=140px'te (eski formülün 70'e ulaştığı nokta)
// yine ~70 versin diye eski davranışla aynı hassasiyette kalacak şekilde
// hesaplandı - tetikleme kolaylığı değişmiyor, sadece aşırı çekmedeki his.
const RUBBER_LIMIT = 160 // gösterge mesafesinin sonsuza yaklaştığı asimptot
const RUBBER_CONSTANT = 0.889

function rubberband(overshoot, limit = RUBBER_LIMIT, constant = RUBBER_CONSTANT) {
  return (overshoot * limit * constant) / (limit + constant * Math.abs(overshoot))
}

export function usePullToRefresh(onRefresh, { disabled = false } = {}) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef(null)
  const distanceRef = useRef(0)
  const refreshingRef = useRef(false)
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  useEffect(() => { refreshingRef.current = refreshing }, [refreshing])

  useEffect(() => {
    if (disabled) return undefined

    const onTouchStart = (e) => {
      if (window.scrollY > 0 || refreshingRef.current) { startYRef.current = null; return }
      startYRef.current = e.touches[0].clientY
    }

    const onTouchMove = (e) => {
      if (startYRef.current === null) return
      const delta = e.touches[0].clientY - startYRef.current
      if (delta <= 0 || window.scrollY > 0) {
        distanceRef.current = 0
        setPullDistance(0)
        return
      }
      const next = rubberband(delta)
      distanceRef.current = next
      setPullDistance(next)
    }

    const onTouchEnd = () => {
      if (startYRef.current === null) return
      startYRef.current = null
      if (distanceRef.current >= PULL_THRESHOLD) {
        setPullDistance(PULL_THRESHOLD)
        setRefreshing(true)
        Promise.resolve(onRefreshRef.current?.()).finally(() => {
          setRefreshing(false)
          setPullDistance(0)
          distanceRef.current = 0
        })
      } else {
        setPullDistance(0)
        distanceRef.current = 0
      }
    }

    // passive: true - dokunma listener'ları scroll performansını
    // engellemesin diye (preventDefault hiç çağrılmıyor, native scroll'a
    // müdahale etmiyoruz, sadece izliyoruz).
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [disabled])

  return { pullDistance, refreshing, threshold: PULL_THRESHOLD }
}
