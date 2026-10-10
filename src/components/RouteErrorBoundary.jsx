import { Component, Fragment } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { ErrorOutlineRounded, RefreshRounded } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { hasAttemptedChunkReload, reloadOnceForChunkError } from '../utils/chunkReloadGuard.js'

// Rota düzeyi güvenlik ağı: tek bir sayfanın render hatası tüm uygulamayı
// (üst bar, alt menü) düşürmesin. Kök ErrorBoundary (ThemedApp) yine durur;
// bu, kabuğun İÇİNDE, sadece <Outlet/> çevresinde yaşayan daha nazik bir
// katman - kullanıcı başka bir sekmeye dokunup yoluna devam edebilir.
//
// resetKey (location.key) değişince sıfırlanır: başka bir sayfaya geçmek
// hatayı otomatik temizler; "Tekrar dene" aynı rotayı yeniden mount eder.
// Chunk yükleme hatası (yeni deploy sonrası eski hash) kök sınırla aynı
// şekilde bir kez otomatik yenileme ile çözülür.
const CHUNK_LOAD_ERROR_PATTERN = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading chunk .* failed/i

class RouteErrorBoundaryInner extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, attempt: 0 }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Sayfa render hatası:', error, info)
    if (CHUNK_LOAD_ERROR_PATTERN.test(error?.message || '') && !hasAttemptedChunkReload()) {
      reloadOnceForChunkError()
      return
    }
    import('@sentry/react')
      .then((Sentry) => Sentry.captureException(error, { extra: { componentStack: info?.componentStack, route: this.props.resetKey } }))
      .catch(() => {})
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  retry = () => {
    // attempt değişince children yeniden mount edilir (key), hata temizlenir.
    this.setState(s => ({ hasError: false, attempt: s.attempt + 1 }))
    this.props.onRetry?.()
  }

  render() {
    if (!this.state.hasError) {
      return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>
    }
    return (
      <Box
        role="alert"
        sx={{
          my: { xs: 3, md: 6 }, p: { xs: 2.5, sm: 3 }, textAlign: 'center',
          borderRadius: '22px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border', boxShadow: 1
        }}
      >
        <Box
          sx={{
            width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'brand.roseSoft'
          }}
        >
          <ErrorOutlineRounded sx={{ fontSize: 28, color: 'error.main' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Bu sayfa yüklenemedi</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380, mx: 'auto', mb: 2.5 }}>
          Beklenmedik bir sorun oldu. Verilerin güvende; yeniden denemek çoğu zaman yeterli olur.
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center">
          <Button variant="contained" startIcon={<RefreshRounded />} onClick={this.retry} sx={{ minHeight: 44 }}>
            Tekrar dene
          </Button>
        </Stack>
      </Box>
    )
  }
}

export default function RouteErrorBoundary({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  // "Tekrar dene": aynı rotaya replace ile gidip sayfayı taze bir
  // location.key ile yeniden kurar (lazy bileşenin kendi state'i de sıfırlanır).
  const retryRoute = () => navigate(location.pathname + location.search + location.hash, { replace: true })
  return (
    <RouteErrorBoundaryInner resetKey={location.key} onRetry={retryRoute}>
      {children}
    </RouteErrorBoundaryInner>
  )
}
