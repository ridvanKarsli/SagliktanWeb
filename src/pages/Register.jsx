import { useState } from 'react'
import {
  Alert, Box, Button, Container, Snackbar, Stack, TextField, Typography, Divider, Link, MenuItem, CircularProgress,
} from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import Surface from '../components/Surface.jsx'

const ALLOWED_ROLES = ['doctor', 'user']

export default function Register() {
  const { register } = useAuth()
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
  const [ok, setOk] = useState(false)
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
      setOk(true)
      setTimeout(() => navigate('/posts', { replace: true }), 800)
    } catch (err) {
      setError((err && err.message) ? err.message : String(err) || 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', alignItems: 'center', backgroundColor: 'background.default', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="sm">
        {/* Logo */}
        <Box sx={{ display: 'grid', placeItems: 'center', mb: 2 }}>
          <Box component="img" src="/sagliktanLogo.png" alt="Sağlıktan" sx={{ width: 72, height: 72 }} />
        </Box>

        <Surface>
          <Stack spacing={2} component="form" onSubmit={onSubmit} aria-label="Kayıt formu" noValidate>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Kayıt Ol</Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="İsim"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoComplete="given-name"
              />
              <TextField
                label="Soyisim"
                required
                value={form.surname}
                onChange={e => setForm(f => ({ ...f, surname: e.target.value }))}
                autoComplete="family-name"
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
              helperText='Format: YYYY-MM-DD (örn. 1998-07-15)'
            />

            {/* Rol seçimi — menü yazıları görünür */}
            <TextField
              label="Rol"
              select
              required
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              helperText='Sadece "doctor" veya "user"'
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
                        '&.Mui-selected': { bgcolor: 'rgba(52,195,161,0.18)' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' }
                      }
                    }
                  }
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
            />

            <TextField
              label="Şifre"
              type="password"
              required
              inputProps={{ minLength: 4 }}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
            />

            <TextField
              label="Şifre (tekrar)"
              type="password"
              required
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              autoComplete="new-password"
            />

            <Button type="submit" disabled={loading}>
              {loading ? (<><CircularProgress size={18} sx={{ mr: 1 }} /> Kaydediliyor…</>) : 'Kayıt Ol'}
            </Button>

            <Divider sx={{ my: 1 }} />
            <Typography variant="body2">
              Hesabın var mı? <Link component={RouterLink} to="/">Giriş Yap</Link>
            </Typography>
          </Stack>
        </Surface>
      </Container>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" variant="filled" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={ok} autoHideDuration={1800} onClose={() => setOk(false)}>
        <Alert severity="success" variant="filled" onClose={() => setOk(false)}>Kayıt başarılı! Yönlendiriliyorsunuz…</Alert>
      </Snackbar>
    </Box>
  )
}
