import { useState, useEffect } from 'react'
import {
  Box, Button, Container, Link, Stack, TextField, Typography, Divider, CircularProgress, FormControlLabel, Checkbox
} from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import AnimatedLogo from '../components/AnimatedLogo.jsx'

export default function Login() {
  const { login } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', pw: '' })
  const [rememberMe, setRememberMe] = useState(true) // Varsayılan olarak işaretli
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email.trim(), form.pw, rememberMe)
      navigate('/posts', { replace: true })
    } catch (err) {
      const errorMessage = (err && err.message) ? err.message : String(err) || 'Giriş başarısız.'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Error state'i değiştiğinde bildirim göster (eski kod uyumluluğu için)
  useEffect(() => {
    if (error) {
      showError(error)
    }
  }, [error, showError])

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'grid',
      alignItems: 'center',
      backgroundColor: 'background.default',
      py: { xs: 4, md: 8 }
    }}>
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Animasyonlu Logo */}
        <Box sx={{ display: 'grid', placeItems: 'center', mb: { xs: 2.5, md: 3 } }}>
          <AnimatedLogo size={140} mobileSize={100} />
        </Box>

        <Stack spacing={{ xs: 2.5, md: 3 }} component="form" onSubmit={onSubmit} aria-label="Giriş formu" noValidate sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', fontSize: { xs: 24, sm: 28, md: 32 } }}>
            Giriş Yap
          </Typography>

          <TextField
            label="E-posta"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            autoFocus
            autoComplete="email"
            inputProps={{ 'aria-label': 'E-posta' }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '16px', sm: '16px' }
              }
            }}
          />

          <TextField
            label="Şifre"
            type="password"
            value={form.pw}
            onChange={e => setForm(f => ({ ...f, pw: e.target.value }))}
            required
            autoComplete="current-password"
            inputProps={{ minLength: 4, 'aria-label': 'Şifre' }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '16px', sm: '16px' }
              }
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary"
              />
            }
            label="Beni Hatırla"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: { xs: '14px', sm: '15px' }
              }
            }}
          />

          <Button 
            type="submit" 
            disabled={loading}
            size="large"
            sx={{
              minHeight: { xs: 48, md: 44 },
              fontSize: { xs: '16px', md: '15px' },
              fontWeight: 600,
              py: { xs: 1.5, md: 1.25 }
            }}
          >
            {loading ? (<><CircularProgress size={18} sx={{ mr: 1 }} /> Giriş yapılıyor…</>) : 'Giriş Yap'}
          </Button>

          <Divider sx={{ my: 1 }} />

          <Typography variant="body2">
            Hesabın yok mu?{' '}
            <Link component={RouterLink} to="/register" sx={{ color: 'primary.main' }}>
              Kayıt Ol
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
