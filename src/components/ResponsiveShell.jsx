import { useMemo } from 'react'
import {
  BottomNavigation, BottomNavigationAction, Box, 
  Typography, Avatar
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import {
  HomeRounded, SearchRounded, PersonRounded, LogoutRounded
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const SIDEBAR_WIDTH = 240
const MOBILE_NAV_HEIGHT = 64

const navItems = [
  { label: 'Gruplar', icon: <HomeRounded />, to: '/groups' },
  { label: 'Ara', icon: <SearchRounded />, to: '/search' },
  { label: 'Profil', icon: <PersonRounded />, to: '/profile' }
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
            px: 2.5
          }}
        >
          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              px: 1.5,
              mb: 5,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/groups')}
          >
            <Avatar
              src="/sagliktanLogo.png"
              alt="Sağlıktan"
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(11, 58, 78, 0.1)'
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

          {/* Nav Links */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {navItems.map(item => {
              const active = location.pathname.startsWith(item.to)
              return (
                <Box
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? 'rgba(11, 58, 78, 0.06)' : 'transparent',
                    fontWeight: active ? 600 : 500,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: active ? 'rgba(11, 58, 78, 0.08)' : 'rgba(11, 58, 78, 0.04)',
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
                    {item.icon}
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
                bgcolor: 'rgba(220, 53, 69, 0.06)', 
                color: '#DC3545' 
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
        <Box sx={{ maxWidth: 720, mx: 'auto', width: '100%', px: { xs: 2, sm: 3 } }}>
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
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: theme.zIndex.appBar + 1,
            boxShadow: '0 -4px 20px rgba(11, 58, 78, 0.08)'
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
                padding: '8px 12px',
                gap: 0.5,
                '& .MuiSvgIcon-root': { fontSize: 24 },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  marginTop: '2px',
                  '&.Mui-selected': {
                    fontSize: '0.6875rem'
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
            {navItems.map(item => (
              <BottomNavigationAction 
                key={item.to} 
                icon={item.icon} 
                label={item.label}
              />
            ))}
          </BottomNavigation>
          <Box sx={{ height: 'env(safe-area-inset-bottom)', bgcolor: 'background.paper' }} />
        </Box>
      )}
    </Box>
  )
}
