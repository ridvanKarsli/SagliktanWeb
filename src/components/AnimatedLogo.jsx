import { Box } from '@mui/material'

/**
 * Logo Component - Clean and professional
 * Statik logo, animasyonsuz
 */
export default function AnimatedLogo({ 
  size = 120, 
  mobileSize = 100,
  showBorder = false,
  sx = {} 
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: { xs: mobileSize, md: size },
        height: { xs: mobileSize, md: size },
        ...sx
      }}
    >
      <Box
        component="img"
        src="/sagliktanLogo.png"
        alt="Sağlıktan"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '50%',
          boxShadow: showBorder ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
          border: showBorder ? '2px solid rgba(255,255,255,0.1)' : 'none',
          backgroundColor: '#fff'
        }}
      />
    </Box>
  )
}

