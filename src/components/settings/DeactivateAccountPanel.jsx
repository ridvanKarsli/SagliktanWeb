import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PasswordField from '../PasswordField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { deactivateAccount } from '../../services/api.js'
import { useFormValidation } from '../../hooks/useFormValidation.js'
import { currentPasswordError, fieldErrorsFrom, fieldFromMessage } from '../../utils/validation.js'

const validate = (f) => ({ password: currentPasswordError(f.password) })
const MESSAGE_FIELDS = [[/şifre/i, 'password']]

// Hesabı deaktive etme onayı (geri alınabilir, destek üzerinden). Hesap silme
// gibi şifre teyidi ister (bkz. DeleteAccountPanel ile aynı desen).
export default function DeactivateAccountPanel({ onCancel }) {
  const { token, logout } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [deactivating, setDeactivating] = useState(false)
  const v = useFormValidation({ password }, validate)

  const submit = async (e) => {
    e.preventDefault()
    if (deactivating || !v.validateAll()) return
    setDeactivating(true)
    try {
      await deactivateAccount(token, password)
      showSuccess('Hesabınız deaktive edildi.')
      await logout()
      navigate('/')
    } catch (err) {
      const mapped = { ...fieldFromMessage(err, MESSAGE_FIELDS), ...fieldErrorsFrom(err) }
      if (!v.applyServerErrors(mapped)) showError(err.message || 'Hesap deaktive edilemedi.')
      setDeactivating(false)
    }
  }

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ p: 2.5, pt: 0.5 }}>
      <Alert severity="warning" sx={{ mb: 0 }}>
        <Stack spacing={1.5}>
          <Typography variant="body2">
            Hesabını deaktive edersen oturumun hemen kapatılır ve tekrar giriş
            yapamazsın. Verilerin silinmez - hesabını yeniden aktifleştirmek
            istersen destek ekibimizle iletişime geçmen yeterli (şu an kendi
            kendine yeniden aktifleştirme seçeneği yok).
          </Typography>
          <PasswordField
            label="Şifreni gir" value={password} autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
            {...v.field('password')} helperText={v.error('password')}
            fullWidth required size="small"
            slotProps={{ htmlInput: { enterKeyHint: 'done', 'data-testid': 'deactivate-account-password' } }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button type="submit" variant="contained" color="error" disabled={deactivating}>
              {deactivating ? <CircularProgress size={14} color="inherit" /> : 'Evet, Deaktive Et'}
            </Button>
            <Button onClick={onCancel} disabled={deactivating}>Vazgeç</Button>
          </Stack>
        </Stack>
      </Alert>
    </Box>
  )
}
