import { createTheme, alpha } from '@mui/material/styles'

const primary = '#34C3A1'
const secondary = '#1B7A85'
const bgDark = '#0B3A4E'
const paper = '#FAF9F6'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: primary },
    secondary: { main: secondary },
    background: { 
      default: '#000000', // Twitter dark mode
      paper: 'rgba(0,0,0,0.6)' 
    },
    text: { 
      primary: '#FFFFFF', // Twitter white
      secondary: 'rgba(255,255,255,0.7)' // Twitter gray
    }
  },
  shape: { borderRadius: 16 }, // Twitter tarzı daha yuvarlak
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: -0.5, color: '#FFFFFF' },
    h2: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: -0.3, color: '#FFFFFF' },
    h3: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: -0.2, color: '#FFFFFF' },
    h4: { fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF' },
    h5: { fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' },
    h6: { fontSize: '0.9375rem', fontWeight: 700, color: '#FFFFFF' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.5, color: '#FFFFFF' },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.7)' },
    button: { textTransform: 'none', fontWeight: 700, fontSize: '0.9375rem' }
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
        root: { 
          paddingInline: 16, 
          paddingBlock: 10, 
          borderRadius: 20, // Twitter tarzı daha yuvarlak
          fontWeight: 700,
          fontSize: '0.9375rem',
          textTransform: 'none'
        },
        containedPrimary: { 
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            opacity: 0.9
          }
        }
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
