import { useEffect, useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
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
    // Kök neden (mobil tasarım hatası): önceden bir Stack(row, flexWrap)
    // içinde flex: '1 1 200px' idi - 5 kart 200px tabanla dar bir ekranda
    // 2'şer sarıyor ama son kart TEK başına kalıp flex-grow:1 ile satırın
    // tamamına gerilip diğerleriyle uyumsuz/"kayık" görünüyordu. Ayrıca
    // width/minWidth sınırlaması olmadığı için büyük bir sayı (value) kartı
    // kendi hücresinin dışına taşırabiliyordu (bkz. ContentTab.jsx
    // ContentCard'daki aynı width/minWidth/overflow üçlüsü). Artık
    // DashboardTab'daki CSS Grid sabit sütun sayısı veriyor - hiçbir kart
    // yalnız kalıp gerilmiyor.
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: 'background.paper',
        border: '1px solid', borderColor: highlight ? `${color}.main` : 'divider',
        display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 },
        width: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, borderRadius: 2.5, flexShrink: 0,
          display: 'grid', placeItems: 'center',
          background: (t) => `linear-gradient(135deg, ${t.palette[color].main}33, ${t.palette[color].main}14)`,
          color: `${color}.main`
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.25, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {value ?? '—'}
        </Typography>
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
      {/* Sabit sütun sayılı CSS Grid - flex+flexWrap'in aksine son satırdaki
          "yetim" kart asla satırın tamamına gerilip diğerleriyle uyumsuz
          görünmüyor (bkz. StatCard yorumu). xs: 2 sütun, sm: 3, md+: 5 -
          5 kart md+ ekranda tek satıra tam sığıyor. */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(5, 1fr)'
          }
        }}
      >
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
      </Box>
    </Box>
  )
}
