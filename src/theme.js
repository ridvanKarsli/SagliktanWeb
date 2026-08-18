import { createTheme } from '@mui/material/styles'

// BREAKPOINT KONVANSİYONU (mobil uyum raporu roadmap: "Breakpoint kullanımını
// tek bir konvansiyona indir"). Kod tabanında iki farklı responsive yaklaşım
// var - useMediaQuery(theme.breakpoints...) (13 dosya) ve sx={{ xs:, sm: }}
// (28 dosya) - bunlar ÇAKIŞAN alternatifler değil, iki AYRI amaca hizmet
// ediyor. Denetimde ikisinin bir arada olması "karışıklık" gibi görünse de,
// asıl kural şu ve zaten büyük ölçüde uygulanıyor:
//
// 1) sx={{ xs: ..., sm: ..., md: ... }} → SADECE STİL/DEĞER farklılığı için
//    varsayılan seçim (spacing, fontSize, width, flexDirection, display vb.).
//    Render edilen DOM/bileşen ağacı aynı kalıyor, sadece CSS değeri
//    değişiyor. Ekstra JS re-render'ı yok, SSR/hydration'a duyarlı değil.
//
// 2) useMediaQuery(theme.breakpoints.down/up('xx')) → SADECE JS'in kendisinin
//    dallanması GEREKTİĞİNDE: Dialog'un fullScreen prop'u (bkz.
//    SendPostDialog.jsx, ReportDialog.jsx, Chat.jsx), admin tablolarının
//    mobilde tamamen farklı bir DOM'a (kart listesi) geçmesi (bkz.
//    UsersTab/ContentTab/ReportsTab.jsx) veya ResponsiveShell'in masaüstü/
//    mobil navigasyon arasında seçim yapması gibi durumlar - yani sx'in
//    karşılayamayacağı, koşullu render/prop mantığı.
//
// Her iki durumda da breakpoint değeri HER ZAMAN buradaki theme.breakpoints'
// tan (MUI varsayılanları: xs=0, sm=600, md=900, lg=1200, xl=1536) gelir -
// hiçbir dosyada window.matchMedia veya elle yazılmış piksel değeri (örn.
// "@media (max-width: 640px)") kullanılmaz. Yeni bir responsive karar
// eklerken önce "bu sadece görünüm mü değişiyor, yoksa render edilen şey mi
// değişiyor?" sorusu sorulmalı - cevaba göre yukarıdaki iki seçenekten biri
// kullanılır, üçüncü bir yöntem (yeni bir hook, elle matchMedia vb.) icat
// edilmez.

