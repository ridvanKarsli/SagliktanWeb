// Sitenin TEK doğrulama kaynağı: kullanıcının yazdığı/seçtiği her verinin
// kuralları ve Türkçe hata metinleri burada. Sınırlar backend'deki request
// DTO'ları (@Size/@NotBlank/@Email), NameValidator, CityValidator,
// MediaConstraints ve PollServiceImpl ile birebir aynı tutulmalı - asıl
// doğrulama yine sunucuda; burada amaç kullanıcıyı istek atmadan, alanın
// hemen altında ve anlaşılır biçimde yönlendirmek.
//
// Bileşenler kendi regex'ini yazmaz: buradaki sabitleri, temizleyicileri
// (cleanText...) ve *Error fonksiyonlarını kullanır. Her *Error fonksiyonu
// hata metni ya da null (geçerli) döner.
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, nameProblem } from './validateName.js'
import { getPasswordStrength } from './passwordStrength.js'
import { TR_CITIES } from './communityProfile.js'

export { isValidName } from './validateName.js'
export { getPasswordStrength }

/* ------------------------------------------------------------------ */
/* Sınırlar (backend ile aynı)                                         */
/* ------------------------------------------------------------------ */

export const LIMITS = Object.freeze({
  NAME_MIN: NAME_MIN_LENGTH, // NameValidator
  NAME_MAX: NAME_MAX_LENGTH,
  EMAIL_MAX: 254, // RFC 5321; backend'de ayrı @Size yok
  PASSWORD_MIN: 8, // Register/ChangePassword/ResetPasswordRequest @Size(min=8,max=100)
  PASSWORD_MAX: 100,
  CODE_LENGTH: 6, // AuthServiceImpl.VERIFICATION_CODE_LENGTH (doğrulama + sıfırlama)
  CITY_MAX: 60, // @Size(max=60) + @ValidCity
  BIO_MAX: 1000, // UpdateProfileRequest.bio
  TITLE_MAX: 255, // PostRequest.title
  CONTENT_MAX: 10000, // PostRequest.content
  COMMENT_MAX: 3000, // CommentRequest.content
  MESSAGE_MAX: 4000, // SendMessageRequest.content
  REPORT_REASON_MAX: 500, // ReportRequest.reason
  POLL_MIN_OPTIONS: 2, // PollServiceImpl
  POLL_MAX_OPTIONS: 6,
  POLL_OPTION_MAX: 120,
  PHOTOS_MAX: 6, // MediaConstraints.MAX_ATTACHMENTS_PER_POST
  PHOTO_MAX_BYTES: 8 * 1024 * 1024, // MediaConstraints.MAX_FILE_SIZE_BYTES (sıkıştırma SONRASI)
  // Sıkıştırmadan ÖNCE seçilen ham dosya için üst sınır: tarayıcının dev bir
  // görseli belleğe açmaya çalışıp donmasını önler (sıkıştırınca ~birkaç yüz KB).
  PHOTO_INPUT_MAX_BYTES: 30 * 1024 * 1024,
  SEARCH_MAX: 100, // arama kutuları (backend'de sınır yok, makul üst sınır)
  DIAGNOSIS_YEAR_MIN: 1900, // HealthProfileRequest @Min(1900); üst sınır içinde bulunulan yıl
})

// Sunucunun kabul ettiği fotoğraf tipleri (MediaConstraints.ALLOWED_CONTENT_TYPES).
export const ALLOWED_PHOTO_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp'])

// Sayaç bu orana gelince gösterilir (ör. %80): uzun metinlerde dikkat dağıtmasın.
const COUNTER_RATIO = 0.8

/* ------------------------------------------------------------------ */
/* Metin temizleme                                                     */
/* ------------------------------------------------------------------ */

// Baştaki/sondaki boşlukları ve görünmez karakterleri (sıfır genişlikli
// boşluk, BOM) atar. Yalnızca boşluktan oluşan metin '' olur.
const EDGE_INVISIBLE = /^[\s\u200B-\u200D\u2060\uFEFF]+|[\s\u200B-\u200D\u2060\uFEFF]+$/g
export function cleanText(value) {
  if (value == null) return ''
  return String(value).replace(EDGE_INVISIBLE, '')
}

export function isBlank(value) {
  return cleanText(value) === ''
}

// Tek satırlık alanlar (ad, başlık, anket seçeneği): ek olarak içteki art
// arda boşlukları teke indirir ve satır sonlarını boşluğa çevirir (yapıştırma).
export function cleanLine(value) {
  return cleanText(value).replace(/\s+/g, ' ')
}

