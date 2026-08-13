import { useMemo } from 'react'
import {
  Badge, BottomNavigation, BottomNavigationAction, Box,
  Typography, Avatar
} from '@mui/material'
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

  const navItems = useMemo(
    () => (user?.role === 'ADMIN' ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS),
    [user?.role]
  )

  const current = useMemo(
    () => Math.max(0, navItems.findIndex(n => location.pathname.startsWith(n.to))),
    [location.pathname, navItems]
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
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
            // Camsı yarı saydam + blur - arkadaki ambient glow (bkz. body
            // arkaplanı, theme.js) hafifçe sızsın diye düz opak yüzey yerine.
            bgcolor: 'rgba(42, 36, 31, 0.86)',
            // Blur radius 16px'ten 10px'e düşürüldü - "kasma" şikayeti
            // sonrası mobil performans denetiminde bulundu: scroll sırasında
            // sürekli ekranda kalan (fixed/sticky) camsı yüzeylerde yüksek
            // blur radius'u GPU'ya sürekli iş yüklüyordu, özellikle orta/alt
            // segment Android cihazlarda hissedilir jank'e yol açabiliyordu.
            // 10px görsel olarak neredeyse ayırt edilemez ama compositing
            // maliyeti belirgin düşüyor - kurumsal ürünlerin (Twitter/X,
            // LinkedIn vb.) çoğu da persistent nav yüzeylerinde 8-12px
            // aralığını kullanıyor, 16px+ genelde tek seferlik/geçici
            // yüzeylerde (modal, toast) tercih ediliyor.
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
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
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(44, 117, 98, 0.12)'
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
                    background: active
                      ? 'linear-gradient(90deg, rgba(76, 184, 159, 0.16) 0%, rgba(76, 184, 159, 0.05) 100%)'
                      : 'transparent',
                    fontWeight: active ? 600 : 500,
                    transition: 'all 0.2s ease',
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
                      background: active
                        ? 'linear-gradient(90deg, rgba(76, 184, 159, 0.20) 0%, rgba(76, 184, 159, 0.07) 100%)'
                        : 'rgba(76, 184, 159, 0.06)',
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
                  <Typography sx={{ fontWeight: 'inherit', fontSize: '0.9375rem' }}>
                    {item.label}
                  </Typography>
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

      {/* Content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: { md: `${SIDEBAR_WIDTH}px` },
          pb: { xs: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 8px)`, md: 0 },
          minHeight: '100vh'
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
              bgcolor: 'rgba(42, 36, 31, 0.86)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
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
          sx={{ maxWidth: 720, mx: 'auto', width: '100%', px: { xs: 2, sm: 3 } }}
        >
          {children}
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
            bgcolor: 'rgba(42, 36, 31, 0.86)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: theme.zIndex.appBar + 1,
            boxShadow: '0 -4px 20px rgba(44, 117, 98, 0.10)'
          }}
        >
          <BottomNavigation
            value={current}
            onChange={(_, value) => navigate(navItems[value].to)}
            showLabels
            sx={{
              height: MOBILE_NAV_HEIGHT,
              bgcolor: 'transparent',
              // Blur zaten sarmalayan Box'ta uygulanıyor (yukarıda) - MUI'nin
              // MuiBottomNavigation tema varsayılanı (bkz. theme.js) burada
              // AYRICA blur(16px) uyguluyordu, şeffaf bir katmanın üstüne
              // ikinci bir blur bindirmek görsel olarak hiçbir fark
              // yaratmıyor ama mobilde scroll sırasında GPU'ya iki kat iş
              // yüklüyordu - kaldırıldı.
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
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
