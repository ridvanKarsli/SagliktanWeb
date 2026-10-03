import { Avatar, Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import NotificationBell from '../NotificationBell.jsx'
import { clickableProps } from '../../utils/clickable.js'

// Mobil üst bar: logo + marka adı ve bildirimler. Ana ekrana eklenip tam
// ekran açıldığında çentik/durum çubuğu alanını da karşılar (safe-area-inset-top).
export default function MobileTopBar() {
  const theme = useTheme()
  const navigate = useNavigate()
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.25,
        px: 2,
        pt: 'calc(10px + env(safe-area-inset-top))',
        pb: 1.25,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box
        {...clickableProps(() => navigate('/home'))}
        aria-label="Sağlıktan ana sayfa"
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', minHeight: 40 }}
      >
        <Avatar
          src="/sagliktanLogo.png"
          alt="Sağlıktan"
          sx={{ width: 28, height: 28, borderRadius: '8px' }}
        />
        <Typography
          sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'primary.main', letterSpacing: '-0.01em' }}
        >
          Sağlıktan
        </Typography>
      </Box>
      <NotificationBell />
    </Box>
  )
}
