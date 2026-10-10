import { useState } from 'react'
import {
  Box, Button, Stack, TextField, Typography, Link, CircularProgress, Checkbox, FormControlLabel, FormHelperText
} from '@mui/material'
import { MarkEmailReadOutlined } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import TrustBadges from '../components/TrustBadges.jsx'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Companion from '../components/avatars/Companion.jsx'
import { radius } from '../design/tokens.js'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.jsx'
import PasswordField from '../components/PasswordField.jsx'
import CityField from '../components/profile/CityField.jsx'
import EmailField from '../components/forms/EmailField.jsx'
import { useFormValidation } from '../hooks/useFormValidation.js'
import {
  LIMITS, cityError, cleanLine, emailError, fieldErrorsFrom, fieldFromMessage,
  nameError, newPasswordError, normalizeCity, normalizeEmail
} from '../utils/validation.js'

// Kayıt tamamlanınca "E-postanı kontrol et" ekranı sayfa yenilense de
// kalsın (kullanıcı posta uygulamasına geçip geri dönüyor). Sekmeye özel.
const REGISTERED_EMAIL_KEY = 'sagliktan:registeredEmail'
function readRegisteredEmail() {
  try { return sessionStorage.getItem(REGISTERED_EMAIL_KEY) || '' } catch { return '' }
}
function writeRegisteredEmail(email) {
  try {
    if (email) sessionStorage.setItem(REGISTERED_EMAIL_KEY, email)
    else sessionStorage.removeItem(REGISTERED_EMAIL_KEY)
  } catch { /* depolama kapalıysa ekran yalnızca bu render'da kalır */ }
}

const validateRegister = (f) => ({
  firstName: nameError(f.firstName, 'first'),
  lastName: nameError(f.lastName, 'last'),
  email: emailError(f.email),
  city: cityError(f.city),
  // Şifre tekrarı yok: göster/gizle + güç göstergesi yazım hatasını zaten
  // görünür kılıyor; ikinci alan özellikle mobilde kaydı yarıda bıraktırıyordu.
  password: newPasswordError(f.password),
  kvkkConsent: f.kvkkConsent ? null : 'Kayıt olmak için aydınlatma metnini onaylaman gerekiyor.',
})

// Backend'in alan adı vermeden döndürdüğü bilinen hatalar.
const REGISTER_MESSAGE_FIELDS = [
  [/e-posta/i, 'email'],
  [/KVKK/i, 'kvkkConsent'],
]

const nameInputProps = {
  maxLength: LIMITS.NAME_MAX, autoCapitalize: 'words', autoCorrect: 'off', spellCheck: false, enterKeyHint: 'next'
}

