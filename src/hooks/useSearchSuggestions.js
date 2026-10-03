import { useEffect, useState } from 'react'
import { quickSearch } from '../services/api.js'

const MIN_TERM_LENGTH = 2
const DEBOUNCE_MS = 300

// Yazarken birleşik hızlı arama önerileri (gönderi/yorum/kişi). Her yeni
// terim bir önceki isteği iptal eder: yavaş gelen eski yanıt, güncel
// terimin önerilerinin üzerine yazmasın. Öneri ikincil bir yardımcı -
// başarısız olursa kutu sessizce boş kalır, Enter ile asıl arama çalışır.
export function useSearchSuggestions(token, term) {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const clean = term.trim()

  useEffect(() => {
    if (!token || clean.length < MIN_TERM_LENGTH) {
      setSuggestions(null)
      setLoading(false)
      return undefined
    }
    setLoading(true)
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      quickSearch(token, clean, { signal: ctrl.signal })
        .then(res => setSuggestions(res))
        .catch(err => { if (err?.name !== 'AbortError') setSuggestions(null) })
        .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    }, DEBOUNCE_MS)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [token, clean])

  const hasAny = !!suggestions && !!(suggestions.posts?.length || suggestions.comments?.length || suggestions.users?.length)
  return { suggestions, loading, hasAny, clear: () => setSuggestions(null), minLength: MIN_TERM_LENGTH }
}
