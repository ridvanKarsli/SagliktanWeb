// Uygulama genelinde tekrarlanan basit biçimlendirme yardımcıları (bkz.
// clean-code audit) - önceden initialsFrom 11 dosyada, prettyDate ise
// pages/profile/ProfileShared.jsx içinde ama profil dışı sayfalarda inline
// olarak birebir kopyalanmış haldeydi.

// Ad-soyaddan avatar baş harfleri: iki kelimeyse her birinin ilk harfi,
// tek kelimeyse ilk iki harfi, hiç isim yoksa "?".
export function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) return ((parts[0][0] || '') + (parts[0][1] || '')).toUpperCase()
  return '?'
}

// ISO tarih string'ini (ya da Date'i) tr-TR yerel biçiminde kısa tarihe çevirir.
// Geçersiz/boş girişte null döner.
export function prettyDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR') : null
}
