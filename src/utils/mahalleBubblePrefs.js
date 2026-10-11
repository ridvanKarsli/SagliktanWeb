// Yüzen ev düğmesinin (Sağlıktan'daki Mahalle kısayolu) tercihi ve konumu.
// Bu cihazda saklanır; localStorage kapalıysa (gizli sekme) yalnızca bu
// oturumda geçerli olur. Tercih Mahalle'nin kendi Ayarlar'ından değişir.
//  mode: 'normal' (kenarda, dokunulmayınca yarı saklanır)
//        'small'  (hep kenarda saklı, daha küçük; tamamen kapatma yok)
const MODE_KEY = 'sagliktan:mahalle-bubble-mode'
const LEGACY_ENABLED_KEY = 'sagliktan:mahalle-bubble' // eski açık/kapalı anahtarı
const POS_KEY = 'sagliktan:mahalle-bubble-pos'
export const MAHALLE_BUBBLE_EVENT = 'sagliktan:mahalle-bubble-change'
export const BUBBLE_MODES = ['normal', 'small']

let memoryMode = 'normal'

export function getMahalleBubbleMode() {
  try {
    const m = localStorage.getItem(MODE_KEY)
    if (BUBBLE_MODES.includes(m)) return m
    // geçiş: eskiden "kapalı" seçen kişiye artık "küçük" (kapatma yok)
    if (localStorage.getItem(LEGACY_ENABLED_KEY) === 'off') {
      localStorage.setItem(MODE_KEY, 'small')
      localStorage.removeItem(LEGACY_ENABLED_KEY)
      return 'small'
    }
    return memoryMode
  } catch {
    return memoryMode
  }
}

export function setMahalleBubbleMode(mode) {
  const m = BUBBLE_MODES.includes(mode) ? mode : 'normal'
  memoryMode = m
  try {
    localStorage.setItem(MODE_KEY, m)
    localStorage.removeItem(LEGACY_ENABLED_KEY)
  } catch { /* yalnızca bu oturum */ }
  try { window.dispatchEvent(new CustomEvent(MAHALLE_BUBBLE_EVENT)) } catch { /* eski tarayıcı */ }
}

// { side: 'left'|'right', frac: 0..1 } - frac kullanılabilir yüksekliğin oranı
export function readBubblePos() {
  try {
    const p = JSON.parse(localStorage.getItem(POS_KEY) || 'null')
    if (p && (p.side === 'left' || p.side === 'right') && typeof p.frac === 'number') {
      return { side: p.side, frac: Math.min(1, Math.max(0, p.frac)) }
    }
  } catch { /* bozuk kayıt: varsayılan */ }
  return { side: 'right', frac: 0.4 }
}

export function saveBubblePos(pos) {
  try { localStorage.setItem(POS_KEY, JSON.stringify(pos)) } catch { /* yalnızca bu oturum */ }
}

export const MAHALLE_BUBBLE_KEYS = { MODE_KEY, LEGACY_ENABLED_KEY, POS_KEY }
