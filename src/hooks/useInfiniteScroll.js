import { useCallback, useEffect, useRef, useState } from 'react'
import { isScrollRestoring, onScrollRestored } from './useScrollRestoration.js'

const supportsObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window

// Liste sonundaki gözcü (sentinel) görünüme yaklaşınca bir sonraki sayfayı
// otomatik yükler ("Daha fazla yükle" düğmesi yerine).
//
//   onLoadMore  - sonraki sayfayı isteyen fonksiyon
//   hasMore     - daha sayfa var mı
//   loading     - şu an sayfa yükleniyor mu (yüklenirken tetiklenmez)
//   itemCount   - listedeki öğe sayısı; bir yükleme listeyi büyütmeden
//                 bittiyse (hata ya da hep tekrar eden kayıtlar) otomatik
//                 yükleme durur ve "Tekrar dene" düğmesi gösterilir -
//                 sonsuz istek döngüsü olmaz.
//   root        - kaydırma kabı elemanı (dialog içi listeler; useState ile
//                 tutulan callback ref'ten); verilmezse viewport.
//   rootMargin  - kullanıcı dibe varmadan yüklemeye başlamak için pay.
//   disabled    - ilk yükleme sürerken vb.
//
// Her yükleme bitince gözlemci yeniden kurulur: yeni gözlemci gözcünün o
// anki durumunu hemen bildirir, sayfa hâlâ dolmadıysa bir sonraki sayfa da
// gelir. Geri gezinmede kaydırma geri yüklenirken (bkz.
// useScrollRestoration) gözlemci kurulmaz; konum oturunca kurulur.
//
// Döner: { sentinelRef, stalled, supported, retry }
//   stalled   - son otomatik yükleme listeyi büyütmedi; düğme gösterilmeli.
//   supported - IntersectionObserver var mı (yoksa düğme gösterilmeli).
//   retry     - düğmeden elle yükleme (stalled durumunu sıfırlar).
export function useInfiniteScroll({ onLoadMore, hasMore, loading, itemCount, root = null, rootMargin = '600px 0px', disabled = false }) {
  const [sentinel, setSentinel] = useState(null)
  const [stalled, setStalled] = useState(false)
  const [restoring, setRestoring] = useState(isScrollRestoring)

  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore
  // Bir yüklemeyi başlattığımız andaki öğe sayısı; yükleme bitince
  // karşılaştırılır.
  const pendingFromRef = useRef(null)

  useEffect(() => {
    if (!restoring) return undefined
    // Abonelikten önce bitmiş olabilir.
    if (!isScrollRestoring()) { setRestoring(false); return undefined }
    return onScrollRestored(() => setRestoring(false))
  }, [restoring])

  // Yükleme bitti: liste büyümediyse otomatik yüklemeyi durdur.
  // (Bazı kaynaklar "yükleniyor"u bir render sonra açar - ör. arama sayfa
  // numarasını artırıp effect'te istek atar; yükleme gerçekten başlamadan
  // karar verilmesin diye önce loading=true görülmüş olmalı.)
  const sawLoadingRef = useRef(false)
  useEffect(() => {
    if (pendingFromRef.current == null) return
    if (loading) { sawLoadingRef.current = true; return }
    if (!sawLoadingRef.current) return
    if (itemCount != null && itemCount <= pendingFromRef.current && hasMore) setStalled(true)
    pendingFromRef.current = null
    sawLoadingRef.current = false
  }, [loading, itemCount, hasMore])

  const trigger = useCallback(() => {
    pendingFromRef.current = itemCount ?? 0
    sawLoadingRef.current = false
    onLoadMoreRef.current?.()
  }, [itemCount])

  useEffect(() => {
    if (!supportsObserver || !sentinel || !hasMore || loading || disabled || stalled || restoring) return undefined
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        observer.disconnect()
        trigger()
      }
    }, { root, rootMargin })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinel, hasMore, loading, disabled, stalled, restoring, root, rootMargin, trigger])

  const retry = useCallback(() => {
    setStalled(false)
    trigger()
  }, [trigger])

  return { sentinelRef: setSentinel, stalled, supported: supportsObserver, retry }
}
