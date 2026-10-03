import { useCallback, useEffect, useState } from 'react'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import {
  DashboardOutlined, FlagOutlined, ForumOutlined, GroupsOutlined, PeopleAltOutlined
} from '@mui/icons-material'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAdminStats } from '../../services/api.js'
import DashboardTab from './tabs/DashboardTab.jsx'
import ReportsTab from './tabs/ReportsTab.jsx'
import ContentTab from './tabs/ContentTab.jsx'
import UsersTab from './tabs/UsersTab.jsx'
import GroupsTab from './tabs/GroupsTab.jsx'

const TABS = [
  { value: 'dashboard', label: 'Genel Bakış', icon: DashboardOutlined },
  { value: 'reports', label: 'Şikayetler', icon: FlagOutlined },
  { value: 'content', label: 'İçerik', icon: ForumOutlined },
  { value: 'users', label: 'Kullanıcılar', icon: PeopleAltOutlined },
  { value: 'groups', label: 'Gruplar', icon: GroupsOutlined },
]
const VALID = new Set(TABS.map(t => t.value))

// Admin paneli kabuğu. Sekme URL'de (?tab=reports) tutulur: geri tuşu,
// yenileme ve "şikayetler" gibi doğrudan linkler çalışsın. Bekleyen şikayet
// sayısı sekme üzerinde rozet olarak görünür - moderatörün ilk bakışta
// nereye gideceği belli olsun.
export default function AdminPanel() {
  const { token } = useAuth()
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab = VALID.has(raw) ? raw : 'dashboard'
  const [pending, setPending] = useState(null)

  // Bekleyen şikayet rozeti: sekme değişince ve bir şikayet çözülünce tazelenir.
  // İkincil veri - alınamazsa rozet gösterilmez.
  const refreshPending = useCallback(() => {
    getAdminStats(token).then(s => setPending(s?.pendingReports ?? 0)).catch(() => {})
  }, [token])

  useEffect(() => { refreshPending() }, [refreshPending, tab])

  const setTab = (v) => {
    const next = new URLSearchParams(params)
    if (v === 'dashboard') next.delete('tab'); else next.set('tab', v)
    setParams(next, { replace: false })
  }

  return (
    <Box sx={{ py: { xs: 1.5, md: 3 } }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1.5 }}>Admin Paneli</Typography>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        allowScrollButtonsMobile={false}
        aria-label="Yönetim bölümleri"
        sx={{
          borderBottom: '1px solid', borderColor: 'divider', mb: 2,
          mx: { xs: -2, sm: 0 }, px: { xs: 1, sm: 0 },
          minHeight: 44,
          '& .MuiTab-root': { minHeight: 44, minWidth: 0, px: 1.5, textTransform: 'none', fontWeight: 600 },
          '& .MuiTabs-scroller': { scrollbarWidth: 'none' }
        }}
      >
        {TABS.map(t => {
          const Icon = t.icon
          const label = t.value === 'reports' && pending > 0
            ? (
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                {t.label}
                <Box
                  component="span"
                  sx={{
                    minWidth: 20, height: 20, px: 0.75, borderRadius: 999, fontSize: 12, fontWeight: 700,
                    display: 'inline-grid', placeItems: 'center',
                    bgcolor: 'warning.main', color: 'background.default'
                  }}
                >
                  {pending > 99 ? '99+' : pending}
                </Box>
              </Box>
            )
            : t.label
          return (
            <Tab
              key={t.value}
              value={t.value}
              label={label}
              icon={<Icon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              aria-label={t.label}
            />
          )
        })}
      </Tabs>
      {tab === 'dashboard' && <DashboardTab token={token} onGo={setTab} />}
      {tab === 'reports' && <ReportsTab token={token} onResolved={refreshPending} />}
      {tab === 'content' && <ContentTab token={token} />}
      {tab === 'users' && <UsersTab token={token} />}
      {tab === 'groups' && <GroupsTab token={token} />}
    </Box>
  )
}
