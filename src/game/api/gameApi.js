// Sağlıktan Mahalle REST istemcisi (bkz. SagliktanApi/docs/game-api.md).
// Uygulamanın ortak `request` yardımcısını kullanır: token, zaman aşımı,
// 401'de tek seferlik yenileme, ApiError ve 429 mesajları aynen geçerli.
import { request, API_BASE } from '../../services/api.js'

const B = '/game'

// --- Profil ---
export const getMe = (token, { signal } = {}) => request(`${B}/me`, { token, signal, fresh: true })
export const createMe = (token, { nickname, appearance, petKey }) =>
  request(`${B}/me`, { method: 'POST', token, body: { nickname, appearance, petKey: petKey ?? null } })
export const updateAppearance = (token, appearance) => request(`${B}/me/appearance`, { method: 'PUT', token, body: { appearance } })
export const updatePet = (token, petKey) => request(`${B}/me/pet`, { method: 'PUT', token, body: { petKey: petKey ?? null } })
export const updateNickname = (token, nickname) => request(`${B}/me/nickname`, { method: 'PUT', token, body: { nickname } })
export const updateSettings = (token, roomVisibility) => request(`${B}/me/settings`, { method: 'PUT', token, body: { roomVisibility } })
export const claimDaily = (token) => request(`${B}/me/daily`, { method: 'POST', token })

// --- Katalog ve mağaza ---
export const getCatalog = (token, { signal } = {}) => request(`${B}/catalog`, { token, signal })
export const buyItem = (token, itemKey) => request(`${B}/shop/buy`, { method: 'POST', token, body: { itemKey } })

// --- Odalar ---
export const getMyRoom = (token, { signal } = {}) => request(`${B}/rooms/me`, { token, signal, fresh: true })
export const saveMyRoom = (token, items) => request(`${B}/rooms/me`, { method: 'PUT', token, body: { items } })
export const getRoom = (token, publicId, { signal } = {}) => request(`${B}/rooms/${encodeURIComponent(publicId)}`, { token, signal, fresh: true })
export const getNeighbors = (token, { page = 0, size = 20, signal } = {}) => request(`${B}/neighbors`, { token, signal, params: { page, size }, fresh: true })
export const getVisitors = (token, { signal } = {}) => request(`${B}/visitors`, { token, signal, fresh: true })

// --- Hediyeler ---
export const sendGift = (token, { toPublicId, giftKey, messageKey }) =>
  request(`${B}/gifts`, { method: 'POST', token, body: { toPublicId, giftKey, messageKey } })
export const getGifts = (token, { page = 0, size = 20, signal } = {}) => request(`${B}/gifts`, { token, signal, params: { page, size }, fresh: true })
export const markGiftsSeen = (token) => request(`${B}/gifts/seen`, { method: 'POST', token })

// --- Engel / şikayet ---
export const blockPlayer = (token, publicId) => request(`${B}/players/${encodeURIComponent(publicId)}/block`, { method: 'POST', token })
export const unblockPlayer = (token, publicId) => request(`${B}/players/${encodeURIComponent(publicId)}/block`, { method: 'DELETE', token })
export const getBlockedPlayers = (token, { signal } = {}) => request(`${B}/players/blocked`, { token, signal, fresh: true })
export const reportPlayer = (token, publicId, reason) =>
  request(`${B}/players/${encodeURIComponent(publicId)}/report`, { method: 'POST', token, body: reason ? { reason } : {} })

// --- Açık dünya ---
// spawn: doğma ipucu {x,y} (kapının toSpawn'ı ya da yeniden katılımda son konum).
// Sunucu sınır içindeyse oraya koyar; ayrı bir "move" gerekmez.
export const joinZone = (token, zone, { spawn, signal } = {}) =>
  request(`${B}/world/${encodeURIComponent(zone)}/join`, {
    method: 'POST', token, signal, body: spawn ? { x: spawn.x, y: spawn.y } : undefined,
  })
export const moveTo = (token, x, y) => request(`${B}/world/move`, { method: 'POST', token, body: { x, y } })
export const say = (token, { phraseKey, emoteKey }) =>
  request(`${B}/world/say`, { method: 'POST', token, body: phraseKey ? { phraseKey } : { emoteKey } })
// Duruş (EK v1.1): { pose: 'stand'|'sit'|'lie', facing, flip, held|null }
export const setPose = (token, { pose, facing, flip, held }) =>
  request(`${B}/world/pose`, { method: 'POST', token, body: { pose, facing, flip: !!flip, held: held || null } })
export const heartbeat = (token) => request(`${B}/world/heartbeat`, { method: 'POST', token })
export const leaveWorld = (token) => request(`${B}/world/leave`, { method: 'POST', token })

// Sekme kapanırken (pagehide) normal fetch iptal edilebilir; keepalive ile
// "ayrıldım" isteği sayfa gittikten sonra da tamamlanır. Hata önemsiz:
// sunucu 70 sn sessizlikte zaten düşürür.
export function leaveWorldKeepalive(token) {
  try {
    fetch(`${API_BASE}${B}/world/leave`, {
      method: 'POST',
      keepalive: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {})
  } catch { /* eski tarayıcı: sunucu zaman aşımıyla düşürür */ }
}

// "Şu an bir bölgede değilsin, yeniden katıl" (sunucu bizi düşürmüş).
export const isNotInWorld = (err) => err?.status === 404
