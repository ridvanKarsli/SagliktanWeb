// Grafik metinleri için Türkçe biçimlendiriciler ve küçük ölçek yardımcıları.

const numberFmt = new Intl.NumberFormat('tr-TR')
const compactFmt = new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 })
const percentFmt = new Intl.NumberFormat('tr-TR', { style: 'percent', maximumFractionDigits: 0 })
const signedPercentFmt = new Intl.NumberFormat('tr-TR', { style: 'percent', maximumFractionDigits: 0, signDisplay: 'exceptZero' })
const dayShortFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' })
const dayLongFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })

/** 1284 → "1.284" */
export const formatNumber = (n) => (n == null || Number.isNaN(n) ? '—' : numberFmt.format(n))
/** 12900 → "12,9 B" - eksen etiketleri gibi dar yerler için. */
export const formatCompact = (n) => (Math.abs(n) < 10000 ? numberFmt.format(n) : compactFmt.format(n))
/** 0.64 → "%64" */
export const formatPercent = (r) => percentFmt.format(r)
/** 0.12 → "+%12", -0.05 → "-%5" */
export const formatSignedPercent = (r) => signedPercentFmt.format(r)

/** "2026-10-03" → yerel gece yarısı Date (UTC kaymasız). */
export function parseDay(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
/** "2026-10-03" → "3 Eki" */
export const formatDayShort = (iso) => dayShortFmt.format(parseDay(iso))
/** "2026-10-03" → "3 Ekim Cumartesi" */
export const formatDayLong = (iso) => dayLongFmt.format(parseDay(iso))

/**
 * 0'dan başlayan "yuvarlak" eksen işaretleri. max=37 → [0, 10, 20, 30, 40].
 * Hepsi sıfırsa yine de [0, 1] döner ki çizgi tabana otursun.
 */
export function niceTicks(max, target = 4) {
  if (!(max > 0)) return [0, 1]
  const raw = max / target
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map(s => s * pow).find(s => s >= raw && (s >= 1 || pow < 1)) || pow * 10
  const s = Math.max(1, step) // gün sayıları tam sayı
  const top = Math.ceil(max / s) * s
  const ticks = []
  for (let v = 0; v <= top + 1e-9; v += s) ticks.push(Math.round(v))
  return ticks
}

/**
 * X ekseninde hangi günlerin etiketleneceği. En son gün (bugün) her zaman
 * etiketlenir; geriye doğru eşit adımla gidilir ki etiketler çakışmasın.
 * @param n nokta sayısı  @param width çizim genişliği  @param minGap etiketler arası min px
 */
export function pickTickIndexes(n, width, minGap = 56) {
  if (n <= 0) return []
  const maxLabels = Math.max(2, Math.floor(width / minGap))
  const step = [1, 2, 3, 7, 14, 15, 30, 45].find(s => Math.ceil(n / s) <= maxLabels) || Math.ceil(n / maxLabels)
  const out = []
  for (let i = n - 1; i >= 0; i -= step) out.unshift(i)
  return out
}

// Eksen yazısı (Nunito, 11.5px) genişlik tahmini - kenar boşluğu ve etiket
// çakışması hesabı için; ölçüm yapmadan yeterince isabetli.
export const textWidth = (s, size = 11.5) => String(s).length * size * 0.56

/** Y ekseni etiketleri için gereken sol boşluk. */
export function yAxisWidth(ticks) {
  return Math.ceil(Math.max(...ticks.map(t => textWidth(formatCompact(t))))) + 8
}
