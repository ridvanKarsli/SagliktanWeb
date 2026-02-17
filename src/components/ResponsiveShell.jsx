import { useMemo, useState } from 'react'
import {
  BottomNavigation, BottomNavigationAction, Box, IconButton,
  Typography, Menu, MenuItem
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import {
  Home, SmartToy, Search, Person, Logout
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const SIDEBAR_WIDTH = 220
const MOBILE_NAV_HEIGHT = 56

const navItems = [
  { label: 'Ana Sayfa', icon: <Home />, to: '/posts' },
  { label: 'AI', icon: <SmartToy />, to: '/ai-chat' },
  { label: 'Ara', icon: <Search />, to: '/search' },
  { label: 'Profil', icon: <Person />, to: '/profile' }
]

export default function ResponsiveShell({ children }) {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const current = useMemo(
    () => Math.max(0, navItems.findIndex(n => location.pathname.startsWith(n.to))),
    [location.pathname]
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
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            py: 3,
            px: 2
          }}
        >
          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              px: 1,
              mb: 4,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/posts')}
          >
            <Box
              component="img"
              src="/sagliktanLogo.png"
              alt="Sağlıktan"
              sx={{ width: 28, height: 28, borderRadius: '50%' }}
            />
            <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: 'text.primary' }}>
              Sağlıktan
            </Typography>
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {navItems.map(item => {
              const active = location.pathname.startsWith(item.to)
              return (
                <Box
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? 'rgba(59,130,246,0.1)' : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', '& svg': { fontSize: 20 } }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ fontWeight: active ? 500 : 400, fontSize: '0.875rem' }}>
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
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              cursor: 'pointer',
              color: 'text.secondary',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', color: 'text.primary' }
            }}
          >
            <Logout sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: '0.875rem' }}>Çıkış</Typography>
          </Box>
        </Box>
      )}

      {/* Content */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          ml: { md: `${SIDEBAR_WIDTH}px` },
          pb: { xs: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom))`, md: 0 }
        }}
      >
        <Box sx={{ maxWidth: 680, mx: 'auto', width: '100%' }}>
          {children}
        </Box>
      </Box>

      {/* Mobile Nav */}
      {!isMdUp && (
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
            value={current}
            onChange={(_, value) => navigate(navItems[value].to)}
            showLabels={false}
            sx={{
              height: MOBILE_NAV_HEIGHT,
              bgcolor: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                color: 'text.secondary',
                minWidth: 0,
                '& .MuiSvgIcon-root': { fontSize: 22 },
                '&.Mui-selected': { color: 'primary.main' }
              }
            }}
          >
            {navItems.map(item => (
              <BottomNavigationAction key={item.to} icon={item.icon} />
            ))}
          </BottomNavigation>
          <Box sx={{ height: 'env(safe-area-inset-bottom)' }} />
        </Box>
      )}
    </Box>
  )
}
