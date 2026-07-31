import { createTheme } from '@mui/material/styles'

// Sağlıktan Kurumsal Renk Paleti - Sıcak Dark Mode
// Tasarım niyeti: sağlık topluluğu için huzur verici, sıcak ve profesyonel
// bir koyu tema - mavi/siyah "tech" kontrastı yerine sıcak espresso tonlu
// bir zemin üzerine yumuşak salvia yeşili ve mercan vurgu rengiyle.
const colors = {
  primary: '#4CB89F',      // Açık salvia yeşili - koyu zeminde öne çıkar
  primaryDark: '#3F9C87',  // Koyu salvia - gradient/aksan için
  secondary: '#E08B6D',    // Sıcak mercan - insani/samimi vurgu
  tertiary: '#2C7562',     // Derin yeşil - aksan/gradient
  background: '#1E1A16',   // Sıcak espresso - lacivert/siyah değil
  surface: '#2A241F',      // Kart yüzeyleri
  surfaceAlt: '#332C25',   // Bölüm ayrımı için sıcak koyu ton
  text: {
    primary: '#F2EDE6',    // Sıcak krem
    secondary: '#B3A99C',  // Sıcak gri
    disabled: '#6B6255',
  },
  border: 'rgba(242, 237, 230, 0.10)',
  divider: 'rgba(242, 237, 230, 0.08)',
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
      light: '#7ECCB6',
      dark: colors.primaryDark,
      contrastText: colors.background,
    },
    secondary: {
      main: colors.secondary,
      light: '#EAAB92',
      dark: '#D97757',
      contrastText: colors.background,
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
      main: '#E08078',
      light: '#EEA9A3',
    },
    warning: {
      main: '#E0A85E',
      light: '#EEC48D',
    },
    success: {
      main: colors.primary,
      light: '#7ECCB6',
    },
    info: {
      main: '#7FAEBD',
      light: '#A6C6D1',
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
    '0 1px 2px rgba(0, 0, 0, 0.22)',
    '0 2px 6px rgba(0, 0, 0, 0.26)',
    '0 4px 10px rgba(0, 0, 0, 0.30)',
    '0 6px 14px rgba(0, 0, 0, 0.34)',
    '0 8px 18px rgba(0, 0, 0, 0.38)',
    '0 12px 24px rgba(0, 0, 0, 0.42)',
    '0 16px 32px rgba(0, 0, 0, 0.46)',
    '0 20px 40px rgba(0, 0, 0, 0.50)',
    '0 24px 48px rgba(0, 0, 0, 0.54)',
    ...Array(15).fill('0 24px 48px rgba(0, 0, 0, 0.54)'),
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
          color: colors.background,
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
            boxShadow: '0 6px 18px rgba(76, 184, 159, 0.28)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          color: colors.background,
          '&:hover': {
            background: `linear-gradient(135deg, #7ECCB6 0%, ${colors.primary} 100%)`,
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary,
          color: colors.background,
          '&:hover': {
            backgroundColor: '#EAAB92',
          },
        },
        outlined: {
          borderWidth: 1.5,
          borderColor: colors.primary,
          color: colors.primary,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(76, 184, 159, 0.10)',
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
            backgroundColor: 'rgba(242, 237, 230, 0.06)',
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
            backgroundColor: colors.surfaceAlt,
            fontSize: '1rem',
            '& fieldset': {
              borderColor: colors.border,
              borderWidth: 1.5,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(242, 237, 230, 0.22)',
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
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.28)',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.36)',
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
          backgroundColor: 'rgba(76, 184, 159, 0.16)',
          color: colors.primary,
          '&:hover': {
            backgroundColor: 'rgba(76, 184, 159, 0.26)',
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
          color: colors.background,
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          color: colors.text.primary,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
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
            backgroundColor: 'rgba(242, 237, 230, 0.08)',
            color: colors.primary,
          },
        },
        // "small" varyantı MUI'de ~34px - mobilde önerilen minimum dokunma
        // alanının (44px) altında kalıyor, parmakla isabet ettirmek
        // zorlaşıyor. Görsel ikon boyutu aynı kalsın diye padding ile değil
        // min-width/height ile büyütüyoruz (buton tıklama alanı büyür,
        // ikonun kendisi büyümez).
        sizeSmall: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colors.primary,
          textDecoration: 'none',
          fontWeight: 500,
          '&:hover': {
            color: '#7ECCB6',
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
        // Okunabilirlik notu: mesaj metni tam saturasyonlu vurgu rengiyle
        // değil, kreme yakın yüksek kontrastlı bir tonla yazılıyor - renk
        // sadece ikon ve kenarlıkta anlam taşıyor. Uzun metinlerde saf
        // vurgu rengiyle yazı okumak gözü yoruyordu.
        root: {
          borderRadius: 12,
          padding: '12px 16px',
          alignItems: 'flex-start',
        },
        icon: {
          fontSize: 22,
          marginRight: 12,
          paddingTop: 1,
          opacity: 1,
        },
        message: {
          padding: '2px 0',
          fontSize: '0.9rem',
          fontWeight: 500,
          lineHeight: 1.6,
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 184, 159, 0.14)',
          color: '#E4F3EE',
          border: '1px solid rgba(76, 184, 159, 0.32)',
          '& .MuiAlert-icon': { color: colors.primary },
        },
        standardError: {
          backgroundColor: 'rgba(224, 128, 120, 0.14)',
          color: '#F8E2DF',
          border: '1px solid rgba(224, 128, 120, 0.34)',
          '& .MuiAlert-icon': { color: '#E08078' },
        },
        standardInfo: {
          backgroundColor: 'rgba(127, 174, 189, 0.14)',
          color: '#E3EDF0',
          border: '1px solid rgba(127, 174, 189, 0.32)',
          '& .MuiAlert-icon': { color: '#7FAEBD' },
        },
        standardWarning: {
          backgroundColor: 'rgba(224, 168, 94, 0.14)',
          color: '#F8ECDA',
          border: '1px solid rgba(224, 168, 94, 0.34)',
          '& .MuiAlert-icon': { color: '#E0A85E' },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(242, 237, 230, 0.08)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
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
            backgroundColor: 'rgba(242, 237, 230, 0.06)',
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
          backgroundColor: colors.surfaceAlt,
          color: colors.text.primary,
          fontSize: '0.8125rem',
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
        },
      },
    },
  },
})

export default theme
