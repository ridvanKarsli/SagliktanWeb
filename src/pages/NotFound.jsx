import { Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Gerçek 404 sayfası. Önceden "*" rotası WelcomeScreen'i (Giriş yap /
// Kayıt ol pazarlama sayfası) gösteriyordu - oturumu AÇIK bir kullanıcı
// yanlış bir linke tıkladığında oturumunun düştüğünü sanıyordu.
export default function NotFound() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const home = isAuthenticated ? '/home' : '/'

  return (
    <Box
      component="main"
      sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4, textAlign: 'center', bgcolor: 'background.default' }}
    >
      <Stack spacing={2} alignItems="center" className="page-transition" sx={{ maxWidth: 440 }}>
        <Typography variant="h2" component="h1">
          Bu yol bir yere çıkmıyor
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. Adresi kontrol edebilir ya da
          ana sayfaya dönüp oradan devam edebilirsin.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1, width: { xs: '100%', sm: 'auto' } }}>
          <Button variant="contained" onClick={() => navigate(home, { replace: true })}>
            Ana sayfaya dön
          </Button>
          <Button variant="outlined" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(home))}>
            Geri
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
