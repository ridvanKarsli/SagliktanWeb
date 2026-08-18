const STORAGE_KEY = 'sagliktan:recentSearches'
const MAX_ITEMS = 8

// Arama geçmişi yalnızca bu cihazda/tarayıcıda saklanır (localStorage) -
// backend'e gönderilmez, kullanıcı hesabına bağlı değildir.
export function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(t => typeof t === 'string' && t.trim()) : []
  } catch {
    return []
  }
}

export function saveRecentSearch(term) {
  const clean = String(term || '').trim()
  if (!clean) return loadRecentSearches()
  const existing = loadRecentSearches().filter(t => t.toLowerCase() !== clean.toLowerCase())
  const next = [clean, ...existing].slice(0, MAX_ITEMS)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage kullanılamıyor olabilir (gizli sekme vb.) - sessizce yok say
  }
  return next
}

export function removeRecentSearch(term) {
  const next = loadRecentSearches().filter(t => t.toLowerCase() !== String(term || '').toLowerCase())
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // no-op
  }
  return next
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
  return []
}
