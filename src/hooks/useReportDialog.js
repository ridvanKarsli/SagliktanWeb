import { useCallback, useState } from 'react'
import { useNotification } from '../context/NotificationContext.jsx'

// Şikayet akışının ortak durumu: hangi hedef şikayet ediliyor, gönderim
// sürüyor mu, başarı/hata bildirimi. sendReport(target, reason) asıl API
// çağrısını yapar (gönderi, yorum, mesaj ya da kullanıcı).
//
// Kullanım:
//   const report = useReportDialog((id, reason) => reportPost(token, id, reason))
//   report.open(post.id)
//   <ReportDialog {...report.dialogProps} />
export function useReportDialog(sendReport) {
  const { showError, showSuccess } = useNotification()
  const [target, setTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const close = useCallback(() => setTarget(null), [])

  const submit = async (reason) => {
    setSubmitting(true)
    try {
      await sendReport(target, reason)
      showSuccess('Şikayetiniz alındı, teşekkür ederiz.')
      setTarget(null)
      return true
    } catch (err) {
      showError(err.message || 'Şikayet gönderilemedi.')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return {
    open: setTarget,
    dialogProps: { open: target != null, onClose: close, onSubmit: submit, submitting }
  }
}
