import { useState } from 'react'
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Şikayet için ortak dialog: post ya da yorum, tek bir bileşenle karşılanıyor.
// PostDetail.jsx'ten taşındı (bkz. clean-code audit).
export default function ReportDialog({ open, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState('')
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const handleClose = () => {
    if (submitting) return
    setReason('')
    onClose()
  }

  const handleSubmit = async () => {
    await onSubmit(reason.trim() || null)
    setReason('')
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth fullScreen={fullScreen}>
      <DialogTitle>İçeriği Şikayet Et</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Bu içeriği neden şikayet ettiğinizi kısaca belirtebilirsiniz (opsiyonel).
        </DialogContentText>
        <TextField
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Örn. uygunsuz içerik, yanlış bilgi..."
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
