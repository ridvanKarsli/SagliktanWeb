import { useCallback, useEffect, useRef, useState } from 'react'

const contentOf = (res) => (Array.isArray(res?.content) ? res.content : [])

// Backend'in sayfalı ({content, last, totalElements}) döndürdüğü herhangi bir
// listeyi "ilk sayfayı yükle + Daha Fazla Yükle ile devamını ekle" deseniyle
// yöneten ortak hook.
//
// fetchPage(pageNum) -> Promise<{ content, last, totalElements? }>
//
// options:
//   enabled  - false ise hiç fetch etmez (ör. henüz açılmamış bir sekme/dialog).
//   once     - true ise ilk başarılı yüklemeden sonra enabled tekrar
//              false/true olsa bile yeniden fetch etmez (ör. bir kez açılıp
//              cache'lenen "Kaydedilenler" sekmesi ya da "Üyeler" dialogu).
//   deps     - fetchPage'in kapattığı, değişince page 0'dan yeniden fetch
//              tetiklemesi gereken değerler (ör. [token, sort, query]).
//   onError  - (err, phase) => void; phase 'initial' | 'loadMore'.
//
// Yarış koruması: her yükleme bir "nesil" numarası alır. deps değişince ya da
// reload() çağrılınca nesil artar; eski nesle ait (yavaş gelen) bir yanıt -
// ilk sayfa da olsa "daha fazla" da olsa - artık geçerli listeye yazılmaz.
// Bileşen unmount olunca da nesil geçersizleşir.
export function usePaginatedList(fetchPage, { enabled = true, once = false, deps = [], onError } = {}) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(enabled)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPageRef = useRef(fetchPage)
  fetchPageRef.current = fetchPage
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const loadedOnceRef = useRef(false)
  const generationRef = useRef(0)
  const loadingMoreRef = useRef(false)

  const loadFirstPage = useCallback(() => {
    const generation = ++generationRef.current
    const isCurrent = () => generation === generationRef.current
    loadingMoreRef.current = false
    setLoading(true)
    setLoadingMore(false)
    setPage(0)
    return fetchPageRef.current(0)
      .then(res => {
        if (!isCurrent()) return
        setItems(contentOf(res))
        setLast(res?.last ?? true)
        setTotalCount(res?.totalElements ?? 0)
        loadedOnceRef.current = true
      })
      .catch(err => { if (isCurrent()) onErrorRef.current?.(err, 'initial') })
      .finally(() => { if (isCurrent()) setLoading(false) })
  }, [])

  // Süren isteklerin yanıtlarını geçersiz kılar (unmount ya da deps değişimi).
  const invalidatePending = useCallback(() => { generationRef.current += 1 }, [])

  useEffect(() => {
    if (!enabled || (once && loadedOnceRef.current)) {
      setLoading(false)
      return undefined
    }
    loadFirstPage()
    return invalidatePending
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, once, ...deps])

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) return
    const generation = generationRef.current
    const nextPage = page + 1
    loadingMoreRef.current = true
    setLoadingMore(true)
    try {
      const res = await fetchPageRef.current(nextPage)
      if (generation !== generationRef.current) return
      // Offset sayfalama + araya giren yeni kayıtlar aynı öğeyi iki sayfada
      // döndürebilir; tekrar eden id'leri ekleme (React key çakışması olmasın).
      setItems(prev => {
        const known = new Set(prev.map(it => it?.id))
        return [...prev, ...contentOf(res).filter(it => !known.has(it?.id))]
      })
      setLast(res?.last ?? true)
      setPage(nextPage)
    } catch (err) {
      if (generation === generationRef.current) onErrorRef.current?.(err, 'loadMore')
    } finally {
      if (generation === generationRef.current) {
        loadingMoreRef.current = false
        setLoadingMore(false)
      }
    }
  }, [page])

  return { items, setItems, loading, loadingMore, last, totalCount, setTotalCount, loadMore, reload: loadFirstPage }
}
