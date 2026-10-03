import { useEffect, useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import {
  ArrowForwardRounded, ChatBubbleOutlineRounded, DescriptionOutlined, FlagOutlined, GroupsRounded, PeopleAltRounded
} from '@mui/icons-material'
import { useNotification } from '../../../context/NotificationContext.jsx'
import { getAdminStats, listDiseaseGroups } from '../../../services/api.js'
import { AdminLoading } from '../AdminUi.jsx'

// Genel bakış: dört sayı + tek bir "şimdi yapılacak" kartı. Dashboard'un
// işi bilgi vermek değil moderatörü doğru sekmeye yönlendirmek; bu yüzden
// bekleyen şikayet, istatistik kutusu değil eylem kartı olarak ayrılıyor.
function StatTile({ label, value, icon, onClick }) {
  const Icon = icon
  const clickable = typeof onClick === 'function'
  return (
    <Box
      component={clickable ? 'button' : 'div'}
      onClick={onClick}
      sx={{
        textAlign: 'left', font: 'inherit', color: 'inherit',
        p: { xs: 1.75, sm: 2 }, borderRadius: 3, bgcolor: 'background.paper',
        border: '1px solid', borderColor: 'divider',
        display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0,
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': clickable ? { borderColor: 'text.secondary' } : undefined,
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
        <Icon sx={{ fontSize: 18 }} />
        <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{label}</Typography>
      </Stack>
      <Typography variant="h4" component="div" sx={{ fontWeight: 700, lineHeight: 1, fontSize: { xs: '1.75rem', sm: '2rem' }, fontVariantNumeric: 'tabular-nums' }}>
        {value ?? '—'}
      </Typography>
    </Box>
  )
}

export default function DashboardTab({ token, onGo }) {
  const [stats, setStats] = useState(null)
  const [groupCount, setGroupCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useNotification()

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all([
      getAdminStats(token),
      // İkincil veri: başarısız olursa '—' gösterilir, dashboard bozulmaz.
      listDiseaseGroups(token).catch(() => [])
    ])
      .then(([statsRes, groups]) => {
        if (!alive) return
        setStats(statsRes)
        setGroupCount(Array.isArray(groups) ? groups.length : null)
      })
      .catch(err => { if (alive) showError(err.message || 'İstatistikler alınamadı.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [token, showError])

  if (loading) return <AdminLoading />

  const pending = stats?.pendingReports ?? 0
  const fmt = (n) => (n == null ? null : new Intl.NumberFormat('tr-TR').format(n))

  return (
    <Stack spacing={2}>
      {/* Şimdi yapılacak */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 }, borderRadius: 3,
          border: '1px solid', borderColor: pending > 0 ? 'warning.main' : 'divider',
          bgcolor: pending > 0 ? (t) => `${t.palette.warning.main}14` : 'background.paper',
          display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap'
        }}
      >
        <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: (t) => `${t.palette.warning.main}22`, color: 'warning.main' }}>
          <FlagOutlined />
        </Box>
        <Box sx={{ flex: 1, minWidth: 160 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {pending > 0 ? `${pending} şikayet inceleme bekliyor` : 'Bekleyen şikayet yok'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {pending > 0 ? 'Topluluğun güveni için 24 saat içinde yanıt hedefi.' : 'Harika - moderasyon kuyruğu temiz.'}
          </Typography>
        </Box>
        {pending > 0 && (
          <Button variant="contained" color="warning" endIcon={<ArrowForwardRounded />} onClick={() => onGo?.('reports')} sx={{ minHeight: 44, flexShrink: 0 }}>
            İncele
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' } }}>
        <StatTile label="Toplam Kayıtlı Kişi" value={fmt(stats?.totalUsers)} icon={PeopleAltRounded} onClick={() => onGo?.('users')} />
        <StatTile label="Toplam Gönderi" value={fmt(stats?.totalPosts)} icon={DescriptionOutlined} onClick={() => onGo?.('content')} />
        <StatTile label="Toplam Yorum" value={fmt(stats?.totalComments)} icon={ChatBubbleOutlineRounded} onClick={() => onGo?.('content')} />
        <StatTile label="Hastalık Grubu" value={fmt(groupCount)} icon={GroupsRounded} onClick={() => onGo?.('groups')} />
      </Box>
    </Stack>
  )
}
