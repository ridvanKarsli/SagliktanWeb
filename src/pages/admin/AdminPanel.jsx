import { useState } from 'react'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import { useAuth } from '../../context/AuthContext.jsx'
import DashboardTab from './tabs/DashboardTab.jsx'
import ReportsTab from './tabs/ReportsTab.jsx'
import ContentTab from './tabs/ContentTab.jsx'
import UsersTab from './tabs/UsersTab.jsx'
import GroupsTab from './tabs/GroupsTab.jsx'

// Sekmelerin kendisi pages/admin/tabs/*.jsx içine taşındı (bkz. clean-code
// audit, "god component" bölünmesi) - bu dosya artık sadece Tabs kabuğu.
export default function AdminPanel() {
  const { token } = useAuth()
  const [tab, setTab] = useState('dashboard')

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Admin Paneli</Typography>
      {/* Mobilde scroll ok butonları (allowScrollButtonsMobile) kapatıldı:
          5 sekme + dar ekranda MUI'nin sol scroll butonu, aktif sekmeye
          otomatik kaydırma sırasında bir önceki sekmenin üstüne biniyor
          ("Genel Bakış" -> "enel Bakış" görünüyordu, bkz. mobil tasarım
          hatası ekran görüntüsü). Dokunmatik cihazlarda zaten native
          swipe ile kaydırılabiliyor, buton olmadan da erişilebilir. */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 1 }}
      >
        <Tab value="dashboard" label="Genel Bakış" />
        <Tab value="reports" label="Şikayetler" />
        <Tab value="content" label="İçerik" />
        <Tab value="users" label="Kullanıcılar" />
        <Tab value="groups" label="Gruplar" />
      </Tabs>
      {tab === 'dashboard' && <DashboardTab token={token} />}
      {tab === 'reports' && <ReportsTab token={token} />}
      {tab === 'content' && <ContentTab token={token} />}
      {tab === 'users' && <UsersTab token={token} />}
      {tab === 'groups' && <GroupsTab token={token} />}
    </Box>
  )
}
