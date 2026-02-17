import { createTheme } from '@mui/material/styles'

// Sağlıktan Kurumsal Renk Paleti
const colors = {
  primary: '#0B3A4E',      // Koyu mavi - ana renk
  secondary: '#34C3A1',    // Yeşil - vurgu/aksiyon rengi
  tertiary: '#1B7A85',     // Teal - ikincil vurgu
  background: '#FAF9F6',   // Krem beyaz - arka plan
  surface: '#FFFFFF',      // Saf beyaz - kart yüzeyleri
  text: {
    primary: '#0B3A4E',
    secondary: '#5A6B75',
    disabled: '#9CA8B0',
  },
  border: '#E8E8E8',
  divider: '#F0F0F0',
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: '#1B5A6E',
      dark: '#072A3A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.secondary,
      light: '#5DD4B5',
      dark: '#2A9E82',
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
      main: '#DC3545',
      light: '#F8D7DA',
    },
    warning: {
      main: '#FFC107',
      light: '#FFF3CD',
    },
    success: {
      main: colors.secondary,
      light: '#D4EDDA',
    },
    info: {
      main: colors.tertiary,
      light: '#D1ECF1',
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
    '0 1px 2px rgba(11, 58, 78, 0.04)',
    '0 2px 4px rgba(11, 58, 78, 0.06)',
    '0 4px 8px rgba(11, 58, 78, 0.08)',
    '0 6px 12px rgba(11, 58, 78, 0.1)',
    '0 8px 16px rgba(11, 58, 78, 0.12)',
    '0 12px 24px rgba(11, 58, 78, 0.14)',
    '0 16px 32px rgba(11, 58, 78, 0.16)',
    '0 20px 40px rgba(11, 58, 78, 0.18)',
    '0 24px 48px rgba(11, 58, 78, 0.2)',
    ...Array(15).fill('0 24px 48px rgba(11, 58, 78, 0.2)'),
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
          backgroundColor: colors.secondary,
          color: '#FFFFFF',
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
            boxShadow: '0 4px 12px rgba(11, 58, 78, 0.2)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.tertiary} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.tertiary} 100%)`,
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary,
          '&:hover': {
            backgroundColor: '#2A9E82',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(11, 58, 78, 0.04)',
          },
        },
        outlinedPrimary: {
          borderColor: colors.primary,
          color: colors.primary,
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(11, 58, 78, 0.04)',
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
            backgroundColor: '#FFFFFF',
            fontSize: '1rem',
            '& fieldset': {
              borderColor: colors.border,
              borderWidth: 1.5,
            },
            '&:hover fieldset': {
              borderColor: colors.tertiary,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
              borderWidth: 2,
            },
          },
          '& .MuiInputBase-input': {
            padding: '14px 16px',
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
          boxShadow: '0 2px 8px rgba(11, 58, 78, 0.06)',
          border: `1px solid ${colors.border}`,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(11, 58, 78, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
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
          backgroundColor: 'rgba(52, 195, 161, 0.12)',
          color: colors.tertiary,
          '&:hover': {
            backgroundColor: 'rgba(52, 195, 161, 0.2)',
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
          backgroundColor: colors.secondary,
          color: '#FFFFFF',
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: colors.text.primary,
          boxShadow: '0 1px 3px rgba(11, 58, 78, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${colors.border}`,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
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
            backgroundColor: 'rgba(11, 58, 78, 0.06)',
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
          backgroundColor: 'rgba(52, 195, 161, 0.1)',
          color: colors.tertiary,
        },
        standardError: {
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          color: '#DC3545',
        },
        standardInfo: {
          backgroundColor: 'rgba(27, 122, 133, 0.1)',
          color: colors.tertiary,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(11, 58, 78, 0.06)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(11, 58, 78, 0.12)',
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.9375rem',
          padding: '10px 16px',
          '&:hover': {
            backgroundColor: 'rgba(11, 58, 78, 0.04)',
          },
        },
      },
    },
  },
})

export default theme
