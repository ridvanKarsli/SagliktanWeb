import { Component } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { ErrorOutlineRounded, HomeRounded, RefreshRounded } from '@mui/icons-material'

// React'in render sırasında yakaladığı beklenmedik hatalara karşı güvenlik
// ağı - bu olmadan bir bileşende fırlatılan hata (örn. beklenmeyen null,
// bozuk veri şekli) kullanıcıyı bomboş beyaz bir ekranda bırakıyordu.
// componentDidCatch/getDerivedStateFromError class component'lere özgü,
// hook karşılığı yok - bu yüzden fonksiyon component değil class kullanıyoruz.
// Router hook'larına bağımlı olmasın diye (Router dışında da sarılabilsin)
// gezinme için useNavigate yerine bilerek window.location kullanıyoruz.
//
// "Chunk yükleme hatası" özel durumu: route bazlı code splitting (App.jsx)
// her lazy sayfayı hash'li bir dosya adıyla (ör. index-BqI1K_2i.js) ayrı bir
// dosyada tutuyor. Bir kullanıcı sekmeyi AÇIK bıraktığında yeni bir deploy
// yapılırsa, o sekmedeki React.lazy() eski hash'li dosyayı import etmeye
// çalışır - o dosya artık yeni deploy'da yok, Vercel'in SPA fallback rewrite'ı
// ("/(.*) -> /index.html", bkz. vercel.json) bu isteğe 404 yerine index.html
// DÖNER, tarayıcı bunu JS olarak import etmeye çalışınca "Importing a module
// script failed" / "Failed to fetch dynamically imported module" hatası
// fırlatılır. Bu, kullanıcının gerçek bir hatayla karşılaşması değil - tek
// çözümü taze index.html'i (ve dolayısıyla güncel chunk referanslarını) almak
// için sayfayı yeniden yüklemek. Bu yüzden bu spesifik hata sınıfını
// yakalayıp OTOMATİK (kullanıcıya "Sayfayı Yenile"ye bastırmadan) BİR KEZ
// yeniden yüklüyoruz - sessionStorage bayrağı sonsuz yenileme döngüsünü
// engelliyor (gerçekten kalıcı bir hataysa ikinci denemede normal hata
// ekranı gösterilir).
const CHUNK_LOAD_ERROR_PATTERN = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading chunk .* failed/i
const CHUNK_RELOAD_FLAG = 'sagliktan-chunk-reload-attempted'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isChunkLoadError: CHUNK_LOAD_ERROR_PATTERN.test(error?.message || '') }
  }

  componentDidCatch(error, info) {
    console.error('Beklenmeyen render hatası:', error, info)

    if (this.state.isChunkLoadError && !sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
      sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1')
      window.location.reload()
      return
    }
    // @sentry/react artık burada da statik import DEĞİL - Lighthouse CI'ın
    // yakaladığı LCP ihlali (bkz. commit geçmişi) SDK'nın, DSN olsun ya da
    // olmasın, önceden bu dosya üzerinden ana JS paketine (initial render'ı
    // bloke eden) kalıcı biçimde girmesinden kaynaklanıyordu - main.jsx'teki
    // "if (sentryDsn)" kontrolü sadece Sentry.init/reportWebVitals çağrısını
    // eliyordu, SDK'nın kendisini değil (bu dosya koşulsuz/her zaman
    // ulaşılabilir olduğu için tree-shaking SDK'yı çıkaramıyordu). Dinamik
    // import ile SDK artık ayrı bir chunk'a düşüyor, ana paketi hiç
    // büyütmüyor; hata gerçekten oluşursa (nadir yol) bir adet ek ağ isteği
    // kabul edilebilir bir bedel. DSN yoksa Sentry.init hiç çağrılmadığından
    // captureException zaten no-op - güvenle her ortamda çağrılabilir.
    import('@sentry/react')
      .then((Sentry) => {
        Sentry.captureException(error, { extra: { componentStack: info?.componentStack } })
      })
      .catch(() => {})
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 3,
          py: 6,
          bgcolor: 'background.default',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(224, 128, 120, 0.14)',
            border: '1px solid rgba(224, 128, 120, 0.32)',
            mb: 2.5,
          }}
        >
          <ErrorOutlineRounded sx={{ fontSize: 32, color: '#E08078' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Bir şeyler ters gitti
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380, mb: 3.5 }}>
          Sayfa beklenmedik bir hatayla karşılaştı. Bu durum genelde geçicidir,
          verileriniz güvende - sayfayı yenilemek çoğu zaman sorunu çözer.
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<RefreshRounded />}
            onClick={this.handleReload}
            sx={{ minHeight: 44 }}
          >
            Sayfayı Yenile
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeRounded />}
            onClick={this.handleGoHome}
            sx={{ minHeight: 44 }}
          >
            Ana Sayfaya Dön
          </Button>
        </Stack>
      </Box>
    )
  }
}
