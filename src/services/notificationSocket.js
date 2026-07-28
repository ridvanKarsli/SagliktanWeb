// src/services/notificationSocket.js
//
// Gerçek zamanlı bildirimler için STOMP over WebSocket bağlantısı.
// Backend'in WS endpoint'i (bkz. SagliktanApi WebSocketConfig) kendi CORS
// benzeri origin allowlist'ini kullanıyor ve Vercel'in /api rewrite'ı
// sadece HTTP içindir - WebSocket upgrade'ini güvenilir şekilde proxy'lemez.
// Bu yüzden burada backend'e DOĞRUDAN (Vercel'i atlayarak) bağlanıyoruz.
// (bkz. vercel.json - CSP connect-src'ye backend origin'i bunun için eklendi.)
import { Client } from '@stomp/stompjs'

const WS_BASE =
  import.meta.env.VITE_WS_BASE?.trim() ||
  (import.meta.env.DEV ? 'ws://localhost:8080/ws' : 'wss://api.sagliktan.com/ws')

/**
 * Bağlantıyı açar ve aktive eder. Döndürülen client, ihtiyaç kalmadığında
 * (ör. logout, unmount) `.deactivate()` ile kapatılmalı.
 */
export function connectNotificationSocket(token, { onNotification, onConnectionChange } = {}) {
  const client = new Client({
    brokerURL: WS_BASE,
    // JWT burada, STOMP CONNECT frame'inin native header'ı olarak taşınır -
    // tarayıcının native WebSocket API'si Authorization header'ı desteklemediği
    // için gerçek kimlik doğrulaması burada yapılır (bkz. backend
    // JwtHandshakeChannelInterceptor).
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    onStompError: (frame) => {
      console.error('Bildirim WebSocket hatası:', frame.headers?.message)
    },
    onWebSocketError: (event) => {
      console.error('Bildirim WebSocket bağlantı hatası:', event)
    },
    // Abonelik gerçekten kurulmadan bildirim yayını yapılırsa (broker
    // "connected" ama henüz SUBSCRIBE frame'i gönderilmemişse) mesaj
    // sessizce kaybolur - bu yüzden bağlı/kopuk durumunu dışarı bildiriyoruz
    // (bkz. NotificationsFeedContext, NotificationBell'deki test marker'ı).
    // Gerçek kullanıcılar bunu görmez, sadece E2E'nin subscribe tamamlanmadan
    // bildirim tetikleyen aksiyona geçmesini engellemek için var.
    onDisconnect: () => onConnectionChange?.(false),
    onWebSocketClose: () => onConnectionChange?.(false),
  })

  client.onConnect = () => {
    client.subscribe('/user/queue/notifications', (message) => {
      try {
        const payload = JSON.parse(message.body)
        onNotification?.(payload)
      } catch {
        // Ayrıştırılamayan mesaj sessizce yoksayılır.
      }
    })
    // Abonelik frame'i gönderildikten SONRA "bağlı" say - onConnect
    // sırasında subscribe senkron çağrıldığı için bu noktada abonelik
    // backend'e iletilmiş oluyor.
    onConnectionChange?.(true)
  }

  client.activate()
  return client
}
