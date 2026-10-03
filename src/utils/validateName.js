// Backend'deki NameValidator (SagliktanApi) ile aynı kural - burada sadece
// anlık kullanıcı geri bildirimi için, gerçek kaynak backend'de. İki
// aşamalı: 1) yapısal (sadece harf + boşluk/tire/kesme işareti, art arda
// ayraç yok), 2) bilinen placeholder/şaka kelimeleri.
const STRUCTURE = /^\p{L}+(?:[ '-]\p{L}+)*$/u

export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 100

const BANNED_WORDS = new Set([
  'test', 'deneme', 'asdf', 'qwerty', 'yok', 'bilinmiyor',
  'isimyok', 'mal', 'salak', 'aptal', 'xxx', 'abc', 'isim', 'soyisim'
])

// Neden geçersiz olduğunu döner (null => geçerli). Mesajları
// utils/validation.js üretir; burada yalnızca backend kuralının birebir aynısı.
// 'empty' | 'short' | 'long' | 'chars' | 'banned' | null
export function nameProblem(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return 'empty'
  if (trimmed.length < NAME_MIN_LENGTH) return 'short'
  if (trimmed.length > NAME_MAX_LENGTH) return 'long'
  if (!STRUCTURE.test(trimmed)) return 'chars'

  const normalized = trimmed.toLocaleLowerCase('tr')
  if (BANNED_WORDS.has(normalized)) return 'banned'
  for (const word of normalized.split(/[ '-]+/)) {
    if (BANNED_WORDS.has(word)) return 'banned'
  }
  return null
}

export function isValidName(value) {
  return nameProblem(value) === null
}
