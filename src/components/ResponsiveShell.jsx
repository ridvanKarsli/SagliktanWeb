import { useMemo } from 'react'
import {
  Badge, BottomNavigation, BottomNavigationAction, Box,
  Typography, Avatar
} from '@mui/material'
import useQuickSearchShortcut from '../hooks/useQuickSearchShortcut.js'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import {
  HomeRounded, HomeOutlined, GroupsRounded, GroupsOutlined, SearchRounded, SearchOutlined,
  ChatBubbleRounded, ChatBubbleOutlineRounded,
  PersonRounded, PersonOutlineRounded, LogoutRounded, AdminPanelSettingsRounded, AdminPanelSettingsOutlined
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useMessaging } from '../context/MessagingContext.jsx'
import InstallPrompt from './InstallPrompt.jsx'
import NotificationBell from './NotificationBell.jsx'

const SIDEBAR_WIDTH = 240
const MOBILE_NAV_HEIGHT = 64

// Instagram deseni: sekme aktifken outline ikon yerine dolu (filled)
// versiyonu gösterilir - salt renk değişiminden daha güçlü, alışılmış bir
// "buradasın" sinyali. iconOutline pasifken, icon aktifken kullanılıyor.
// Mesajlar sekmesinin rozeti (bekleyen istek sayısı) statik değil - bkz.
// aşağıdaki navItems useMemo'su, MessagingContext'ten canlı okunuyor.
//
// "Ana Sayfa" (karışık gönderi akışı, bkz. Home.jsx) ve "Gruplar" (grup
// keşfi/yönetimi, bkz. DiseaseGroups.jsx) artık ayrı sekmeler - önceden
// tek "Gruplar" sekmesi Home ikonuyla /groups'u açıyordu, kullanıcı her
// girişte önce bir grup seçmek zorunda kalıyordu. Home ikonu artık gerçek
// ana sayfada; Gruplar kendi (GroupsRounded) ikonuyla ayrı bir sekme.
const BASE_NAV_ITEMS = [
  // Tek kelime bilinçli tercih: mobil alt navda artık 5 (admin'de 6) sekme
  // var, "Ana Sayfa" iki kelimesi dar ekranlarda alt sekmeye sığmayıp
  // ikinci satıra taşıyor, satır yüksekliğini bozup diğer sekmelerle
  // hizasız görünüyordu (bkz. mobil tasarım hatası ekran görüntüsü).
  { label: 'Anasayfa', icon: <HomeRounded />, iconOutline: <HomeOutlined />, to: '/home' },
  { label: 'Gruplar', icon: <GroupsRounded />, iconOutline: <GroupsOutlined />, to: '/groups' },
  { label: 'Ara', icon: <SearchRounded />, iconOutline: <SearchOutlined />, to: '/search' },
  { label: 'Mesajlar', icon: <ChatBubbleRounded />, iconOutline: <ChatBubbleOutlineRounded />, to: '/messages' },
  { label: 'Profil', icon: <PersonRounded />, iconOutline: <PersonOutlineRounded />, to: '/profile' }
]

const ADMIN_NAV_ITEM = {
  label: 'Admin', icon: <AdminPanelSettingsRounded />, iconOutline: <AdminPanelSettingsOutlined />, to: '/admin'
}

