import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  ArrowForwardRounded, ChatBubbleOutlineRounded, CloudOffOutlined, DescriptionOutlined, FlagOutlined,
  GroupsRounded, InsightsOutlined, PeopleAltRounded
} from '@mui/icons-material'
import { useSearchParams } from 'react-router-dom'
import { getAdminActivity, getAdminStats, listDiseaseGroups } from '../../../services/api.js'
import { radius } from '../../../design/tokens.js'
import EmptyState from '../../../components/EmptyState.jsx'
import ChartCard from '../../../components/charts/ChartCard.jsx'
import LineChart from '../../../components/charts/LineChart.jsx'
import ColumnChart from '../../../components/charts/ColumnChart.jsx'
import StackedBarList from '../../../components/charts/StackedBarList.jsx'
import StatTile from '../../../components/charts/StatTile.jsx'
import { SERIES_LABELS, useChartColors } from '../../../components/charts/chartPalette.js'
import { computeDelta } from '../../../components/charts/delta.js'
import { formatDayLong, formatDayShort, formatNumber, formatPercent } from '../../../components/charts/format.js'

// Genel bakış: önce "şimdi yapılacak" (bekleyen şikayet), sonra seçilen
// dönemin kullanım özeti (önceki eşit döneme göre değişimle), günlük
// grafikler ve en hareketli gruplar; en altta platform toplamları.
// Dönem URL'de (?gun=30) tutulur - yenileyince/paylaşınca aynı görünüm.

const PERIODS = [7, 30, 90]
const DEFAULT_DAYS = 30

// Backend LocalDate'i "2026-10-03" yazar; zaman damgası ayarı açık kalırsa
// [2026, 10, 3] gelebilir - ikisini de kabul et.
const normDate = (d) => (Array.isArray(d) ? d.map((p, i) => String(p).padStart(i ? 2 : 4, '0')).join('-') : String(d))

const ratio = (a, b) => (b > 0 ? a / b : null)

export default function DashboardTab({ token, onGo }) {
  const theme = useTheme()
  const wide = useMediaQuery(theme.breakpoints.up('md'))
  const colors = useChartColors()
  const [params, setParams] = useSearchParams()
  const requested = Number(params.get('gun'))
  const days = PERIODS.includes(requested) ? requested : DEFAULT_DAYS

  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [stats, setStats] = useState(null)
  const [groupCount, setGroupCount] = useState(null)

  // Dönem verisi. Dönem değişince eski grafik soluk hâlde yerinde kalır
  // (iskelete dönüp sayfa zıplamaz); yeni veri gelince yerine oturur.
  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)
    getAdminActivity(token, { days, signal: ctrl.signal })
      .then(res => {
        setActivity({
          ...res,
          series: (res?.series || []).map(p => ({ ...p, date: normDate(p.date) })),
          topGroups: res?.topGroups || [],
        })
      })
      .catch(err => {
        if (ctrl.signal.aborted || err?.name === 'AbortError') return
        setError(err?.message || 'Kullanım verileri alınamadı.')
      })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [token, days, attempt])

  // Toplamlar ve bekleyen şikayet: ikincil veri, alınamazsa '—'.
  useEffect(() => {
    let alive = true
    getAdminStats(token).then(s => { if (alive) setStats(s) }).catch(() => {})
    listDiseaseGroups(token)
      .then(g => { if (alive) setGroupCount(Array.isArray(g) ? g.length : null) })
      .catch(() => {})
    return () => { alive = false }
  }, [token])

  const setDays = useCallback((d) => {
    if (!d || d === days) return
    const next = new URLSearchParams(params)
    if (d === DEFAULT_DAYS) next.delete('gun'); else next.set('gun', String(d))
    setParams(next, { replace: true })
  }, [days, params, setParams])

  const pending = stats?.pendingReports ?? 0

  return (
    <Stack spacing={2.5}>
      {pending > 0 && <PendingReportsCard count={pending} onGo={() => onGo?.('reports')} />}

      <PeriodHeader days={days} onChange={setDays} activity={activity} loading={loading && !activity} />

      {!activity && loading && <DashboardSkeleton />}

      {!activity && !loading && error && (
        <ErrorBlock message={error} onRetry={() => setAttempt(a => a + 1)} />
      )}

      {activity && (
        <ActivityContent
          activity={activity}
          days={days}
          busy={loading}
          wide={wide}
          colors={colors}
          refetchError={error}
          onRetry={() => setAttempt(a => a + 1)}
          onLonger={days < 90 ? () => setDays(90) : null}
        />
      )}

      <Totals stats={stats} groupCount={groupCount} onGo={onGo} />
    </Stack>
  )
}

/* ---------- Bölümler ---------- */

