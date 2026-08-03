import { Component } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { ErrorOutlineRounded, HomeRounded, RefreshRounded } from '@mui/icons-material'
import * as Sentry from '@sentry/react'

// React'in render sırasında yakaladığı beklenmedik hatalara karşı güvenlik
// ağı - bu olmadan bir bileşende fırlatılan hata (örn. beklenmeyen null,
// bozuk veri şekli) kullanıcıyı bomboş beyaz bir ekranda bırakıyordu.
// componentDidCatch/getDerivedStateFromError class component'lere özgü,
// hook karşılığı yok - bu yüzden fonksiyon component değil class kullanıyoruz.
// Router hook'larına bağımlı olmasın diye (Router dışında da sarılabilsin)
// gezinme için useNavigate yerine bilerek window.location kullanıyoruz.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Beklenmeyen render hatası:', error, info)
    // main.jsx'te VITE_SENTRY_DSN yoksa Sentry.init hiç çağrılmıyor - o
    // durumda bu no-op'tur, güvenle her ortamda çağrılabilir.
    Sentry.captureException(error, { extra: { componentStack: info?.componentStack } })
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
