import { useState } from 'react'
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { LIMITS, clampLength, cleanText, counterText } from '../../utils/validation.js'
import SlideUp from '../shell/SlideUp.jsx'

// Gönderi, yorum, mesaj ve kullanıcı şikayetleri için ortak dialog. Gerekçe
// isteğe bağlı; gönderim sürerken dialog kapatılamaz ve hata olursa yazılan
// metin korunur (bkz. useReportDialog).
export default function ReportDialog({
  open, onClose, onSubmit, submitting,
  title = 'İçeriği Şikayet Et',
  description = 'Bu içerikte seni rahatsız eden ne? Kısaca yazarsan inceleyen ekip durumu daha iyi anlar; yazmak zorunda değilsin.',
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
    if (submitting) return
    // Yalnızca boşluktan oluşan açıklama "açıklama yok" (null) sayılır.
    const ok = await onSubmit(cleanText(reason) || null)
    if (ok !== false) setReason('')
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      fullScreen={fullScreen}
      slots={fullScreen ? { transition: SlideUp } : undefined}
      // Dialog bir portal ama React olayları bileşen ağacında kabarcıklanır:
      // tıklanabilir bir kartın içinden açıldığında karttaki onClick'i
      // tetiklemesin.
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle sx={{ pt: fullScreen ? 'calc(env(safe-area-inset-top) + 20px)' : undefined }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        <TextField
          value={reason}
          onChange={e => setReason(clampLength(e.target.value, LIMITS.REPORT_REASON_MAX))}
          placeholder={placeholder}
          multiline
          minRows={2}
          maxRows={8}
          fullWidth
          helperText={counterText(reason, LIMITS.REPORT_REASON_MAX) || undefined}
          inputProps={{ maxLength: LIMITS.REPORT_REASON_MAX, autoCapitalize: 'sentences', 'aria-label': 'Şikayet açıklaması' }}
          slotProps={{ formHelperText: { sx: { textAlign: 'right', mr: 0 } } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: fullScreen ? 'calc(env(safe-area-inset-bottom) + 16px)' : 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={submitting}>Vazgeç</Button>
        <Button variant="contained" color="error" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <CircularProgress size={16} color="inherit" /> : 'Şikayet Et'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
