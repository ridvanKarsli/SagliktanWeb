// Uygulama genelinde ortak biçimlendirme yardımcıları (isim baş harfleri,
// sunucu tarihleri, göreli zaman, sayılar).

// Ad-soyaddan avatar baş harfleri: iki kelimeyse her birinin ilk harfi,
// tek kelimeyse ilk iki harfi, hiç isim yoksa "?".
export function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) return ((parts[0][0] || '') + (parts[0][1] || '')).toUpperCase()
  return '?'
}

// Backend tüm zaman damgalarını LocalDateTime olarak, saat dilimi/offset
// OLMADAN ("2026-10-03T09:00:00") ve UTC'de üretir (bkz. SagliktanApi
// Dockerfile: TZ=UTC). `new Date("2026-10-03T09:00:00")` ise böyle bir
// string'i YEREL saat olarak yorumlar - İstanbul'daki kullanıcı sohbet/
// bildirim saatlerini 3 saat geri görüyor, "bugün mü?" kıyası gece
// yarısı civarında yanlış çıkıyordu. Dilim bilgisi yoksa 'Z' ekleyerek
// UTC olarak parse ediyoruz; zaten offset'li/Z'li string ve Date/number
// girişleri olduğu gibi geçer.
const HAS_ZONE = /(?:[zZ]|[+-]\d{2}:?\d{2})$/
export function parseServerDate(value) {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  const str = String(value)
  // Sadece "YYYY-MM-DDTHH:mm[:ss[.fff]]" biçimindeki dilimsiz tarih-saat'e
  // dokunuyoruz; salt tarih ("2026-10-03") zaten UTC gece yarısı sayılır.
  const dt = /^\d{4}-\d{2}-\d{2}T/.test(str) && !HAS_ZONE.test(str)
    ? new Date(str + 'Z')
    : new Date(str)
  return isNaN(dt) ? null : dt
}

// ISO tarih string'ini (ya da Date'i) tr-TR yerel biçiminde kısa tarihe çevirir.
// Geçersiz/boş girişte null döner.
export function prettyDate(d) {
  const dt = parseServerDate(d)
  return dt ? dt.toLocaleDateString('tr-TR') : null
}

// Göreli zaman: "az önce", "5 dk", "3 sa", "2 gün", sonrası kısa tarih.
// Sosyal akışlarda mutlak tarih ("03.10.2026") yerine bu okunur; yoğun
// listelerde (yorum, bildirim, sohbet) yer kazandırır.
export function relativeTime(value, now = new Date()) {
  const dt = parseServerDate(value)
  if (!dt) return ''
  const diff = Math.max(0, (now.getTime() - dt.getTime()) / 1000)
  if (diff < 45) return 'az önce'
  if (diff < 3600) return `${Math.round(diff / 60)} dk`
  if (diff < 86400) return `${Math.round(diff / 3600)} sa`
  if (diff < 7 * 86400) return `${Math.round(diff / 86400)} gün`
  const sameYear = dt.getFullYear() === now.getFullYear()
  return dt.toLocaleDateString('tr-TR', sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' })
}

// Sayıları Türkçe binlik ayraçlı gösterir: 12345 -> "12.345".
const countFormat = new Intl.NumberFormat('tr-TR')
export function formatCount(n) {
  return countFormat.format(n ?? 0)
}
