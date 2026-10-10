// Kullanıcının üye olduğu hastalık grupları için PAYLAŞIMLI önbellek.
//
// /users/me/disease-groups aynı oturumda yedi ayrı yerden (ana sayfa, gönderi
// penceresi, profil, karşılama, grup sayfaları, detay...) ayrı ayrı
// isteniyordu; çoğu aynı birkaç saniye içinde. Burada tek bir söz (promise)
// paylaşılır: aynı anda gelen çağrılar aynı isteği bekler, sonucu süre
// dolana (TTL) ya da üyelik değişene (invalidateMyGroups - bkz.
// useGroupMembership, Onboarding) kadar herkes kullanır.
//
// Tüketiciler için React tarafı: hooks/useMyDiseaseGroups.js.
import { getMyDiseaseGroups } from './api.js'

const TTL_MS = 5 * 60 * 1000

let state = { token: null, data: null, ts: 0, promise: null }
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => { try { fn(state.data) } catch { /* dinleyici hatası diğerlerini engellemesin */ } })
}

// Önbellekteki (taze) listeyi senkron okur; yoksa null.
export function peekMyGroups(token) {
  if (!token || state.token !== token || !state.data) return null
  if (Date.now() - state.ts > TTL_MS) return null
  return state.data
}

// Listeyi getirir; taze bir kopya varsa ağa çıkmaz. force: önbelleği atla.
// Bilerek AbortSignal almaz: istek paylaşımlı, bir tüketicinin unmount olup
// iptal etmesi diğerlerinin yanıtını düşürmemeli - tüketici yanıtı kendi
// tarafında yoksayar (bkz. useMyDiseaseGroups).
export function fetchMyGroups(token, { force = false } = {}) {
  if (!token) return Promise.resolve([])
  const cached = peekMyGroups(token)
  if (cached && !force) return Promise.resolve(cached)
  if (state.promise && state.token === token && !force) return state.promise

  const promise = getMyDiseaseGroups(token)
    .then((list) => {
      const data = Array.isArray(list) ? list : []
      // Bu arada token değiştiyse (çıkış/giriş) sonucu yazma.
      if (state.token === token) {
        state = { token, data, ts: Date.now(), promise: null }
        notify()
      }
      return data
    })
    .catch((err) => {
      if (state.promise === promise) state.promise = null
      throw err
    })
  state = { ...state, token, promise }
  return promise
}

// Üyelik değişti (katıl/ayrıl): önbelleği düşür ve abonelere haber ver;
// açık ekranlar yeniden çeker.
export function invalidateMyGroups() {
  state = { token: state.token, data: null, ts: 0, promise: null }
  notify()
}

// Çıkışta başka kullanıcının listesi sızmasın.
export function clearMyGroups() {
  state = { token: null, data: null, ts: 0, promise: null }
  notify()
}

export function subscribeMyGroups(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