// Yazarken üst sınırı aşan yapıştırmaları keser (maxLength'e ek güvence:
// dikte ve programatik değişiklikler maxLength'i atlar).
export function clampLength(value, max) {
  const s = value == null ? '' : String(value)
  return s.length > max ? s.slice(0, max) : s
}

// Karakter sayacı: sınıra yaklaşınca "1.234/3.000" metni, aksi halde ''.
export function counterText(value, max, { always = false } = {}) {
  const len = (value || '').length
  if (!always && len < max * COUNTER_RATIO) return ''
  const fmt = (n) => n.toLocaleString('tr-TR')
  return `${fmt(len)}/${fmt(max)}`
}

export function isAtLimit(value, max) {
  return (value || '').length >= max
}

/* ------------------------------------------------------------------ */
/* Türkçe duyarlı karşılaştırma                                        */
/* ------------------------------------------------------------------ */

const TR_FOLD = { ı: 'i', ğ: 'g', ü: 'u', ş: 's', ö: 'o', ç: 'c', â: 'a', î: 'i', û: 'u' }

// Türkçe küçük harfe çevirip aksanları katlar: "İzmir", "izmir", "IZMIR",
// "Izmir" ve "ızmir" aynı anahtara ("izmir") düşer; "canakkale" de
// "Çanakkale"yi bulur. Yalnızca arama/eşleştirme için - gösterim için değil.
export function foldTr(value) {
  return (value || '')
    .trim()
    .replace(/I/g, 'i') // İngilizce klavyede "I" çoğunlukla "İ" kastıyla yazılır
    .toLocaleLowerCase('tr')
    .replace(/[ığüşöçâîû]/g, ch => TR_FOLD[ch])
}

// Önce "ile başlayanlar", sonra "içerenler" (Türkçe duyarlı, büyük/küçük harf
// duyarsız). getLabel ile nesne listelerinde de kullanılabilir.
export function filterPrefixFirst(options, query, { getLabel = (o) => o, limit = Infinity } = {}) {
  const q = foldTr(query)
  if (!q) return limit === Infinity ? options : options.slice(0, limit)
  const starts = []
  const contains = []
  for (const o of options) {
    const label = foldTr(getLabel(o))
    if (label.startsWith(q)) starts.push(o)
    else if (label.includes(q)) contains.push(o)
  }
  return [...starts, ...contains].slice(0, limit)
}

/* ------------------------------------------------------------------ */
/* Ad / soyad (NameValidator)                                          */
/* ------------------------------------------------------------------ */

const NAME_LABELS = {
  first: { empty: 'Adını yaz.', noun: 'Ad' },
  last: { empty: 'Soyadını yaz.', noun: 'Soyad' },
}

export function nameError(value, kind = 'first') {
  const l = NAME_LABELS[kind] || NAME_LABELS.first
  switch (nameProblem(cleanLine(value))) {
    case 'empty': return l.empty
    case 'short': return `${l.noun} en az ${LIMITS.NAME_MIN} harf olmalı.`
    case 'long': return `${l.noun} en fazla ${LIMITS.NAME_MAX} karakter olabilir.`
    case 'chars': return `${l.noun} yalnızca harflerden oluşabilir (arada boşluk, tire ya da kesme işareti olabilir).`
    case 'banned': return `Lütfen gerçek ${kind === 'last' ? 'soyadını' : 'adını'} yaz.`
    default: return null
  }
}

/* ------------------------------------------------------------------ */
/* E-posta                                                             */
/* ------------------------------------------------------------------ */

// Backend EmailValidator.EMAIL_PATTERN (kayıtta zorunlu) ile aynı.
const EMAIL_PATTERN = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const TR_CHARS = /[çğıöşüÇĞİÖŞÜ]/

// Backend e-postayı kırpıp küçük harfe çevirerek saklıyor/arıyor
// (AuthServiceImpl.normalizeEmail) - istemci de aynısını gönderir.
export function normalizeEmail(value) {
  return cleanText(value).toLowerCase()
}

export function emailError(value) {
  const v = cleanText(value)
  if (!v) return 'E-posta adresini yaz.'
  if (/\s/.test(v)) return 'E-posta adresinde boşluk olamaz.'
  if (TR_CHARS.test(v)) return 'E-posta adresinde Türkçe karakter (ç, ğ, ı, ö, ş, ü) olamaz.'
  if (!v.includes('@')) return 'E-posta adresinde "@" işareti eksik görünüyor.'
  if (v.length > LIMITS.EMAIL_MAX) return 'E-posta adresi çok uzun.'
  if (!EMAIL_PATTERN.test(v) || v.includes('..') || /@[.-]|[.-]$/.test(v)) {
    return 'Geçerli bir e-posta adresi yaz (örn. ad@ornek.com).'
  }
  return null
}

