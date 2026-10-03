import { useState } from 'react'
import {
  Box, Button, Link, Stack, Typography, CircularProgress, FormControlLabel, Checkbox
} from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import TrustBadges from '../components/TrustBadges.jsx'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'
import EmailField from '../components/forms/EmailField.jsx'
import { useFormValidation } from '../hooks/useFormValidation.js'
import { currentPasswordError, loginEmailError, normalizeEmail } from '../utils/validation.js'

const validateLogin = (f) => ({ email: loginEmailError(f.email), pw: currentPasswordError(f.pw) })

export default function Login() {
  const { login } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', pw: '' })
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const v = useFormValidation(form, validateLogin)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!v.validateAll()) return
    setLoading(true)
    try {
      const loggedIn = await login(normalizeEmail(form.email), form.pw, rememberMe)
      // Deep-link'i koru (bkz. ProtectedRoute -> WelcomeScreen state.from):
      // sadece uygulama içi, göreli bir yol kabul edilir (open-redirect yok).
      const from = location.state?.from
      const target = from?.pathname && from.pathname.startsWith('/') && !from.pathname.startsWith('//')
        ? `${from.pathname}${from.search || ''}${from.hash || ''}`
        : (loggedIn && loggedIn.onboardingCompleted === false ? '/hosgeldin' : '/home')
      navigate(target, { replace: true })
    } catch (err) {
      showError(err?.message || 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Tekrar hoş geldin"
      lead="Seni anlayan insanlar kaldığın yerde seni bekliyor."
      sideTitle="Önce yoldaş, sonra yol"
      sideText="Gruplarında yeni paylaşımlar, sorularına gelen cevaplar ve seni bekleyen yol arkadaşların var."
      companions={['kirpi', 'filiz', 'kaplumbaga']}
      onBack={() => navigate('/')}
      maxWidth={420}
      footer={(
        <>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Henüz hesabın yok mu?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{ display: 'inline-block', py: 1.5, px: 0.5, my: -1.5, mx: -0.5 }}
            >
              Kayıt Ol
            </Link>
          </Typography>
          <Box sx={{ mt: 2.5 }}>
            <TrustBadges />
          </Box>
        </>
      )}
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.5}>
          <EmailField
            value={form.email}
            onChange={email => setForm(f => ({ ...f, email }))}
            {...v.field('email')}
            errorText={v.error('email')}
            required
            autoFocus
            testId="login-email"
          />

          <PasswordField
            label="Şifre"
            value={form.pw}
            onChange={e => setForm(f => ({ ...f, pw: e.target.value }))}
            {...v.field('pw')}
            helperText={v.error('pw')}
            required
            autoComplete="current-password"
            fullWidth
            placeholder="••••••••"
            slotProps={{ htmlInput: { enterKeyHint: 'go', 'data-testid': 'login-password' } }}
          />

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1
          }}>
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
              sx={{ m: 0, minHeight: 44, '& .MuiFormControlLabel-label': { fontSize: '0.9375rem', color: 'text.secondary', fontWeight: 600 } }}
            />
            <Link
              component={RouterLink}
              to="/forgot-password"
              sx={{
                fontSize: '0.9375rem',
                // Görünmez padding + eşit negatif margin: düzeni bozmadan
                // dokunma alanı ~44px.
                display: 'inline-block', py: 1.5, px: 0.5, my: -1.5, mx: -0.5
              }}
            >
              Şifremi Unuttum
            </Link>
          </Box>

          <Button 
            type="submit" 
            variant="contained"
            disabled={loading}
            fullWidth
            size="large"
          >
            {loading ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CircularProgress size={20} color="inherit" />
                <span>Giriş yapılıyor...</span>
              </Stack>
            ) : 'Giriş Yap'}
          </Button>
        </Stack>
      </Box>

    </AuthLayout>
  )
}
