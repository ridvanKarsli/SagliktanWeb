import { useCallback, useEffect, useState } from 'react'
import {
  Box, Button, Chip, CircularProgress, MenuItem, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useNotification } from '../../../context/NotificationContext.jsx'
import { useConfirm } from '../../../context/ConfirmContext.jsx'
import { listAdminReports, resolveAdminReport } from '../../../services/api.js'

// AdminPanel.jsx'ten ayrı bir dosyaya taşındı (bkz. clean-code audit).

const REPORT_STATUS_LABEL = { PENDING: 'Bekliyor', REVIEWED: 'İncelendi', REJECTED: 'Reddedildi' }
const REPORT_STATUS_COLOR = { PENDING: 'warning', REVIEWED: 'success', REJECTED: 'default' }

function ReportActions({ r, actingId, act, deleteContent }) {
  if (r.status !== 'PENDING') return null
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Button size="small" disabled={actingId === r.id} onClick={() => act(r.id, 'REVIEWED')}>
        İncelendi
      </Button>
      <Button size="small" color="inherit" disabled={actingId === r.id} onClick={() => act(r.id, 'REJECTED')}>
        Reddet
      </Button>
      <Button size="small" color="error" disabled={actingId === r.id} onClick={() => deleteContent(r)}>
        İçeriği Sil
      </Button>
    </Stack>
  )
}

function ReportCard({ r, actingId, act, deleteContent }) {
  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
        <Chip size="small" label={r.targetType === 'POST' ? 'Gönderi' : 'Yorum'} />
        <Chip size="small" label={REPORT_STATUS_LABEL[r.status] || r.status} color={REPORT_STATUS_COLOR[r.status] || 'default'} />
      </Stack>
      <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word' }}>{r.targetPreview}</Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        Sahibi: {r.targetOwnerName || '—'}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: r.reason ? 0.5 : 1.5 }}>
        Şikayet Eden: {r.reporterName}
      </Typography>
      {r.reason && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1.5, wordBreak: 'break-word' }}>
          Sebep: {r.reason}
        </Typography>
      )}
      <ReportActions r={r} actingId={actingId} act={act} deleteContent={deleteContent} />
    </Box>
  )
}

export default function ReportsTab({ token }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [status, setStatus] = useState('PENDING')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState(null)
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()

  const load = useCallback(() => {
    setLoading(true)
    listAdminReports(token, { status: status || undefined, size: 50 })
      .then(res => setReports(Array.isArray(res?.content) ? res.content : []))
      .catch(err => showError(err.message || 'Şikayetler alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, status, showError])

  useEffect(() => { load() }, [load])

  const act = async (id, newStatus, deleteContent = false) => {
    setActingId(id)
    try {
      await resolveAdminReport(token, id, newStatus, deleteContent)
      showSuccess(deleteContent ? 'İçerik silindi.' : 'Şikayet güncellendi.')
      load()
    } catch (err) {
      showError(err.message || 'Şikayet güncellenemedi.')
    } finally {
      setActingId(null)
    }
  }

  const deleteContent = async (r) => {
    const label = r.targetType === 'POST' ? 'gönderiyi' : 'yorumu'
    const ok = await confirm(`Bu ${label} kalıcı olarak silmek istiyor musun? Bu işlem geri alınamaz.`, { title: 'İçeriği sil' })
    if (!ok) return
    act(r.id, 'REVIEWED', true)
  }

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        select size="small" label="Durum" value={status}
        onChange={e => setStatus(e.target.value)}
        sx={{ width: 200, mb: 2 }}
      >
        <MenuItem value="">Tümü</MenuItem>
        <MenuItem value="PENDING">Bekliyor</MenuItem>
        <MenuItem value="REVIEWED">İncelendi</MenuItem>
        <MenuItem value="REJECTED">Reddedildi</MenuItem>
      </TextField>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {reports.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Kayıt yok.</Typography>
          )}
          {reports.map(r => (
            <ReportCard key={r.id} r={r} actingId={actingId} act={act} deleteContent={deleteContent} />
          ))}
        </Stack>
      ) : (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}>
          {/* minWidth: table-layout:auto olduğu için, dar viewport'larda
              tarayıcı Aksiyon sütunundaki 3 butona yer açmak için İçerik/Sebep
              sütunlarını maxWidth'in çok altına sıkıştırıp her kelimeyi/harfi
              tek tek satıra bölüyordu (okunmuyordu). minWidth vererek tablo
              artık gerektiğinde TableContainer içinde yatay kayıyor, sütunlar
              kendi doğal genişliğini koruyor. */}
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Tür</TableCell>
                <TableCell>İçerik</TableCell>
                <TableCell>Sahibi</TableCell>
                <TableCell>Şikayet Eden</TableCell>
                <TableCell>Sebep</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">Aksiyon</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">Kayıt yok.</TableCell></TableRow>
              )}
              {reports.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.targetType === 'POST' ? 'Gönderi' : 'Yorum'}</TableCell>
                  <TableCell sx={{ maxWidth: 240, whiteSpace: 'normal', wordBreak: 'break-word' }}>{r.targetPreview}</TableCell>
                  <TableCell>{r.targetOwnerName || '—'}</TableCell>
                  <TableCell>{r.reporterName}</TableCell>
                  <TableCell sx={{ maxWidth: 160, whiteSpace: 'normal', wordBreak: 'break-word' }}>{r.reason || '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={REPORT_STATUS_LABEL[r.status] || r.status} color={REPORT_STATUS_COLOR[r.status] || 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <ReportActions r={r} actingId={actingId} act={act} deleteContent={deleteContent} />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
