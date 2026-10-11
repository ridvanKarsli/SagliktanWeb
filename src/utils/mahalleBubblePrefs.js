// "Mahalle kısayolu" (yüzen düğme) tercihi ve konumu. Bu cihazda saklanır;
// localStorage kapalıysa (gizli sekme) yalnızca bu oturumda geçerli olur.
const ENABLED_KEY = 'sagliktan:mahalle-bubble'
const POS_KEY = 'sagliktan:mahalle-bubble-pos'
export const MAHALLE_BUBBLE_EVENT = 'sagliktan:mahalle-bubble-change'

let memoryEnabled = true

export function isMahalleBubbleEnabled() {
  try {
    const v = localStorage.getItem(ENABLED_KEY)
    return v === null ? memoryEnabled : v !== 'off'
  } catch {
    return memoryEnabled
  }
}

export function setMahalleBubbleEnabled(on) {
  memoryEnabled = !!on
  try { localStorage.setItem(ENABLED_KEY, on ? 'on' : 'off') } catch { /* yalnızca bu oturum */ }
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

export const MAHALLE_BUBBLE_KEYS = { ENABLED_KEY, POS_KEY }
