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

const railWidth = 84
const MOBILE_NAV_HEIGHT = 72 // px

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
      {/* Nav Rail (md+) */}
      {isMdUp && (
        <Drawer
          variant="permanent"
          sx={{
            width: railWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: railWidth,
              boxSizing: 'border-box',
              backgroundColor: 'transparent',
              borderRight: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(4px)'
            }
          }}
          open
          aria-label="Ana gezinme"
        >
          <Toolbar sx={{ justifyContent: 'center', mt: 1 }}>
            <AnimatedLogo size={40} mobileSize={40} showBorder={true} />
          </Toolbar>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, mt: 1 }}>
            {navItems.map(item => {
              const active = location.pathname.startsWith(item.to)
              return (
                <Tooltip title={item.label} placement="right" key={item.to}>
                  <IconButton
                    onClick={() => navigate(item.to)}
                    sx={{
                      color: active ? 'primary.main' : 'rgba(255,255,255,0.85)',
                      borderRadius: 3,
                      width: 56, height: 56
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              )
            })}
          </Box>

          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Tooltip title="Çıkış">
              <IconButton onClick={logout} sx={{ color: 'rgba(255,255,255,0.9)' }}>
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        </Drawer>
      )}

      {/* İçerik alanı */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header (aramasız) */}
        <AppBar
          position="sticky"
          color="transparent"
          elevation={0}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(7,20,28,0.4)',
            backdropFilter: 'blur(8px)',
            color: '#fff'
          }}
        >
          <Toolbar sx={{ px: { xs: 1.5, md: 3 }, gap: { xs: 0.5, md: 1 }, minHeight: { xs: 56, md: 64 } }}>
            {!isMdUp && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1, minWidth: 0 }}>
                <AnimatedLogo size={32} mobileSize={28} showBorder={true} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '18px', sm: '20px' } }}>Sağlıktan</Typography>
              </Box>
            )}
            {isMdUp && (
              <Typography variant="h6" sx={{ fontWeight: 800, mx: { xs: 1, md: 2 }, fontSize: { xs: '18px', md: '20px' } }}>
                {headerTitle}
              </Typography>
            )}
            {!isMdUp && headerTitle && (
              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '15px', color: 'rgba(255,255,255,0.9)', ml: 1 }}>
                {headerTitle}
              </Typography>
            )}
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: { xs: 0.25, md: 1 } }}>
              <Tooltip title="Ara">
                <IconButton 
                  onClick={() => navigate('/search')} 
                  sx={{ 
                    color: '#fff',
                    width: { xs: 44, md: 40 },
                    height: { xs: 44, md: 40 },
                    minWidth: { xs: 44, md: 40 },
                    minHeight: { xs: 44, md: 40 }
                  }}
                >
                  <Search sx={{ fontSize: { xs: '22px', md: '24px' } }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Yeni Gönderi">
                <IconButton 
                  onClick={() => navigate('/posts?new=1')} 
                  sx={{ 
                    color: '#fff',
                    width: { xs: 44, md: 40 },
                    height: { xs: 44, md: 40 },
                    minWidth: { xs: 44, md: 40 },
                    minHeight: { xs: 44, md: 40 }
                  }}
                >
                  <AddCircleOutline sx={{ fontSize: { xs: '22px', md: '24px' } }} />
                </IconButton>
              </Tooltip>
              {token && (
                <>
                  <Tooltip title="Menü">
                    <IconButton 
                      onClick={handleMenuOpen} 
                      sx={{ 
                        color: '#fff',
                        width: { xs: 44, md: 40 },
                        height: { xs: 44, md: 40 },
                        minWidth: { xs: 44, md: 40 },
                        minHeight: { xs: 44, md: 40 }
                      }}
                    >
                      <AccountCircleIcon sx={{ fontSize: { xs: 28, md: 32 } }} />
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
                        bgcolor: '#192837',
                        color: '#fff',
                        borderRadius: 2,
                        minWidth: 160,
                        boxShadow: 12,
                        py: 0.5,
                        border: 'none',
                      },
                    }}
                  >
                    <MenuItem 
                      onClick={goProfile} 
                      sx={{ 
                        color: '#fff', 
                        fontWeight: 600, 
                        borderRadius: 2, 
                        px: 2.5, 
                        py: { xs: 1.5, md: 1.15 },
                        minHeight: { xs: 48, md: 40 },
                        fontSize: { xs: '15px', md: '14px' },
                        '&:hover': { bgcolor: 'primary.main', color: '#fff' } 
                      }}
                    >
                      <AccountCircleIcon sx={{ mr: 1, color: 'primary.main' }} /> Profilim
                    </MenuItem>
                    <MenuItem 
                      onClick={handleLogout} 
                      sx={{ 
                        color: '#fff', 
                        fontWeight: 600, 
                        borderRadius: 2, 
                        px: 2.5, 
                        py: { xs: 1.5, md: 1.15 },
                        minHeight: { xs: 48, md: 40 },
                        fontSize: { xs: '15px', md: '14px' },
                        '&:hover': { bgcolor: 'error.main', color: '#fff' } 
                      }}
                    >
                      <LogoutIcon sx={{ mr: 1, color: 'error.main' }} /> Çıkış Yap
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sayfa gövdesi (mobilde alt menü yüksekliğini tolere et) */}
        <Box
          component="main"
          sx={{
            width: '100%',
            maxWidth: '100%',
            mx: 'auto',
            overflowX: 'hidden',
            pb: { xs: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 12px)`, md: 0 }
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 680, lg: 980 },
              mx: 'auto',
              overflowX: 'hidden'
            }}
          >
            {children}
          </Box>
        </Box>

        {/* Mobil Alt Bar – her zaman en altta (fixed) */}
        {!isMdUp && (
          <Box
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              height: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
              zIndex: (t) => t.zIndex.appBar + 2,
              borderTop: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(7,20,28,0.45)'
            }}
          >
            <BottomNavigation
              value={current}
              onChange={(_, value) => navigate(navItems[value].to)}
              showLabels
              sx={{
                height: MOBILE_NAV_HEIGHT,
                background: 'transparent',
                px: { xs: 0.5, sm: 1 },
                '& .MuiBottomNavigationAction-root': {
                  color: 'rgba(255,255,255,0.85)',
                  minWidth: { xs: 60, sm: 70 },
                  minHeight: { xs: 48, sm: 56 },
                  position: 'relative',
                  paddingInline: { xs: 0.75, sm: 1.25 },
                  '& .MuiBottomNavigationAction-label': {
                    fontWeight: 600,
                    opacity: 0.9,
                    fontSize: { xs: '11px', sm: '12px' },
                    marginTop: { xs: 0.25, sm: 0.5 },
                    '&.Mui-selected': {
                      fontSize: { xs: '11px', sm: '12px' }
                    }
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: '24px', sm: '28px' }
                  }
                },
                '& .Mui-selected': { color: 'primary.main' }
              }}
            >
              {navItems.map(item => (
                <BottomNavigationAction key={item.to} label={item.label} icon={item.icon} />
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
