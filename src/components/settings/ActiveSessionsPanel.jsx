import { useState } from 'react'
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import LazyListPanel from './LazyListPanel.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import { useLazyResource } from '../../hooks/useLazyResource.js'
import { listSessions, revokeSession } from '../../services/api.js'
import { prettyDate } from '../../utils/format.js'

// Hangi cihazlarda oturum açık + diğer cihazlardaki oturumu sonlandırma.
export default function ActiveSessionsPanel() {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()
  const sessions = useLazyResource(
    () => listSessions(token).then(res => (Array.isArray(res) ? res : [])),
    { enabled: !!token }
  )
  const [revokingId, setRevokingId] = useState(null)

  const handleRevoke = async (sessionRowId) => {
    // O cihazda oturum anında düşer - geri alınamaz, bu yüzden onay istenir.
    const ok = await confirm('Bu cihazdaki oturumu sonlandırmak istiyor musun?', { title: 'Oturumu sonlandır' })
    if (!ok) return
    setRevokingId(sessionRowId)
    try {
      await revokeSession(token, sessionRowId)
      sessions.setData(prev => (prev || []).filter(s => s.id !== sessionRowId))
      showSuccess('Oturum sonlandırıldı.')
    } catch (err) {
      showError(err.message || 'Oturum sonlandırılamadı.')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <LazyListPanel
      loading={sessions.loading}
      error={sessions.error && 'Aktif oturumlar alınamadı.'}
      onRetry={sessions.reload}
      items={sessions.data}
      emptyText="Aktif oturum bulunamadı."
      renderItem={(s) => (
        <Stack key={s.id} direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.75 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{s.deviceLabel}</Typography>
              {s.current && <Chip label="Bu cihaz" size="small" color="primary" variant="outlined" sx={{ height: 20 }} />}
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Son kullanım: {prettyDate(s.lastUsedAt) || 'Bilinmiyor'}
            </Typography>
          </Box>
          {!s.current && (
            <Button
              size="small" variant="outlined" color="error"
              disabled={revokingId === s.id}
              onClick={() => handleRevoke(s.id)}
              sx={{ minHeight: 36 }}
            >
              {revokingId === s.id ? <CircularProgress size={14} color="inherit" /> : 'Çıkış Yap'}
            </Button>
          )}
        </Stack>
      )}
    />
  )
}
