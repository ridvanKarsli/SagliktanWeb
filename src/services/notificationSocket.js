// src/services/notificationSocket.js
//
// Gerçek zamanlı bildirimler: bağlantının kendisi realtimeSocket.js'teki TEK
// paylaşımlı STOMP istemcisi (mesajlaşmayla aynı soket). Backend'in WS
// endpoint'i (bkz. SagliktanApi WebSocketConfig) kendi origin allowlist'ini
// kullanıyor ve Vercel'in /api rewrite'ı sadece HTTP içindir - WebSocket
// upgrade'ini güvenilir şekilde proxy'lemez. Bu yüzden backend'e DOĞRUDAN
// bağlanılır (bkz. vercel.json - CSP connect-src'ye backend origin'i bunun
// için eklendi; adres realtimeSocket.js'te).
import { acquireRealtimeConnection, onRealtimeStatus, subscribeRealtime } from './realtimeSocket.js'

/**
 * Bildirim kuyruğuna abone olur ve bağlantıyı ister. Döndürülen nesne,
 * ihtiyaç kalmadığında (logout, unmount) `.deactivate()` ile bırakılmalı.
 * onConnectionChange(bool): abonelik gerçekten kurulduktan sonra true
 * (bkz. NotificationsFeedContext / NotificationBell'deki test marker'ı).
 */
export function connectNotificationSocket(token, { onNotification, onConnectionChange } = {}) {
  const unsubs = [subscribeRealtime('/user/queue/notifications', (payload) => onNotification?.(payload))]
  if (onConnectionChange) unsubs.push(onRealtimeStatus(onConnectionChange))
  const release = acquireRealtimeConnection(token)
  return {
    deactivate() {
      unsubs.forEach(fn => fn())
      release()
    }
  }
}
