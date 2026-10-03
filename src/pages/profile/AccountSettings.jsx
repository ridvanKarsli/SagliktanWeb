import { useState } from 'react'
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material'
import {
  ArrowBackRounded, BlockRounded, DeleteForeverRounded, DescriptionOutlined, DevicesOutlined,
  FileDownloadOutlined, GroupsRounded, HelpOutlineRounded, InfoOutlined, LockOutlined, LogoutRounded,
  PrivacyTipOutlined, WarningAmberRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { exportMyData } from '../../services/api.js'
import { downloadJson } from '../../utils/download.js'
import CommunitySettings from './CommunitySettings.jsx'
import SettingsSection, { SettingsCard } from '../../components/settings/SettingsSection.jsx'
import SettingsRow from '../../components/settings/SettingsRow.jsx'
import ExpandableSettingsRow from '../../components/settings/ExpandableSettingsRow.jsx'
import AccessibilitySettings from '../../components/settings/AccessibilitySettings.jsx'
import ChangePasswordForm from '../../components/settings/ChangePasswordForm.jsx'
import BlockedUsersPanel from '../../components/settings/BlockedUsersPanel.jsx'
import ActiveSessionsPanel from '../../components/settings/ActiveSessionsPanel.jsx'
import DeactivateAccountPanel from '../../components/settings/DeactivateAccountPanel.jsx'
import DeleteAccountPanel from '../../components/settings/DeleteAccountPanel.jsx'

const ICON_SX = { fontSize: 20 }

const SUPPORT_LINKS = [
  { label: 'Yardım ve Destek', to: '/yardim', Icon: HelpOutlineRounded },
  { label: 'Hakkımızda', to: '/hakkimizda', Icon: InfoOutlined },
  { label: 'Topluluk Kuralları', to: '/topluluk-kurallari', Icon: GroupsRounded },
  { label: 'Kullanım Şartları', to: '/kullanim-sartlari', Icon: DescriptionOutlined },
  { label: 'Gizlilik Politikası', to: '/gizlilik-politikasi', Icon: PrivacyTipOutlined },
]

// KVKK veri taşınabilirliği: kullanıcının kendi verisini JSON olarak indirmesi.
function useDataExport() {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [exporting, setExporting] = useState(false)

  const exportData = async () => {
    if (exporting) return
    setExporting(true)
    try {
      downloadJson(await exportMyData(token), 'sagliktan-verilerim.json')
      showSuccess('Verileriniz indirildi.')
    } catch (err) {
      showError(err.message || 'Verileriniz indirilemedi.')
    } finally {
      setExporting(false)
    }
  }

  return { exporting, exportData }
}

/**
 * Hesap ayarları: profil eşleşmesi, erişilebilirlik, hesap/gizlilik, destek
 * bağlantıları ve tehlikeli bölge. Açılır paneller aynı anda yalnızca
 * kendi içeriklerini yükler (bkz. components/settings).
 */
export default function AccountSettings() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { exporting, exportData } = useDataExport()
  // Hangi açılır panelin açık olduğu (aynı anda birden fazla açık olabilir).
  const [openPanels, setOpenPanels] = useState(() => new Set())
  const isOpen = (key) => openPanels.has(key)
  const toggle = (key) => setOpenPanels(prev => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key); else next.add(key)
    return next
  })
  const close = (key) => setOpenPanels(prev => {
    const next = new Set(prev)
    next.delete(key)
    return next
  })

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3, px: { xs: 0.5, md: 0 } }}>
        <IconButton onClick={() => navigate('/profile')} aria-label="Profile dön" edge="start">
          <ArrowBackRounded />
        </IconButton>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>Ayarlar</Typography>
      </Stack>

      <Stack spacing={4}>
        <CommunitySettings />

        <SettingsSection title="Erişilebilirlik">
          <AccessibilitySettings />
        </SettingsSection>

        <SettingsSection title="Hesap">
          <SettingsCard>
            <Stack divider={<Divider />}>
              <ExpandableSettingsRow
                icon={<LockOutlined sx={ICON_SX} />} label="Şifre Değiştir"
                open={isOpen('password')} onToggle={() => toggle('password')}
              >
                <ChangePasswordForm onDone={() => close('password')} />
              </ExpandableSettingsRow>
              <ExpandableSettingsRow
                icon={<BlockRounded sx={ICON_SX} />} label="Engellenen Kullanıcılar"
                open={isOpen('blocked')} onToggle={() => toggle('blocked')}
              >
                <BlockedUsersPanel />
              </ExpandableSettingsRow>
              <ExpandableSettingsRow
                icon={<DevicesOutlined sx={ICON_SX} />} label="Aktif Oturumlar"
                open={isOpen('sessions')} onToggle={() => toggle('sessions')}
              >
                <ActiveSessionsPanel />
              </ExpandableSettingsRow>
              <SettingsRow icon={<FileDownloadOutlined sx={ICON_SX} />} label="Verilerimi İndir" loading={exporting} onClick={exportData} />
              <SettingsRow icon={<LogoutRounded sx={ICON_SX} />} label="Çıkış Yap" onClick={handleLogout} />
            </Stack>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Destek ve Yasal">
          <SettingsCard>
            <Stack divider={<Divider />}>
              {SUPPORT_LINKS.map(link => {
                const Icon = link.Icon
                return <SettingsRow key={link.to} icon={<Icon sx={ICON_SX} />} label={link.label} onClick={() => navigate(link.to)} />
              })}
            </Stack>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Tehlikeli Bölge">
          <SettingsCard>
            <Stack divider={<Divider />}>
              <ExpandableSettingsRow
                icon={<WarningAmberRounded sx={ICON_SX} />} label="Hesabımı Deaktive Et" danger
                open={isOpen('deactivate')} onToggle={() => toggle('deactivate')}
              >
                <DeactivateAccountPanel onCancel={() => close('deactivate')} />
              </ExpandableSettingsRow>
              <ExpandableSettingsRow
                icon={<DeleteForeverRounded sx={ICON_SX} />} label="Hesabımı Sil" danger
                open={isOpen('delete')} onToggle={() => toggle('delete')}
              >
                <DeleteAccountPanel onCancel={() => close('delete')} />
              </ExpandableSettingsRow>
            </Stack>
          </SettingsCard>
        </SettingsSection>
      </Stack>
    </Box>
  )
}
