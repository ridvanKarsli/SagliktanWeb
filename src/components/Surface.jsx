import { Box } from '@mui/material'

/**
 * Profesyonel yarı saydam yüzey (tam kare)
 * - Border radius: 0
 * - İçerik taşmaları engellenir
 * - Cam efekti + ince sınır
 * 
 */
export default function Surface({ children, sx, ...rest }) {
  return (
    <Box
      sx={{
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.14)',
        backgroundColor: 'rgba(7,20,28,0.28)',
        backdropFilter: 'blur(8px)',
        borderRadius: 0,                  // 🔵 tam kare
        p: { xs: 2, md: 3 },
        overflow: 'hidden',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        '& *': { minWidth: 0 },
        ...sx
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}
