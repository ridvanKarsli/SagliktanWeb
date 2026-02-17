import { useState, useEffect } from 'react'
import {
  Box, Button, Link, Stack, TextField, Typography, CircularProgress, FormControlLabel, Checkbox
} from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', pw: '' })
  const [rememberMe, setRememberMe] = useState(true)
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

  useEffect(() => {
    if (error) showError(error)
  }, [error, showError])

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      px: 3
    }}>
      <Box sx={{ width: '100%', maxWidth: 360 }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Box
            component="img"
            src="/sagliktanLogo.png"
            alt="Sağlıktan"
            sx={{ width: 48, height: 48, borderRadius: '50%', mb: 3 }}
          />
          <Typography variant="h1" sx={{ mb: 1 }}>
            Giriş Yap
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Hesabınıza erişin
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={3}>
            <TextField
              label="E-posta"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoFocus
              autoComplete="email"
              fullWidth
            />

            <TextField
              label="Şifre"
              type="password"
              value={form.pw}
              onChange={e => setForm(f => ({ ...f, pw: e.target.value }))}
              required
              autoComplete="current-password"
              fullWidth
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                />
              }
              label="Beni hatırla"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8125rem', color: 'text.secondary' } }}
            />

            <Button 
              type="submit" 
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} color="inherit" />
                  <span>Giriş yapılıyor...</span>
                </Stack>
              ) : 'Giriş Yap'}
            </Button>
          </Stack>
        </Box>

        {/* Footer */}
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 4, textAlign: 'center' }}>
          Hesabınız yok mu?{' '}
          <Link component={RouterLink} to="/register" sx={{ color: 'primary.main', fontWeight: 500 }}>
            Kayıt Ol
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
