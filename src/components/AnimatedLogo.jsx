import { useState, useEffect } from 'react'
import { Box } from '@mui/material'

/**
 * Animasyonlu Logo Component
 * 2 saniye logo, 2 saniye Lumo arasında geçiş yapar
 */
export default function AnimatedLogo({ 
  size = 120, 
  mobileSize = 120,
  showBorder = true,
  sx = {} 
}) {
  const [showLumo, setShowLumo] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowLumo(prev => !prev)
    }, 2000) // 2 saniye

    return () => clearInterval(interval)
  }, [])

  return (
    <Box
      sx={{
        position: 'relative',
        width: { xs: mobileSize, md: size },
        height: { xs: mobileSize, md: size },
        ...sx
      }}
    >
      {/* Logo */}
      <Box
        component="img"
        src="/sagliktanLogo.png"
        alt="Sağlıktan"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: showLumo ? 0 : 1,
          transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out',
          borderRadius: '50%',
          boxShadow: showBorder ? 6 : 'none',
          border: showBorder ? '3px solid #dbeafe' : 'none',
          background: '#fff',
          transform: showLumo ? 'scale(0.8)' : 'scale(1)',
          zIndex: showLumo ? 1 : 2
        }}
      />
      {/* Lumo */}
      <Box
        component="img"
        src="/Lumo.png"
        alt="Lumo"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: showLumo ? 1 : 0,
          transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out',
          borderRadius: '0%',
          transform: showLumo ? 'scale(1)' : 'scale(0.8)',
          zIndex: showLumo ? 2 : 1
        }}
      />
    </Box>
  )
}

