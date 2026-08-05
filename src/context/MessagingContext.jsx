import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { connectMessagingSocket } from '../services/messagingSocket.js'
import { getPendingMessageRequestCount } from '../services/api.js'

// Faz 2 adım 6: NotificationsFeedContext ile aynı üst seviye rol (global,
// nav rozeti için sayaç tutan bir context) ama farklı bir şekilde - burada
// TÜM konuşma/mesaj listesini global state'te tutmuyoruz (o, Conversations/
// Chat sayfalarının kendi sorumluluğu), sadece nav rozeti için "bekleyen
// mesaj isteği" sayısını ve sayfaların canlı WS olaylarına abone
// olabileceği basit bir yayıncı/abone (pub-sub) mekanizması sağlıyor.
const MessagingContext = createContext(null)

export function MessagingProvider({ children }) {
  const { token } = useAuth()
  const [pendingRequestCount, setPendingRequestCount] = useState(0)
  const clientRef = useRef(null)
  const messageListenersRef = useRef(new Set())
  const requestListenersRef = useRef(new Set())

  const refreshPendingCount = useCallback(() => {
    if (!token) return
    getPendingMessageRequestCount(token)
      .then(res => setPendingRequestCount(res?.count ?? 0))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (!token) {
      setPendingRequestCount(0)
      clientRef.current?.deactivate()
      clientRef.current = null
      return undefined
    }

    refreshPendingCount()

    const client = connectMessagingSocket(token, {
      // Aktif bir sohbet ekranı açıksa (Chat.jsx) mesajı orada canlı
      // gösterecek, kapalıysa bir sonraki Conversations ziyaretinde REST ile
      // gelecek - burada global bir "okunmamış mesaj" sayacı TUTULMUYOR,
      // her konuşmanın kendi unreadCount'u zaten listConversations
      // yanıtında geliyor (bkz. Conversations.jsx).
      onMessage: (message) => {
        messageListenersRef.current.forEach(fn => fn(message))
      },
      onMessageRequest: (req) => {
        setPendingRequestCount(prev => prev + 1)
        requestListenersRef.current.forEach(fn => fn(req))
      },
    })
    clientRef.current = client

    return () => {
      client.deactivate()
      if (clientRef.current === client) clientRef.current = null
    }
  }, [token, refreshPendingCount])

  const subscribeToMessages = useCallback((fn) => {
    messageListenersRef.current.add(fn)
    return () => messageListenersRef.current.delete(fn)
  }, [])

  const subscribeToMessageRequests = useCallback((fn) => {
    requestListenersRef.current.add(fn)
    return () => requestListenersRef.current.delete(fn)
  }, [])

  const decrementPendingCount = useCallback(() => {
    setPendingRequestCount(prev => Math.max(0, prev - 1))
  }, [])

  return (
    <MessagingContext.Provider
      value={{
        pendingRequestCount,
        refreshPendingCount,
        decrementPendingCount,
        subscribeToMessages,
        subscribeToMessageRequests,
      }}
    >
      {children}
    </MessagingContext.Provider>
  )
}

export function useMessaging() {
  const ctx = useContext(MessagingContext)
  if (!ctx) {
    throw new Error('useMessaging must be used within MessagingProvider')
  }
  return ctx
}
