import { Box, IconButton } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { CottageOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import NotificationBell from '../NotificationBell.jsx'
import BrandMark from './BrandMark.jsx'

// Mobil üst bar: logo + marka adı ve bildirimler. Zemin rengiyle hafif
// buzlu bir şerit; içerik altından akarken bile sakin durur. Ana ekrana
// eklenip tam ekran açıldığında çentik alanını da karşılar.
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
      {/* Sağda: Mahalle (oyun) kısa yolu + bildirimler. Mobil alt menü dolu
          olduğu için oyunun mobil girişi burada; iki 44px ikon 320px'te de sığar. */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
        {/* İpucu: yerel title (MUI Tooltip, Popper'ı ana pakete çekiyordu ~30 KB) */}
        <IconButton
          onClick={() => navigate('/game')}
          aria-label="Mahalle'ye git"
          title="Mahalle"
          sx={{ width: 44, height: 44, color: 'brand.apricotInk' }}
        >
          <CottageOutlined />
        </IconButton>
        <NotificationBell />
      </Box>
    </Box>
  )
}