// Giriş/şifre sıfırlama isteği: yalnızca bariz biçim hataları (eski/özel
// hesapları dışarıda bırakmamak için kayıttaki katı desen uygulanmaz).
export function loginEmailError(value) {
  const v = cleanText(value)
  if (!v) return 'E-posta adresini yaz.'
  if (/\s/.test(v)) return 'E-posta adresinde boşluk olamaz.'
  if (!/^[^@]+@[^@]+$/.test(v)) return 'E-posta adresinde "@" işareti eksik ya da fazla görünüyor.'
  if (v.length > LIMITS.EMAIL_MAX) return 'E-posta adresi çok uzun.'
  return null
}

// Sık kullanılan sağlayıcılarda yazım hatası önerisi ("gmial.com" →
// "gmail.com"). Engellemez; alanın altında "Bunu mu demek istedin?" olarak gösterilir.
const COMMON_DOMAINS = [
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'yandex.com',
  'hotmail.com.tr', 'outlook.com.tr', 'yahoo.com.tr', 'live.com', 'msn.com', 'mynet.com',
]
// Gerçek ama yaygın bir alan adına çok benzeyen domain'ler: öneri yapma.
const KNOWN_DOMAINS = new Set([
  ...COMMON_DOMAINS, 'mail.com', 'email.com', 'ymail.com', 'gmx.com', 'gmx.de', 'me.com', 'mac.com', 'aol.com',
  'proton.me', 'protonmail.com', 'yandex.ru', 'hotmail.co.uk', 'live.co.uk', 'windowslive.com', 'googlemail.com',
])

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = tmp
    }
  }
  return prev[b.length]
}

export function suggestEmail(value) {
  const v = normalizeEmail(value)
  const at = v.lastIndexOf('@')
  if (at < 1) return null
  const domain = v.slice(at + 1)
  if (domain.length < 4 || KNOWN_DOMAINS.has(domain)) return null
  let best = null
  let bestDist = 3
  for (const d of COMMON_DOMAINS) {
    const dist = editDistance(domain, d)
    if (dist < bestDist) { best = d; bestDist = dist }
  }
  return best && bestDist <= 2 ? `${v.slice(0, at)}@${best}` : null
}

/* ------------------------------------------------------------------ */
/* Şifre                                                               */
/* ------------------------------------------------------------------ */

// Giriş/hesap silme: yalnızca boş olmasın (eski hesapların şifresi kısa olabilir).
export function currentPasswordError(value) {
  return value ? null : 'Şifreni yaz.'
}

// Yeni şifre (kayıt, sıfırlama, değiştirme). Şifre KIRPILMAZ - boşluk da
// şifrenin parçası olabilir; ama baştaki/sondaki boşluk çoğunlukla
// kopyala-yapıştır kazasıdır, kullanıcıyı uyarırız.
export function newPasswordError(value, { current } = {}) {
  if (!value) return 'Bir şifre belirle.'
  if (value.length < LIMITS.PASSWORD_MIN) return `Şifre en az ${LIMITS.PASSWORD_MIN} karakter olmalı.`
  if (value.length > LIMITS.PASSWORD_MAX) return `Şifre en fazla ${LIMITS.PASSWORD_MAX} karakter olabilir.`
  if (value !== value.trim()) return 'Şifrenin başında ya da sonunda boşluk var; yanlışlıkla eklendiyse sil.'
  if (current && value === current) return 'Yeni şifren mevcut şifrenden farklı olmalı.'
  return null
}

export function confirmPasswordError(confirm, password) {
  if (!confirm) return 'Şifreni bir kez daha yaz.'
  if (confirm !== password) return 'Şifreler aynı değil.'
  return null
}

/* ------------------------------------------------------------------ */
/* E-posta ile gelen 6 haneli kod                                      */
/* ------------------------------------------------------------------ */

// Yapıştırılan "123 456" / "Kod: 123456" gibi değerlerden yalnızca rakamları alır.
export function sanitizeCode(value) {
  return (value || '').replace(/\D/g, '').slice(0, LIMITS.CODE_LENGTH)
}

export function codeError(value) {
  const v = sanitizeCode(value)
  if (!v) return 'E-postana gelen kodu yaz.'
  if (v.length !== LIMITS.CODE_LENGTH) return `Kod ${LIMITS.CODE_LENGTH} haneli olmalı.`
  return null
}

