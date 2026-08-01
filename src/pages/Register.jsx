import { useState, useEffect } from 'react'
import {
  Box, Button, Stack, TextField, Typography, Link, CircularProgress,
  useMediaQuery, useTheme, Checkbox, FormControlLabel
} from '@mui/material'
import { ArrowBack, MarkEmailReadOutlined } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { isValidName } from '../utils/validateName.js'

export default function Register() {
  const { register } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    kvkkConsent: false
  })
  const [error, setError] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim() || !form.password) {
      setError('Lütfen zorunlu alanları doldurun.')
      return
    }
    if (!isValidName(form.firstName)) {
      setError('Lütfen geçerli bir ad girin (sadece harf, en az 2 karakter).')
      return
    }
    if (!isValidName(form.lastName)) {
      setError('Lütfen geçerli bir soyad girin (sadece harf, en az 2 karakter).')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Şifreler uyuşmuyor.')
      return
    }
    if (form.password.length < 8) {
      setError('Şifre en az 8 karakter olmalı.')
      return
    }
    if (!form.kvkkConsent) {
      setError('Kayıt olmak için KVKK Aydınlatma Metni\'ni onaylamanız gerekiyor.')
      return
    }

    setError('')
    setLoading(true)
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        kvkkConsent: form.kvkkConsent
      })
      setRegisteredEmail(form.email.trim())
    } catch (err) {
      const errorMessage = (err && err.message) ? err.message : String(err) || 'Kayıt başarısız.'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (error) showError(error)
  }, [error, showError])

  // Kayıt başarılı: backend e-posta doğrulaması zorunlu tutuyor, otomatik giriş yok.
  if (registeredEmail) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: 'background.default' }}>
        <Box sx={{ maxWidth: 440, textAlign: 'center' }}>
          <MarkEmailReadOutlined sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h2" sx={{ color: 'primary.main', mb: 2 }}>
            E-postanı kontrol et
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
            <strong>{registeredEmail}</strong> adresine bir doğrulama bağlantısı gönderdik.
            Hesabınla giriş yapabilmek için önce e-postandaki bağlantıya tıklayarak
            adresini doğrulaman gerekiyor.
          </Typography>
          <Button variant="contained" size="large" fullWidth onClick={() => navigate('/login', { replace: true })}>
            Giriş sayfasına dön
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left side - Branding (hidden on mobile) */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(160deg, #241F1A 0%, #1E1A16 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{
            position: 'absolute', top: '-10%', right: '-15%', width: 420, height: 420,
            borderRadius: '50%', bgcolor: 'rgba(224, 139, 109, 0.16)', filter: 'blur(100px)', pointerEvents: 'none'
          }} />
          <Box sx={{
            position: 'absolute', bottom: '-15%', left: '-10%', width: 380, height: 380,
            borderRadius: '50%', bgcolor: 'rgba(76, 184, 159, 0.16)', filter: 'blur(100px)', pointerEvents: 'none'
          }} />
          <Box sx={{ maxWidth: 400, textAlign: 'center', position: 'relative' }}>
            <Box
              component="img"
              src="/sagliktanLogo.png"
              alt="Sağlıktan"
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                mb: 4,
                boxShadow: '0 16px 48px rgba(44, 117, 98, 0.3)'
              }}
            />
            <Typography variant="h2" sx={{ color: 'primary.main', mb: 2, fontWeight: 700 }}>
              Sizi Anlayan
              <br />Bir Topluluk
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Aynı yolu yürüyen insanlarla tanışın, deneyimlerinizi güvenle paylaşın.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Right side - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          overflowY: 'auto'
        }}
      >
        {/* Back button */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ color: 'text.secondary' }}
          >
            Ana Sayfa
          </Button>
        </Box>

        {/* Form Container */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 3, sm: 4 },
            pb: 6
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 440 }}>
            {/* Mobile Logo */}
            {isMobile && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  component="img"
                  src="/sagliktanLogo.png"
                  alt="Sağlıktan"
                  sx={{ width: 56, height: 56, borderRadius: '14px', mb: 2 }}
                />
              </Box>
            )}

            {/* Header */}
            <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h2" sx={{ color: 'primary.main', mb: 1 }}>
                Kayıt Ol
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Sağlık topluluğuna katılın
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="İsim"
                    required
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    autoComplete="given-name"
                    fullWidth
                    placeholder="Adınız"
                    slotProps={{ htmlInput: { 'data-testid': 'register-firstName' } }}
                  />
                  <TextField
                    label="Soyisim"
                    required
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    autoComplete="family-name"
                    fullWidth
                    placeholder="Soyadınız"
                    slotProps={{ htmlInput: { 'data-testid': 'register-lastName' } }}
                  />
                </Stack>

                <TextField
                  label="E-posta adresi"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                  fullWidth
                  placeholder="ornek@email.com"
                  slotProps={{ htmlInput: { 'data-testid': 'register-email' } }}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Şifre"
                    type="password"
                    required
                    helperText="En az 8 karakter"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    autoComplete="new-password"
                    fullWidth
                    placeholder="••••••••"
                    slotProps={{ htmlInput: { minLength: 8, 'data-testid': 'register-password' } }}
                  />

                  <TextField
                    label="Şifre (tekrar)"
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    autoComplete="new-password"
                    fullWidth
                    placeholder="••••••••"
                    slotProps={{ htmlInput: { 'data-testid': 'register-confirmPassword' } }}
                  />
                </Stack>

                <FormControlLabel
                  sx={{ alignItems: 'flex-start', ml: 0, mt: 0.5 }}
                  control={
                    <Checkbox
                      checked={form.kvkkConsent}
                      onChange={e => setForm(f => ({ ...f, kvkkConsent: e.target.checked }))}
                      sx={{ pt: 0.25 }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      <Link
                        component={RouterLink}
                        to="/gizlilik-politikasi"
                        target="_blank"
                        rel="noopener"
                        sx={{ color: 'secondary.main', fontWeight: 600 }}
                      >
                        KVKK Aydınlatma Metni ve Gizlilik Politikası
                      </Link>
                      'nı okudum, kişisel verilerimin belirtilen kapsamda işlenmesini kabul ediyorum.
                    </Typography>
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth
                  size="large"
                  sx={{ mt: 1 }}
                >
                  {loading ? (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CircularProgress size={20} color="inherit" />
                      <span>Kaydediliyor...</span>
                    </Stack>
                  ) : 'Kayıt Ol'}
                </Button>
              </Stack>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Hesabınız var mı?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: 'secondary.main',
                    fontWeight: 600,
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  Giriş Yap
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
