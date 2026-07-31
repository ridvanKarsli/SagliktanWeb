// Backend'deki NameValidator (SagliktanApi) ile aynı kural - burada sadece
// anlık kullanıcı geri bildirimi için, gerçek kaynak backend'de. İki
// aşamalı: 1) yapısal (sadece harf + boşluk/tire/kesme işareti, art arda
// ayraç yok), 2) bilinen placeholder/şaka kelimeleri.
const STRUCTURE = /^\p{L}+(?:[ '-]\p{L}+)*$/u

const MIN_LENGTH = 2
const MAX_LENGTH = 100

const BANNED_WORDS = new Set([
  'test', 'deneme', 'asdf', 'qwerty', 'yok', 'bilinmiyor',
  'isimyok', 'mal', 'salak', 'aptal', 'xxx', 'abc', 'isim', 'soyisim'
])

export function isValidName(value) {
  if (!value) return false
  const trimmed = value.trim()
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) return false
  if (!STRUCTURE.test(trimmed)) return false

  const normalized = trimmed.toLocaleLowerCase('tr')
  if (BANNED_WORDS.has(normalized)) return false
  for (const word of normalized.split(/[ '-]+/)) {
    if (BANNED_WORDS.has(word)) return false
  }
  return true
}
