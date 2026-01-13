import { createContext, useContext, useState, useCallback } from 'react'
import LumoNotification from '../components/LumoNotification.jsx'
import { Box } from '@mui/material'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setNotifications(prev => [...prev, { id, message, type, duration }])
    
    // Otomatik kaldırma
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, duration + 300) // Animation için ekstra süre
    }
    
    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const showError = useCallback((message, duration = 4000) => {
    return showNotification(message, 'error', duration)
  }, [showNotification])

  const showSuccess = useCallback((message, duration = 4000) => {
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
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        {notifications.map((notification, index) => (
          <Box
            key={notification.id}
            sx={{
              position: 'absolute',
              bottom: index * 200, // Her bildirim üst üste
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              pointerEvents: 'auto'
            }}
          >
            <LumoNotification
              message={notification.message}
              type={notification.type}
              duration={notification.duration}
              onClose={() => removeNotification(notification.id)}
            />
          </Box>
        ))}
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




