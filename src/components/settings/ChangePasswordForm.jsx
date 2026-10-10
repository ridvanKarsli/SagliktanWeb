import { useState } from 'react'
import { Box, Button, CircularProgress, Stack } from '@mui/material'
import PasswordField from '../PasswordField.jsx'
import PasswordStrengthMeter from '../PasswordStrengthMeter.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { changePassword } from '../../services/api.js'
import { useFormValidation } from '../../hooks/useFormValidation.js'
import {
  LIMITS, confirmPasswordError, currentPasswordError, fieldErrorsFrom, fieldFromMessage, newPasswordError
} from '../../utils/validation.js'

const validate = (f) => ({
  currentPassword: currentPasswordError(f.currentPassword),
  newPassword: newPasswordError(f.newPassword, { current: f.currentPassword }),
  confirmPassword: confirmPasswordError(f.confirmPassword, f.newPassword),
})
const MESSAGE_FIELDS = [[/mevcut şifre/i, 'currentPassword']]

// Şifre değiştirme formu. onDone: başarı ya da iptal sonrası paneli kapatmak için.
export default function ChangePasswordForm({ onDone }) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [fields, setFields] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const v = useFormValidation(fields, validate)
  const set = (key) => (e) => setFields(f => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (saving || !v.validateAll()) return
    setSaving(true)
    try {
      await changePassword(token, { currentPassword: fields.currentPassword, newPassword: fields.newPassword })
      showSuccess('Şifre değiştirildi.')
      onDone()
    } catch (err) {
      const mapped = { ...fieldFromMessage(err, MESSAGE_FIELDS), ...fieldErrorsFrom(err) }
      if (!v.applyServerErrors(mapped)) showError(err.message || 'Şifre değiştirilemedi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ p: 2.5, pt: 0.5 }}>
      <Stack spacing={2}>
        <PasswordField
          label="Mevcut Şifre" value={fields.currentPassword} autoComplete="current-password"
          onChange={set('currentPassword')} {...v.field('currentPassword')} helperText={v.error('currentPassword')}
          fullWidth required slotProps={{ htmlInput: { enterKeyHint: 'next' } }}
        />
        <Box>
          <PasswordField
            label="Yeni Şifre" value={fields.newPassword} autoComplete="new-password"
            onChange={set('newPassword')} {...v.field('newPassword')}
            helperText={v.error('newPassword') || `En az ${LIMITS.PASSWORD_MIN} karakter`}
            fullWidth required slotProps={{ htmlInput: { enterKeyHint: 'next' } }}
          />
          <Box sx={{ mt: 1 }}>
            <PasswordStrengthMeter password={fields.newPassword} />
          </Box>
        </Box>
        <PasswordField
          label="Yeni Şifre (Tekrar)" value={fields.confirmPassword} autoComplete="new-password"
          onChange={set('confirmPassword')} {...v.field('confirmPassword')} helperText={v.error('confirmPassword')}
          fullWidth required slotProps={{ htmlInput: { enterKeyHint: 'done' } }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={16} color="inherit" /> : 'Şifreyi Değiştir'}
          </Button>
          <Button onClick={onDone} disabled={saving}>İptal</Button>
        </Stack>
      </Stack>
    </Box>
  )
}
