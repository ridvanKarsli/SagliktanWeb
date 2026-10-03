import { createTheme, alpha } from '@mui/material/styles'
import { fonts, motion, palettes, radius } from './design/tokens.js'

// Responsive kuralı: yalnızca görünüm değişiyorsa sx={{ xs, sm, md }};
// render edilen şey değişiyorsa (fullScreen dialog, mobil/masaüstü gezinme)
// useMediaQuery(theme.breakpoints...). Breakpoint'ler MUI varsayılanları
// (sm=600, md=900, lg=1200); elle matchMedia ya da piksel media query yok.

// Hedef kitle (kronik/nadir hastalıkla yaşayanlar ve yakınları, aralarında
// yaşlılar ve görme güçlüğü yaşayanlar) için gövde metni bilinçli olarak
// 17px, satır aralığı geniş. Başlıklar tombul Baloo 2, metin yuvarlak Nunito.
const typography = {
  fontFamily: fonts.body,
  fontWeightRegular: 500,
  fontWeightMedium: 600,
  fontWeightBold: 800,
  h1: { fontFamily: fonts.display, fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.01em' },
  h2: { fontFamily: fonts.display, fontSize: 'clamp(1.6rem, 4.6vw, 2.25rem)', fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.005em' },
  h3: { fontFamily: fonts.display, fontSize: 'clamp(1.35rem, 3.6vw, 1.75rem)', fontWeight: 700, lineHeight: 1.25 },
  h4: { fontFamily: fonts.display, fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', fontWeight: 700, lineHeight: 1.25 },
  h5: { fontFamily: fonts.display, fontSize: '1.3125rem', fontWeight: 700, lineHeight: 1.3 },
  h6: { fontFamily: fonts.body, fontSize: '1.1875rem', fontWeight: 800, lineHeight: 1.4 },
  subtitle1: { fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1.5 },
  subtitle2: { fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.5 },
  body1: { fontSize: '1.0625rem', fontWeight: 500, lineHeight: 1.7 },
  body2: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.65 },
  caption: { fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.5 },
  overline: { fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'none' },
  button: { textTransform: 'none', fontWeight: 800, letterSpacing: '0.005em' },
}

function buildShadows(c) {
  const s = (y, b, a) => `0 ${y}px ${b}px rgba(${c.shadowRgb}, ${a})`
  const soft = [
    'none',
    s(1, 2, 0.06),
    `${s(1, 3, 0.06)}, ${s(4, 12, 0.05)}`,
    `${s(2, 4, 0.06)}, ${s(8, 20, 0.07)}`,
    `${s(4, 8, 0.07)}, ${s(14, 32, 0.09)}`,
    `${s(6, 12, 0.08)}, ${s(20, 44, 0.12)}`,
  ]
  return [...soft, ...Array(25 - soft.length).fill(soft[soft.length - 1])]
}

function buildTheme(mode) {
  const c = palettes[mode]
  const overlay = (a) => `rgba(${c.overlayRgb}, ${a})`
  const focusRing = `0 0 0 3px ${alpha(c.primaryBright, 0.45)}`

  return createTheme({
    palette: {
      mode,
      primary: { main: c.primary, light: c.primaryBright, dark: c.primaryDeep, contrastText: mode === 'light' ? '#FFFFFF' : c.background },
      secondary: { main: c.apricot, light: c.apricot, dark: c.apricotInk, contrastText: '#173530' },
      success: { main: c.primary, light: c.primaryBright, dark: c.primaryDeep, contrastText: mode === 'light' ? '#FFFFFF' : c.background },
      info: { main: c.sky, contrastText: '#FFFFFF' },
      warning: { main: c.amber, contrastText: '#FFFFFF' },
      error: { main: c.rose, contrastText: '#FFFFFF' },
      background: { default: c.background, paper: c.surface },
      text: { primary: c.ink, secondary: c.inkSoft, disabled: c.inkMuted },
      divider: c.divider,
      action: {
        hover: overlay(0.05),
        selected: overlay(0.08),
        focus: overlay(0.10),
      },
      // Tema dışı renk ihtiyacı için tüm token'lar (theme.palette.brand.apricot gibi).
      brand: c,
    },
    typography,
    shape: { borderRadius: 4 },
    shadows: buildShadows(c),
    transitions: {
      easing: { easeOut: motion.flow, easeInOut: motion.flow },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
          body: { backgroundColor: c.background, color: c.ink },
          '::selection': { backgroundColor: alpha(c.primaryBright, 0.35), color: c.ink },
        },
      },
      MuiCircularProgress: {
        defaultProps: { 'aria-label': 'Yükleniyor', thickness: 4.5 },
      },
      MuiButtonBase: {
        defaultProps: { disableRipple: false },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.pill,
            padding: '11px 22px',
            fontSize: '0.98rem',
            minHeight: 46,
            boxShadow: 'none',
            transition: `transform ${motion.fast}ms ${motion.spring}, background-color ${motion.fast}ms ease, border-color ${motion.fast}ms ease, box-shadow ${motion.base}ms ease`,
            '&:active': { transform: 'scale(0.96)' },
            '&:hover': { boxShadow: 'none' },
            '&.Mui-focusVisible': { boxShadow: focusRing },
            '@media (prefers-reduced-motion: reduce)': { '&:active': { transform: 'none' } },
          },
          containedPrimary: {
            backgroundColor: c.primary,
            boxShadow: `0 6px 16px ${alpha(c.primary, 0.28)}`,
            '&:hover': { backgroundColor: c.primaryDeep, boxShadow: `0 8px 20px ${alpha(c.primary, 0.32)}` },
          },
          containedSecondary: {
            color: '#173530',
            '&:hover': { backgroundColor: alpha(c.apricot, 0.88) },
          },
          outlined: {
            borderWidth: 1.5,
            borderColor: c.borderStrong,
            color: c.ink,
            '&:hover': { borderWidth: 1.5, borderColor: c.primary, backgroundColor: c.primarySoft },
          },
          outlinedPrimary: { borderColor: alpha(c.primary, 0.5), color: c.primary },
          text: {
            color: c.inkSoft,
            '&:hover': { backgroundColor: overlay(0.05), color: c.ink },
          },
          textPrimary: { color: c.primary, '&:hover': { color: c.primaryDeep, backgroundColor: c.primarySoft } },
          sizeSmall: { minHeight: 38, padding: '6px 14px', fontSize: '0.875rem' },
          sizeLarge: { minHeight: 54, padding: '14px 28px', fontSize: '1.0625rem' },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: c.inkSoft,
            transition: `transform ${motion.fast}ms ${motion.spring}, background-color ${motion.fast}ms ease, color ${motion.fast}ms ease`,
            '&:hover': { backgroundColor: overlay(0.06), color: c.ink },
            '&:active': { transform: 'scale(0.9)' },
            '&.Mui-focusVisible': { boxShadow: focusRing },
          },
          sizeSmall: { minWidth: 40, minHeight: 40 },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: `0 10px 24px ${alpha(c.primary, 0.35)}`,
            transition: `transform ${motion.base}ms ${motion.spring}, box-shadow ${motion.base}ms ease`,
            '&:active': { transform: 'scale(0.92)' },
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'medium' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: c.surfaceAlt,
            fontSize: '1.0625rem',
            transition: `background-color ${motion.fast}ms ease, box-shadow ${motion.base}ms ease`,
            '& fieldset': { borderColor: 'transparent', borderWidth: 1.5 },
            '&:hover fieldset': { borderColor: c.borderStrong },
            '&.Mui-focused': { backgroundColor: c.surface, boxShadow: `0 0 0 4px ${alpha(c.primaryBright, 0.18)}` },
            '&.Mui-focused fieldset': { borderColor: c.primary, borderWidth: 2 },
            '&.Mui-error fieldset': { borderColor: c.rose },
          },
          input: { padding: '14px 16px', color: c.ink },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { color: c.inkSoft, fontWeight: 600 } },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { fontWeight: 600, marginLeft: 6 } },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            boxShadow: 'none',
            border: `1px solid ${c.border}`,
            backgroundColor: c.surface,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none', backgroundColor: c.surface },
          rounded: { borderRadius: radius.md },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: radius.pill, fontWeight: 700, fontSize: '0.8125rem' },
          filled: {
            '&.MuiChip-colorDefault': {
              backgroundColor: c.primarySoft,
              color: c.primary,
              '&:hover': { backgroundColor: alpha(c.primaryBright, 0.22) },
            },
          },
          outlined: { borderColor: c.border, borderWidth: 1.5 },
          colorPrimary: { '&.MuiChip-filled': { backgroundColor: c.primary, color: mode === 'light' ? '#FFFFFF' : c.background } },
          colorSuccess: {
            '&.MuiChip-filled': { backgroundColor: c.primarySoft, color: c.primary },
            '&.MuiChip-outlined': { borderColor: alpha(c.primary, 0.45), color: c.primary },
          },
          colorInfo: {
            '&.MuiChip-filled': { backgroundColor: c.skySoft, color: c.sky },
            '&.MuiChip-outlined': { borderColor: alpha(c.sky, 0.45), color: c.sky },
          },
          colorWarning: {
            '&.MuiChip-filled': { backgroundColor: c.amberSoft, color: c.amber },
            '&.MuiChip-outlined': { borderColor: alpha(c.amber, 0.45), color: c.amber },
          },
          colorError: {
            '&.MuiChip-filled': { backgroundColor: c.roseSoft, color: c.rose },
            '&.MuiChip-outlined': { borderColor: alpha(c.rose, 0.45), color: c.rose },
          },
          colorSecondary: {
            '&.MuiChip-filled': { backgroundColor: c.apricotSoft, color: c.apricotInk },
            '&.MuiChip-outlined': { borderColor: alpha(c.apricot, 0.6), color: c.apricotInk },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { backgroundColor: c.primarySoft, color: c.primary, fontWeight: 800, fontFamily: fonts.display },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundColor: c.surface, color: c.ink, boxShadow: 'none', borderBottom: `1px solid ${c.divider}` },
        },
      },
      MuiDrawer: {
        styleOverrides: { paper: { backgroundColor: c.surface, borderRight: `1px solid ${c.border}` } },
      },
      MuiBottomNavigation: {
        styleOverrides: { root: { backgroundColor: c.surface, borderTop: `1px solid ${c.border}`, height: 64 } },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            color: c.inkMuted,
            minWidth: 'auto',
            padding: '6px 8px',
            '& .MuiSvgIcon-root': {
              transition: `transform ${motion.base}ms ${motion.spring}`,
              borderRadius: radius.pill,
              padding: '2px 14px',
              boxSizing: 'content-box',
            },
            '&.Mui-selected': { color: c.primary },
            '&.Mui-selected .MuiSvgIcon-root': { backgroundColor: c.primarySoft, transform: 'translateY(-1px)' },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 700,
              marginTop: 4,
              '&.Mui-selected': { fontSize: '0.75rem', fontWeight: 800 },
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { backgroundColor: c.primary, height: 3, borderRadius: radius.pill },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.98rem',
            minHeight: 48,
            color: c.inkSoft,
            '&.Mui-selected': { color: c.primary, fontWeight: 800 },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            color: c.inkSoft,
            borderColor: c.border,
            '&.Mui-selected': {
              backgroundColor: c.primarySoft,
              color: c.primary,
              '&:hover': { backgroundColor: alpha(c.primaryBright, 0.22) },
            },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: { borderRadius: radius.pill, backgroundColor: c.surfaceAlt, padding: 3, gap: 3 },
          grouped: {
            border: 0,
            borderRadius: `${radius.pill}px !important`,
            margin: 0,
            '&.Mui-selected': { backgroundColor: c.surface, boxShadow: `0 2px 8px rgba(${c.shadowRgb}, 0.10)` },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: { '&.Mui-checked + .MuiSwitch-track': { opacity: 1, backgroundColor: c.primaryBright } },
          track: { borderRadius: radius.pill, backgroundColor: c.borderStrong, opacity: 1 },
          thumb: { boxShadow: `0 2px 4px rgba(${c.shadowRgb}, 0.25)` },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: c.primary,
            fontWeight: 700,
            textDecorationColor: alpha(c.primary, 0.4),
            '&:hover': { textDecorationColor: c.primary },
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: c.divider } },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: radius.md, padding: '12px 16px', alignItems: 'flex-start', border: 0 },
          icon: { fontSize: 22, marginRight: 12, paddingTop: 1, opacity: 1 },
          message: { padding: '2px 0', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.6 },
          standardSuccess: { backgroundColor: c.primarySoft, color: c.ink, '& .MuiAlert-icon': { color: c.primary } },
          standardInfo: { backgroundColor: c.skySoft, color: c.ink, '& .MuiAlert-icon': { color: c.sky } },
          standardWarning: { backgroundColor: c.amberSoft, color: c.ink, '& .MuiAlert-icon': { color: c.amber } },
          standardError: { backgroundColor: c.roseSoft, color: c.ink, '& .MuiAlert-icon': { color: c.rose } },
        },
      },
      MuiSkeleton: {
        defaultProps: { animation: 'wave' },
        styleOverrides: {
          root: { backgroundColor: overlay(mode === 'light' ? 0.07 : 0.08) },
          wave: {
            '&::after': {
              background: `linear-gradient(90deg, transparent, ${mode === 'light' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.06)'}, transparent)`,
            },
          },
          rounded: { borderRadius: radius.md },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: radius.md,
            boxShadow: `0 12px 32px rgba(${c.shadowRgb}, ${mode === 'light' ? 0.14 : 0.45})`,
            border: `1px solid ${c.border}`,
            backgroundColor: c.surfaceRaised,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { fontSize: '0.98rem', fontWeight: 600, padding: '10px 16px', minHeight: 44, '&:hover': { backgroundColor: overlay(0.05) } },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { backgroundColor: c.surface, borderRadius: radius.xl, border: `1px solid ${c.border}` },
          paperFullScreen: { borderRadius: 0, border: 0 },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontFamily: fonts.display, fontWeight: 700, fontSize: '1.3rem' } },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: c.ink,
            color: c.background,
            fontSize: '0.8125rem',
            fontWeight: 700,
            borderRadius: 10,
            padding: '6px 10px',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: radius.pill, backgroundColor: overlay(0.08) },
          bar: { borderRadius: radius.pill },
        },
      },
    },
  })
}

