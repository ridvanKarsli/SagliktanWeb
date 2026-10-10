// src/services/messagingSocket.js
//
// Mesajlaşma olayları için ince sarmalayıcı: bağlantının kendisi artık
// realtimeSocket.js'teki TEK paylaşımlı STOMP istemcisi (bildirimlerle aynı
// soket, farklı kuyruklar). Dış API korunuyor: döndürülen nesne, ihtiyaç
// kalmadığında (logout, unmount) `.deactivate()` ile bırakılmalı.
import { acquireRealtimeConnection, onRealtimeStatus, subscribeRealtime } from './realtimeSocket.js'

/**
 * Backend'in iki ayrı kuyruğa push ettiği olayları (bkz.
 * MessageServiceImpl.pushNewMessage, MessageRequestServiceImpl.pushNewRequest)
 * dinler. onMessage: yeni sohbet mesajı geldiğinde, onMessageRequest: yeni
 * mesaj isteği geldiğinde çağrılır.
 */
export function connectMessagingSocket(token, { onMessage, onMessageRequest, onConnectionChange } = {}) {
  const unsubs = [
    subscribeRealtime('/user/queue/messages', (payload) => onMessage?.(payload)),
    subscribeRealtime('/user/queue/message-requests', (payload) => onMessageRequest?.(payload)),
  ]
  if (onConnectionChange) unsubs.push(onRealtimeStatus(onConnectionChange))
  const release = acquireRealtimeConnection(token)
  return {
    deactivate() {
      unsubs.forEach(fn => fn())
      release()
    }
  }
}