export default function Register() {
  const { register } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    city: '',
    kvkkConsent: false
  })
  const [registeredEmail, setRegisteredEmailState] = useState(readRegisteredEmail)
  const setRegisteredEmail = (email) => { writeRegisteredEmail(email); setRegisteredEmailState(email) }
  const [loading, setLoading] = useState(false)
  const v = useFormValidation(form, validateRegister)
  const set = (key) => (value) => setForm(f => ({ ...f, [key]: value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!v.validateAll()) return

    setLoading(true)
    try {
      const email = normalizeEmail(form.email)
      await register({
        firstName: cleanLine(form.firstName),
        lastName: cleanLine(form.lastName),
        email,
        password: form.password,
        kvkkConsent: form.kvkkConsent,
        city: normalizeCity(form.city)
      })
      setRegisteredEmail(email)
    } catch (err) {
      const mapped = { ...fieldFromMessage(err, REGISTER_MESSAGE_FIELDS), ...fieldErrorsFrom(err) }
      if (!v.applyServerErrors(mapped)) showError(err?.message || 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  // Kayıt başarılı: backend e-posta doğrulaması zorunlu tutuyor, otomatik giriş yok.
  if (registeredEmail) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: 'background.default' }}>
        <Box className="page-transition" sx={{ maxWidth: 460, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2.5 }}>
            <Box className="sg-arrive"><Companion name="serce" size={104} /></Box>
            <Box sx={{ position: 'absolute', right: -6, bottom: -2, width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', border: '3px solid', borderColor: 'background.default' }}>
              <MarkEmailReadOutlined sx={{ fontSize: 22 }} />
            </Box>
          </Box>
          <Typography variant="h2" component="h1" sx={{ mb: 1.5 }}>
            E-postanı kontrol et
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1.5 }}>
            <strong>{registeredEmail}</strong> adresine bir doğrulama bağlantısı gönderdik.
            Bağlantıya dokunup adresini doğruladıktan sonra giriş yapabilirsin.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, p: 1.5, borderRadius: `${radius.md}px`, bgcolor: 'brand.surfaceAlt' }}>
            Birkaç dakika içinde gelmezse gereksiz (spam) klasörüne de bakmayı unutma.
          </Typography>
          <Button variant="contained" size="large" fullWidth onClick={() => { setRegisteredEmail(''); navigate('/login', { replace: true }) }}>
            Giriş sayfasına dön
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <AuthLayout
      title="Aramıza katıl"
      lead="Yalnız değilsin. Bir dakikada hesabını oluştur, seninle aynı yoldan geçenlerle tanış."
      sideTitle="Yalnız değilsin"
      sideText="Kronik ve nadir hastalıklarla yaşayanlar ve yakınları burada deneyimlerini paylaşıyor. İlk yol arkadaşların seni bekliyor."
      companions={['damla', 'filiz', 'bulut']}
      onBack={() => navigate('/')}
      maxWidth={480}
      footer={(
        <>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Zaten hesabın var mı?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{ display: 'inline-block', py: 1.5, px: 0.5, my: -1.5, mx: -0.5 }}
            >
              Giriş Yap
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="İsim"
              required
              value={form.firstName}
              onChange={e => set('firstName')(e.target.value)}
              {...v.field('firstName')}
              helperText={v.error('firstName')}
              autoComplete="given-name"
              fullWidth
              placeholder="Adın"
              slotProps={{ htmlInput: { ...nameInputProps, 'data-testid': 'register-firstName' } }}
            />
            <TextField
              label="Soyisim"
              required
              value={form.lastName}
              onChange={e => set('lastName')(e.target.value)}
              {...v.field('lastName')}
              helperText={v.error('lastName')}
              autoComplete="family-name"
              fullWidth
              placeholder="Soyadın"
              slotProps={{ htmlInput: { ...nameInputProps, 'data-testid': 'register-lastName' } }}
            />
          </Stack>

          <EmailField
            required
            value={form.email}
            onChange={set('email')}
            {...v.field('email')}
            errorText={v.error('email')}
            helperText="Doğrulama bağlantısı bu adrese gönderilecek."
            testId="register-email"
          />

          <CityField
            value={form.city}
            onChange={set('city')}
            {...v.field('city')}
            helperText={v.error('city') || 'Profilinde görünür, istediğin zaman değiştirebilirsin.'}
            testId="register-city"
          />

          <Stack spacing={2.5}>
            <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <PasswordField
                label="Şifre"
                required
                value={form.password}
                onChange={e => set('password')(e.target.value)}
                {...v.field('password')}
                helperText={v.error('password') || `En az ${LIMITS.PASSWORD_MIN} karakter`}
                autoComplete="new-password"
                fullWidth
                placeholder="••••••••"
                slotProps={{ htmlInput: { minLength: LIMITS.PASSWORD_MIN, enterKeyHint: 'done', 'data-testid': 'register-password' } }}
              />
              <PasswordStrengthMeter password={form.password} />
            </Box>
          </Stack>

          <Box>
          <FormControlLabel
            sx={{ alignItems: 'flex-start', ml: 0, mt: 0.5 }}
            control={
              <Checkbox
                checked={form.kvkkConsent}
                onChange={e => set('kvkkConsent')(e.target.checked)}
                inputRef={v.refFor('kvkkConsent')}
                slotProps={{ input: { 'aria-invalid': !!v.error('kvkkConsent') || undefined } }}
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

                >
                  KVKK Aydınlatma Metni ve Gizlilik Politikası
                </Link>
                'nı okudum, kişisel verilerimin belirtilen kapsamda işlenmesini kabul ediyorum.
              </Typography>
            }
          />
          {v.error('kvkkConsent') && (
            <FormHelperText error sx={{ ml: 4.5, mt: 0 }}>{v.error('kvkkConsent')}</FormHelperText>
          )}
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
                <span>Kaydediliyor...</span>
              </Stack>
            ) : 'Kayıt Ol'}
          </Button>
        </Stack>
      </Box>

    </AuthLayout>
  )
}
