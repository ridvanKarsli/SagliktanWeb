import { Avatar, Box, Typography } from '@mui/material'
import { LogoutRounded } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import NotificationBell from '../NotificationBell.jsx'
import { clickableProps } from '../../utils/clickable.js'
import NavIcon from './NavIcon.jsx'
import { isNavItemActive, useNavItems } from './navConfig.jsx'

export const SIDEBAR_WIDTH = 240

// Masaüstü sol gezinme çubuğu: logo + bildirimler, sekmeler, çıkış.
export default function DesktopSidebar({ onLogout }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navItems = useNavItems()

  return (
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
          justifyContent: 'space-between',
          px: 1.5,
          mb: 5
        }}
      >
        <Box
          {...clickableProps(() => navigate('/home'))}
          aria-label="Sağlıktan ana sayfa"
          sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
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
          const active = isNavItemActive(item, pathname)
          return (
            <Box
              key={item.to}
              {...clickableProps(() => navigate(item.to))}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
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
                <NavIcon item={item} active={active} />
              </Box>
              <Typography sx={{ fontWeight: 'inherit', fontSize: '0.9375rem', flex: 1 }}>
                {item.label}
              </Typography>
              {/* X.com/Linear tarzı kısayol ipucu - bkz. useQuickSearchShortcut.js.
                  Sadece masaüstü sidebar'da: mobilde klavye kısayolunun
                  bir anlamı yok. */}
              {item.to === '/search' && (
                // Metin tam opak 'text.secondary': soluklaştırmak WCAG AA
                // renk kontrastını ihlal eder (bkz. accessibility.spec.js).
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
        {...clickableProps(onLogout)}
        aria-label="Çıkış Yap"
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
  )
}
