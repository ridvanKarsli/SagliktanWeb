import { createContext, useContext, useState, useCallback } from 'react'
import LumoNotification from '../components/LumoNotification.jsx'
import { Box, Stack } from '@mui/material'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setNotifications(prev => {
      // Aynı mesajı tekrar gösterme (spam önleme)
      if (prev.some(n => n.message === message && n.type === type)) return prev
      // En fazla 3 bildirim göster
      const next = [...prev, { id, message, type, duration }]
      return next.length > 3 ? next.slice(-3) : next
    })
    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const showError = useCallback((message, duration = 5000) => {
    return showNotification(message, 'error', duration)
  }, [showNotification])

  const showSuccess = useCallback((message, duration = 3000) => {
    return showNotification(message, 'success', duration)
  }, [showNotification])

  const showWarning = useCallback((message, duration = 4000) => {
    return showNotification(message, 'warning', duration)
  }, [showNotification])

  const showInfo = useCallback((message, duration = 4000) => {
    return showNotification(message, 'info', duration)
  }, [showNotification])

  return (
    <NotificationContext.Provider value={{ showNotification, showError, showSuccess, showWarning, showInfo, removeNotification }}>
      {children}
      {/* Notification Container */}
      <Box
        sx={{
          position: 'fixed',
          // Ana ekrana eklenip tam ekran açıldığında bildirim çentik/durum
          // çubuğunun altında kalmasın diye safe-area payı ekleniyor.
          top: { xs: 'calc(12px + env(safe-area-inset-top))', sm: 'calc(20px + env(safe-area-inset-top))' },
          right: { xs: 0, sm: 20 },
          left: { xs: 0, sm: 'auto' },
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'center', sm: 'flex-end' },
        }}
      >
        <Stack
          spacing={1}
          sx={{ width: { xs: '100%', sm: 420 }, pointerEvents: 'auto' }}
        >
          {notifications.map((notification) => (
            <LumoNotification
              key={notification.id}
              message={notification.message}
              type={notification.type}
              duration={notification.duration}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </Stack>
      </Box>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}