// Sağlıktan Kurumsal Renk Paleti - Sıcak Dark/Light Mode
// Tasarım niyeti: sağlık topluluğu için huzur verici, sıcak ve profesyonel
// bir tema - mavi/siyah "tech" kontrastı yerine sıcak espresso/krem tonlu
// bir zemin üzerine yumuşak salvia yeşili ve mercan vurgu rengiyle.
//
// Faz6: açık tema seçeneği eklendi (bkz. AccessibilityContext.jsx
// themeMode). Gerekçe: koyu zemin herkes için en okunabilir seçenek değil -
// yaşlı/az gören bazı kullanıcılar açık zeminde daha rahat okuyor, bu
// kozmetik değil gerçek bir erişilebilirlik boşluğuydu. theme.js baştan bir
// factory'e (buildTheme) çevrildi ki tüm ~600 satırlık component
// override'ları TEK bir yerden hem koyu hem açık moda hizmet etsin - iki
// ayrı dosya/blok kopyalamak (bakım riski, ileride birbirinden sapma) yerine
// her iki paletin renk değerlerini (darkColors/lightColors) ayrı tanımlayıp
// aynı yapı tanımını (typography/shape/shadows/components) iki renk setiyle
// de üretiyoruz. Vurgu renkleri (primary/secondary) açık modda koyulaştırıldı
// - beyaz metinli dolgu butonlarda (containedPrimary/Secondary) AA kontrast
// oranını (~4.5:1) tutturmak için; MuiAlert'in "standardXxx" metin renkleri
// de (kremimsi açık tonlar, koyu zeminde okunaklıydı) açık modda koyu-mürekkep
// tonlarına çevrildi - aksi halde açık zeminde neredeyse görünmez kalırlardı.
const darkColors = {
  primary: '#4CB89F',      // Açık salvia yeşili - koyu zeminde öne çıkar
  primaryLight: '#7ECCB6',
  primaryDark: '#3F9C87',  // Koyu salvia - gradient/aksan için
  secondary: '#E08B6D',    // Sıcak mercan - insani/samimi vurgu
  secondaryLight: '#EAAB92',
  secondaryDark: '#D97757',
  tertiary: '#2C7562',     // Derin yeşil - aksan/gradient
  background: '#1E1A16',   // Sıcak espresso - lacivert/siyah değil
  surface: '#2A241F',      // Kart yüzeyleri
  surfaceAlt: '#332C25',   // Bölüm ayrımı için sıcak koyu ton
  text: {
    primary: '#F2EDE6',    // Sıcak krem
    secondary: '#B3A99C',  // Sıcak gri
    // Eski değer (#6B6255) zeminle 2.88:1 kontrast veriyordu - WCAG AA
    // eşiği olan 4.5:1'in çok altında, pratikte okunamıyordu. Bu ton 5.09:1
    // veriyor: hâlâ belirgin biçimde "pasif" görünüyor ama okunabiliyor.
    disabled: '#948A7C',
  },
  border: 'rgba(242, 237, 230, 0.10)',
  divider: 'rgba(242, 237, 230, 0.08)',
  // Hover/skeleton/high-contrast gibi opaklık-tabanlı overlay'lerin RGB
  // tabanı - koyu modda "zemin üstüne açık mürekkep", açık modda tam tersi
  // (aşağıdaki lightColors.overlayRgb) olması gerekiyor.
  overlayRgb: '242, 237, 230',
  outlinedHover: 'rgba(76, 184, 159, 0.10)',
  chipFilled: { bg: 'rgba(76, 184, 159, 0.16)', bgHover: 'rgba(76, 184, 159, 0.26)' },
  alert: {
    success: { bg: 'rgba(76, 184, 159, 0.14)', text: '#E4F3EE', icon: '#4CB89F' },
    error: { bg: 'rgba(224, 128, 120, 0.14)', text: '#F8E2DF', icon: '#E08078' },
    info: { bg: 'rgba(127, 174, 189, 0.14)', text: '#E3EDF0', icon: '#7FAEBD' },
    warning: { bg: 'rgba(224, 168, 94, 0.14)', text: '#F8ECDA', icon: '#E0A85E' },
  },
}

const lightColors = {
  primary: '#2C7562',      // Koyu salvia - beyaz metinli butonlarda AA kontrast için
  primaryLight: '#4CB89F', // Marka birincil rengi burada "açık" varyant oluyor
  primaryDark: '#1B4A3D',
  secondary: '#B8563C',    // Koyu terrakota - aynı AA kontrast gerekçesiyle
  secondaryLight: '#E08B6D',
  secondaryDark: '#8A3F28',
  tertiary: '#2C7562',
  background: '#FAF8F5',   // Sıcak kırık beyaz - steril beyaz değil
  surface: '#FFFFFF',
  surfaceAlt: '#F1ECE4',   // Bölüm ayrımı için sıcak açık ton
  text: {
    primary: '#241F1A',    // Sıcak neredeyse-siyah mürekkep
    secondary: '#5C5346',  // Sıcak koyu gri - #FAF8F5 zeminde ~7:1 kontrast
    disabled: '#8C8171',
  },
  border: 'rgba(36, 31, 26, 0.12)',
  divider: 'rgba(36, 31, 26, 0.08)',
  overlayRgb: '36, 31, 26',
  outlinedHover: 'rgba(44, 117, 98, 0.08)',
  chipFilled: { bg: 'rgba(44, 117, 98, 0.10)', bgHover: 'rgba(44, 117, 98, 0.18)' },
  alert: {
    success: { bg: 'rgba(44, 117, 98, 0.10)', text: '#1B4A3D', icon: '#2C7562' },
    error: { bg: 'rgba(194, 74, 63, 0.10)', text: '#7A2E26', icon: '#C24A3F' },
    info: { bg: 'rgba(76, 124, 140, 0.10)', text: '#2C4A54', icon: '#4C7C8C' },
    warning: { bg: 'rgba(184, 121, 30, 0.10)', text: '#6B4A12', icon: '#B8791E' },
  },
}

