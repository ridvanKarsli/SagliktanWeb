import { ForumOutlined, HelpOutlineRounded, PollOutlined } from '@mui/icons-material'

export const TITLE_MAX = 255
export const CONTENT_MAX = 10000
export const POLL_MIN_OPTIONS = 2
export const POLL_MAX_OPTIONS = 6
export const POLL_OPTION_MAX = 120

export const EMPTY_POLL_OPTIONS = Object.freeze(['', ''])

// Gönderi türleri ve her birine özel alan etiketleri/ipuçları.
export const POST_TYPES = [
  {
    value: 'DISCUSSION', label: 'Gönderi', icon: ForumOutlined,
    hint: 'Deneyimini, gününü ya da öğrendiğin bir şeyi paylaş.',
    titleLabel: 'Başlık', titlePlaceholder: 'Kısa ve anlaşılır bir başlık',
    contentLabel: 'İçerik', contentPlaceholder: 'Deneyimini anlat…'
  },
  {
    value: 'QUESTION', label: 'Soru', icon: HelpOutlineRounded,
    hint: 'Sorular "Cevap bekleyenler"de öne çıkar; en iyi cevabı sen seçersin.',
    titleLabel: 'Sorun', titlePlaceholder: 'Sorunu tek cümleyle yaz',
    contentLabel: 'Ayrıntılar', contentPlaceholder: 'Durumunu, neler denediğini ve neyi merak ettiğini anlat…'
  },
  {
    value: 'POLL', label: 'Anket', icon: PollOutlined,
    hint: 'Gruba tek dokunuşla yanıtlanacak bir soru sor (2-6 seçenek).',
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

// Boş olmayan, kırpılmış seçenekler ve anketin geçerliliği (en az 2 farklı seçenek).
export function normalizePollOptions(options) {
  const clean = options.map(o => o.trim()).filter(Boolean)
  const distinct = new Set(clean.map(o => o.toLocaleLowerCase('tr'))).size === clean.length
  return { clean, valid: clean.length >= POLL_MIN_OPTIONS && distinct }
}
