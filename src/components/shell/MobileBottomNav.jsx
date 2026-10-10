import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import NavIcon from './NavIcon.jsx'
import { isNavItemActive, useNavItems } from './navConfig.jsx'
import { emitListRefresh } from '../../utils/listRefreshBus.js'

export const MOBILE_NAV_HEIGHT = 64

// Mobil alt sekme çubuğu. Seçili sekmenin ikonu yumuşak yeşil bir kapsülün
// içine yaylanarak oturur (tema: MuiBottomNavigationAction). Sekmelerden
// birine ait olmayan sayfalarda (ör. gönderi detayı) hiçbir sekme seçili
// görünmez.
//
// Davranış (yerleşik uygulama alışkanlığı):
// - Zaten açık sekmeye tekrar dokunmak: en üste kaydır ve açık listeyi
//   tazele (listRefreshBus). Sekmenin alt sayfasındaysan (ör. /groups/1)
//   sekmenin köküne dön.
// - Üst düzey sekmeler arasında geçiş: geçmişe yeni kayıt eklenmez
//   (replace) - Geri tuşu sekmeler arasında dolaşmaz, sekmeye gelmeden
//   önceki sayfaya döner. Bir alt sayfadan sekmeye geçiş ise push kalır.
export default function MobileBottomNav() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navItems = useNavItems()
  const current = navItems.findIndex(item => isNavItemActive(item, pathname))
  const onTopLevel = navItems.some(item => item.to === pathname)

  const onSelect = (index) => {
    const item = navItems[index]
    if (index === current) {
      if (pathname === item.to) {
        try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { window.scrollTo(0, 0) }
        emitListRefresh('tab-reselect')
      } else {
        navigate(item.to)
      }
      return
    }
    navigate(item.to, { replace: onTopLevel })
  }

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
        onChange={(_, value) => onSelect(value)}
        showLabels
        sx={{
          height: 'auto',
          minHeight: MOBILE_NAV_HEIGHT,
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
              maxWidth: '100%',
              // Çok dar ekranda (küçük telefonlar, büyük yazı ölçeği)
              // etiketler sığmaz; ikon + aria-label yeter.
              '@media (max-width: 359.95px)': { display: 'none' }
            }
          }
        }}
      >
        {navItems.map((item, i) => (
          <BottomNavigationAction
            key={item.to}
            icon={<NavIcon item={item} active={i === current} />}
            label={item.label}
            aria-label={item.label}
            aria-current={i === current ? 'page' : undefined}
          />
        ))}
      </BottomNavigation>
    </Box>
  )
}
