import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { connectNotificationSocket } from '../services/notificationSocket.js'
import {
  getUnreadNotificationCount, listNotifications, markAllNotificationsRead, markNotificationRead
} from '../services/api.js'

// Kalıcı/okunabilir bildirim akışı (yorum/yanıt bildirimleri) - mevcut
// NotificationContext.jsx'teki anlık toast'lardan (LumoNotification) tamamen
// ayrı bir kavram, karıştırılmasın.
const NotificationsFeedContext = createContext(null)

const FEED_PAGE_SIZE = 10

export function NotificationsFeedProvider({ children }) {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  // Sadece E2E testleri için: STOMP aboneliği gerçekten kurulana kadar
  // "bağlı" sayılmıyor - bkz. notificationSocket.js#connectNotificationSocket.
  // Gerçek kullanıcı arayüzünde bu bilgi görünmez, sadece NotificationBell'de
  // gizli bir test marker'ı olarak render ediliyor.
  const [wsConnected, setWsConnected] = useState(false)
  const clientRef = useRef(null)

  const refresh = useCallback(() => {
    if (!token) return
    // İkincil veri (bkz. api.js hata yutma konvansiyonu): bildirim akışı
    // WS bağlantısı zaten yeniden dener, burada başarısız bir refresh
    // için toast göstermek gürültü olurdu.
    listNotifications(token, { size: FEED_PAGE_SIZE })
      .then(res => setItems(Array.isArray(res?.content) ? res.content : []))
      .catch(() => {})
    getUnreadNotificationCount(token)
      .then(res => setUnreadCount(res?.count ?? 0))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (!token) {
      setItems([])
      setUnreadCount(0)
      setWsConnected(false)
      clientRef.current?.deactivate()
      clientRef.current = null
      return undefined
    }

    refresh()

    const client = connectNotificationSocket(token, {
      onNotification: (notification) => {
        setItems(prev => [notification, ...prev].slice(0, FEED_PAGE_SIZE))
        setUnreadCount(prev => prev + 1)
      },
      onConnectionChange: setWsConnected
    })
    clientRef.current = client

    return () => {
      setWsConnected(false)
      client.deactivate()
      if (clientRef.current === client) clientRef.current = null
    }
  }, [token, refresh])

  const markRead = useCallback(async (id) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount(prev => Math.max(0, prev - 1))
    try {
      await markNotificationRead(token, id)
    } catch {
      refresh()
    }
  }, [token, refresh])

  const markAllRead = useCallback(async () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    try {
      await markAllNotificationsRead(token)
    } catch {
      refresh()
    }
  }, [token, refresh])

  return (
    <NotificationsFeedContext.Provider value={{ items, unreadCount, markRead, markAllRead, refresh, wsConnected }}>
      {children}
    </NotificationsFeedContext.Provider>
  )
}

export function useNotificationsFeed() {
  const ctx = useContext(NotificationsFeedContext)
  if (!ctx) {
    throw new Error('useNotificationsFeed must be used within NotificationsFeedProvider')
  }
  return ctx
}
