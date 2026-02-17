import { createTheme } from '@mui/material/styles'

// Sağlıktan Kurumsal Renk Paleti - Dark Mode
const colors = {
  primary: '#34C3A1',      // Yeşil - ana vurgu rengi
  secondary: '#1B7A85',    // Teal - ikincil vurgu
  tertiary: '#0B3A4E',     // Koyu mavi - aksan
  background: '#0A0F14',   // Koyu arka plan
  surface: '#131A22',      // Kart yüzeyleri
  surfaceLight: '#1A242E', // Açık yüzey
  text: {
    primary: '#F5F7FA',
    secondary: '#9CA8B5',
    disabled: '#5A6570',
  },
  border: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.06)',
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
      light: '#5DD4B5',
      dark: '#2A9E82',
      contrastText: '#0A0F14',
    },
    secondary: {
      main: colors.secondary,
      light: '#2A9AA8',
      dark: '#145A64',
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
      main: '#EF4444',
      light: '#FCA5A5',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
    },
    success: {
      main: colors.primary,
      light: '#5DD4B5',
    },
    info: {
      main: colors.secondary,
      light: '#2A9AA8',
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
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.2)',
    '0 2px 4px rgba(0, 0, 0, 0.25)',
    '0 4px 8px rgba(0, 0, 0, 0.3)',
    '0 6px 12px rgba(0, 0, 0, 0.35)',
    '0 8px 16px rgba(0, 0, 0, 0.4)',
    '0 12px 24px rgba(0, 0, 0, 0.45)',
    '0 16px 32px rgba(0, 0, 0, 0.5)',
    '0 20px 40px rgba(0, 0, 0, 0.55)',
    '0 24px 48px rgba(0, 0, 0, 0.6)',
    ...Array(15).fill('0 24px 48px rgba(0, 0, 0, 0.6)'),
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
          borderRadius: 10,
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
            boxShadow: '0 4px 16px rgba(52, 195, 161, 0.3)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          color: '#0A0F14',
          '&:hover': {
            background: `linear-gradient(135deg, #5DD4B5 0%, #2A9AA8 100%)`,
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary,
          '&:hover': {
            backgroundColor: '#2A9AA8',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: colors.primary,
          color: colors.primary,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(52, 195, 161, 0.08)',
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
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
            borderRadius: 10,
            backgroundColor: colors.surfaceLight,
            fontSize: '1rem',
            '& fieldset': {
              borderColor: colors.border,
              borderWidth: 1.5,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.15)',
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
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
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
          backgroundColor: 'rgba(52, 195, 161, 0.15)',
          color: colors.primary,
          '&:hover': {
            backgroundColor: 'rgba(52, 195, 161, 0.25)',
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
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: colors.primary,
          },
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
            color: '#5DD4B5',
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
          backgroundColor: 'rgba(52, 195, 161, 0.15)',
          color: colors.primary,
        },
        standardError: {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#EF4444',
        },
        standardInfo: {
          backgroundColor: 'rgba(27, 122, 133, 0.15)',
          color: colors.secondary,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
          backgroundColor: colors.surfaceLight,
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
