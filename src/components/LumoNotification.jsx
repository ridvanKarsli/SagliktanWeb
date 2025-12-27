import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'

export default function LumoNotification({ message, type = 'info', onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => {
          if (onClose) onClose()
        }, 300) // Animation için bekle
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!visible) return null

  // Type'a göre renk ve emoji
  const typeConfig = {
    error: { color: '#ff4444', emoji: '😟', bgColor: 'rgba(255, 68, 68, 0.1)' },
    success: { color: '#34c759', emoji: '🎉', bgColor: 'rgba(52, 199, 89, 0.1)' },
    warning: { color: '#ff9500', emoji: '⚠️', bgColor: 'rgba(255, 149, 0, 0.1)' },
    info: { color: '#007aff', emoji: 'ℹ️', bgColor: 'rgba(0, 122, 255, 0.1)' }
  }

  const config = typeConfig[type] || typeConfig.info

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 16, sm: 30 },
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: '100%',
        maxWidth: '100vw',
        animation: 'slideUp 0.3s ease-out',
        '@keyframes slideUp': {
          '0%': {
            opacity: 0,
            transform: 'translateX(-50%) translateY(20px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateX(-50%) translateY(0)'
          }
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          maxWidth: { xs: 'calc(100vw - 32px)', sm: 400 },
          width: '100%',
          mb: { xs: 1.5, sm: 2 },
          px: { xs: 1, sm: 0 }
        }}
      >
        {/* Konuşma Baloncuğu */}
        <Box
          sx={{
            backgroundColor: config.bgColor,
            backdropFilter: 'blur(10px)',
            border: { xs: `1.5px solid ${config.color}`, sm: `2px solid ${config.color}` },
            borderRadius: { xs: 3, sm: 4 },
            px: { xs: 2.5, sm: 4 },
            py: { xs: 2, sm: 3 },
            position: 'relative',
            boxShadow: { xs: '0 4px 12px rgba(0,0,0,0.15)', sm: '0 8px 24px rgba(0,0,0,0.2)' },
            wordBreak: 'break-word',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: { xs: -12, sm: -16 },
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: { xs: '12px solid transparent', sm: '16px solid transparent' },
              borderRight: { xs: '12px solid transparent', sm: '16px solid transparent' },
              borderTop: { xs: `12px solid`, sm: `16px solid` },
              borderTopColor: config.color,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: { xs: 14, sm: 17 },
              lineHeight: { xs: 1.5, sm: 1.6 },
              color: config.color,
              textAlign: 'center',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {config.emoji} {message}
          </Typography>
        </Box>

        {/* Lumo Görseli */}
        <Box
          sx={{
            width: { xs: 100, sm: 150 },
            height: { xs: 100, sm: 150 },
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'bounce 2s ease-in-out infinite',
            '@keyframes bounce': {
              '0%, 100%': {
                transform: 'translateY(0)'
              },
              '50%': {
                transform: 'translateY(-8px)'
              }
            }
          }}
        >
          <Box
            component="img"
            src="/Lumo.png"
            alt="Lumo"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))'
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

