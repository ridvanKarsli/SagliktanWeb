import { useEffect, useState } from 'react'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { ChatBubbleOutlineRounded, DescriptionOutlined, FlagOutlined, GroupsRounded, PeopleAltRounded } from '@mui/icons-material'
import { useNotification } from '../../../context/NotificationContext.jsx'
import { getAdminStats, listDiseaseGroups } from '../../../services/api.js'

// AdminPanel.jsx'ten ayrı bir dosyaya taşındı (bkz. clean-code audit) - her
// sekme kendi verisini/state'ini yönetiyor, ortak olan sadece sayfa kabuğu
// (bkz. AdminPanel.jsx).

// Renk adı MUI theme palette anahtarına karşılık geliyor (ör. 'warning' ->
// theme.palette.warning.main) - StatCard'ın arka plan/ikon rengini buradan
// türetiyoruz ki bekleyen şikayet gibi "dikkat çekmesi gereken" kartlar
// diğerlerinden görsel olarak ayrışsın.
function StatCard({ label, value, icon, color = 'primary', highlight = false }) {
  return (
    <Box
      sx={{
        flex: '1 1 200px', p: 2.5, borderRadius: 3, bgcolor: 'background.paper',
        border: '1px solid', borderColor: highlight ? `${color}.main` : 'divider',
        display: 'flex', alignItems: 'center', gap: 2
      }}
    >
      <Box
        sx={{
          width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
          display: 'grid', placeItems: 'center',
          background: (t) => `linear-gradient(135deg, ${t.palette[color].main}33, ${t.palette[color].main}14)`,
          color: `${color}.main`
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.25 }}>{value ?? '—'}</Typography>
      </Box>
    </Box>
  )
}

export default function DashboardTab({ token }) {
  const [stats, setStats] = useState(null)
  const [groupCount, setGroupCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useNotification()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAdminStats(token),
      // İkincil veri: sadece "Hastalık Grubu" kart sayısı için kullanılıyor,
      // başarısız olursa kart '—' gösterir, tüm dashboard'u bozmasın diye
      // ayrı yutuluyor (bkz. api.js hata yutma konvansiyonu).
      listDiseaseGroups(token).catch(() => [])
    ])
      .then(([statsRes, groups]) => {
        setStats(statsRes)
        setGroupCount(Array.isArray(groups) ? groups.length : null)
      })
      .catch(err => showError(err.message || 'İstatistikler alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, showError])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>

  const pending = stats?.pendingReports ?? 0

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Platformun genel durumuna hızlı bir bakış.
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={2}>
        <StatCard label="Toplam Kayıtlı Kişi" value={stats?.totalUsers} icon={<PeopleAltRounded />} color="primary" />
        <StatCard label="Toplam Gönderi" value={stats?.totalPosts} icon={<DescriptionOutlined />} color="secondary" />
        <StatCard label="Toplam Yorum" value={stats?.totalComments} icon={<ChatBubbleOutlineRounded />} color="secondary" />
        <StatCard label="Hastalık Grubu" value={groupCount} icon={<GroupsRounded />} color="primary" />
        <StatCard
          label="Bekleyen Şikayet"
          value={pending}
          icon={<FlagOutlined />}
          color={pending > 0 ? 'warning' : 'success'}
          highlight={pending > 0}
        />
      </Stack>
    </Box>
  )
}
