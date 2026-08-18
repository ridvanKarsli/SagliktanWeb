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
    // Eski değer (#6B6255) zeminle 2.88:1 kontrast veriyordu - WCAG AA
    // eşiği olan 4.5:1'in çok altında, pratikte okunamıyordu. Bu ton 5.09:1
    // veriyor: hâlâ belirgin biçimde "pasif" görünüyor ama okunabiliyor.
    disabled: '#948A7C',
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
    caption: {
      fontSize: '0.8125rem',
      lineHeight: 1.55,
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
        // index.css'teki gradyanla birebir aynı - orada JS yüklenmeden önceki
        // ilk boyama için, burada CssBaseline'ın kendi reset'i body arkaplanını
        // ezmesin diye tekrarlanıyor.
        body: {
          backgroundColor: colors.background,
          backgroundImage: [
            'radial-gradient(ellipse 900px 600px at 8% -5%, rgba(76, 184, 159, 0.13), transparent 60%)',
            'radial-gradient(ellipse 700px 500px at 100% 8%, rgba(224, 139, 109, 0.10), transparent 60%)',
            'radial-gradient(ellipse 800px 700px at 92% 92%, rgba(44, 117, 98, 0.14), transparent 60%)',
            'radial-gradient(ellipse 600px 500px at -5% 85%, rgba(224, 139, 109, 0.07), transparent 55%)',
          ].join(', '),
          backgroundRepeat: 'no-repeat',
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
        // Instagram'ın buton dili düz/tek renk, parlak "SaaS gradyanı" değil
        // - burada da öyle: hover'da hafif renk koyulaşması + minik kalkma,
        // ama dolgu her zaman tek düz renk.
        contained: {
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 18px rgba(76, 184, 159, 0.24)',
          },
          '&:active': {
            transform: 'translateY(0)',
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
            borderRadius: 12,
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
    // Nav yüzeyleri (AppBar/Drawer/BottomNav) camsı yarı saydam + blur -
    // arkadaki ambient glow'un hafifçe sızmasına izin verir, tamamen opak
    // düz panellerden daha "modern ürün" hissi verir (bkz. body gradyanı).
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(42, 36, 31, 0.86)',
          // bkz. ResponsiveShell.jsx'teki aynı optimizasyon notu - 16px'ten
          // 10px'e düşürüldü, mobilde scroll performansı için.
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: colors.text.primary,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(42, 36, 31, 0.86)',
          // bkz. ResponsiveShell.jsx'teki aynı optimizasyon notu - 16px'ten
          // 10px'e düşürüldü, mobilde scroll performansı için.
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRight: `1px solid ${colors.border}`,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(42, 36, 31, 0.86)',
          // bkz. ResponsiveShell.jsx'teki aynı optimizasyon notu - 16px'ten
          // 10px'e düşürüldü, mobilde scroll performansı için.
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
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

// Kişiselleştirme: yüksek kontrast modu (bkz. AccessibilityContext.jsx).
// theme.js'i baştan bir factory'e çevirmek yerine (yüksek risk, ~600 satırlık
// mevcut tanımı bozma ihtimali), MUI'nin createTheme(baseTheme, overrides)
// deep-merge özelliğini kullanıyoruz - yalnızca kontrastı düşük olan alanlar
// (ikincil/disabled metin, divider/border opaklığı, Paper kenarlığı)
// üzerine yazılıyor, geri kalan tüm tasarım sistemi aynen korunuyor.
export function createAccessibleTheme(baseTheme, { highContrast = false } = {}) {
  if (!highContrast) return baseTheme
  return createTheme(baseTheme, {
    palette: {
      text: {
        secondary: '#D6CCBE',
        disabled: '#B7AC9C',
      },
      divider: 'rgba(242, 237, 230, 0.28)',
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { border: '1px solid rgba(242, 237, 230, 0.28)' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { border: '1px solid rgba(242, 237, 230, 0.32)' },
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
          outlined: { borderWidth: 1.5, borderColor: 'rgba(242, 237, 230, 0.4)' },
        },
      },
    },
  })
}