function PendingReportsCard({ count, onGo }) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.25 }, borderRadius: `${radius.md}px`,
        border: '1px solid', borderColor: 'warning.main',
        bgcolor: 'brand.amberSoft',
        display: 'flex', alignItems: 'center', gap: 1.75, flexWrap: 'wrap'
      }}
    >
      <Box sx={{ width: 44, height: 44, borderRadius: `${radius.sm}px`, display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: 'brand.amberSoft', color: 'warning.main' }}>
        <FlagOutlined />
      </Box>
      <Box sx={{ flex: 1, minWidth: 170 }}>
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
          {formatNumber(count)} şikayet inceleme bekliyor
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
          Topluluğun güveni için 24 saat içinde yanıt vermeye çalışalım.
        </Typography>
      </Box>
      <Button variant="contained" color="warning" endIcon={<ArrowForwardRounded />} onClick={onGo} sx={{ minHeight: 44, flexShrink: 0 }}>
        İncele
      </Button>
    </Box>
  )
}

function PeriodHeader({ days, onChange, activity, loading }) {
  const s = activity?.series
  const range = s?.length ? `${formatDayShort(s[0].date)} – ${formatDayShort(s[s.length - 1].date)}` : null
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', rowGap: 1.25, columnGap: 2 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" component="h2" sx={{ lineHeight: 1.2 }}>Platform kullanımı</Typography>
        {(loading || range) && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, minHeight: '1.65em' }}>
            {loading ? <Skeleton width={210} /> : `${range} · önceki ${days} günle karşılaştırılıyor`}
          </Typography>
        )}
      </Box>
      <ToggleButtonGroup
        exclusive
        value={days}
        onChange={(_, v) => onChange(v)}
        aria-label="Dönem"
        size="small"
        sx={{
          p: 0.5, gap: 0.5, borderRadius: 999, bgcolor: 'brand.surfaceAlt',
          '& .MuiToggleButtonGroup-grouped': {
            border: 0, borderRadius: '999px !important', m: 0,
            px: 1.75, minHeight: 36, minWidth: 72,
            fontWeight: 800, fontSize: '0.875rem', textTransform: 'none', color: 'text.secondary',
            '&.Mui-selected': { bgcolor: 'background.paper', color: 'text.primary', boxShadow: 1 },
            '&.Mui-selected:hover': { bgcolor: 'background.paper' },
          },
        }}
      >
        {PERIODS.map(p => <ToggleButton key={p} value={p}>{p} gün</ToggleButton>)}
      </ToggleButtonGroup>
    </Box>
  )
}

