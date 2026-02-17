import { createTheme } from '@mui/material/styles'

// Modern, minimal sağlık platformu renk paleti
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    secondary: { main: '#71717a', light: '#a1a1aa', dark: '#52525b' },
    success: { main: '#22c55e', light: '#4ade80', dark: '#16a34a' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    background: { default: '#09090b', paper: '#18181b' },
    text: { primary: '#fafafa', secondary: '#a1a1aa' },
    divider: 'rgba(255,255,255,0.06)'
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontWeight: 600, fontSize: '1.375rem', lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    h4: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
    h5: { fontWeight: 500, fontSize: '0.9375rem', lineHeight: 1.4 },
    h6: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.4 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5, color: '#a1a1aa' },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: '#71717a' },
    button: { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem' }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        html: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#27272a transparent',
          '&::-webkit-scrollbar': { width: 6, height: 6 },
          '&::-webkit-scrollbar-thumb': { background: '#27272a', borderRadius: 3 },
          '&::-webkit-scrollbar-track': { background: 'transparent' }
        }
      }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, padding: '10px 20px', fontWeight: 500 },
        contained: { background: '#3b82f6', '&:hover': { background: '#2563eb' } },
        outlined: { borderColor: '#27272a', '&:hover': { borderColor: '#3b82f6', background: 'rgba(59,130,246,0.08)' } },
        text: { '&:hover': { background: 'rgba(255,255,255,0.04)' } }
      }
    },
    MuiCard: {
      styleOverrides: { root: { background: '#18181b', borderRadius: 16, border: 'none', boxShadow: 'none' } }
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none', border: 'none' } }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            background: 'rgba(255,255,255,0.02)',
            '& fieldset': { borderColor: '#27272a' },
            '&:hover fieldset': { borderColor: '#3f3f46' },
            '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: 1 }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6, height: 26, fontWeight: 500, background: 'rgba(255,255,255,0.06)', border: 'none' } }
    },
    MuiAvatar: {
      styleOverrides: { root: { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', fontWeight: 600 } }
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 10, '&:hover': { background: 'rgba(255,255,255,0.06)' } } }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&:hover': { background: 'rgba(255,255,255,0.04)' },
          '&.Mui-selected': { background: 'rgba(59,130,246,0.12)', '&:hover': { background: 'rgba(59,130,246,0.16)' } }
        }
      }
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: 'rgba(255,255,255,0.06)' } }
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { background: '#27272a', fontSize: '0.75rem', borderRadius: 8, padding: '8px 12px' } }
    },
    MuiMenu: {
      styleOverrides: { paper: { background: '#1f1f23', borderRadius: 12, border: '1px solid #27272a', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' } }
    },
    MuiMenuItem: {
      styleOverrides: { root: { borderRadius: 8, margin: '2px 6px', '&:hover': { background: 'rgba(255,255,255,0.06)' } } }
    },
    MuiDialog: {
      styleOverrides: { paper: { background: '#18181b', borderRadius: 16, border: '1px solid #27272a' } }
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 500, '&.Mui-selected': { color: '#3b82f6' } } }
    },
    MuiTabs: {
      styleOverrides: { indicator: { background: '#3b82f6', height: 2, borderRadius: 1 } }
    },
    MuiBottomNavigation: {
      styleOverrides: { root: { background: '#18181b', borderTop: '1px solid #27272a' } }
    },
    MuiBottomNavigationAction: {
      styleOverrides: { root: { '&.Mui-selected': { color: '#3b82f6' } } }
    },
    MuiAppBar: {
      styleOverrides: { root: { background: '#18181b', borderBottom: '1px solid #27272a', boxShadow: 'none' } }
    }
  }
})

export default theme
