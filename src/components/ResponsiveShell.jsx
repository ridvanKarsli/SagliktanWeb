import { useEffect } from 'react'
import { Box } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import useQuickSearchShortcut from '../hooks/useQuickSearchShortcut.js'
import { useAuth } from '../context/AuthContext.jsx'
import InstallPrompt from './InstallPrompt.jsx'
import DesktopSidebar, { SIDEBAR_WIDTH } from './shell/DesktopSidebar.jsx'
import MobileTopBar from './shell/MobileTopBar.jsx'
import MobileBottomNav, { MOBILE_NAV_HEIGHT } from './shell/MobileBottomNav.jsx'

// Oturum açık sayfaların kabuğu: masaüstünde sabit sol gezinme, mobilde üst
// bar + alt sekme çubuğu; ortada dar (okunabilir) içerik sütunu.
export default function ResponsiveShell({ children }) {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Rota değişince en üste kaydır: içerik key={location.pathname} ile yeniden
  // mount oluyor ama kaydırma kabının (#root / window) konumu korunuyordu.
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } catch {
      window.scrollTo(0, 0)
    }
    const root = document.getElementById('root')
    if (root) root.scrollTop = 0
  }, [location.pathname])

  // Önce çıkışın bitmesi beklenir: aksi halde PublicOnlyRoute hâlâ "giriş
  // yapmış" görüp "/"den /home'a geri sektirir (titreşim).
  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  // Cmd/Ctrl+K ve "/" ile her yerden hızlı arama.
  useQuickSearchShortcut()

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      {isMdUp && <DesktopSidebar onLogout={handleLogout} />}

      <Box
        sx={{
          flexGrow: 1,
          // Flex öğesinin varsayılan min-width'i "auto": bu olmadan uzun bir
          // başlık + buton sayfayı mobilde yatay kaydırmaya zorluyordu.
          minWidth: 0,
          ml: { md: `${SIDEBAR_WIDTH}px` },
          display: 'flex',
          minHeight: '100dvh'
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            pb: { xs: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 8px)`, md: 0 }
          }}
        >
          {!isMdUp && <MobileTopBar />}

          <Box
            key={location.pathname}
            className="page-transition"
            sx={{
              // Admin paneli veri yoğun (tablolar/kartlar) - yalnızca orada
              // genişletilir; diğer sayfalar okunabilirlik için dar kalır.
              maxWidth: isAdminRoute ? 1100 : 720,
              mx: 'auto', width: '100%', px: { xs: 2, sm: 3 }
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>

      {!isMdUp && <MobileBottomNav />}

      <InstallPrompt />
    </Box>
  )
}
