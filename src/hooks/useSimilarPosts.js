import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { searchPosts } from '../services/api.js'

const MIN_QUERY_LENGTH = 8
const DEBOUNCE_MS = 600
const MAX_SUGGESTIONS = 3

// Yeni gönderi yazılırken başlığa benzeyen mevcut gönderiler (en fazla 3).
// Seçili hastalık grubundakiler öne alınır. Öneri ikincil bir yardımcı:
// hata kullanıcıya gösterilmez.
export function useSimilarPosts(title, { enabled, diseaseGroupId }) {
  const { token } = useAuth()
  const [similar, setSimilar] = useState([])
  const query = enabled ? title.trim() : ''

  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) { setSimilar([]); return undefined }
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      searchPosts(token, query, { size: 10, signal: ctrl.signal })
        .then(res => {
          const items = Array.isArray(res?.content) ? res.content : []
          const inGroup = diseaseGroupId != null ? items.filter(p => String(p.diseaseGroupId) === String(diseaseGroupId)) : []
          const rest = items.filter(p => !inGroup.includes(p))
          setSimilar([...inGroup, ...rest].slice(0, MAX_SUGGESTIONS))
        })
        .catch(() => { /* öneri - sessiz */ })
    }, DEBOUNCE_MS)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query, token, diseaseGroupId])

  return similar
}
