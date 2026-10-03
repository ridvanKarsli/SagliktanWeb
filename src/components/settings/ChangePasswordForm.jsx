import { useState } from 'react'
import { Box, Button, CircularProgress, Stack } from '@mui/material'
import PasswordField from '../PasswordField.jsx'
import PasswordStrengthMeter from '../PasswordStrengthMeter.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { changePassword } from '../../services/api.js'

const PASSWORD_MIN_LENGTH = 8

// Şifre değiştirme formu. onDone: başarı ya da iptal sonrası paneli kapatmak için.
export default function ChangePasswordForm({ onDone }) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!currentPassword) { showError('Mevcut şifreni gir.'); return }
    if (newPassword.length < PASSWORD_MIN_LENGTH) { showError('Yeni şifre en az 8 karakter olmalı.'); return }
    setSaving(true)
    try {
      await changePassword(token, { currentPassword, newPassword })
      showSuccess('Şifre değiştirildi.')
      onDone()
    } catch (err) {
      showError(err.message || 'Şifre değiştirilemedi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box component="form" onSubmit={submit} sx={{ p: 2.5, pt: 0.5 }}>
      <Stack spacing={2}>
        <PasswordField
          label="Mevcut Şifre" value={currentPassword} autoComplete="current-password"
          onChange={e => setCurrentPassword(e.target.value)} fullWidth required size="small"
        />
        <Box>
          <PasswordField
            label="Yeni Şifre" value={newPassword} autoComplete="new-password"
            onChange={e => setNewPassword(e.target.value)} fullWidth required size="small"
            helperText="En az 8 karakter"
          />
          <Box sx={{ mt: 1 }}>
            <PasswordStrengthMeter password={newPassword} />
          </Box>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button type="submit" variant="contained" size="small" disabled={saving}>
            {saving ? <CircularProgress size={16} color="inherit" /> : 'Şifreyi Değiştir'}
          </Button>
          <Button size="small" onClick={onDone} disabled={saving}>İptal</Button>
        </Stack>
      </Stack>
    </Box>
  )
}
