import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import NavIcon from './NavIcon.jsx'
import { isNavItemActive, useNavItems } from './navConfig.jsx'

export const MOBILE_NAV_HEIGHT = 64

// Mobil alt sekme çubuğu. Sekmelerden birine ait olmayan sayfalarda (ör.
// gönderi detayı, başka bir kullanıcının profili) hiçbir sekme seçili
// görünmez - önceden yanlışlıkla "Anasayfa" seçili kalıyordu.
export default function MobileBottomNav() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navItems = useNavItems()
  const current = navItems.findIndex(item => isNavItemActive(item, pathname))

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: theme.zIndex.appBar + 1
      }}
    >
      <BottomNavigation
        value={current === -1 ? false : current}
        onChange={(_, value) => navigate(navItems[value].to)}
        showLabels
        sx={{
          height: MOBILE_NAV_HEIGHT,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: 0,
            // Admin kullanıcılarda 6 sekme oluyor (bkz. ADMIN_NAV_ITEM) -
            // 12px yatay padding dar ekranlarda (ör. iPhone SE/mini)
            // sekmelerin sıkışıp etiketlerin iki satıra taşmasına yol
            // açıyordu. 4px'e düşürüldü, ikon/etiket boyutu aynı kaldı.
            padding: '8px 4px',
            gap: 0.5,
            '& .MuiSvgIcon-root': { fontSize: 24 },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
              marginTop: '2px',
              // Güvenlik payı: padding daraltmasına rağmen bir etiket
              // yine de sığmazsa iki satıra bölünüp satır yüksekliğini
              // bozmak yerine tek satırda üç nokta ile kesilsin.
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              '&.Mui-selected': {
                fontSize: '0.75rem'
              }
            },
            '&.Mui-selected': { 
              color: 'primary.main',
              '& .MuiSvgIcon-root': {
                color: 'secondary.main'
              }
            }
          }
        }}
      >
        {navItems.map((item, i) => (
          <BottomNavigationAction
            key={item.to}
            icon={<NavIcon item={item} active={i === current} />}
            label={item.label}
          />
        ))}
      </BottomNavigation>
      <Box sx={{ height: 'env(safe-area-inset-bottom)', bgcolor: 'background.paper' }} />
    </Box>
  )
}
