import { useState, useEffect } from 'react'
import {
  Box, Button, Container, Stack, TextField, Typography, Divider, Link, MenuItem, CircularProgress,
} from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import AnimatedLogo from '../components/AnimatedLogo.jsx'
import WelcomeScreen from '../components/WelcomeScreen.jsx'

const ALLOWED_ROLES = ['doctor', 'user']

export default function Register() {
  const { register } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    surname: '',
    dateOfBirth: '',   // YYYY-MM-DD (native <input type="date"> ISO döner)
    role: 'doctor',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    // Basit kontroller
    if (!form.name?.trim() || !form.surname?.trim() || !form.email?.trim() || !form.password) {
      setError('Lütfen zorunlu alanları doldurun.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Şifreler uyuşmuyor.')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) {
      setError('Doğum tarihi "YYYY-MM-DD" biçiminde olmalı.')
      return
    }
    const normRole = String(form.role).toLowerCase()
    if (!ALLOWED_ROLES.includes(normRole)) {
      setError('Rol sadece "doctor" veya "user" olabilir.')
      return
    }

    setError('')
    setLoading(true)
    try {
      await register({
        name: form.name.trim(),
        surname: form.surname.trim(),
        dateOfBirth: form.dateOfBirth,
        role: normRole,
        email: form.email.trim(),
        password: form.password
      })
      // Kayıt başarılı, hoş geldin ekranını göster
      setShowWelcome(true)
    } catch (err) {
      const errorMessage = (err && err.message) ? err.message : String(err) || 'Kayıt başarısız.'
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

  // Hoş geldin ekranını göster
  if (showWelcome) {
    return <WelcomeScreen onContinue={() => navigate('/', { replace: true })} />
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', alignItems: 'center', backgroundColor: 'background.default', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Animasyonlu Logo */}
        <Box sx={{ display: 'grid', placeItems: 'center', mb: { xs: 2.5, md: 3 } }}>
          <AnimatedLogo size={140} mobileSize={100} />
        </Box>

        <Stack spacing={{ xs: 2.5, md: 3 }} component="form" onSubmit={onSubmit} aria-label="Kayıt formu" noValidate sx={{ maxWidth: 500, mx: 'auto', width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', fontSize: { xs: 24, sm: 28, md: 32 } }}>Kayıt Ol</Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="İsim"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoComplete="given-name"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '16px', sm: '16px' }
                }
              }}
            />
            <TextField
              label="Soyisim"
              required
              value={form.surname}
              onChange={e => setForm(f => ({ ...f, surname: e.target.value }))}
              autoComplete="family-name"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '16px', sm: '16px' }
                }
              }}
            />
          </Stack>

          {/* Doğum tarihi */}
          <TextField
            label="Doğum Tarihi"
            type="date"
            required
            value={form.dateOfBirth}
            onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: '1900-01-01', max: new Date().toISOString().split('T')[0] }}
            autoComplete="bday"
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '16px', sm: '16px' }
              }
            }}
          />

          {/* Rol seçimi — menü yazıları görünür */}
          <TextField
            label="Rol"
            select
            required
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    bgcolor: 'rgba(7,20,28,0.96)',
                    color: '#FAF9F6',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(6px)',
                    '& .MuiMenuItem-root': {
                      color: '#FAF9F6',
                      fontSize: { xs: '16px', sm: '15px' },
                      minHeight: { xs: 48, sm: 40 },
                      '&.Mui-selected': { bgcolor: 'rgba(52,195,161,0.18)' },
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' }
                    }
                  }
                }
              }
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '16px', sm: '16px' }
              }
            }}
          >
            <MenuItem value="doctor">Doktor</MenuItem>
            <MenuItem value="user">Kullanıcı</MenuItem>
          </TextField>

          <TextField
            label="E-posta"
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            autoComplete="email"
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '16px', sm: '16px' }
              }
            }}
          />

          <TextField
            label="Şifre"
            type="password"
            required
            inputProps={{ minLength: 4 }}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            autoComplete="new-password"
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '16px', sm: '16px' }
              }
            }}
          />

          <TextField
            label="Şifre (tekrar)"
            type="password"
            required
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            autoComplete="new-password"
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '16px', sm: '16px' }
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
            {loading ? (<><CircularProgress size={18} sx={{ mr: 1 }} /> Kaydediliyor…</>) : 'Kayıt Ol'}
          </Button>

          <Divider sx={{ my: 1 }} />
          <Typography variant="body2">
            Hesabın var mı? <Link component={RouterLink} to="/">Giriş Yap</Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