export default function ResponsiveShell({ children }) {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { pendingRequestCount, unreadMessageCount } = useMessaging()
  const messagesBadgeCount = pendingRequestCount + unreadMessageCount
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Cmd/Ctrl+K ve "/" ile heryerden hızlı arama - bkz. useQuickSearchShortcut.js
  useQuickSearchShortcut()

  const navItems = useMemo(
    () => (user?.role === 'ADMIN' ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS),
    [user?.role]
  )

  const current = useMemo(
    () => Math.max(0, navItems.findIndex(n => location.pathname.startsWith(n.to))),
    [location.pathname, navItems]
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      {/* Sidebar - Desktop */}
      {isMdUp && (
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            // Faz4: camsı yarı saydam + blur kaldırıldı - X.com'un kendi
            // sol nav'ı da tamamen opaktır, blur hem performans maliyeti
            // hem de gereksiz "widget" hissi katıyordu. Düz opak yüzey +
            // sağdaki kenarlık (üstte zaten var) yeterli ayrımı sağlıyor.
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            py: 3,
            px: 2.5
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              mb: 5
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
              onClick={() => navigate('/home')}
            >
              <Avatar
                src="/sagliktanLogo.png"
                alt="Sağlıktan"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px'
                }}
              />
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: 'primary.main',
                  letterSpacing: '-0.01em'
                }}
              >
                Sağlıktan
              </Typography>
            </Box>
            <NotificationBell />
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {navItems.map(item => {
              const active = location.pathname.startsWith(item.to)
              return (
                <Box
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    color: active ? 'primary.main' : 'text.secondary',
                    // Faz4: köşegen gradyan dolgu yerine düz, tek tonlu tint -
                    // X'in aktif sekme dilinde de dolgu her zaman düz renktir.
                    bgcolor: active ? 'rgba(76, 184, 159, 0.12)' : 'transparent',
                    fontWeight: active ? 600 : 500,
                    transition: 'background-color 0.15s ease, color 0.15s ease',
                    // Aktif satırın solunda ince bir vurgu çubuğu - hangi
                    // sekmede olduğunu arka plan tonundan daha net anlatır.
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -10,
                      top: '20%',
                      bottom: '20%',
                      width: 3,
                      borderRadius: 3,
                      bgcolor: 'primary.main',
                      opacity: active ? 1 : 0,
                      transition: 'opacity 0.2s ease'
                    },
                    '&:hover': {
                      bgcolor: active ? 'rgba(76, 184, 159, 0.16)' : 'rgba(242, 237, 230, 0.06)',
                      color: 'primary.main'
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      '& svg': {
                        fontSize: 22,
                        color: active ? 'secondary.main' : 'inherit'
                      }
                    }}
                  >
                    {item.to === '/messages' && messagesBadgeCount > 0 ? (
                      <Badge badgeContent={messagesBadgeCount} color="error" max={99}>
                        {active ? item.icon : item.iconOutline}
                      </Badge>
                    ) : (
                      active ? item.icon : item.iconOutline
                    )}
                  </Box>
                  <Typography sx={{ fontWeight: 'inherit', fontSize: '0.9375rem', flex: 1 }}>
                    {item.label}
                  </Typography>
                  {/* X.com/Linear tarzı kısayol ipucu - bkz. useQuickSearchShortcut.js.
                      Sadece masaüstü sidebar'da: mobilde klavye kısayolunun
                      bir anlamı yok. */}
                  {item.to === '/search' && (
                    // NOT: metin rengi TAM opaklıkta 'text.secondary' - önceden
                    // inactive durumda opacity: 0.6 ile soluklaştırılıyordu, bu da
                    // axe-core'un WCAG AA color-contrast kuralını ihlal ediyordu
                    // (bkz. accessibility.spec.js CI hatası). Soluklaştırma yerine
                    // sadece border'ı hafif belirginleştiriyoruz, metin okunur kalıyor.
                    <Box
                      sx={{
                        fontSize: '0.6875rem', fontWeight: 600, color: 'text.secondary',
                        border: '1px solid', borderColor: 'divider', borderRadius: 1,
                        px: 0.75, py: 0.125
                      }}
                    >
                      ⌘K
                    </Box>
                  )}
                </Box>
              )
            })}
          </Box>

          <Box sx={{ flex: 1 }} />
          
          {/* Logout */}
          <Box
            onClick={() => { logout(); navigate('/') }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 1.5,
              borderRadius: 2.5,
              cursor: 'pointer',
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(196, 85, 74, 0.08)',
                color: '#C4554A'
              }
            }}
          >
            <LogoutRounded sx={{ fontSize: 22 }} />
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }}>Çıkış Yap</Typography>
          </Box>
        </Box>
      )}

      {/* İçerik alanı - sol nav (sabit) + orta akış. Faz5'te eklenen üçüncü
          sütun (RightRail: "Popüler Gruplar" paneli) kullanıcı isteğiyle
          kaldırıldı - orta akış artık kalan tüm genişliği kaplıyor. */}
      <Box
        sx={{
          flexGrow: 1,
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
          {/* Mobil üst bar - sabit, logo + marka adı. Native app'lerdeki üst
              bar + alt sekme çubuğu ikilisini taklit ediyor. Ana ekrana
              eklenip tam ekran açıldığında çentik/durum çubuğu alanını da
              bu bar karşılıyor (safe-area-inset-top); normal tarayıcı
              sekmesinde bu değer 0 olduğu için görünüm değişmiyor. */}
          {!isMdUp && (
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
                // Faz4: blur/yarı saydamlık kaldırıldı - opak yüzey + kenarlık.
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box
                onClick={() => navigate('/home')}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }}
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
          )}

          <Box
            key={location.pathname}
            className="page-transition"
            sx={{
              // Admin paneli veri-yoğun tablolar/kartlar barındırıyor (bkz.
              // AdminPanel'in alt sekmeleri) - akış sayfalarındaki 720px sınırı
              // burada masaüstünde ciddi bir sıkışmaya yol açıyordu: Dashboard
              // sekmesindeki 5 sütunlu istatistik grid'i etiketleri "T.."/"H.."
              // diye kırpıyordu, Şikayetler/İçerik tabloları (900/760px minWidth)
              // kendi konteynerlerinde gereksiz yatay kaydırmaya zorlanıyordu.
              // Diğer tüm sayfalar (Home/Posts/Profile vb.) kasıtlı olarak dar
              // kalıyor - okunabilirlik için (bkz. tipografi ölçeği notu,
              // theme.js) - bu yüzden global sınırı değiştirmek yerine sadece
              // /admin rotasında genişletiyoruz.
              maxWidth: isAdminRoute ? 1100 : 720,
              mx: 'auto', width: '100%', px: { xs: 2, sm: 3 }
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      {!isMdUp && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            // Faz4: blur + renkli glow gölgesi kaldırıldı - opak yüzey + tek
            // üst kenarlık, X'in alt nav'ı da aynı şekilde düz/opaktır.
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: theme.zIndex.appBar + 1
          }}
        >
          <BottomNavigation
            value={current}
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
                icon={
                  item.to === '/messages' && messagesBadgeCount > 0 ? (
                    <Badge badgeContent={messagesBadgeCount} color="error" max={99}>
                      {i === current ? item.icon : item.iconOutline}
                    </Badge>
                  ) : (
                    i === current ? item.icon : item.iconOutline
                  )
                }
                label={item.label}
              />
            ))}
          </BottomNavigation>
          <Box sx={{ height: 'env(safe-area-inset-bottom)', bgcolor: 'background.paper' }} />
        </Box>
      )}

      <InstallPrompt />
    </Box>
  )
}
