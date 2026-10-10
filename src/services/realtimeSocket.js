// src/services/realtimeSocket.js
//
// TEK paylaşımlı STOMP-over-WebSocket istemcisi. Bildirimler (notification-
// Socket.js) ve mesajlaşma (messagingSocket.js) eskiden iki ayrı bağlantı
// açıyordu: iki el sıkışma, iki kalp atışı, iki yeniden bağlanma döngüsü -
// mobil pil/veri için gereksiz. Burada bir bağlantı, hedef (destination)
// başına abone listesi tutulur; dış API'ler (connectXxxSocket) aynı kaldı.
//
// - @stomp/stompjs dinamik import: kütüphane (~15 KB gz) giriş paketine
//   girmez, ilk bağlantı isteğinde iner.
// - Yeniden bağlanma üstel (1 sn -> 30 sn) + küçük rastgele sapma (jitter):
//   sunucu/ağ döndüğünde binlerce istemci aynı milisaniyede yüklenmesin.
// - Sekme 60 sn'den uzun arka plandaysa bağlantı kapatılır (pil), görünür
//   olunca hemen yeniden açılır - kaçırılan bildirimler REST tazelemesiyle
//   (bkz. context'lerdeki refresh) telafi edilir.
// - JWT: STOMP CONNECT header'ında taşınır (tarayıcı WebSocket API'si
//   Authorization header'ı desteklemez - bkz. backend JwtHandshakeChannel-
//   Interceptor). Her (yeniden) bağlanmada depodaki taze token okunur,
//   dolmuşsa AuthContext'in tek-uçuş refresh kilidiyle yenilenir (bkz.
//   socketAuth.js) - bu yüzden bağlantı "token" değil "kullanıcı" ömürlüdür.
import { resolveFreshAccessToken } from './socketAuth.js'

const WS_BASE =
  import.meta.env.VITE_WS_BASE?.trim() ||
  (import.meta.env.DEV ? 'ws://localhost:8080/ws' : 'wss://api.sagliktan.com/ws')

const RECONNECT_DELAY_MS = 1000
const MAX_RECONNECT_DELAY_MS = 30000
const RECONNECT_JITTER_MS = 400
const HIDDEN_DISCONNECT_AFTER_MS = 60000

let client = null
let activating = null // dinamik import + activate sürüyor
let fallbackToken = null
let refCount = 0 // kaç context bağlantı istiyor
let connected = false
let pausedForVisibility = false
let hiddenTimer = null
let attempt = 0

// destination -> Set<handler>; handler(parsedPayload)
const handlers = new Map()
// destination -> StompSubscription (yalnızca bağlıyken)
const stompSubscriptions = new Map()
const statusListeners = new Set()

function setConnected(value) {
  if (connected === value) return
  connected = value
  statusListeners.forEach(fn => { try { fn(value) } catch { /* dinleyici hatası */ } })
}

function subscribeOnBroker(destination) {
  if (!client?.connected || stompSubscriptions.has(destination)) return
  const sub = client.subscribe(destination, (message) => {
    let payload
    try { payload = JSON.parse(message.body) } catch { return } // ayrıştırılamayan mesaj yoksayılır
    handlers.get(destination)?.forEach(fn => { try { fn(payload) } catch (err) { console.error('Realtime dinleyici hatası:', err) } })
  })
  stompSubscriptions.set(destination, sub)
}

