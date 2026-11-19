import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import useQuickSearchShortcut from '../hooks/useQuickSearchShortcut.js'
import { useScrollRestoration } from '../hooks/useScrollRestoration.js'
import { useOnlineStatus } from '../hooks/useOnlineStatus.js'
import { useAuth } from '../context/AuthContext.jsx'
import { emitListRefresh } from '../utils/listRefreshBus.js'
import InstallPrompt from './InstallPrompt.jsx'
import AvatarUnlockWatcher from './avatars/AvatarUnlockWatcher.jsx'
import DesktopSidebar, { SIDEBAR_WIDTH } from './shell/DesktopSidebar.jsx'
import MobileTopBar from './shell/MobileTopBar.jsx'
import MobileBottomNav, { MOBILE_NAV_HEIGHT } from './shell/MobileBottomNav.jsx'
import OfflineBanner from './shell/OfflineBanner.jsx'
import '../styles/feed.css'

// Oturum açık sayfaların kabuğu: masaüstünde sabit sol gezinme, mobilde üst
// bar + alt sekme çubuğu; ortada dar (okunabilir) içerik sütunu.
export default function ResponsiveShell({ children }) {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Yeni sayfaya gidişte en üste; geri/ileri'de bırakılan konuma dön (bkz.
  // useScrollRestoration). Geri dönüşte giriş animasyonu da oynatılmaz:
  // kullanıcı "kaldığı yere" döner, sayfa yeniden "gelmez".
  const navigationType = useScrollRestoration()
  const isBack = navigationType === 'POP'

  // Çevrimdışı -> çevrimiçi geçişinde açık listeler sessizce tazelenir.
  const online = useOnlineStatus()
  const wasOfflineRef = useRef(!online)
  useEffect(() => {
    if (online && wasOfflineRef.current) emitListRefresh('online')
    wasOfflineRef.current = !online
  }, [online])

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
      {/* Faydalı oylarla yeni yol arkadaşı açıldığında tüm uygulamada kutlar
          (oturum başına bir kontrol; Profil sayfası da kendi kontrolünü tetikler). */}
      <AvatarUnlockWatcher />
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
            pb: { xs: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 8px)`, md: 4 }
          }}
        >
          {/* Üst şerit: (varsa) çevrimdışı uyarısı + mobil üst bar birlikte
              yapışık kalır; MobileTopBar kendi sticky'sini bu kabın içinde
              sürdürür. */}
          <Box sx={{ position: 'sticky', top: 0, zIndex: theme.zIndex.appBar }}>
            {!online && <OfflineBanner />}
            {!isMdUp && <MobileTopBar />}
          </Box>

          <Box
            key={location.pathname}
            className={isBack ? undefined : 'page-transition'}
            sx={{
              // Admin paneli veri yoğun (tablolar/kartlar) - yalnızca orada
              // genişletilir; diğer sayfalar okunabilirlik için dar kalır.
              // Akış sütunu masaüstünde de ~680px: satır uzunluğu rahat
              // okunur, kartlar "çakıl taşı" gibi ortada durur.
              maxWidth: isAdminRoute ? 1100 : 704,
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
