import { useCallback, useEffect, useRef, useState } from 'react'

// Backend'in sayfalı ({content, last, totalElements}) döndürdüğü herhangi bir
// listeyi "ilk sayfayı yükle + Daha Fazla Yükle ile devamını ekle" deseniyle
// yöneten ortak hook (bkz. clean-code audit) - önceden Profile.jsx (2 kez),
// Posts.jsx, SubGroups.jsx (üye dialogu) ve Conversations.jsx'te aynı
// page/last/loading/loadingMore state şablonu + loadMore handler'ı birebir
// kopyalanmıştı.
//
// fetchPage(pageNum) -> Promise<{ content, last, totalElements? }>
//
// options:
//   enabled  - false ise hiç fetch etmez (ör. henüz açılmamış bir sekme/dialog).
//   once     - true ise enabled true olduktan ve ilk yükleme başarılı olduktan
//              sonra, enabled tekrar false/true olsa bile yeniden fetch etmez
//              (ör. "Kaydedilenler" sekmesi ya da "Üyeler" dialogu - bir kez
//              yüklenip sonra cache'leniyor).
//   deps     - fetchPage'in kapattığı, değişince page 0'dan yeniden fetch
//              tetiklemesi gereken değerler (ör. [token, sort, query]).
//   onError  - (err, phase) => void; phase 'initial' | 'loadMore'.
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

  const load = useCallback(() => {
    setLoading(true)
    setPage(0)
    return fetchPageRef.current(0)
      .then(res => {
        setItems(Array.isArray(res?.content) ? res.content : [])
        setLast(res?.last ?? true)
        setTotalCount(res?.totalElements ?? 0)
        loadedOnceRef.current = true
      })
      .catch(err => onErrorRef.current?.(err, 'initial'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!enabled || (once && loadedOnceRef.current)) {
      setLoading(false)
      return undefined
    }
    let mounted = true
    setLoading(true)
    setPage(0)
    fetchPageRef.current(0)
      .then(res => {
        if (!mounted) return
        setItems(Array.isArray(res?.content) ? res.content : [])
        setLast(res?.last ?? true)
        setTotalCount(res?.totalElements ?? 0)
        loadedOnceRef.current = true
      })
      .catch(err => { if (mounted) onErrorRef.current?.(err, 'initial') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, once, ...deps])

  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await fetchPageRef.current(nextPage)
      setItems(prev => [...prev, ...(Array.isArray(res?.content) ? res.content : [])])
      setLast(res?.last ?? true)
      setPage(nextPage)
    } catch (err) {
      onErrorRef.current?.(err, 'loadMore')
    } finally {
      setLoadingMore(false)
    }
  }, [page])

  return { items, setItems, loading, loadingMore, last, totalCount, loadMore, reload: load }
}
