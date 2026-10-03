import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PasswordField from '../PasswordField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { deleteAccount } from '../../services/api.js'

// Hesabı kalıcı silme (anonimleştirme) - şifre teyidi ister, geri alınamaz.
export default function DeleteAccountPanel({ onCancel }) {
  const { token, logout } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!password) { showError('Şifreni gir.'); return }
    setDeleting(true)
    try {
      await deleteAccount(token, password)
      showSuccess('Hesabınız silindi.')
      await logout()
      navigate('/')
    } catch (err) {
      showError(err.message || 'Hesap silinemedi.')
      setDeleting(false)
    }
  }

  return (
    <Box component="form" onSubmit={submit} sx={{ p: 2.5, pt: 0.5 }}>
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
            fullWidth required size="small"
            slotProps={{ htmlInput: { 'data-testid': 'delete-account-password' } }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button type="submit" variant="contained" color="error" size="small" disabled={deleting}>
              {deleting ? <CircularProgress size={14} color="inherit" /> : 'Evet, Hesabımı Sil'}
            </Button>
            <Button size="small" onClick={onCancel} disabled={deleting}>Vazgeç</Button>
          </Stack>
        </Stack>
      </Alert>
    </Box>
  )
}
