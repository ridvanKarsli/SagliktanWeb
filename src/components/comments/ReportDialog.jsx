import { useState } from 'react'
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Gönderi, yorum, mesaj ve kullanıcı şikayetleri için ortak dialog. Gerekçe
// isteğe bağlı; gönderim sürerken dialog kapatılamaz ve hata olursa yazılan
// metin korunur (bkz. useReportDialog).
export default function ReportDialog({
  open, onClose, onSubmit, submitting,
  title = 'İçeriği Şikayet Et',
  description = 'Bu içeriği neden şikayet ettiğinizi kısaca belirtebilirsiniz (opsiyonel).',
  placeholder = 'Örn. uygunsuz içerik, yanlış bilgi...'
}) {
  const [reason, setReason] = useState('')
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const handleClose = () => {
    if (submitting) return
    setReason('')
    onClose()
  }

  const handleSubmit = async () => {
    const ok = await onSubmit(reason.trim() || null)
    if (ok !== false) setReason('')
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      fullScreen={fullScreen}
      // Dialog bir portal ama React olayları bileşen ağacında kabarcıklanır:
      // tıklanabilir bir kartın içinden açıldığında karttaki onClick'i
      // tetiklemesin.
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        <TextField
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder={placeholder}
          multiline
          minRows={2}
          fullWidth
          inputProps={{ maxLength: 500 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>Vazgeç</Button>
        <Button variant="contained" color="error" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <CircularProgress size={16} color="inherit" /> : 'Şikayet Et'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
