import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { connectMessagingSocket } from '../services/messagingSocket.js'
import { getPendingMessageRequestCount, getUnreadMessageCount } from '../services/api.js'

// Global mesajlaşma durumu: konuşma/mesaj listelerini değil (onlar
// Conversations/Chat sayfalarının sorumluluğu), yalnızca nav rozeti için
// "bekleyen mesaj isteği" + "okunmamış mesaj" sayılarını ve sayfaların canlı
// WS olaylarına abone olabileceği basit bir yayıncı/abone mekanizmasını tutar.
const MessagingContext = createContext(null)

export function MessagingProvider({ children }) {
  const { token } = useAuth()
  const [pendingRequestCount, setPendingRequestCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const clientRef = useRef(null)
  const messageListenersRef = useRef(new Set())
  const requestListenersRef = useRef(new Set())

  const refreshPendingCount = useCallback(() => {
    if (!token) return
    // İkincil veri (bkz. api.js hata yutma konvansiyonu): nav rozeti için
    // sayaç - başarısız olursa rozet güncel kalır, kullanıcıyı toast'la
    // rahatsız etmeye değmez.
    getPendingMessageRequestCount(token)
      .then(res => setPendingRequestCount(res?.count ?? 0))
      .catch(() => {})
  }, [token])

  // Yerel artır/azalt yerine sunucudan tekrar okuyoruz - "okundu" işaretleme
  // (Chat.jsx) ile "yeni mesaj geldi" (WS) olayları farklı yerlerden
  // tetiklendiği için basit +1/-1 sayaç kolayca senkron dışı kalır; tek bir
  // GET isteği bunu garanti doğru tutar.
  const refreshUnreadCount = useCallback(() => {
    if (!token) return
    // İkincil veri, yukarıdaki refreshPendingCount ile aynı gerekçe.
    getUnreadMessageCount(token)
      .then(res => setUnreadMessageCount(res?.count ?? 0))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (!token) {
      setPendingRequestCount(0)
      setUnreadMessageCount(0)
      clientRef.current?.deactivate()
      clientRef.current = null
      return undefined
    }

    refreshPendingCount()
    refreshUnreadCount()

    const client = connectMessagingSocket(token, {
      // Aktif bir sohbet ekranı açıksa (Chat.jsx) mesajı orada canlı
      // gösterecek ve okundu işaretleyecek, kapalıysa nav rozetine yansır -
      // her konuşmanın kendi unreadCount'u ayrıca listConversations
      // yanıtında geliyor (bkz. Conversations.jsx), burada sadece TOPLAM.
      onMessage: (message) => {
        refreshUnreadCount()
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
  }, [token, refreshPendingCount, refreshUnreadCount])

  const subscribeToMessages = useCallback((fn) => {
    messageListenersRef.current.add(fn)
    return () => messageListenersRef.current.delete(fn)
  }, [])

  const subscribeToMessageRequests = useCallback((fn) => {
    requestListenersRef.current.add(fn)
    return () => requestListenersRef.current.delete(fn)
  }, [])

  const value = useMemo(() => ({
    pendingRequestCount,
    unreadMessageCount,
    refreshPendingCount,
    refreshUnreadCount,
    subscribeToMessages,
    subscribeToMessageRequests,
  }), [
    pendingRequestCount, unreadMessageCount, refreshPendingCount, refreshUnreadCount,
    subscribeToMessages, subscribeToMessageRequests
  ])

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>
}

export function useMessaging() {
  const ctx = useContext(MessagingContext)
  if (!ctx) {
    throw new Error('useMessaging must be used within MessagingProvider')
  }
  return ctx
}
