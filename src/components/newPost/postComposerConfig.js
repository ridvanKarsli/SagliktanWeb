import { ForumOutlined, HelpOutlineRounded, PollOutlined } from '@mui/icons-material'
import { LIMITS, validatePollOptions } from '../../utils/validation.js'

// Sınırların tek kaynağı utils/validation.js (backend PostRequest/PollServiceImpl).
export const TITLE_MAX = LIMITS.TITLE_MAX
export const CONTENT_MAX = LIMITS.CONTENT_MAX
export const POLL_MIN_OPTIONS = LIMITS.POLL_MIN_OPTIONS
export const POLL_MAX_OPTIONS = LIMITS.POLL_MAX_OPTIONS
export const POLL_OPTION_MAX = LIMITS.POLL_OPTION_MAX

export const EMPTY_POLL_OPTIONS = Object.freeze(['', ''])

// Gönderi türleri ve her birine özel alan etiketleri/ipuçları.
export const POST_TYPES = [
  {
    value: 'DISCUSSION', label: 'Gönderi', icon: ForumOutlined,
    hint: 'Bir deneyim, gününden bir an ya da küçük bir sevinç. Ne paylaşırsan, okuyan birine iyi gelebilir.',
    titleLabel: 'Başlık', titlePlaceholder: 'Kısa ve anlaşılır bir başlık',
    contentLabel: 'İçerik', contentPlaceholder: 'Deneyimini anlat…'
  },
  {
    value: 'QUESTION', label: 'Soru', icon: HelpOutlineRounded,
    hint: 'Sorun "Cevap bekleyenler"de öne çıkar; deneyimi olanlar yanıtlar, en işine yarayanı sen seçersin.',
    titleLabel: 'Sorun', titlePlaceholder: 'Sorunu tek cümleyle yaz',
    contentLabel: 'Ayrıntılar', contentPlaceholder: 'Durumunu, neler denediğini ve neyi merak ettiğini anlat…'
  },
  {
    value: 'POLL', label: 'Anket', icon: PollOutlined,
    hint: 'Gruba tek dokunuşla yanıtlanacak bir soru sor (2-6 seçenek). Oy verenler sonuçları hemen görür.',
    titleLabel: 'Anket sorusu', titlePlaceholder: 'Örn. Hangi tedaviyi denediniz?',
    contentLabel: 'Açıklama', contentPlaceholder: 'Neden soruyorsun? Kısa bir açıklama ekle…'
  },
]

export function postTypeMeta(value) {
  return POST_TYPES.find(t => t.value === value) || POST_TYPES[0]
}

export function isKnownPostType(value) {
  return POST_TYPES.some(t => t.value === value)
}

// Boş olmayan, kırpılmış seçenekler, anketin geçerliliği ve seçenek bazlı
// hatalar (bkz. validation.validatePollOptions).
export const normalizePollOptions = validatePollOptions
