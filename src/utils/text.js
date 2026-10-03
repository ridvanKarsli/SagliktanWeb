// Metni kelime ortasında da olsa en fazla `max` karaktere kısaltır, sona "…" ekler.
export function truncate(text = '', max = 140) {
  const clean = String(text || '').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trimEnd()}…`
}

// Ad + soyadı tek bir görünen isimde birleştirir.
export function fullNameOf(person, fallback = '') {
  return [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim() || fallback
}
