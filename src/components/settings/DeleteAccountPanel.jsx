import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PasswordField from '../PasswordField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { deleteAccount } from '../../services/api.js'
import { useFormValidation } from '../../hooks/useFormValidation.js'
import { currentPasswordError, fieldErrorsFrom, fieldFromMessage } from '../../utils/validation.js'

const validate = (f) => ({ password: currentPasswordError(f.password) })
const MESSAGE_FIELDS = [[/şifre/i, 'password']]

// Hesabı kalıcı silme (anonimleştirme) - şifre teyidi ister, geri alınamaz.
export default function DeleteAccountPanel({ onCancel }) {
  const { token, logout } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const v = useFormValidation({ password }, validate)

  const submit = async (e) => {
    e.preventDefault()
    if (deleting || !v.validateAll()) return
    setDeleting(true)
    try {
      await deleteAccount(token, password)
      showSuccess('Hesabınız silindi.')
      await logout()
      navigate('/')
    } catch (err) {
      const mapped = { ...fieldFromMessage(err, MESSAGE_FIELDS), ...fieldErrorsFrom(err) }
      if (!v.applyServerErrors(mapped)) showError(err.message || 'Hesap silinemedi.')
      setDeleting(false)
    }
  }

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ p: 2.5, pt: 0.5 }}>
      <Alert severity="error" sx={{ mb: 0 }}>
        <Stack spacing={1.5}>
          <Typography variant="body2">
            Hesabını silersen kimlik bilgilerin (ad, soyad, e-posta) kalıcı olarak
            anonimleştirilir ve oturumun kapatılır. Bu işlem GERİ ALINAMAZ.
            Gönderi/yorumların, topluluk tartışmaları bozulmasın diye kaldırılmadan
            kalır ama artık sana ait görünmez.
          </Typography>
          <PasswordField
            label="Şifreni gir" value={password} autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
            {...v.field('password')} helperText={v.error('password')}
            fullWidth required size="small"
            slotProps={{ htmlInput: { enterKeyHint: 'done', 'data-testid': 'delete-account-password' } }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button type="submit" variant="contained" color="error" disabled={deleting}>
              {deleting ? <CircularProgress size={14} color="inherit" /> : 'Evet, Hesabımı Sil'}
            </Button>
            <Button onClick={onCancel} disabled={deleting}>Vazgeç</Button>
          </Stack>
        </Stack>
      </Alert>
    </Box>
  )
}
