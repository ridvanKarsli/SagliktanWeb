import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { clickableProps } from '../../utils/clickable.js'

// Logo + "Sağlıktan" yazısı (Baloo 2). Dokununca ana sayfaya döner.
export default function BrandMark({ size = 32, fontSize = '1.3rem' }) {
  const navigate = useNavigate()
  return (
    <Box
      {...clickableProps(() => navigate('/home'))}
      aria-label="Sağlıktan ana sayfa"
      sx={{
        display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', minHeight: 44, borderRadius: 2,
        '&:active img': { transform: 'rotate(-8deg) scale(0.94)' }
      }}
    >
      <Box
        component="img"
        src="/sagliktanLogo.png"
        alt=""
        sx={{ width: size, height: size, borderRadius: `${Math.round(size * 0.3)}px`, transition: 'transform 240ms var(--ease-spring)' }}
      />
      <Typography
        component="span"
        sx={{ fontFamily: (t) => t.typography.h1.fontFamily, fontWeight: 800, fontSize, lineHeight: 1, color: 'primary.main', pt: '3px' }}
      >
        Sağlıktan
      </Typography>
    </Box>
  )
}
