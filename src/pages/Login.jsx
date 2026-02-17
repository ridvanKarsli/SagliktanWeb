import { useState, useEffect } from 'react'
import {
  Box, Button, Link, Stack, TextField, Typography, CircularProgress, 
  FormControlLabel, Checkbox, Container, useMediaQuery, useTheme
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
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
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left side - Branding (hidden on mobile) */}
      {!isMobile && (
        <Box 
          sx={{ 
            flex: 1,
            background: 'linear-gradient(135deg, #0B3A4E 0%, #1B7A85 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            position: 'relative'
          }}
        >
          <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
            <Box 
              component="img"
              src="/sagliktanLogo.png"
              alt="Sağlıktan"
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '20px',
                mb: 4,
                boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
              }}
            />
            <Typography 
              variant="h2" 
              sx={{ color: 'white', mb: 2, fontWeight: 700 }}
            >
              Sağlıktan'a
              <br />Hoş Geldiniz
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}
            >
              Sağlık yolculuğunuzda size eşlik eden güvenilir topluluk platformu.
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
          bgcolor: 'background.default'
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
            pb: 8
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            {/* Mobile Logo */}
            {isMobile && (
              <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                Giriş Yap
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Hesabınıza erişmek için giriş yapın
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="E-posta adresi"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                  autoComplete="email"
                  fullWidth
                  placeholder="ornek@email.com"
                />

                <TextField
                  label="Şifre"
                  type="password"
                  value={form.pw}
                  onChange={e => setForm(f => ({ ...f, pw: e.target.value }))}
                  required
                  autoComplete="current-password"
                  fullWidth
                  placeholder="••••••••"
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
                        sx={{ 
                          color: 'text.secondary',
                          '&.Mui-checked': { color: 'secondary.main' }
                        }}
                      />
                    }
                    label="Beni hatırla"
                    sx={{ 
                      m: 0,
                      '& .MuiFormControlLabel-label': { 
                        fontSize: '0.875rem', 
                        color: 'text.secondary' 
                      } 
                    }}
                  />
                </Box>

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
                      <span>Giriş yapılıyor...</span>
                    </Stack>
                  ) : 'Giriş Yap'}
                </Button>
              </Stack>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Hesabınız yok mu?{' '}
                <Link 
                  component={RouterLink} 
                  to="/register" 
                  sx={{ 
                    color: 'secondary.main', 
                    fontWeight: 600,
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  Kayıt Ol
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
