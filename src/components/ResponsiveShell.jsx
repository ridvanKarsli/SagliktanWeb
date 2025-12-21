import { useMemo } from 'react'
import {
  AppBar, BottomNavigation, BottomNavigationAction, Box, Drawer, IconButton,
  Toolbar, Typography, Paper, Tooltip
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import {
  Home, SmartToy, ManageSearchRounded, PersonOutline, Logout,
  Search, AddCircleOutline
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import AnimatedLogo from './AnimatedLogo.jsx';

const railWidth = 275 // Twitter tarzı geniş sidebar
const MOBILE_NAV_HEIGHT = 60 // px - Twitter mobil gibi daha kompakt

const navItems = [
  { label: 'Gönderiler', icon: <Home />, to: '/posts', header: 'Topluluk Akışı' },
  { label: 'AI ile Sohbet', icon: <SmartToy />, to: '/ai-chat', header: 'AI ile Sohbet' },
  { label: 'Kişi Ara', icon: <ManageSearchRounded />, to: '/search', header: 'Kişi Ara' },
  { label: 'Profil', icon: <PersonOutline />, to: '/profile', header: 'Profil' }
]

function getHeaderTitle(pathname) {
  const found = navItems.find(n => pathname.startsWith(n.to))
  return found?.header ?? 'Sağlıktan'
}

export default function ResponsiveShell({ children }) {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user: me, token } = useAuth();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const handleMenuOpen = (e) => setMenuAnchor(e.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  const goProfile = () => { handleMenuClose(); navigate('/profile'); };
  const handleLogout = () => { handleMenuClose(); logout(); navigate('/'); };

  const current = useMemo(
    () => Math.max(0, navItems.findIndex(n => location.pathname.startsWith(n.to))),
    [location.pathname]
  )
  const headerTitle = getHeaderTitle(location.pathname)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sol Sidebar - Twitter tarzı (md+) */}
      {isMdUp && (
        <Drawer
          variant="permanent"
          sx={{
            width: railWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: railWidth,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(0,0,0,0.65)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              px: 2
            }
          }}
          open
          aria-label="Ana gezinme"
        >
          {/* Logo */}
          <Box sx={{ py: 2, px: 1 }}>
            <AnimatedLogo size={32} mobileSize={32} showBorder={false} />
          </Box>

          {/* Navigation Items - Twitter tarzı */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
            {navItems.map(item => {
              const active = location.pathname.startsWith(item.to)
              return (
                <Box
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    cursor: 'pointer',
                    color: active ? 'text.primary' : 'text.secondary',
                    backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'text.primary'
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minWidth: 24,
                    '& svg': { fontSize: 26 }
                  }}>
                    {item.icon}
                  </Box>
                  <Typography 
                    sx={{ 
                      fontWeight: active ? 700 : 500,
                      fontSize: '20px',
                      lineHeight: 1.2
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              )
            })}
          </Box>

          <Box sx={{ flex: 1 }} />
          
          {/* Çıkış butonu */}
          <Box sx={{ px: 3, py: 2 }}>
            <Box
              onClick={logout}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                cursor: 'pointer',
                color: 'text.secondary',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'text.primary'
                }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minWidth: 24,
                '& svg': { fontSize: 26 }
              }}>
                <Logout />
              </Box>
              <Typography 
                sx={{ 
                  fontWeight: 500,
                  fontSize: '20px',
                  lineHeight: 1.2
                }}
              >
                Çıkış Yap
              </Typography>
            </Box>
          </Box>
        </Drawer>
      )}

      {/* İçerik alanı */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header - Twitter tarzı */}
        <AppBar
          position="sticky"
          color="transparent"
          elevation={0}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
        >
          <Toolbar 
            sx={{ 
              px: { xs: 1.5, md: 3 }, 
              gap: { xs: 0.5, md: 1 }, 
              minHeight: { xs: 48, md: 53 },
              maxWidth: { md: 600 },
              mx: 'auto',
              width: '100%',
              borderLeft: { md: '1px solid rgba(255,255,255,0.08)' },
              borderRight: { md: '1px solid rgba(255,255,255,0.08)' }
            }}
          >
            {!isMdUp && (
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '20px',
                  flex: 1
                }}
              >
                {headerTitle}
              </Typography>
            )}
            {isMdUp && (
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '20px',
                  flex: 1
                }}
              >
                {headerTitle}
              </Typography>
            )}
            {token && (
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Menü">
                  <IconButton 
                    onClick={handleMenuOpen} 
                    sx={{ 
                      color: 'text.secondary',
                      width: { xs: 40, md: 36 },
                      height: { xs: 40, md: 36 },
                      minWidth: { xs: 40, md: 36 },
                      minHeight: { xs: 40, md: 36 },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: 'text.primary'
                      }
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: { xs: 24, md: 24 } }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  getContentAnchorEl={null}
                  sx={{
                    '& .MuiPaper-root': {
                      bgcolor: 'rgba(0,0,0,0.8)',
                      color: '#fff',
                      borderRadius: 2,
                      minWidth: 200,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      py: 0.5,
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(12px)'
                    },
                  }}
                >
                  <MenuItem 
                    onClick={goProfile} 
                    sx={{ 
                      color: '#fff', 
                      fontWeight: 500, 
                      borderRadius: 1, 
                      px: 2.5, 
                      py: { xs: 1.5, md: 1.15 },
                      minHeight: { xs: 48, md: 40 },
                      fontSize: { xs: '15px', md: '15px' },
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } 
                    }}
                  >
                    <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20 }} /> Profilim
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout} 
                    sx={{ 
                      color: '#fff', 
                      fontWeight: 500, 
                      borderRadius: 1, 
                      px: 2.5, 
                      py: { xs: 1.5, md: 1.15 },
                      minHeight: { xs: 48, md: 40 },
                      fontSize: { xs: '15px', md: '15px' },
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } 
                    }}
                  >
                    <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> Çıkış Yap
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Ana İçerik Alanı - Twitter tarzı */}
        <Box
          component="main"
          sx={{
            display: 'flex',
            width: '100%',
            maxWidth: '100%',
            mx: 'auto',
            overflowX: 'hidden',
            pb: { xs: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 12px)`, md: 0 }
          }}
        >
          {/* Ana İçerik - Twitter tarzı ortalanmış, mobilde tam genişlik */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              maxWidth: { xs: '100%', md: 600 },
              mx: 'auto',
              width: '100%',
              borderLeft: { md: '1px solid rgba(255,255,255,0.08)' },
              borderRight: { md: '1px solid rgba(255,255,255,0.08)' },
              overflowX: 'hidden'
            }}
          >
            {children}
          </Box>
        </Box>

        {/* Mobil Alt Bar – Twitter/X mobil gibi sadece ikonlar */}
        {!isMdUp && (
          <Box
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              height: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
              zIndex: (t) => t.zIndex.appBar + 2,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(0,0,0,0.65)'
            }}
          >
            <BottomNavigation
              value={current}
              onChange={(_, value) => navigate(navItems[value].to)}
              showLabels={false}
              sx={{
                height: MOBILE_NAV_HEIGHT,
                background: 'transparent',
                px: 0,
                '& .MuiBottomNavigationAction-root': {
                  color: 'rgba(255,255,255,0.6)',
                  minWidth: 0,
                  minHeight: 0,
                  padding: 0,
                  maxWidth: '25%',
                  '& .MuiSvgIcon-root': {
                    fontSize: '26px'
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    '& .MuiSvgIcon-root': {
                      fontSize: '28px'
                    }
                  }
                }
              }}
            >
              {navItems.map(item => (
                <BottomNavigationAction key={item.to} icon={item.icon} />
              ))}
            </BottomNavigation>
            {/* safe-area boşluğu */}
            <Box sx={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
          </Box>
        )}
      </Box>
    </Box>
  )
}
