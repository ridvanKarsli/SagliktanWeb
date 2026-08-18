// Basit, bağımlılıksız şifre gücü sezgiseli (zxcvbn gibi ağır bir kütüphane
// eklemeden - bkz. görev #304: sadece kullanıcıya kaba bir geri bildirim
// vermek yeterli, kriptografik bir değerlendirme değil). 0-4 arası puan
// döner; her biri bir çeşitlilik/uzunluk kriterine karşılık gelir.
export function getPasswordStrength(password) {
  const pw = password || ''
  if (!pw) return { score: 0, label: '', color: 'text.secondary' }

  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++

  // 5 kritere karşılık 0-4 aralığına sıkıştır (min 1 - boş olmayan her
  // şifre en azından "Zayıf" gösterilsin).
  const clamped = Math.max(1, Math.min(4, score))

  const levels = {
    1: { label: 'Zayıf', color: '#E08078' },
    2: { label: 'Orta', color: '#E0A85E' },
    3: { label: 'İyi', color: '#7FAEBD' },
    4: { label: 'Güçlü', color: '#4CB89F' },
  }

  return { score: clamped, ...levels[clamped] }
}
