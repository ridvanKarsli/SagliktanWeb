import { useSyncExternalStore } from 'react'
import { getAvatarOptions } from '../../services/api.js'

// Yol arkadaşı (avatar) seçenekleri için küçük, uygulama geneli önbellek ve
// "yeni açılanlar" takibi. Seçenekler bir oturumda en fazla bir kez çekilir
// (requestAvatarRecheck ile yeniden); hangi avatarların kişiye zaten
// gösterildiği cihazda (localStorage) kişi bazında tutulur:
//   seen  - kişinin açık olduğunu bildiği avatarlar
//   fresh - açılmış ama henüz hiç seçilmemiş "yeni" avatarlar (seçicide rozet)

const storageKey = (userId) => `sagliktan:avatars:${userId}`
const RECHECK_EVENT = 'sagliktan:avatars-recheck'

export function readUnlockMemory(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return { seen: null, fresh: [] }
    const parsed = JSON.parse(raw)
    return {
      seen: Array.isArray(parsed?.seen) ? parsed.seen : null,
      fresh: Array.isArray(parsed?.fresh) ? parsed.fresh : [],
    }
  } catch {
    return { seen: null, fresh: [] }
  }
}

function writeUnlockMemory(userId, memory) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(memory))
  } catch {
    // Gizli sekme / dolu depolama: kutlama bir dahaki sefere tekrar gösterilebilir, sorun değil.
  }
  emit()
}

/**
 * Sunucudan gelen seçeneklerle hafızayı eşitler ve YENİ açılanları döndürür.
 * İlk kez (hafıza yokken) sessizce başlatır: o ana kadar açık olanlar kutlanmaz.
 * celebrate=false iken yeniler kutlanmadan "fresh" olarak işaretlenir (seçici açıkken).
 */
export function syncUnlockMemory(userId, options) {
  const unlocked = (options?.avatars || []).filter(a => a.unlocked).map(a => a.key)
  const memory = readUnlockMemory(userId)
  if (memory.seen === null) {
    writeUnlockMemory(userId, { seen: unlocked, fresh: [] })
    return []
  }
  const newOnes = unlocked.filter(k => !memory.seen.includes(k))
  if (newOnes.length) {
    writeUnlockMemory(userId, {
      seen: [...new Set([...memory.seen, ...newOnes])],
      fresh: [...new Set([...memory.fresh, ...newOnes])],
    })
  }
  return (options.avatars || []).filter(a => newOnes.includes(a.key))
}

export function clearFresh(userId, key) {
  const memory = readUnlockMemory(userId)
  if (!memory.fresh.includes(key)) return
  writeUnlockMemory(userId, { ...memory, fresh: memory.fresh.filter(k => k !== key) })
}

// ---- Seçenek önbelleği (profil ilerleme ipucu, seçici ve izleyici paylaşır) ----

let state = { userId: null, options: null, version: 0 }
const listeners = new Set()
function emit() {
  state = { ...state, version: state.version + 1 }
  listeners.forEach(l => l())
}
function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setAvatarOptions(userId, options) {
  state = { ...state, userId, options }
  emit()
}

/** Bu kişinin önbellekteki seçenekleri ve "yeni" avatar listesi. */
export function useAvatarOptions(userId) {
  const snap = useSyncExternalStore(subscribe, () => state)
  const options = userId != null && String(snap.userId) === String(userId) ? snap.options : null
  const fresh = userId != null ? readUnlockMemory(userId).fresh : []
  return { options, fresh }
}

// Aynı anda birden fazla izleyici takılı olsa bile tek istek, tek kutlama.
let checkedFor = null
let inflight = null

/**
 * Seçenekleri (oturumda bir kez) çeker, hafızayla karşılaştırır. Dönen nesnede
 * newlyUnlocked ve claim(): kutlamayı yalnızca ilk çağıran yapar.
 */
export function checkAvatarUnlocks(token, userId, { force = false } = {}) {
  const key = String(userId)
  if (!force && checkedFor === key && inflight) return inflight
  checkedFor = key
  let claimed = false
  inflight = getAvatarOptions(token)
    .then(options => {
      setAvatarOptions(userId, options)
      const newlyUnlocked = syncUnlockMemory(userId, options)
      return {
        newlyUnlocked,
        claim: () => {
          if (claimed || !newlyUnlocked.length) return false
          claimed = true
          return true
        },
      }
    })
    .catch(() => {
      // İkincil özellik: sessizce vazgeç, sonraki istekte tekrar denenir.
      checkedFor = null
      inflight = null
      return { newlyUnlocked: [], claim: () => false }
    })
  return inflight
}

/** Faydalı oy alınabilecek bir olaydan sonra (ör. bildirim) yeniden kontrol iste. */
export function requestAvatarRecheck() {
  checkedFor = null
  inflight = null
  try { window.dispatchEvent(new Event(RECHECK_EVENT)) } catch { /* SSR yok */ }
}

export const AVATAR_RECHECK_EVENT = RECHECK_EVENT

/** Sıradaki kilitli avatar ve ona kalan oy (yoksa null). */
export function nextCompanion(options) {
  if (!options?.avatars) return null
  const helpful = options.helpfulReceived || 0
  const next = options.avatars
    .filter(a => !a.unlocked)
    .sort((a, b) => a.requiredHelpful - b.requiredHelpful)[0]
  if (!next) return null
  const prev = options.avatars
    .filter(a => a.unlocked)
    .reduce((m, a) => Math.max(m, a.requiredHelpful), 0)
  const span = Math.max(1, next.requiredHelpful - prev)
  return {
    avatar: next,
    remaining: Math.max(0, next.requiredHelpful - helpful),
    progress: Math.min(100, Math.max(0, ((helpful - prev) / span) * 100)),
  }
}
