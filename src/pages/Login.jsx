import { useState } from 'react'
import {
  Alert, Box, Button, Container, Link, Snackbar, Stack, TextField, Typography, Divider, CircularProgress
} from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import AnimatedLogo from '../components/AnimatedLogo.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', pw: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email.trim(), form.pw)
      navigate('/posts', { replace: true })
    } catch (err) {
      setError((err && err.message) ? err.message : String(err) || 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'grid',
      alignItems: 'center',
      backgroundColor: 'background.default',
      py: { xs: 4, md: 8 }
    }}>
      <Container maxWidth="sm">
        {/* Animasyonlu Logo */}
        <Box sx={{ display: 'grid', placeItems: 'center', mb: 3 }}>
          <AnimatedLogo size={140} mobileSize={120} />
        </Box>

        <Stack spacing={3} component="form" onSubmit={onSubmit} aria-label="Giriş formu" noValidate sx={{ maxWidth: 400, mx: 'auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
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
          />

          <TextField
            label="Şifre"
            type="password"
            value={form.pw}
            onChange={e => setForm(f => ({ ...f, pw: e.target.value }))}
            required
            autoComplete="current-password"
            inputProps={{ minLength: 4, 'aria-label': 'Şifre' }}
          />

          <Button type="submit" disabled={loading}>
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

      <Snackbar
        open={!!error}
        autoHideDuration={4500}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}
