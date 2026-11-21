// Metni kelime ortasında da olsa en fazla `max` karaktere kısaltır, sona "…" ekler.
export function truncate(text = '', max = 140) {
  const clean = String(text || '').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trimEnd()}…`
}

// Ad + soyadı tek bir görünen isimde birleştirir.
export function fullNameOf(person, fallback = '') {
  // Takma ad yalnızca kişinin kendi kaydında döner; başkaları için sunucu
  // takma adı zaten firstName alanında gönderir.
  return (person?.nickname || [person?.firstName, person?.lastName].filter(Boolean).join(' ')).trim() || fallback
}
