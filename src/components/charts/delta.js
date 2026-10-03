import { formatSignedPercent } from './format.js'

/**
 * Önceki eşit döneme göre değişim. Renk tek başına anlam taşımaz: her
 * değişim yön ikonu + işaretli metin + ekran okuyucu cümlesiyle gelir.
 *
 * @param current   bu dönemin değeri
 * @param previous  önceki dönemin değeri
 * @param opts.unit 'percent' (göreli % değişim) | 'points' (oranlar için yüzde puan farkı)
 * @returns {{ direction: 'up'|'down'|'flat'|'new'|'none', text: string, srText: string }}
 */
export function computeDelta(current, previous, { unit = 'percent' } = {}) {
  if (current == null || previous == null) return { direction: 'none', text: '', srText: '' }
  if (unit === 'points') {
    const pts = Math.round((current - previous) * 100)
    if (pts === 0) return { direction: 'flat', text: 'Değişim yok', srText: 'Önceki döneme göre değişim yok' }
    const text = `${pts > 0 ? '+' : '−'}${Math.abs(pts)} puan`
    return { direction: pts > 0 ? 'up' : 'down', text, srText: `Önceki döneme göre ${Math.abs(pts)} puan ${pts > 0 ? 'artış' : 'düşüş'}` }
  }
  if (previous === 0) {
    if (current === 0) return { direction: 'flat', text: 'Değişim yok', srText: 'Önceki döneme göre değişim yok' }
    return { direction: 'new', text: 'Önceki dönem 0', srText: 'Önceki dönemde hiç yoktu' }
  }
  const r = (current - previous) / previous
  if (Math.abs(r) < 0.005) return { direction: 'flat', text: 'Değişim yok', srText: 'Önceki döneme göre değişim yok' }
  const text = formatSignedPercent(r).replace('-', '−')
  return { direction: r > 0 ? 'up' : 'down', text, srText: `Önceki döneme göre ${formatSignedPercent(Math.abs(r)).replace('+', '')} ${r > 0 ? 'artış' : 'düşüş'}` }
}
