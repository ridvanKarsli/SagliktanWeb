import { useState } from 'react'
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { CheckRounded, CloseRounded, DeleteOutline, FlagOutlined, OpenInNewRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../../context/NotificationContext.jsx'
import { useConfirm } from '../../../context/ConfirmContext.jsx'
import { listAdminReports, resolveAdminReport } from '../../../services/api.js'
import { usePaginatedList } from '../../../hooks/usePaginatedList.js'
import { relativeTime } from '../../../utils/format.js'
import { AdminCard, AdminEmpty, AdminList, AdminLoading, LoadMoreButton, MetaRow, SegmentedFilter } from '../AdminUi.jsx'

const STATUS = { PENDING: { label: 'Bekliyor', color: 'warning' }, REVIEWED: { label: 'İncelendi', color: 'success' }, REJECTED: { label: 'Reddedildi', color: 'default' } }
const TARGET = { POST: 'Gönderi', COMMENT: 'Yorum', MESSAGE: 'Mesaj', USER: 'Kullanıcı' }

function targetHref(r) {
  if (r.targetType === 'POST') return `/post/${r.targetId}`
  if (r.targetType === 'USER') return `/users/${r.targetId}`
  return null
}

function ReportCard({ r, actingId, act, deleteContent }) {
  const navigate = useNavigate()
  const busy = actingId === r.id
  const st = STATUS[r.status] || { label: r.status, color: 'default' }
  const href = targetHref(r)
  const pending = r.status === 'PENDING'

  return (
    <AdminCard sx={{ opacity: pending ? 1 : 0.85 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Chip size="small" label={TARGET[r.targetType] || r.targetType} variant="outlined" sx={{ fontWeight: 600 }} />
        <Chip size="small" label={st.label} color={st.color} sx={{ fontWeight: 600 }} />
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>{relativeTime(r.createdAt)}</Typography>
      </Stack>

      {/* Şikayet edilen içerik: alıntı gibi ayrışsın */}
      <Box sx={{ pl: 1.5, borderLeft: '3px solid', borderColor: 'divider', mb: 1.25 }}>
        <Typography
          variant="body2"
          sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {r.targetPreview || <em>Önizleme yok</em>}
        </Typography>
      </Box>

      <Stack spacing={0.5} sx={{ mb: pending ? 1.5 : 0 }}>
        {r.reason && <MetaRow label="Sebep"><strong>{r.reason}</strong></MetaRow>}
        <MetaRow label="Sahibi">{r.targetOwnerName || '—'}</MetaRow>
        <MetaRow label="Bildiren">{r.reporterName}</MetaRow>
        {!pending && r.resolvedByName && <MetaRow label="Çözen">{r.resolvedByName}</MetaRow>}
      </Stack>

      {pending && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button
            size="small" variant="contained" disableElevation
            startIcon={<CheckRounded />} disabled={busy}
            onClick={() => act(r.id, 'REVIEWED')} sx={{ minHeight: 40 }}
          >
            İncelendi
          </Button>
          <Button
            size="small" color="inherit" startIcon={<CloseRounded />} disabled={busy}
            onClick={() => act(r.id, 'REJECTED')} sx={{ minHeight: 40, color: 'text.secondary' }}
          >
            Reddet
          </Button>
          {/* USER şikayetinde silinecek tek bir içerik yok; hesap aksiyonu
              Kullanıcılar sekmesinde bilinçli ayrı bir akış. */}
          {r.targetType !== 'USER' && (
            <Button
              size="small" color="error"
              startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <DeleteOutline />}
              disabled={busy} onClick={() => deleteContent(r)} sx={{ minHeight: 40 }}
            >
              İçeriği Sil
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          {href && (
            <Button
              size="small" endIcon={<OpenInNewRounded sx={{ fontSize: 16 }} />}
              onClick={() => navigate(href)} sx={{ minHeight: 40, color: 'text.secondary' }}
            >
              Aç
            </Button>
          )}
        </Stack>
      )}
    </AdminCard>
  )
}

export default function ReportsTab({ token }) {
  const [status, setStatus] = useState('PENDING')
  const [actingId, setActingId] = useState(null)
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()

  const {
    items: reports, loading, loadingMore, last, totalCount, loadMore, reload: load,
  } = usePaginatedList(
    (pageNum) => listAdminReports(token, { status: status || undefined, page: pageNum, size: 30 }),
    { deps: [token, status], onError: (err) => showError(err.message || 'Şikayetler alınamadı.') }
  )

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
    const label = { POST: 'gönderiyi', COMMENT: 'yorumu', MESSAGE: 'mesajı' }[r.targetType] || 'içeriği'
    const ok = await confirm(`Bu ${label} kalıcı olarak silmek istiyor musun? Bu işlem geri alınamaz.`, { title: 'İçeriği sil' })
    if (!ok) return
    act(r.id, 'REVIEWED', true)
  }

  return (
    <Stack spacing={2}>
      <SegmentedFilter
        ariaLabel="Şikayet durumu"
        value={status}
        onChange={setStatus}
        options={[
          { value: 'PENDING', label: 'Bekleyen' },
          { value: 'REVIEWED', label: 'İncelenen' },
          { value: 'REJECTED', label: 'Reddedilen' },
          { value: '', label: 'Tümü' },
        ]}
      />

      {loading ? <AdminLoading /> : reports.length === 0 ? (
        <AdminEmpty
          icon={FlagOutlined}
          title={status === 'PENDING' ? 'Bekleyen şikayet yok' : 'Bu filtrede kayıt yok'}
          description={status === 'PENDING' ? 'Yeni bir şikayet geldiğinde burada görünür.' : undefined}
        />
      ) : (
        <AdminList>
          {reports.map(r => <ReportCard key={r.id} r={r} actingId={actingId} act={act} deleteContent={deleteContent} />)}
        </AdminList>
      )}

      {!loading && !last && (
        <LoadMoreButton loading={loadingMore} shown={reports.length} total={totalCount} onClick={loadMore} noun="şikayet" />
      )}
    </Stack>
  )
}
