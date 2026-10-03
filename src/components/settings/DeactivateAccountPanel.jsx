import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { deactivateAccount } from '../../services/api.js'

// Hesabı deaktive etme onayı (geri alınabilir, destek üzerinden).
export default function DeactivateAccountPanel({ onCancel }) {
  const { token, logout } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()
  const [deactivating, setDeactivating] = useState(false)

  const deactivate = async () => {
    setDeactivating(true)
    try {
      await deactivateAccount(token)
      showSuccess('Hesabınız deaktive edildi.')
      await logout()
      navigate('/')
    } catch (err) {
      showError(err.message || 'Hesap deaktive edilemedi.')
      setDeactivating(false)
    }
  }

  return (
    <Box sx={{ p: 2.5, pt: 0.5 }}>
      <Alert severity="warning" sx={{ mb: 0 }}>
        <Stack spacing={1.5}>
          <Typography variant="body2">
            Hesabını deaktive edersen oturumun hemen kapatılır ve tekrar giriş
            yapamazsın. Verilerin silinmez - hesabını yeniden aktifleştirmek
            istersen destek ekibimizle iletişime geçmen yeterli (şu an kendi
            kendine yeniden aktifleştirme seçeneği yok).
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="contained" color="error" size="small" onClick={deactivate} disabled={deactivating}>
              {deactivating ? <CircularProgress size={14} color="inherit" /> : 'Evet, Deaktive Et'}
            </Button>
            <Button size="small" onClick={onCancel} disabled={deactivating}>Vazgeç</Button>
          </Stack>
        </Stack>
      </Alert>
    </Box>
  )
}
