import { createTheme } from '@mui/material/styles'

// Sağlıktan Kurumsal Renk Paleti - Light Mode
// Tasarım niyeti: sağlık topluluğu için sıcak, huzur verici ve güven veren
// bir görünüm - koyu/teknoloji temalı kontrastan uzak, krem tonlu bir zemin
// üzerine yumuşak salvia yeşili ve mercan vurgu rengiyle.
const colors = {
  primary: '#3F9C87',      // Salvia yeşili - ana marka rengi
  secondary: '#D97757',    // Sıcak mercan - insani/samimi vurgu
  tertiary: '#2C7562',     // Koyu yeşil - aksan
  background: '#FBF7F1',   // Krem/fildişi arka plan
  surface: '#FFFFFF',      // Kart yüzeyleri
  surfaceAlt: '#F3ECE0',   // Bölüm ayrımı için yumuşak krem
  text: {
    primary: '#332F2A',    // Sıcak kömür - saf siyah değil
    secondary: '#7C7368',  // Sıcak gri
    disabled: '#B4AC9F',
  },
  border: 'rgba(51, 47, 42, 0.10)',
  divider: 'rgba(51, 47, 42, 0.08)',
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: '#6FBBA8',
      dark: '#2C7562',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.secondary,
      light: '#E8A488',
      dark: '#B85C3D',
      contrastText: '#FFFFFF',
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    divider: colors.divider,
    error: {
      main: '#C4554A',
      light: '#E39089',
    },
    warning: {
      main: '#C98A3E',
      light: '#E8B876',
    },
    success: {
      main: colors.primary,
      light: '#6FBBA8',
    },
    info: {
      main: '#5B8FA3',
      light: '#8FB5C4',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.7,
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: colors.text.secondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 14,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(51, 47, 42, 0.06)',
    '0 2px 6px rgba(51, 47, 42, 0.07)',
    '0 4px 10px rgba(51, 47, 42, 0.08)',
    '0 6px 14px rgba(51, 47, 42, 0.09)',
    '0 8px 18px rgba(51, 47, 42, 0.10)',
    '0 12px 24px rgba(51, 47, 42, 0.11)',
    '0 16px 32px rgba(51, 47, 42, 0.12)',
    '0 20px 40px rgba(51, 47, 42, 0.13)',
    '0 24px 48px rgba(51, 47, 42, 0.14)',
    ...Array(15).fill('0 24px 48px rgba(51, 47, 42, 0.14)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          backgroundColor: colors.background,
          color: colors.text.primary,
        },
        '::selection': {
          backgroundColor: colors.primary,
          color: '#FFFFFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.9375rem',
          minHeight: 48,
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 18px rgba(63, 156, 135, 0.25)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.tertiary} 100%)`,
          color: '#FFFFFF',
          '&:hover': {
            background: `linear-gradient(135deg, #4EAE98 0%, ${colors.primary} 100%)`,
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary,
          '&:hover': {
            backgroundColor: '#B85C3D',
          },
        },
        outlined: {
          borderWidth: 1.5,
          borderColor: colors.primary,
          color: colors.primary,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(63, 156, 135, 0.08)',
            borderColor: colors.primary,
          },
        },
        outlinedPrimary: {
          borderColor: colors.primary,
          color: colors.primary,
        },
        text: {
          color: colors.text.secondary,
          '&:hover': {
            backgroundColor: 'rgba(51, 47, 42, 0.04)',
            color: colors.text.primary,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            fontSize: '1rem',
            '& fieldset': {
              borderColor: colors.border,
              borderWidth: 1.5,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(51, 47, 42, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
              borderWidth: 2,
            },
          },
          '& .MuiInputBase-input': {
            padding: '14px 16px',
            color: colors.text.primary,
          },
          '& .MuiInputLabel-root': {
            color: colors.text.secondary,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 10px rgba(51, 47, 42, 0.06)',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 28px rgba(51, 47, 42, 0.10)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colors.surface,
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8125rem',
        },
        filled: {
          backgroundColor: 'rgba(63, 156, 135, 0.12)',
          color: colors.tertiary,
          '&:hover': {
            backgroundColor: 'rgba(63, 156, 135, 0.2)',
          },
        },
        outlined: {
          borderColor: colors.border,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary,
          color: '#FFFFFF',
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          color: colors.text.primary,
          boxShadow: '0 1px 3px rgba(51, 47, 42, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface,
          borderRight: `1px solid ${colors.border}`,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: colors.text.secondary,
          minWidth: 'auto',
          padding: '8px 12px',
          '&.Mui-selected': {
            color: colors.primary,
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.6875rem',
            fontWeight: 500,
            marginTop: 4,
            '&.Mui-selected': {
              fontSize: '0.6875rem',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          minHeight: 48,
          color: colors.text.secondary,
          '&.Mui-selected': {
            color: colors.primary,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: colors.primary,
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: colors.text.secondary,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(51, 47, 42, 0.06)',
            color: colors.primary,
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colors.tertiary,
          textDecoration: 'none',
          fontWeight: 500,
          '&:hover': {
            color: colors.primary,
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.divider,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          backgroundColor: 'rgba(63, 156, 135, 0.12)',
          color: colors.tertiary,
        },
        standardError: {
          backgroundColor: 'rgba(196, 85, 74, 0.12)',
          color: '#C4554A',
        },
        standardInfo: {
          backgroundColor: 'rgba(91, 143, 163, 0.12)',
          color: '#4A7788',
        },
        standardWarning: {
          backgroundColor: 'rgba(201, 138, 62, 0.12)',
          color: '#9C6C2E',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(51, 47, 42, 0.06)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(51, 47, 42, 0.12)',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.9375rem',
          padding: '10px 16px',
          '&:hover': {
            backgroundColor: 'rgba(51, 47, 42, 0.04)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.text.primary,
          color: '#FFFFFF',
          fontSize: '0.8125rem',
          borderRadius: 8,
        },
      },
    },
  },
})

export default theme