// typography/shape/shadows renkten bağımsız - iki modda da aynı ölçek
// kullanılıyor, bu yüzden buildTheme dışında bir kere tanımlanıyor.
const typography = {
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
  // Tracking (letter-spacing) boyuta göre kademeli daralıyor - h1/h2'de
  // zaten vardı (-0.02em / -0.01em), h3-h6'da eksikti ve MUI'nin Roboto
  // için ayarlanmış varsayılanlarına düşüyordu (Inter'e göre optik olarak
  // hafif gevşek). Apple'ın tipografi ilkesi: büyük metin negatif tracking
  // ister (harfler büyüdükçe birbirinden fazla ayrı görünür), küçük metin
  // sıfıra/pozitife yaklaşır - burada da h1'den h6'ya doğru kademeli
  // sıfıra iniyor.
  h3: {
    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.005em',
  },
  h4: {
    fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.0025em',
  },
  // h5/h6 gövde metninden (body1 = 1.0625rem) BÜYÜK kalmalı - aksi halde
  // başlık kendi paragrafından küçük görünür. Gövde ölçeği büyütüldüğünde
  // bunlar da birlikte büyütüldü.
  h5: {
    fontSize: '1.3125rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  h6: {
    fontSize: '1.1875rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  // OKUNABİLİRLİK NOTU: bu platformun hedef kitlesi kronik/nadir
  // hastalıklarla yaşayan bireyler ve yakınları - içlerinde yaşlılar,
  // yorgunluk/görme sorunu yaşayanlar ve uzun metin okumakta zorlananlar
  // var. Bu yüzden tipografi ölçeği bilinçli olarak "normal" bir sosyal
  // uygulamadan bir tık büyük tutuluyor: gövde metni 17px (varsayılan
  // 16px yerine), ikincil metin 15px (14px yerine), en küçük metin 13px
  // (12px yerine). Satır aralıkları da uzun metinlerde göz takibini
  // kolaylaştırmak için açık (1.7-1.75).
  subtitle1: {
    fontSize: '1.0625rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  subtitle2: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1.0625rem',
    lineHeight: 1.75,
    letterSpacing: '0.01em',
  },
  body2: {
    fontSize: '0.9375rem',
    lineHeight: 1.7,
    letterSpacing: '0.01em',
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
}

const shape = {
  borderRadius: 12,
}

// Faz4: X.com/Linear gibi olgun ürünler yüzey ayrımını gölgeyle değil
// kenarlıkla (border) yapar - gölge sadece gerçekten "yükselen" katmanlarda
// (menü, dialog, tooltip) kullanılır. Siyah tabanlı gölge ölçeği hem koyu
// hem açık zeminde standart Material pratiği - moda göre ayrıca
// değiştirilmiyor.
const shadows = [
  'none',
  '0 1px 2px rgba(0, 0, 0, 0.18)',
  '0 1px 3px rgba(0, 0, 0, 0.20)',
  '0 2px 4px rgba(0, 0, 0, 0.22)',
  '0 2px 6px rgba(0, 0, 0, 0.24)',
  '0 4px 8px rgba(0, 0, 0, 0.26)',
  '0 4px 10px rgba(0, 0, 0, 0.28)',
  '0 6px 14px rgba(0, 0, 0, 0.30)',
  '0 8px 18px rgba(0, 0, 0, 0.32)',
  '0 10px 22px rgba(0, 0, 0, 0.34)',
  ...Array(15).fill('0 10px 22px rgba(0, 0, 0, 0.34)'),
]

function buildTheme(mode) {
  const colors = mode === 'light' ? lightColors : darkColors

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: colors.primaryLight,
        dark: colors.primaryDark,
        contrastText: colors.background,
      },
      secondary: {
        main: colors.secondary,
        light: colors.secondaryLight,
        dark: colors.secondaryDark,
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
        main: colors.alert.error.icon,
        light: mode === 'light' ? '#E08078' : '#EEA9A3',
      },
      warning: {
        main: colors.alert.warning.icon,
        light: mode === 'light' ? '#E0A85E' : '#EEC48D',
      },
      success: {
        main: colors.primary,
        light: colors.primaryLight,
      },
      info: {
        main: colors.alert.info.icon,
        light: mode === 'light' ? '#7FAEBD' : '#A6C6D1',
      },
    },
    typography,
    shape,
    shadows,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollBehavior: 'smooth',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          // Faz4: köşe glow'ları kaldırıldı - bkz. index.css'teki aynı karar
          // gerekçesi. Düz zemin, tutarlı olsun diye burada da tekrarlanıyor
          // (CssBaseline'ın kendi reset'i body arkaplanını ezmesin diye).
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
      // axe-core (bkz. e2e/accessibility.spec.js) "aria-progressbar-name"
      // ihlalini yakaladı: kod tabanındaki onlarca <CircularProgress /> (sayfa
      // yükleme, buton içi spinner, pull-to-refresh...) hiçbirinde erişilebilir
      // isim yok, MUI varsayılan olarak eklemiyor. Her kullanım yerini tek tek
      // düzeltmek yerine (dokunma ihtimali yüksek, tutarsız kalma riski var)
      // burada TEK bir varsayılan tanımlanıyor - defaultProps, tek tek
      // sx/props geçilen yerlerde ezilebilir ama genel kural bu.
      MuiCircularProgress: {
        defaultProps: {
          'aria-label': 'Yükleniyor',
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
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          // Faz4: X.com'un buton dili tek düz renk + kalkma/glow YOK, hover
          // sadece rengi bir tık koyulaştırır/açar - burada da öyle. Önceki
          // translateY + renkli glow gölgesi "pazarlama sitesi" hissi
          // veriyordu; kaldırıldı, sadece renk geçişi kaldı.
          contained: {
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            backgroundColor: colors.primary,
            color: colors.background,
            '&:hover': {
              backgroundColor: colors.primaryDark,
            },
          },
          containedSecondary: {
            backgroundColor: colors.secondary,
            color: colors.background,
            '&:hover': {
              backgroundColor: colors.secondaryLight,
            },
          },
          outlined: {
            borderWidth: 1.5,
            borderColor: colors.primary,
            color: colors.primary,
            '&:hover': {
              borderWidth: 1.5,
              backgroundColor: colors.outlinedHover,
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
              backgroundColor: `rgba(${colors.overlayRgb}, 0.06)`,
              color: colors.text.primary,
            },
          },
          // root'taki minHeight: 48 ve padding: '12px 24px' tüm boyutlara
          // (size prop'undan bağımsız) uygulanıyordu - size="small" verilen
          // butonlar (admin tabloları, yorum/gönderi aksiyonları vb. birçok
          // yerde kullanılıyor) görsel olarak medium boyutta render oluyordu.
          // Mobilde bu, sık kullanılan küçük aksiyon butonlarının (İncelendi,
          // Reddet, Sil, Düzenle...) gereğinden büyük yer kaplayıp satırların
          // taşmasına/sıkışmasına yol açıyordu.
          sizeSmall: {
            minHeight: 38,
            padding: '6px 14px',
            fontSize: '0.8125rem',
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
              backgroundColor: colors.surfaceAlt,
              // 16px ALTINA İNMEMELİ: iOS Safari, 16px'ten küçük yazı tipi olan
              // bir input'a odaklanıldığında sayfayı otomatik yakınlaştırıyor
              // ve kullanıcı geri uzaklaştırmak zorunda kalıyor - mobil formlarda
              // en can sıkıcı davranışlardan biri.
              fontSize: '1.0625rem',
              '& fieldset': {
                borderColor: colors.border,
                borderWidth: 1.5,
              },
              '&:hover fieldset': {
                borderColor: `rgba(${colors.overlayRgb}, 0.22)`,
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
      // Faz4: kart ayrımı artık ağır gölgeyle değil kenarlıkla yapılıyor (bkz.
      // shadows ölçeği üstündeki not) - X.com'daki timeline öğeleri de aynı
      // mantıkla çalışır: kalkma animasyonu/parlak gölge yok, sadece hover'da
      // kenarlık/zemin bir tık belirginleşir.
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow: 'none',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            transition: 'border-color 0.15s ease, background-color 0.15s ease',
            '&:hover': {
              borderColor: `rgba(${colors.overlayRgb}, 0.18)`,
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
            borderRadius: 14,
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
            backgroundColor: colors.chipFilled.bg,
            color: colors.primary,
            '&:hover': {
              backgroundColor: colors.chipFilled.bgHover,
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
      // Faz4: nav yüzeylerindeki (AppBar/Drawer/BottomNav) yarı saydamlık +
      // blur kaldırıldı - X.com'un kendi app kabuğu tamamen OPAK'tır, camsı
      // blur paneller "pazarlama sitesi/iOS widget" hissi veriyordu ve ayrıca
      // mobilde backdrop-filter maliyeti vardı (bkz. eski ResponsiveShell
      // notu). Artık düz opak yüzey + tek kenarlık ile ayrım yapılıyor.
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.surface,
            color: colors.text.primary,
            boxShadow: 'none',
            borderBottom: `1px solid ${colors.divider}`,
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
              fontSize: '0.75rem',
              fontWeight: 500,
              marginTop: 4,
              '&.Mui-selected': {
                fontSize: '0.75rem',
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
              backgroundColor: `rgba(${colors.overlayRgb}, 0.08)`,
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
              color: colors.primaryLight,
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
          // değil, zeminle yüksek kontrastlı bir tonla yazılıyor - renk
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
            backgroundColor: colors.alert.success.bg,
            color: colors.alert.success.text,
            border: `1px solid ${colors.alert.success.icon}55`,
            '& .MuiAlert-icon': { color: colors.alert.success.icon },
          },
          standardError: {
            backgroundColor: colors.alert.error.bg,
            color: colors.alert.error.text,
            border: `1px solid ${colors.alert.error.icon}55`,
            '& .MuiAlert-icon': { color: colors.alert.error.icon },
          },
          standardInfo: {
            backgroundColor: colors.alert.info.bg,
            color: colors.alert.info.text,
            border: `1px solid ${colors.alert.info.icon}55`,
            '& .MuiAlert-icon': { color: colors.alert.info.icon },
          },
          standardWarning: {
            backgroundColor: colors.alert.warning.bg,
            color: colors.alert.warning.text,
            border: `1px solid ${colors.alert.warning.icon}55`,
            '& .MuiAlert-icon': { color: colors.alert.warning.icon },
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: `rgba(${colors.overlayRgb}, 0.08)`,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
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
              backgroundColor: `rgba(${colors.overlayRgb}, 0.06)`,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.surface,
            borderRadius: 14,
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
}

const darkTheme = buildTheme('dark')
const lightTheme = buildTheme('light')

// Varsayılan export geriye dönük uyumluluk için koyu tema - bkz.
// ThemedApp.jsx (themeMode'a göre darkTheme/lightTheme arasında seçim yapıyor).
const theme = darkTheme
export default theme
export { darkTheme, lightTheme }

// Kişiselleştirme: yüksek kontrast modu (bkz. AccessibilityContext.jsx).
// theme.js'i baştan bir factory'e çevirmek yerine (yüksek risk, ~600 satırlık
// mevcut tanımı bozma ihtimali), MUI'nin createTheme(baseTheme, overrides)
// deep-merge özelliğini kullanıyoruz - yalnızca kontrastı düşük olan alanlar
// (ikincil/disabled metin, divider/border opaklığı, Paper kenarlığı)
// üzerine yazılıyor, geri kalan tüm tasarım sistemi aynen korunuyor.
//
// Faz6: artık hem koyu hem açık temaya uygulanabilmesi gerekiyor - overlay
// rengi ve metin tonları baseTheme.palette.mode'a göre dallanıyor (koyu
// zeminde açık mürekkep overlay, açık zeminde koyu mürekkep overlay -
// tersi görünmez/anlamsız olurdu).
export function createAccessibleTheme(baseTheme, { highContrast = false } = {}) {
  if (!highContrast) return baseTheme
  const isLight = baseTheme.palette.mode === 'light'
  const overlayRgb = isLight ? lightColors.overlayRgb : darkColors.overlayRgb
  const textSecondary = isLight ? '#3D362C' : '#D6CCBE'
  const textDisabled = isLight ? '#5C5346' : '#B7AC9C'
  return createTheme(baseTheme, {
    palette: {
      text: {
        secondary: textSecondary,
        disabled: textDisabled,
      },
      divider: `rgba(${overlayRgb}, 0.28)`,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { border: `1px solid rgba(${overlayRgb}, 0.28)` },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { border: `1px solid rgba(${overlayRgb}, 0.32)` },
        },
      },
      MuiButton: {
        styleOverrides: {
          outlined: { borderWidth: 2 },
          outlinedPrimary: { borderWidth: 2 },
        },
      },
      MuiChip: {
        styleOverrides: {
          outlined: { borderWidth: 1.5, borderColor: `rgba(${overlayRgb}, 0.4)` },
        },
      },
    },
  })
}