/* ------------------------------------------------------------------ */
/* Şehir (CityValidator / TurkishCities)                               */
/* ------------------------------------------------------------------ */

const CITY_SET = new Set(TR_CITIES)
const CITY_BY_FOLD = new Map(TR_CITIES.map(c => [foldTr(c), c]))

export function isValidCity(value) {
  return CITY_SET.has(cleanText(value))
}

// Kayıtlı değer listede yoksa (eski serbest metin, "Yurt dışı"...) boş sayılır.
export function normalizeCity(value) {
  const v = cleanText(value)
  return CITY_SET.has(v) ? v : ''
}

// Yazılan metin bir ilin adıyla (Türkçe duyarlı) birebir eşleşiyorsa o il.
export function matchCity(text) {
  return CITY_BY_FOLD.get(foldTr(text)) || null
}

export function cityError(value) {
  const v = cleanText(value)
  if (!v) return null // isteğe bağlı
  return CITY_SET.has(v) ? null : 'Lütfen listeden bir il seç.'
}

/* ------------------------------------------------------------------ */
/* Tanı yılı                                                           */
/* ------------------------------------------------------------------ */

export function currentYear() {
  return new Date().getFullYear()
}

export function isValidDiagnosisYear(year) {
  if (year == null || year === '') return true // isteğe bağlı
  const n = Number(year)
  return Number.isInteger(n) && n >= LIMITS.DIAGNOSIS_YEAR_MIN && n <= currentYear()
}

// Geçersiz/eski değer => null (seçim kutusu boş görünür).
export function normalizeDiagnosisYear(year) {
  return year != null && year !== '' && isValidDiagnosisYear(year) ? Number(year) : null
}

const ROLE_VALUES = new Set(['PATIENT', 'CAREGIVER', 'PROFESSIONAL', 'OTHER'])

// Sağlık özeti (HealthProfileRequest): kayıtlı/girilen değerleri geçerli
// kümeye indirger - listede olmayan şehir, aralık dışı yıl, bilinmeyen rol boşalır.
export function cleanHealthProfile(p = {}) {
  return {
    communityRole: ROLE_VALUES.has(p.communityRole) ? p.communityRole : null,
    diagnosisYear: normalizeDiagnosisYear(p.diagnosisYear),
    city: normalizeCity(p.city),
    discoverable: !!p.discoverable,
  }
}

export function healthProfileErrors(p = {}) {
  return {
    diagnosisYear: isValidDiagnosisYear(p.diagnosisYear) ? null : 'Geçerli bir tanı yılı seç.',
    city: cityError(p.city),
  }
}

/* ------------------------------------------------------------------ */
/* Serbest metin alanları                                              */
/* ------------------------------------------------------------------ */

// Zorunlu metin: boş/yalnızca boşluk ya da sınır aşımı.
export function requiredTextError(value, { max, empty, noun = 'Metin' }) {
  const v = cleanText(value)
  if (!v) return empty
  if (max && v.length > max) return `${noun} en fazla ${max.toLocaleString('tr-TR')} karakter olabilir.`
  return null
}

export function optionalTextError(value, { max, noun = 'Metin' }) {
  const v = cleanText(value)
  if (max && v.length > max) return `${noun} en fazla ${max.toLocaleString('tr-TR')} karakter olabilir.`
  return null
}

export const postTitleError = (v) => requiredTextError(v, { max: LIMITS.TITLE_MAX, empty: 'Başlık yaz.', noun: 'Başlık' })
export const postContentError = (v, empty = 'Paylaşmak istediğin metni yaz.') => requiredTextError(v, { max: LIMITS.CONTENT_MAX, empty, noun: 'Metin' })
export const commentError = (v) => requiredTextError(v, { max: LIMITS.COMMENT_MAX, empty: 'Yorum boş olamaz.', noun: 'Yorum' })
export const replyError = (v) => requiredTextError(v, { max: LIMITS.COMMENT_MAX, empty: 'Yanıt boş olamaz.', noun: 'Yanıt' })
export const messageError = (v) => optionalTextError(v, { max: LIMITS.MESSAGE_MAX, noun: 'Mesaj' })
export const bioError = (v) => optionalTextError(v, { max: LIMITS.BIO_MAX, noun: 'Hakkında yazısı' })
export const reportReasonError = (v) => optionalTextError(v, { max: LIMITS.REPORT_REASON_MAX, noun: 'Açıklama' })

/* ------------------------------------------------------------------ */
/* Anket seçenekleri (PollServiceImpl.normalize)                       */
/* ------------------------------------------------------------------ */

