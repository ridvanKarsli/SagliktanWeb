import { useCallback, useEffect, useRef, useState } from 'react'

// Bir veriyi yalnızca ilk kez gerektiğinde (enabled true olunca) yükler ve
// saklar - ör. ayarlardaki açılır panellerin listeleri. Hata durumunda
// `error` dolar ve bir sonraki açılışta tekrar denenir.
export function useLazyResource(fetcher, { enabled }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fetcherRef = useRef(fetcher)
  useEffect(() => { fetcherRef.current = fetcher }, [fetcher])

  const load = useCallback(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetcherRef.current()
      .then(res => { if (alive) setData(res) })
      .catch(err => { if (alive) setError(err.message || 'Yüklenemedi.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!enabled || data !== null) return undefined
    return load()
  }, [enabled, data, load])

  return { data, setData, loading, error, reload: load }
}
