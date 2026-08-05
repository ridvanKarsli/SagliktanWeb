// src/services/messagingSocket.js
//
// notificationSocket.js ile aynı desen (bkz. o dosyanın yorumları - JWT'nin
// STOMP CONNECT header'ında taşınma gerekçesi, Vercel proxy'sinin WS upgrade'i
// güvenilir taşımaması). Bilerek AYRI bir STOMP bağlantısı: bildirimler ve
// mesajlaşma birbirinden bağımsız yaşam döngülerine sahip (biri kapansa
// diğeri etkilenmesin), tek bir "her şeyi bilen" soket yerine.
import { Client } from '@stomp/stompjs'

const WS_BASE =
  import.meta.env.VITE_WS_BASE?.trim() ||
  (import.meta.env.DEV ? 'ws://localhost:8080/ws' : 'wss://api.sagliktan.com/ws')

/**
 * Backend'in iki ayrı kuyruğa push ettiği olayları (bkz.
 * MessageServiceImpl.pushNewMessage, MessageRequestServiceImpl.pushNewRequest)
 * tek bağlantı üzerinden dinler. onMessage: yeni sohbet mesajı geldiğinde,
 * onMessageRequest: yeni mesaj isteği geldiğinde çağrılır.
 */
export function connectMessagingSocket(token, { onMessage, onMessageRequest, onConnectionChange } = {}) {
  const client = new Client({
    brokerURL: WS_BASE,
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    onStompError: (frame) => {
      console.error('Mesajlaşma WebSocket hatası:', frame.headers?.message, frame.body)
    },
    onWebSocketError: (event) => {
      console.error('Mesajlaşma WebSocket bağlantı hatası:', event?.type, event?.code, event?.reason)
    },
    onDisconnect: () => onConnectionChange?.(false),
    onWebSocketClose: () => onConnectionChange?.(false),
  })

  client.onConnect = () => {
    client.subscribe('/user/queue/messages', (message) => {
      try {
        onMessage?.(JSON.parse(message.body))
      } catch {
        // Ayrıştırılamayan mesaj sessizce yoksayılır.
      }
    })
    client.subscribe('/user/queue/message-requests', (message) => {
      try {
        onMessageRequest?.(JSON.parse(message.body))
      } catch {
        // Ayrıştırılamayan mesaj sessizce yoksayılır.
      }
    })
    onConnectionChange?.(true)
  }

  client.activate()
  return client
}
