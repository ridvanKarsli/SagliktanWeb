import { Box } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import NotificationBell from '../NotificationBell.jsx'
import BrandMark from './BrandMark.jsx'

// Mobil üst bar: logo + marka adı ve bildirimler. Zemin rengiyle hafif
// buzlu bir şerit; içerik altından akarken bile sakin durur. Ana ekrana
// eklenip tam ekran açıldığında çentik alanını da karşılar.
export default function MobileTopBar() {
  const theme = useTheme()
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
        pt: 'calc(6px + env(safe-area-inset-top))',
        pb: 0.75,
        bgcolor: alpha(theme.palette.background.default, 0.86),
        backdropFilter: 'blur(14px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <BrandMark size={30} fontSize="1.3rem" />
      <NotificationBell />
    </Box>
  )
}
