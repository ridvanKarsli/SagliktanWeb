import { Box, ButtonBase, Typography } from '@mui/material'
import { LogoutRounded } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import NotificationBell from '../NotificationBell.jsx'
import UserAvatar from '../avatars/UserAvatar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { clickableProps } from '../../utils/clickable.js'
import NavIcon from './NavIcon.jsx'
import BrandMark from './BrandMark.jsx'
import { isNavItemActive, useNavItems } from './navConfig.jsx'

export const SIDEBAR_WIDTH = 256

const rowSx = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 1.75,
  px: 1.75,
  minHeight: 48,
  borderRadius: '999px',
  cursor: 'pointer',
  transition: 'background-color 160ms ease, color 160ms ease',
  '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 }
}

// Masaüstü sol gezinme: marka + bildirimler, sekmeler, altta "sen" kartı
// (avatarın ve adın, profiline gider) ve çıkış.
export default function DesktopSidebar({ onLogout }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navItems = useNavItems()
  const { user } = useAuth()
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')

  return (
    <Box
      component="nav"
      aria-label="Ana gezinme"
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 1, mb: 1 }}>
        <BrandMark size={36} fontSize="1.5rem" />
        <NotificationBell />
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', pl: 1.25, mb: 3.5, lineHeight: 1.45 }}>
        Aynı yoldan geçenlerle, birlikte.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItems.map(item => {
          const active = isNavItemActive(item, pathname)
          return (
            <Box
              key={item.to}
              {...clickableProps(() => navigate(item.to))}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              sx={{
                ...rowSx,
                color: active ? 'primary.main' : 'text.secondary',
                bgcolor: active ? 'brand.primarySoft' : 'transparent',
                fontWeight: active ? 800 : 600,
                '&:hover': { bgcolor: active ? 'brand.primarySoft' : 'action.hover', color: active ? 'primary.main' : 'text.primary' },
                '& svg': { fontSize: 24, transition: 'transform 240ms var(--ease-spring)' },
                '&:hover svg': { transform: 'scale(1.08)' }
              }}
            >
              <Box sx={{ display: 'flex' }}>
                <NavIcon item={item} active={active} />
              </Box>
              <Typography sx={{ fontWeight: 'inherit', fontSize: '1rem', flex: 1 }}>
                {item.label}
              </Typography>
              {/* Kısayol ipucu (bkz. useQuickSearchShortcut). Metin tam opak
                  text.secondary: soluklaştırmak AA kontrastını bozar. */}
              {item.to === '/search' && (
                <Box
                  sx={{
                    fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary',
                    border: '1px solid', borderColor: 'brand.borderStrong', borderRadius: '8px',
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

      {user && (
        <ButtonBase
          onClick={() => navigate('/profile')}
          aria-label={`Profilin: ${fullName || 'Profil'}`}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.25, justifyContent: 'flex-start', textAlign: 'left',
            p: 1.25, mb: 1, borderRadius: '18px', bgcolor: 'brand.surfaceAlt',
            transition: 'background-color 160ms ease',
            '&:hover': { bgcolor: 'brand.primarySoft' },
            '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 }
          }}
        >
          <UserAvatar avatarKey={user.avatarKey} name={fullName} size={40} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ color: 'text.primary', lineHeight: 1.3 }}>{fullName || 'Profilin'}</Typography>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>Profilini gör</Typography>
          </Box>
        </ButtonBase>
      )}

      <Box
        {...clickableProps(onLogout)}
        aria-label="Çıkış Yap"
        sx={{
          ...rowSx,
          color: 'text.secondary',
          '&:hover': { bgcolor: 'brand.roseSoft', color: 'error.main' }
        }}
      >
        <LogoutRounded sx={{ fontSize: 22 }} />
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>Çıkış Yap</Typography>
      </Box>
    </Box>
  )
}
