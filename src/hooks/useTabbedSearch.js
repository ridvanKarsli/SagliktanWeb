import { useCallback, useEffect, useRef, useState } from 'react'
import { searchComments, searchPosts, searchUsers } from '../services/api.js'

export const SEARCH_TABS = [
  { key: 'posts', label: 'Gönderiler', fetcher: searchPosts },
  { key: 'comments', label: 'Yorumlar', fetcher: searchComments },
  { key: 'people', label: 'Kişiler', fetcher: searchUsers },
]

const emptyTabState = {
  results: [], page: 0, totalElements: 0, last: true,
  loading: false, loadingMore: false, searched: false, loadedKey: null
}
const emptyStates = () => Object.fromEntries(SEARCH_TABS.map(t => [t.key, emptyTabState]))

// Sekmeli tam arama sonuçları: yalnızca görüntülenen sekme, gerektiğinde
// tembel yüklenir; "Daha Fazla Yükle" sonuçların sonuna ekler. Sorgu
// değişince (ya da reset() ile aynı sorgu yeniden çalıştırılınca) tüm
// sekmeler sıfırlanıp yeniden yüklenir.
export function useTabbedSearch(token, query, tabIndex, { onError } = {}) {
  const [states, setStates] = useState(emptyStates)
  const [generation, setGeneration] = useState(0)
  const onErrorRef = useRef(onError)
  useEffect(() => { onErrorRef.current = onError }, [onError])

  const tab = SEARCH_TABS[tabIndex]
  const active = states[tab.key]
  const term = query.trim()

  // Yeni sorgu: önceki sonuçlar geçersiz.
  const [lastTerm, setLastTerm] = useState(term)
  if (lastTerm !== term) {
    setLastTerm(term)
    setStates(emptyStates())
  }

  const reset = useCallback(() => {
    setStates(emptyStates())
    setGeneration(g => g + 1)
  }, [])

  useEffect(() => {
    if (!token || !term) return undefined
    const key = tab.key
    const requestKey = `${generation}:${term}:${active.page}`
    if (active.loadedKey === requestKey) return undefined

    const isLoadMore = active.page > 0
    let alive = true
    setStates(prev => ({ ...prev, [key]: { ...prev[key], loading: !isLoadMore, loadingMore: isLoadMore } }))
    tab.fetcher(token, term, { page: active.page })
      .then(res => {
        if (!alive) return
        const newResults = Array.isArray(res?.content) ? res.content : []
        setStates(prev => ({
          ...prev,
          [key]: {
            results: isLoadMore ? [...prev[key].results, ...newResults] : newResults,
            page: active.page,
            totalElements: res?.totalElements ?? 0,
            last: res?.last ?? true,
            loading: false,
            loadingMore: false,
            searched: true,
            loadedKey: requestKey,
          }
        }))
      })
      .catch(err => {
        if (!alive) return
        onErrorRef.current?.(err)
        // Başarısız "daha fazla" denemesinde sayfayı geri al ki tekrar denenebilsin.
        setStates(prev => ({
          ...prev,
          [key]: { ...prev[key], loading: false, loadingMore: false, page: isLoadMore ? prev[key].page - 1 : prev[key].page }
        }))
      })
    return () => { alive = false }
    // active.loadedKey kasıtlı olarak bağımlılık değil: yükleme bitince
    // effect'in kendini yeniden tetiklemesine gerek yok.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, term, tab, active.page, generation])

  const loadMore = useCallback(() => {
    setStates(prev => ({ ...prev, [tab.key]: { ...prev[tab.key], page: prev[tab.key].page + 1 } }))
  }, [tab.key])

  return { states, active, tab, loadMore, reset }
}
