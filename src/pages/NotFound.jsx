import { Box, Button, Stack, Typography } from '@mui/material'
import { SearchOffRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Gerçek 404 sayfası. Önceden "*" rotası WelcomeScreen'i (Giriş Yap /
// Kayıt Ol pazarlama sayfası) gösteriyordu - oturumu AÇIK bir kullanıcı
// yanlış bir linke tıkladığında oturumunun düştüğünü sanıyordu.
export default function NotFound() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const home = isAuthenticated ? '/home' : '/'

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        textAlign: 'center',
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420 }}>
        <SearchOffRounded sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.5 }} />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Sayfa bulunamadı
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. Adresi kontrol
          edebilir veya ana sayfaya dönebilirsin.
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" onClick={() => navigate(home, { replace: true })}>
            Ana sayfaya dön
          </Button>
          <Button variant="text" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(home))}>
            Geri
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