// Boş seçenekler atlanır, büyük/küçük harf duyarsız (Türkçe) tekrarlar ve
// uzunluk reddedilir, 2-6 aralığı zorunlu. Dönüş:
// { clean, valid, optionErrors: [msg|null per input], error: genel mesaj|null }
export function validatePollOptions(options) {
  const list = Array.isArray(options) ? options : []
  const seen = new Map()
  const optionErrors = list.map(() => null)
  const clean = []
  list.forEach((raw, i) => {
    const v = cleanLine(raw)
    if (!v) return
    if (v.length > LIMITS.POLL_OPTION_MAX) {
      optionErrors[i] = `Seçenek en fazla ${LIMITS.POLL_OPTION_MAX} karakter olabilir.`
      return
    }
    const key = v.toLocaleLowerCase('tr')
    if (seen.has(key)) {
      optionErrors[i] = `Bu seçenek ${seen.get(key) + 1}. seçenekle aynı.`
      return
    }
    seen.set(key, i)
    clean.push(v)
  })
  let error = null
  if (clean.length < LIMITS.POLL_MIN_OPTIONS) error = `Ankete en az ${LIMITS.POLL_MIN_OPTIONS} farklı seçenek yaz.`
  else if (clean.length > LIMITS.POLL_MAX_OPTIONS) error = `Bir ankette en fazla ${LIMITS.POLL_MAX_OPTIONS} seçenek olabilir.`
  const valid = !error && optionErrors.every(e => e == null)
  return { clean, valid, optionErrors, error: error || (valid ? null : 'Anket seçeneklerini kontrol et.') }
}

/* ------------------------------------------------------------------ */
/* Fotoğraflar (MediaConstraints)                                      */
/* ------------------------------------------------------------------ */

const formatMb = (bytes) => `${Math.round(bytes / (1024 * 1024))} MB`

// Seçilen ham dosya (sıkıştırmadan önce).
export function photoInputError(file) {
  if (!file) return 'Fotoğraf seçilemedi.'
  // Bazı Android galerileri type'ı boş bırakır; uzantıya da bak.
  const looksImage = (file.type || '').startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|gif|bmp|avif)$/i.test(file.name || '')
  if (!looksImage) return 'Yalnızca fotoğraf ekleyebilirsin.'
  if (file.size > LIMITS.PHOTO_INPUT_MAX_BYTES) return `Bu fotoğraf çok büyük (en fazla ${formatMb(LIMITS.PHOTO_INPUT_MAX_BYTES)}).`
  return null
}

// Sıkıştırılmış, yüklenecek dosya - sunucu ile aynı kural.
export function photoUploadError(file) {
  if (!ALLOWED_PHOTO_TYPES.includes(file?.type)) return 'Bu fotoğraf biçimi desteklenmiyor. JPEG, PNG ya da WebP dene.'
  if (file.size > LIMITS.PHOTO_MAX_BYTES) return `Fotoğraf çok büyük (en fazla ${formatMb(LIMITS.PHOTO_MAX_BYTES)}).`
  return null
}

// compressImage'ın tarayıcıdan gelen (İngilizce, teknik) hatası yerine.
export const PHOTO_DECODE_ERROR = 'Bu fotoğraf açılamadı. Farklı bir fotoğraf dene (HEIC ise JPEG olarak kaydetmeyi deneyebilirsin).'

/* ------------------------------------------------------------------ */
/* Arama                                                               */
/* ------------------------------------------------------------------ */

export function cleanSearch(value) {
  return clampLength(cleanLine(value), LIMITS.SEARCH_MAX)
}

/* ------------------------------------------------------------------ */
/* Sunucu hataları                                                     */
/* ------------------------------------------------------------------ */

// ApiError.fieldErrors ({ "firstName": "...", "pollOptions[0]": "..." })
// → { firstName: "...", pollOptions: "..." }. aliases ile backend alan adı
// farklı bir form alanına eşlenebilir (ör. { newPassword: 'password' }).
export function fieldErrorsFrom(err, aliases = {}) {
  const raw = err?.fieldErrors
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  for (const [key, msg] of Object.entries(raw)) {
    const base = key.replace(/\[\d+\].*$/, '').split('.')[0]
    const field = aliases[base] || base
    if (!out[field]) out[field] = msg
  }
  return out
}

// Backend'in alan adı vermeden döndüğü bilinen mesajları bir alana bağla
// (ör. "Mevcut şifre hatalı" → currentPassword). rules: [[/regex/, 'field']]
export function fieldFromMessage(err, rules) {
  const msg = err?.message || ''
  for (const [re, field] of rules) if (re.test(msg)) return { [field]: msg }
  return {}
}
