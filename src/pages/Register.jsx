import { useState, useEffect } from 'react'
import {
  Box, Button, Stack, TextField, Typography, Link, MenuItem, CircularProgress,
} from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import WelcomeScreen from '../components/WelcomeScreen.jsx'

const ALLOWED_ROLES = ['doctor', 'user']

export default function Register() {
  const { register } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    surname: '',
    dateOfBirth: '',
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
      setShowWelcome(true)
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

  if (showWelcome) {
    return <WelcomeScreen onContinue={() => navigate('/', { replace: true })} />
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'background.default', 
      px: 3,
      py: 4
    }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            component="img"
            src="/sagliktanLogo.png"
            alt="Sağlıktan"
            sx={{ width: 48, height: 48, borderRadius: '50%', mb: 3 }}
          />
          <Typography variant="h1" sx={{ mb: 1 }}>
            Kayıt Ol
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sağlık topluluğuna katılın
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="İsim"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoComplete="given-name"
                fullWidth
              />
              <TextField
                label="Soyisim"
                required
                value={form.surname}
                onChange={e => setForm(f => ({ ...f, surname: e.target.value }))}
                autoComplete="family-name"
                fullWidth
              />
            </Stack>

            <TextField
              label="Doğum Tarihi"
              type="date"
              required
              value={form.dateOfBirth}
              onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: '1900-01-01', max: new Date().toISOString().split('T')[0] }}
              autoComplete="bday"
              fullWidth
            />

            <TextField
              label="Rol"
              select
              required
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              fullWidth
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
              fullWidth
            />

            <TextField
              label="Şifre"
              type="password"
              required
              inputProps={{ minLength: 4 }}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
              fullWidth
            />

            <TextField
              label="Şifre (tekrar)"
              type="password"
              required
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              autoComplete="new-password"
              fullWidth
            />

            <Button type="submit" disabled={loading} fullWidth size="large">
              {loading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} color="inherit" />
                  <span>Kaydediliyor...</span>
                </Stack>
              ) : 'Kayıt Ol'}
            </Button>
          </Stack>
        </Box>

        {/* Footer */}
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 4, textAlign: 'center' }}>
          Hesabınız var mı?{' '}
          <Link component={RouterLink} to="/" sx={{ color: 'primary.main', fontWeight: 500 }}>
            Giriş Yap
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