function ActivityContent({ activity, days, busy, wide, colors, refetchError, onRetry, onLonger }) {
  const { series, current = {}, previous = {}, topGroups } = activity
  const c = colors.series

  const isEmpty = useMemo(() => {
    const keys = ['activeUsers', 'newUsers', 'posts', 'comments', 'reactions', 'messages']
    return keys.every(k => !current[k]) && series.every(p => keys.every(k => !p[k]))
  }, [current, series])

  // Kutucuk eğilimi ~15 noktaya iner (90 günde 6 günlük ortalamalar) - aksi
  // hâlde küçük alanda gürültüye döner. Gruplar bugünden geriye kurulur.
  const trend = (key) => {
    const vals = series.map(p => p[key] || 0)
    const size = Math.ceil(vals.length / 15)
    if (size <= 1) return vals
    const out = []
    for (let end = vals.length; end > 0; end -= size) {
      const chunk = vals.slice(Math.max(0, end - size), end)
      out.unshift(chunk.reduce((a, b) => a + b, 0) / chunk.length)
    }
    return out
  }
  const solveNow = ratio(current.questionsSolved || 0, current.questionsAsked || 0)
  const solvePrev = ratio(previous.questionsSolved || 0, previous.questionsAsked || 0)
  const chartH = wide ? 220 : 196

  const dayColumns = (keys) => [
    { key: 'date', label: 'Gün', format: (v) => formatDayLong(v) },
    ...keys.map(k => ({ key: k, label: SERIES_LABELS[k], numeric: true, format: formatNumber })),
  ]
  // Tablo en yeni gün üstte - kesin sayı arayan genelde son günlere bakar.
  const tableRows = [...series].reverse().map(p => ({ ...p, id: p.date }))

  if (isEmpty) {
    return (
      <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border', borderRadius: `${radius.md}px`, opacity: busy ? 0.55 : 1 }}>
        <EmptyState
          icon={InsightsOutlined}
          title="Bu dönemde henüz hareket yok"
          description={`Son ${days} günde giriş, gönderi ya da yorum olmadı. Topluluk canlandıkça grafikler burada belirecek.`}
          actionLabel={onLonger ? 'Son 90 güne bak' : undefined}
          onAction={onLonger || undefined}
        />
      </Box>
    )
  }

  const groupRows = [...topGroups]
    .map(g => ({ id: g.diseaseGroupId, label: g.name, posts: g.posts || 0, comments: g.comments || 0 }))
    .sort((a, b) => (b.posts + b.comments) - (a.posts + a.comments))

  return (
    <Stack spacing={2} aria-busy={busy || undefined}>
      {refetchError && (
        <Box role="alert" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', px: 1.75, py: 1, borderRadius: `${radius.sm}px`, bgcolor: 'brand.roseSoft' }}>
          <Typography variant="body2" sx={{ flex: 1, minWidth: 160, fontWeight: 600 }}>
            Yeni dönem yüklenemedi, önceki veriler gösteriliyor.
          </Typography>
          <Button size="small" onClick={onRetry}>Tekrar dene</Button>
        </Box>
      )}

      <Box
        component="section"
        aria-label="Dönem özeti"
        className="sg-stagger"
        sx={{
          display: 'grid', gap: 1.25,
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' },
          transition: 'opacity 200ms ease', opacity: busy ? 0.55 : 1,
        }}
      >
        <StatTile label="Aktif kişi" value={formatNumber(current.activeUsers)} delta={computeDelta(current.activeUsers, previous.activeUsers)} trend={{ values: trend('activeUsers'), color: c.activeUsers }} />
        <StatTile label="Yeni üye" value={formatNumber(current.newUsers)} delta={computeDelta(current.newUsers, previous.newUsers)} trend={{ values: trend('newUsers'), color: c.newUsers }} />
        <StatTile label="Gönderi" value={formatNumber(current.posts)} delta={computeDelta(current.posts, previous.posts)} trend={{ values: trend('posts'), color: c.posts }} />
        <StatTile label="Yorum" value={formatNumber(current.comments)} delta={computeDelta(current.comments, previous.comments)} trend={{ values: trend('comments'), color: c.comments }} />
        <StatTile label="Tepki" value={formatNumber(current.reactions)} delta={computeDelta(current.reactions, previous.reactions)} trend={{ values: trend('reactions'), color: colors.textSoft }} />
        <StatTile
          label="Soru çözülme oranı"
          value={solveNow == null ? '—' : formatPercent(solveNow)}
          hint={current.questionsAsked ? `${formatNumber(current.questionsSolved || 0)} / ${formatNumber(current.questionsAsked)} soru` : 'Bu dönemde soru yok'}
          delta={solveNow != null && solvePrev != null ? computeDelta(solveNow, solvePrev, { unit: 'points' }) : null}
        />
      </Box>

      <Box
        className="sg-stagger"
        sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' } }}
      >
        <ChartCard
          title="Günlük aktif kişi"
          description="Gün içinde giriş yapan, yazan, tepki veren ya da mesaj atan farklı kişi sayısı."
          busy={busy}
          table={{ columns: dayColumns(['activeUsers']), rows: tableRows }}
        >
          <LineChart
            data={series}
            series={[{ key: 'activeUsers', label: SERIES_LABELS.activeUsers, color: c.activeUsers }]}
            area
            height={chartH}
            ariaLabel={`Son ${days} günün günlük aktif kişi grafiği. Değerler için tablo görünümünü kullanabilirsin.`}
          />
        </ChartCard>

        <ChartCard
          title="Gönderi ve yorumlar"
          description="Her gün paylaşılan gönderi ve yazılan yorum sayısı."
          busy={busy}
          legend={[
            { key: 'posts', label: SERIES_LABELS.posts, color: c.posts, kind: 'line' },
            { key: 'comments', label: SERIES_LABELS.comments, color: c.comments, kind: 'line' },
          ]}
          table={{ columns: dayColumns(['posts', 'comments']), rows: tableRows }}
        >
          <LineChart
            data={series}
            series={[
              { key: 'posts', label: SERIES_LABELS.posts, color: c.posts },
              { key: 'comments', label: SERIES_LABELS.comments, color: c.comments },
            ]}
            height={chartH}
            ariaLabel={`Son ${days} günün günlük gönderi ve yorum grafiği.`}
          />
        </ChartCard>

        <ChartCard
          title="Yeni üyeler"
          description="Gün gün yeni kayıt sayısı. Üstteki sayı dönemin en yoğun günü."
          busy={busy}
          table={{ columns: dayColumns(['newUsers']), rows: tableRows }}
        >
          <ColumnChart
            data={series}
            valueKey="newUsers"
            label={SERIES_LABELS.newUsers}
            color={c.newUsers}
            height={chartH}
            ariaLabel={`Son ${days} günün günlük yeni üye grafiği.`}
          />
        </ChartCard>

        <ChartCard
          title="En hareketli gruplar"
          description="Bu dönemde en çok gönderi ve yorum alan hastalık grupları."
          busy={busy}
          legend={groupRows.length ? [
            { key: 'posts', label: SERIES_LABELS.posts, color: c.posts, kind: 'rect' },
            { key: 'comments', label: SERIES_LABELS.comments, color: c.comments, kind: 'rect' },
          ] : null}
          table={groupRows.length ? {
            columns: [
              { key: 'label', label: 'Grup' },
              { key: 'posts', label: 'Gönderi', numeric: true, format: formatNumber },
              { key: 'comments', label: 'Yorum', numeric: true, format: formatNumber },
            ],
            rows: groupRows,
          } : null}
        >
          {groupRows.length ? (
            <StackedBarList
              rows={groupRows}
              series={[
                { key: 'posts', label: SERIES_LABELS.posts, color: c.posts },
                { key: 'comments', label: SERIES_LABELS.comments, color: c.comments },
              ]}
              ariaLabel="En hareketli gruplar"
            />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
              Bu dönemde gruplarda yeni gönderi ya da yorum yok.
            </Typography>
          )}
        </ChartCard>
      </Box>
    </Stack>
  )
}

