// Takma ad kuralı (sunucuyla aynı): 3–20 karakter; harf (Türkçe dahil),
// rakam, boşluk, _ ; baş/son boşluk kırpılır.
export const NICK_RE = /^[\p{L}\p{N} _]+$/u

export function validateNickname(raw) {
  const v = (raw || '').trim()
  if (!v) return 'Bir takma ad seç.'
  if (v.length < 3) return 'Takma adın en az 3 karakter olmalı.'
  if (v.length > 20) return 'Takma adın en fazla 20 karakter olabilir.'
  if (!NICK_RE.test(v)) return 'Yalnızca harf, rakam, boşluk ve alt çizgi (_) kullanabilirsin.'
  return null
}

// Sunucu hatasını takma ad alanının altına mı, genel uyarıya mı yazalım?
export function nicknameServerError(err) {
  if (!err) return null
  if (err.status === 409) return err.message || 'Bu takma ad kullanılıyor, başka bir tane dener misin?'
  if (err.status === 400) {
    const fe = err.fieldErrors?.nickname
    if (fe) return fe
    if (/takma ad|gerçek ad|uygun değil|küfür|kelime/i.test(err.message || '')) return err.message
  }
  return null
}
