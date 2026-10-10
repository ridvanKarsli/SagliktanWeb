import { useState } from 'react'
import {
  Box, Button, Link, Stack, TextField, Typography, CircularProgress
} from '@mui/material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext.jsx'
import { forgotPassword, resetPassword } from '../services/api.js'
import PasswordField from '../components/PasswordField.jsx'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Companion from '../components/avatars/Companion.jsx'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.jsx'
import EmailField from '../components/forms/EmailField.jsx'
import { useFormValidation } from '../hooks/useFormValidation.js'
import {
  LIMITS, codeError, confirmPasswordError, fieldErrorsFrom, fieldFromMessage, loginEmailError,
  newPasswordError, normalizeEmail, sanitizeCode
} from '../utils/validation.js'

const validateRequest = (f) => ({ email: loginEmailError(f.email) })
const validateReset = (f) => ({
  code: codeError(f.code),
  newPassword: newPasswordError(f.newPassword),
  confirmPassword: confirmPasswordError(f.confirmPassword, f.newPassword),
})
const RESET_MESSAGE_FIELDS = [[/kod/i, 'code']]

// Şifre sıfırlama backend'de kod tabanlı (link değil - bkz. SmtpEmailService.
// sendPasswordResetCode): kullanıcı e-postasına gelen 6 haneli kodu elle
// giriyor. Bu yüzden tek sayfada iki adımlı bir akış: 1) e-posta gir, kod
// gönderilsin  2) kod + yeni şifreyi gir.
export default function ForgotPassword() {
  const navigate = useNavigate()
  const { showError, showSuccess } = useNotification()

  const [step, setStep] = useState('request') // 'request' | 'reset' | 'done'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  // Backend 5 yanlış denemeden sonra kodu kilitler ve her durumda aynı
  // "Kod hatalı ya da süresi dolmuş" mesajını döner - o anda tek çıkış yeni kod.
  const [codeRejected, setCodeRejected] = useState(false)
  const [resending, setResending] = useState(false)
  const requestForm = useFormValidation({ email }, validateRequest)
  const resetForm = useFormValidation({ code, newPassword, confirmPassword }, validateReset)

  const submitRequest = async (e) => {
    e.preventDefault()
    if (loading || !requestForm.validateAll()) return
    setLoading(true)
    try {
      await forgotPassword({ email: normalizeEmail(email) })
      showSuccess('E-posta adresiniz kayıtlıysa sıfırlama kodu gönderildi.')
      resetForm.reset()
      setStep('reset')
    } catch (err) {
      if (!requestForm.applyServerErrors(fieldErrorsFrom(err))) showError(err.message || 'İstek gönderilemedi.')
    } finally {
      setLoading(false)
    }
  }

  const submitReset = async (e) => {
    e.preventDefault()
    if (loading || !resetForm.validateAll()) return
    setLoading(true)
    try {
      await resetPassword({ email: normalizeEmail(email), code: sanitizeCode(code), newPassword })
      showSuccess('Şifreniz sıfırlandı, artık giriş yapabilirsiniz.')
      setStep('done')
    } catch (err) {
      const mapped = { ...fieldFromMessage(err, RESET_MESSAGE_FIELDS), ...fieldErrorsFrom(err) }
      if (/kod hatalı|süresi dolmuş/i.test(err.message || '')) setCodeRejected(true)
      if (!resetForm.applyServerErrors(mapped)) showError(err.message || 'Şifre sıfırlanamadı.')
    } finally {
      setLoading(false)
    }
  }

  // "Yeni kod iste": aynı adrese yeni kod gönderilir, kod alanı temizlenir.
  const requestNewCode = async () => {
    if (resending) return
    setResending(true)
    try {
      await forgotPassword({ email: normalizeEmail(email) })
      setCode('')
      setCodeRejected(false)
      resetForm.reset()
      showSuccess('Yeni kod gönderildi. E-postanı kontrol et.')
    } catch (err) {
      showError(err.message || 'Kod gönderilemedi.')
    } finally {
      setResending(false)
    }
  }

  const heading = {
    request: { title: 'Şifreni mi unuttun?', lead: 'Olur böyle şeyler. Hesabına kayıtlı e-posta adresini yaz, sana bir sıfırlama kodu gönderelim.' },
    reset: { title: 'Kodu gir', lead: <><strong>{email}</strong> adresine bir kod gönderdik. Kodu ve yeni şifreni aşağıya yaz.</> },
    done: { title: 'Şifren yenilendi', lead: null },
  }[step]

  return (
    <AuthLayout
      title={heading.title}
      lead={heading.lead}
      sideTitle="Merak etme, hallederiz"
      sideText="Herkesin başına gelebilir. E-postana gelecek kodla şifreni birkaç adımda yenileyebilirsin."
      companions={['bulut', 'baykus', 'damla']}
      backLabel="Girişe Dön"
      onBack={() => navigate('/login')}
      maxWidth={420}
      footer={step === 'request' ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Şifreni hatırladın mı?{' '}
          <Link component={RouterLink} to="/login" sx={{ display: 'inline-block', py: 1.5, px: 0.5, my: -1.5, mx: -0.5 }}>
            Giriş Yap
          </Link>
        </Typography>
      ) : null}
    >
            {step === 'done' ? (
    <Box sx={{ textAlign: 'center' }}>
      <Box className="sg-arrive" sx={{ display: 'inline-block', mb: 2 }}><Companion name="gunes" size={88} /></Box>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        Yeni şifren kaydedildi. Artık onunla giriş yapabilirsin.
      </Typography>
      <Button variant="contained" size="large" fullWidth onClick={() => navigate('/login')}>
        Giriş Yap
      </Button>
    </Box>
  ) : step === 'request' ? (
    <>
      <Box component="form" onSubmit={submitRequest} noValidate>
        <Stack spacing={3}>
          <EmailField
            value={email}
            onChange={setEmail}
            {...requestForm.field('email')}
            errorText={requestForm.error('email')}
            required
            autoFocus
            slotProps={{ htmlInput: { enterKeyHint: 'send' } }}
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

    </>
  ) : (
    <>
      <Box component="form" onSubmit={submitReset} noValidate>
        <Stack spacing={3}>
          <TextField
            label="Sıfırlama Kodu"
            value={code}
            onChange={e => { setCode(sanitizeCode(e.target.value)); setCodeRejected(false) }}
            {...resetForm.field('code')}
            helperText={resetForm.error('code') || `E-postana gelen ${LIMITS.CODE_LENGTH} haneli kod`}
            required
            autoFocus
            fullWidth
            placeholder="123456"
            autoComplete="one-time-code"
            slotProps={{
              htmlInput: {
                inputMode: 'numeric', pattern: '[0-9]*', maxLength: LIMITS.CODE_LENGTH,
                enterKeyHint: 'next', autoCorrect: 'off', spellCheck: false
              }
            }}
          />
          {codeRejected && (
            <Button
              variant="outlined"
              onClick={requestNewCode}
              disabled={resending}
              sx={{ alignSelf: 'flex-start', mt: -1.5 }}
            >
              {resending ? 'Gönderiliyor...' : 'Yeni kod iste'}
            </Button>
          )}
          <Box>
            <PasswordField
              label="Yeni Şifre"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              {...resetForm.field('newPassword')}
              helperText={resetForm.error('newPassword') || `En az ${LIMITS.PASSWORD_MIN} karakter`}
              autoComplete="new-password"
              required
              fullWidth
              slotProps={{ htmlInput: { enterKeyHint: 'next' } }}
            />
            <Box sx={{ mt: 1 }}><PasswordStrengthMeter password={newPassword} /></Box>
          </Box>
          <PasswordField
            label="Yeni Şifre (Tekrar)"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            {...resetForm.field('confirmPassword')}
            helperText={resetForm.error('confirmPassword')}
            autoComplete="new-password"
            required
            fullWidth
            slotProps={{ htmlInput: { enterKeyHint: 'done' } }}
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
          >
            Kod gelmedi mi? Tekrar dene
          </Button>
        </Stack>
      </Box>
    </>
  )}
    </AuthLayout>
  )
}
