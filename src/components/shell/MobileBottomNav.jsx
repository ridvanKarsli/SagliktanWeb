import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import NavIcon from './NavIcon.jsx'
import { isNavItemActive, useNavItems } from './navConfig.jsx'

export const MOBILE_NAV_HEIGHT = 64

// Mobil alt sekme çubuğu. Seçili sekmenin ikonu yumuşak yeşil bir kapsülün
// içine yaylanarak oturur (tema: MuiBottomNavigationAction). Sekmelerden
// birine ait olmayan sayfalarda (ör. gönderi detayı) hiçbir sekme seçili
// görünmez.
export default function MobileBottomNav() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navItems = useNavItems()
  const current = navItems.findIndex(item => isNavItemActive(item, pathname))

  return (
    <Box
      component="nav"
      aria-label="Ana gezinme"
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: alpha(theme.palette.background.paper, 0.94),
        backdropFilter: 'blur(14px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: theme.zIndex.appBar + 1,
        pb: 'env(safe-area-inset-bottom)'
      }}
    >
      <BottomNavigation
        value={current === -1 ? false : current}
        onChange={(_, value) => navigate(navItems[value].to)}
        showLabels
        sx={{
          height: MOBILE_NAV_HEIGHT,
          bgcolor: 'transparent',
          borderTop: 0,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            // Admin kullanıcılarda 6 sekme var: dar ekranda (iPhone SE)
            // etiketler sığsın diye yatay boşluk küçük tutulur.
            padding: '8px 2px 6px',
            '& .MuiSvgIcon-root': { fontSize: 24 },
            '& .MuiBottomNavigationAction-label': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
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
    </Box>
  )
}
