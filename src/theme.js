import { createTheme, alpha } from '@mui/material/styles'

const primary = '#34C3A1'
const secondary = '#1B7A85'
const bgDark = '#0B3A4E'
const paper = '#FAF9F6'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: primary },
    secondary: { main: secondary },
    background: { default: bgDark, paper },
    text: { primary: '#FAF9F6', secondary: 'rgba(255,255,255,0.85)' }
  },
  shape: { borderRadius: 10 }, // hafif yuvarlatılmış
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif',
    h1: { fontSize: '2.2rem', fontWeight: 800, letterSpacing: -0.3, color: '#FAF9F6' },
    h2: { fontSize: '1.8rem', fontWeight: 800, letterSpacing: -0.2, color: '#FAF9F6' },
    h3: { fontSize: '1.5rem', fontWeight: 800, color: '#FAF9F6' },
    h4: { fontSize: '1.25rem', fontWeight: 700, color: '#FAF9F6' },
    body1: { color: 'rgba(255,255,255,0.92)' },
    body2: { color: 'rgba(255,255,255,0.85)' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '::-webkit-scrollbar': { width: 10, height: 10 },
        '::-webkit-scrollbar-thumb': { backgroundColor: alpha('#ffffff', 0.28), borderRadius: 8 }
      }
    },
    MuiDivider: { styleOverrides: { root: { borderColor: 'rgba(255,255,255,0.12)' } } },
    MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none', backdropFilter: 'blur(10px)' } } },
    MuiButton: {
      defaultProps: { variant: 'contained', disableElevation: true },
      styleOverrides: {
        root: { paddingInline: 16, paddingBlock: 10, borderRadius: 10 },
        containedPrimary: { boxShadow: '0 6px 16px rgba(52,195,161,0.35)' }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: '#FAF9F6',
            borderRadius: 10
          },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.18)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(primary, 0.6) },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: primary, borderWidth: 2 },
          '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.75)' }
        }
      }
    },
    MuiBottomNavigation: {
      styleOverrides: { root: { paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)' } }
    }
  }
})

export default theme
