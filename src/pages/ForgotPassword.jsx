import { useState } from 'react'
import {
  Box, Button, Link, Stack, TextField, Typography, CircularProgress, useMediaQuery, useTheme
} from '@mui/material'
import { ArrowBack, CheckCircleOutline } from '@mui/icons-material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext.jsx'
import { forgotPassword, resetPassword } from '../services/api.js'

// Şifre sıfırlama backend'de kod tabanlı (link değil - bkz. SmtpEmailService.
// sendPasswordResetCode): kullanıcı e-postasına gelen 6 haneli kodu elle
// giriyor. Bu yüzden tek sayfada iki adımlı bir akış: 1) e-posta gir, kod
// gönderilsin  2) kod + yeni şifreyi gir.
export default function ForgotPassword() {
  const navigate = useNavigate()
  const { showError, showSuccess } = useNotification()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [step, setStep] = useState('request') // 'request' | 'reset' | 'done'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submitRequest = async (e) => {
    e.preventDefault()
    if (!email.trim()) { showError('E-posta adresini gir.'); return }
    setLoading(true)
    try {
      await forgotPassword({ email: email.trim() })
      showSuccess('E-posta adresiniz kayıtlıysa sıfırlama kodu gönderildi.')
      setStep('reset')
    } catch (err) {
      showError(err.message || 'İstek gönderilemedi.')
    } finally {
      setLoading(false)
    }
  }

  const submitReset = async (e) => {
    e.preventDefault()
    if (!code.trim()) { showError('E-postana gelen kodu gir.'); return }
    if (newPassword.length < 8) { showError('Yeni şifre en az 8 karakter olmalı.'); return }
    if (newPassword !== confirmPassword) { showError('Şifreler eşleşmiyor.'); return }
    setLoading(true)
    try {
      await resetPassword({ email: email.trim(), code: code.trim(), newPassword })
      showSuccess('Şifreniz sıfırlandı, artık giriş yapabilirsiniz.')
      setStep('done')
    } catch (err) {
      showError(err.message || 'Şifre sıfırlanamadı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6
          }}
        >
          <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
            <Box
              component="img"
              src="/sagliktanLogo.png"
              alt="Sağlıktan"
              sx={{ width: 80, height: 80, borderRadius: '20px', mb: 4 }}
            />
            <Typography variant="h2" sx={{ color: 'primary.main', mb: 2, fontWeight: 700 }}>
              Şifreni Sıfırla
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Merak etme, herkesin başına gelebilir. E-postana gelecek kodla şifreni birkaç adımda yenileyebilirsin.
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/login')}
            sx={{ color: 'text.secondary' }}
          >
            Girişe Dön
          </Button>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 3, sm: 4 }, pb: 8 }}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            {isMobile && (
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box component="img" src="/sagliktanLogo.png" alt="Sağlıktan" sx={{ width: 56, height: 56, borderRadius: '14px', mb: 2 }} />
              </Box>
            )}

            {step === 'done' ? (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleOutline sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                <Typography variant="h2" sx={{ color: 'primary.main', mb: 1 }}>
                  Şifren Sıfırlandı
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                  Yeni şifrenle giriş yapabilirsin.
                </Typography>
                <Button variant="contained" size="large" fullWidth onClick={() => navigate('/login')}>
                  Giriş Yap
                </Button>
              </Box>
            ) : step === 'request' ? (
              <>
                <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="h2" sx={{ color: 'primary.main', mb: 1 }}>
                    Şifremi Unuttum
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Hesabına kayıtlı e-posta adresini gir, sana bir sıfırlama kodu gönderelim.
                  </Typography>
                </Box>

                <Box component="form" onSubmit={submitRequest}>
                  <Stack spacing={3}>
                    <TextField
                      label="E-posta adresi"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                      autoComplete="email"
                      fullWidth
                      placeholder="ornek@email.com"
                    />
                    <Button type="submit" variant="contained" disabled={loading} fullWidth size="large">
                      {loading ? (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <CircularProgress size={20} color="inherit" />
                          <span>Gönderiliyor...</span>
                        </Stack>
                      ) : 'Sıfırlama Kodu Gönder'}
                    </Button>
                  </Stack>
                </Box>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Şifreni hatırladın mı?{' '}
                    <Link component={RouterLink} to="/login" sx={{ color: 'secondary.main', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
                      Giriş Yap
                    </Link>
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="h2" sx={{ color: 'primary.main', mb: 1 }}>
                    Kodu Gir
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    <strong>{email}</strong> adresine bir kod gönderdik. Kodu ve yeni şifreni aşağıya gir.
                  </Typography>
                </Box>

                <Box component="form" onSubmit={submitReset}>
                  <Stack spacing={3}>
                    <TextField
                      label="Sıfırlama Kodu"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      required
                      autoFocus
                      fullWidth
                      placeholder="123456"
                      inputProps={{ maxLength: 10 }}
                    />
                    <TextField
                      label="Yeni Şifre"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      fullWidth
                      helperText="En az 8 karakter"
                    />
                    <TextField
                      label="Yeni Şifre (Tekrar)"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      fullWidth
                    />
                    <Button type="submit" variant="contained" disabled={loading} fullWidth size="large">
                      {loading ? (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <CircularProgress size={20} color="inherit" />
                          <span>Kaydediliyor...</span>
                        </Stack>
                      ) : 'Şifreyi Sıfırla'}
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setStep('request')}
                      disabled={loading}
                      sx={{ color: 'text.secondary' }}
                    >
                      Kod gelmedi mi? Tekrar dene
                    </Button>
                  </Stack>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
