import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0B3A4E',
      light: '#1B5A70',
      dark: '#052A38',
      contrastText: '#FDFDFC',
    },
    secondary: {
      main: '#34C3A1',
      light: '#5CCFB3',
      dark: '#2A9B81',
      contrastText: '#0B3A4E',
    },
    info: {
      main: '#1B7A85',
      light: '#4A9CA5',
      dark: '#145B63',
      contrastText: '#FDFDFC',
    },
    background: {
      default: '#0B3A4E', // Darkest color as background
      paper: '#FDFDFC',
      secondary: '#FAF9F6',
    },
    text: {
      primary: '#0B3A4E', // Dark text for light backgrounds
      secondary: '#1B7A85', // Medium teal for secondary text
      disabled: 'rgba(11, 58, 78, 0.5)',
      // For dark backgrounds
      light: '#FDFDFC', // Light text for dark backgrounds
      accent: '#34C3A1', // Accent color for highlights
    },
    divider: 'rgba(52, 195, 161, 0.12)',
    success: {
      main: '#34C3A1',
      light: '#5CCFB3',
      dark: '#2A9B81',
    },
    error: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#E55555',
    },
    warning: {
      main: '#FFB800',
      light: '#FFC933',
      dark: '#CC9300',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
      background: 'linear-gradient(135deg, #34C3A1 0%, #1B7A85 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      // Color will be inherited from theme
    },
    h3: {
      fontWeight: 600,
      fontSize: '2.125rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      // Color will be inherited from theme
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.005em',
      lineHeight: 1.3,
      // Color will be inherited from theme
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.375rem',
      lineHeight: 1.4,
      // Color will be inherited from theme
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      // Color will be inherited from theme
    },
    body1: {
      fontSize: '1.0625rem',
      fontWeight: 400,
      lineHeight: 1.7,
      // Color will be inherited from theme
    },
    body2: {
      fontSize: '0.9375rem',
      fontWeight: 400,
      lineHeight: 1.6,
      // Color will be inherited from theme
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
      fontSize: '0.9375rem',
    },
    caption: {
      fontSize: '0.8125rem',
      fontWeight: 400,
      lineHeight: 1.5,
      color: 'rgba(253, 253, 252, 0.6)',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#34C3A1',
    },
  },
  shape: {
    borderRadius: 16,
  },
  spacing: 8,
  shadows: [
    'none',
    '0px 2px 8px rgba(11, 58, 78, 0.15)',
    '0px 4px 16px rgba(11, 58, 78, 0.15)',
    '0px 8px 24px rgba(11, 58, 78, 0.15)',
    '0px 12px 32px rgba(11, 58, 78, 0.15)',
    '0px 16px 40px rgba(11, 58, 78, 0.15)',
    '0px 20px 48px rgba(11, 58, 78, 0.15)',
    '0px 24px 56px rgba(11, 58, 78, 0.15)',
    '0px 32px 64px rgba(11, 58, 78, 0.2)',
    '0px 40px 72px rgba(11, 58, 78, 0.2)',
    '0px 48px 80px rgba(11, 58, 78, 0.2)',
    '0px 56px 88px rgba(11, 58, 78, 0.25)',
    '0px 64px 96px rgba(11, 58, 78, 0.25)',
    '0px 72px 104px rgba(11, 58, 78, 0.25)',
    '0px 80px 112px rgba(11, 58, 78, 0.3)',
    '0px 88px 120px rgba(11, 58, 78, 0.3)',
    '0px 96px 128px rgba(11, 58, 78, 0.3)',
    '0px 104px 136px rgba(11, 58, 78, 0.35)',
    '0px 112px 144px rgba(11, 58, 78, 0.35)',
    '0px 120px 152px rgba(11, 58, 78, 0.35)',
    '0px 128px 160px rgba(11, 58, 78, 0.4)',
    '0px 136px 168px rgba(11, 58, 78, 0.4)',
    '0px 144px 176px rgba(11, 58, 78, 0.4)',
    '0px 152px 184px rgba(11, 58, 78, 0.45)',
    '0px 160px 192px rgba(11, 58, 78, 0.45)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0B3A4E 0%, #1B7A85 100%)',
          minHeight: '100vh',
          fontFamily: '"Poppins", "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#34C3A1 rgba(52, 195, 161, 0.1)',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'rgba(52, 195, 161, 0.1)',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#34C3A1',
          borderRadius: '4px',
          '&:hover': {
            background: '#2A9B81',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 600,
          textTransform: 'none',
          padding: '12px 32px',
          fontSize: '0.9375rem',
          letterSpacing: '0.02em',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #34C3A1 0%, #1B7A85 100%)',
          color: '#0B3A4E',
          fontWeight: 700,
          boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5CCFB3 0%, #4A9CA5 100%)',
            boxShadow: '0px 12px 32px rgba(52, 195, 161, 0.4)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #0B3A4E 0%, #1B7A85 100%)',
          color: '#FDFDFC',
          boxShadow: '0px 8px 24px rgba(11, 58, 78, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1B5A70 0%, #4A9CA5 100%)',
            boxShadow: '0px 12px 32px rgba(11, 58, 78, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: '#34C3A1',
          color: '#34C3A1',
          borderWidth: '2px',
          '&:hover': {
            borderColor: '#5CCFB3',
            backgroundColor: 'rgba(52, 195, 161, 0.08)',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0px 8px 32px rgba(11, 58, 78, 0.15)',
          backgroundImage: 'none',
          backgroundColor: '#FDFDFC',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(52, 195, 161, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0px 8px 32px rgba(11, 58, 78, 0.12)',
          backgroundColor: '#FDFDFC',
          border: '1px solid rgba(52, 195, 161, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0px 16px 48px rgba(11, 58, 78, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: '#FDFDFC',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(52, 195, 161, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              border: 'none',
            },
            '&:hover': {
              border: '2px solid rgba(52, 195, 161, 0.4)',
              transform: 'translateY(-1px)',
              boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.15)',
            },
            '&.Mui-focused': {
              border: '2px solid #34C3A1',
              boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.25)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#1B7A85',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#34C3A1',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#0B3A4E',
            fontWeight: 500,
            '&::placeholder': {
              color: 'rgba(27, 122, 133, 0.6)',
              opacity: 1,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(253, 253, 252, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0px 4px 24px rgba(11, 58, 78, 0.08)',
          borderBottom: '1px solid rgba(52, 195, 161, 0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(253, 253, 252, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(52, 195, 161, 0.12)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backgroundColor: 'rgba(253, 253, 252, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(52, 195, 161, 0.12)',
          boxShadow: '0px 16px 48px rgba(11, 58, 78, 0.15)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          color: '#0B3A4E',
          fontWeight: 500,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(52, 195, 161, 0.08)',
            transform: 'translateX(4px)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
            backgroundColor: 'rgba(52, 195, 161, 0.08)',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #34C3A1 0%, #1B7A85 100%)',
          color: '#0B3A4E',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          backgroundColor: 'rgba(52, 195, 161, 0.1)',
          color: '#1B7A85',
          border: '1px solid rgba(52, 195, 161, 0.2)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 24,
          paddingRight: 24,
          '@media (max-width: 600px)': {
            paddingLeft: 16,
            paddingRight: 16,
          },
        },
      },
    },
  },
});

export default theme; 