const darkTheme = buildTheme('dark')
const lightTheme = buildTheme('light')

export default lightTheme
export { darkTheme, lightTheme }

// Yüksek kontrast: ikincil metin koyulaşır/açılır, kenarlıklar belirginleşir.
export function createAccessibleTheme(baseTheme, { highContrast = false } = {}) {
  if (!highContrast) return baseTheme
  const isLight = baseTheme.palette.mode === 'light'
  const c = palettes[isLight ? 'light' : 'dark']
  const strong = `rgba(${c.overlayRgb}, 0.32)`
  return createTheme(baseTheme, {
    palette: {
      text: { secondary: isLight ? '#22413B' : '#D3E6E0', disabled: isLight ? '#3F5953' : '#B5CCC5' },
      divider: `rgba(${c.overlayRgb}, 0.28)`,
    },
    components: {
      MuiPaper: { styleOverrides: { root: { border: `1px solid ${strong}` } } },
      MuiCard: { styleOverrides: { root: { border: `1px solid ${strong}` } } },
      MuiOutlinedInput: { styleOverrides: { root: { '& fieldset': { borderColor: strong } } } },
      MuiButton: { styleOverrides: { outlined: { borderWidth: 2 } } },
      MuiChip: { styleOverrides: { outlined: { borderWidth: 1.5, borderColor: strong } } },
    },
  })
}