async function createClient() {
  const { Client, ReconnectionTimeMode } = await import('@stomp/stompjs')
  const c = new Client({
    brokerURL: WS_BASE,
    reconnectDelay: RECONNECT_DELAY_MS,
    maxReconnectDelay: MAX_RECONNECT_DELAY_MS,
    reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
    onStompError: (frame) => {
      console.error('WebSocket (STOMP) hatası:', frame.headers?.message, frame.body)
    },
    onWebSocketError: (event) => {
      console.error('WebSocket bağlantı hatası:', event?.type, event?.code, event?.reason)
    },
    onWebSocketClose: (event) => {
      if (!pausedForVisibility) console.warn('WebSocket kapandı:', event?.code, event?.reason)
      stompSubscriptions.clear()
      setConnected(false)
    },
    onDisconnect: () => {
      stompSubscriptions.clear()
      setConnected(false)
    },
  })
  c.beforeConnect = async () => {
    // Üstel gecikmeye küçük bir rastgele sapma ekle (stompjs'in kendi API'si
    // jitter sunmuyor): yalnızca YENİDEN bağlanmalarda.
    if (attempt > 0) await new Promise(r => setTimeout(r, Math.random() * RECONNECT_JITTER_MS))
    attempt += 1
    const fresh = await resolveFreshAccessToken(fallbackToken)
    if (fresh) c.connectHeaders = { Authorization: `Bearer ${fresh}` }
  }
  c.onConnect = () => {
    attempt = 0
    // Kayıtlı tüm hedeflere abone ol; SUBSCRIBE frame'leri gönderildikten
    // SONRA "bağlı" say (abonelik kurulmadan yayın yapılırsa mesaj kaybolur -
    // E2E bu bayrağı bekler, bkz. NotificationBell'deki test marker'ı).
    for (const destination of handlers.keys()) subscribeOnBroker(destination)
    setConnected(true)
  }
  return c
}

function activate() {
  if (client?.active || activating) return activating
  activating = (client ? Promise.resolve(client) : createClient().then(c => { client = c; return c }))
    .then(c => { if (refCount > 0 && !pausedForVisibility) c.activate() })
    .catch(err => console.error('WebSocket istemcisi başlatılamadı:', err))
    .finally(() => { activating = null })
  return activating
}

function deactivate() {
  stompSubscriptions.clear()
  setConnected(false)
  client?.deactivate().catch(() => {})
}

// --- Görünürlük: arka planda > 60 sn ise bağlantıyı bırak, dönünce aç. ---
function onVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    if (hiddenTimer || refCount === 0) return
    hiddenTimer = setTimeout(() => {
      hiddenTimer = null
      if (document.visibilityState !== 'hidden' || refCount === 0) return
      pausedForVisibility = true
      deactivate()
    }, HIDDEN_DISCONNECT_AFTER_MS)
    return
  }
  if (hiddenTimer) { clearTimeout(hiddenTimer); hiddenTimer = null }
  if (pausedForVisibility) {
    pausedForVisibility = false
    attempt = 0
    if (refCount > 0) activate()
  }
}
let visibilityBound = false
function bindVisibility() {
  if (visibilityBound || typeof document === 'undefined') return
  document.addEventListener('visibilitychange', onVisibilityChange)
  visibilityBound = true
}

// --- Dış API ---

/**
 * Bağlantıyı iste (referans sayımlı). token: ilk CONNECT için yedek; asıl
 * token her bağlanmada depodan taze okunur. Dönen release() çağrıldığında
 * ve başka isteyen kalmadığında bağlantı kapanır.
 */
export function acquireRealtimeConnection(token) {
  fallbackToken = token ?? fallbackToken
  refCount += 1
  bindVisibility()
  activate()
  let released = false
  return () => {
    if (released) return
    released = true
    refCount = Math.max(0, refCount - 1)
    if (refCount === 0) {
      if (hiddenTimer) { clearTimeout(hiddenTimer); hiddenTimer = null }
      pausedForVisibility = false
      deactivate()
    }
  }
}

/** Bir STOMP hedefine abone ol; handler ayrıştırılmış JSON gövdeyi alır. */
export function subscribeRealtime(destination, handler) {
  if (!handlers.has(destination)) handlers.set(destination, new Set())
  handlers.get(destination).add(handler)
  subscribeOnBroker(destination)
  return () => {
    const set = handlers.get(destination)
    if (!set) return
    set.delete(handler)
    if (set.size === 0) {
      handlers.delete(destination)
      const sub = stompSubscriptions.get(destination)
      stompSubscriptions.delete(destination)
      try { sub?.unsubscribe() } catch { /* bağlantı çoktan kapanmış olabilir */ }
    }
  }
}

/** Bağlı/kopuk durumunu dinle; hemen mevcut durumla bir kez çağrılır. */
export function onRealtimeStatus(fn) {
  statusListeners.add(fn)
  try { fn(connected) } catch { /* dinleyici hatası */ }
  return () => statusListeners.delete(fn)
}