function Totals({ stats, groupCount, onGo }) {
  const items = [
    { label: 'Kayıtlı kişi', value: stats?.totalUsers, icon: PeopleAltRounded, tab: 'users' },
    { label: 'Gönderi', value: stats?.totalPosts, icon: DescriptionOutlined, tab: 'content' },
    { label: 'Yorum', value: stats?.totalComments, icon: ChatBubbleOutlineRounded, tab: 'content' },
    { label: 'Hastalık grubu', value: groupCount, icon: GroupsRounded, tab: 'groups' },
  ]
  return (
    <Box component="section" aria-labelledby="admin-totals-title">
      <Typography id="admin-totals-title" variant="subtitle1" component="h2" sx={{ fontWeight: 800, mb: 1 }}>
        Tüm zamanlar
      </Typography>
      <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' } }}>
        {items.map(it => {
          const Icon = it.icon
          return (
            <Box
              key={it.label}
              component="button"
              type="button"
              onClick={() => onGo?.(it.tab)}
              aria-label={`${it.label}: ${it.value == null ? 'bilinmiyor' : formatNumber(it.value)}. ${it.tab === 'groups' ? 'Gruplar' : it.tab === 'users' ? 'Kullanıcılar' : 'İçerik'} sekmesine git`}
              className="tap-scale"
              sx={{
                textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer',
                p: 1.5, borderRadius: `${radius.md}px`, bgcolor: 'transparent',
                border: '1px solid', borderColor: 'brand.border',
                display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0,
                transition: 'border-color 160ms ease, background-color 160ms ease',
                '&:hover': { borderColor: 'brand.borderStrong', bgcolor: 'background.paper' },
              }}
            >
              <Box sx={{ width: 36, height: 36, borderRadius: `${radius.sm}px`, display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: 'brand.surfaceAlt', color: 'text.secondary' }}>
                <Icon sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', lineHeight: 1.2 }}>
                  {it.value == null ? '—' : formatNumber(it.value)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', lineHeight: 1.3 }}>
                  {it.label}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

/* ---------- Durumlar ---------- */

function DashboardSkeleton() {
  const card = { bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border', borderRadius: `${radius.md}px` }
  return (
    <Stack spacing={2} aria-busy="true" aria-label="Kullanım verileri yükleniyor">
      <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' } }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Box key={i} sx={{ ...card, p: { xs: 1.5, sm: 1.75 } }}>
            <Skeleton animation="wave" width="55%" height={18} />
            <Skeleton animation="wave" width="70%" height={36} />
            <Skeleton animation="wave" variant="rounded" width={64} height={20} sx={{ borderRadius: 999, mt: 0.5 }} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' } }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ ...card, p: { xs: 1.75, sm: 2.25 } }}>
            <Skeleton animation="wave" width="45%" height={24} />
            <Skeleton animation="wave" width="80%" height={16} sx={{ mb: 1.5 }} />
            <Skeleton animation="wave" variant="rounded" height={196} sx={{ borderRadius: `${radius.sm}px` }} />
          </Box>
        ))}
      </Box>
    </Stack>
  )
}

function ErrorBlock({ message, onRetry }) {
  return (
    <Box role="alert" sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border', borderRadius: `${radius.md}px` }}>
      <EmptyState
        icon={CloudOffOutlined}
        title="Kullanım verileri yüklenemedi"
        description={message}
        actionLabel="Tekrar dene"
        onAction={onRetry}
      />
    </Box>
  )
}
