import { useEffect, useState } from 'react'
import {
  Alert, Box, Button, Chip, CircularProgress, Collapse, Divider, FormControlLabel,
  IconButton, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material'
import {
  ArrowBackRounded, BlockRounded, DeleteForeverRounded, DescriptionOutlined, DevicesOutlined,
  FileDownloadOutlined, FormatSizeRounded, GroupsRounded, HelpOutlineRounded, InfoOutlined,
  LockOutlined, LogoutRounded, PrivacyTipOutlined, WarningAmberRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAccessibility } from '../../context/AccessibilityContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter.jsx'
import {
  changePassword, deactivateAccount, deleteAccount, exportMyData,
  listBlockedUsers, listSessions, revokeSession, unblockUser
} from '../../services/api.js'
import { Section, SettingsRow } from './ProfileShared.jsx'
import { prettyDate } from '../../utils/format.js'

/**
 * Hesap ayarları - Faz5: X/Instagram'da hesap ayarları hiçbir zaman profil
 * sayfasının kaydırma akışının bir parçası değildir, her zaman ayrı bir
 * ekrandır (X: profildeki "..." menüsü -> Ayarlar; IG: hamburger menü ->
 * Ayarlar). Önceden bu içerik Profile.jsx'in altında uzun bir dikey yığın
 * halindeydi - kullanıcı kendi gönderilerini görmek için önce şifre/gizlilik/
 * hesap silme gibi seyrek kullanılan bölümlerin arasından kaydırmak zorunda
 * kalıyordu. Artık Profile.jsx sadece kimlik+içerik gösteriyor, buraya
 * dişli (gear) ikonuyla geliniyor.
 */
export default function AccountSettings() {
  const { token, logout } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()
  const { fontScale, highContrast, fontScaleOptions, setFontScale, setHighContrast } = useAccessibility()

  /* ---- Şifre değiştirme ---- */
  const [pwOpen, setPwOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const savePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword) { showError('Mevcut şifreni gir.'); return }
    if (newPassword.length < 8) { showError('Yeni şifre en az 8 karakter olmalı.'); return }
    setSavingPassword(true)
    try {
      await changePassword(token, { currentPassword, newPassword })
      showSuccess('Şifre değiştirildi.')
      setCurrentPassword('')
      setNewPassword('')
      setPwOpen(false)
    } catch (err) {
      showError(err.message || 'Şifre değiştirilemedi.')
    } finally {
      setSavingPassword(false)
    }
  }

  /* ---- Hesabı deaktive et ---- */
  const [deactivateConfirm, setDeactivateConfirm] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const doDeactivate = async () => {
    setDeactivating(true)
    try {
      await deactivateAccount(token)
      showSuccess('Hesabınız deaktive edildi.')
      await logout()
      navigate('/')
    } catch (err) {
      showError(err.message || 'Hesap deaktive edilemedi.')
      setDeactivating(false)
    }
  }

  /* ---- Verilerimi indir (KVKK veri taşınabilirliği) ---- */
  const [exportingData, setExportingData] = useState(false)

  const doExportData = async () => {
    if (exportingData) return
    setExportingData(true)
    try {
      const data = await exportMyData(token)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'sagliktan-verilerim.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      showSuccess('Verileriniz indirildi.')
    } catch (err) {
      showError(err.message || 'Verileriniz indirilemedi.')
    } finally {
      setExportingData(false)
    }
  }

  /* ---- Hesabı sil (geri alınamaz, anonimleştirme) ---- */
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false)
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  const doDeleteAccount = async (e) => {
    e.preventDefault()
    if (!deleteAccountPassword) { showError('Şifreni gir.'); return }
    setDeletingAccount(true)
    try {
      await deleteAccount(token, deleteAccountPassword)
      showSuccess('Hesabınız silindi.')
      await logout()
      navigate('/')
    } catch (err) {
      showError(err.message || 'Hesap silinemedi.')
      setDeletingAccount(false)
    }
  }

  /* ---- Engellenen kullanıcılar ---- */
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState([])
  const [blockedLoading, setBlockedLoading] = useState(false)
  const [blockedLoaded, setBlockedLoaded] = useState(false)
  const [unblockingId, setUnblockingId] = useState(null)

  useEffect(() => {
    if (!blockedOpen || blockedLoaded || !token) return
    let mounted = true
    setBlockedLoading(true)
    listBlockedUsers(token)
      .then(res => { if (mounted) { setBlockedUsers(Array.isArray(res) ? res : []); setBlockedLoaded(true) } })
      .catch(err => showError(err.message || 'Engellenen kullanıcılar alınamadı.'))
      .finally(() => { if (mounted) setBlockedLoading(false) })
    return () => { mounted = false }
  }, [blockedOpen, blockedLoaded, token, showError])

  const handleUnblock = async (userId) => {
    setUnblockingId(userId)
    try {
      await unblockUser(token, userId)
      setBlockedUsers(prev => prev.filter(b => b.userId !== userId))
      showSuccess('Engel kaldırıldı.')
    } catch (err) {
      showError(err.message || 'Engel kaldırılamadı.')
    } finally {
      setUnblockingId(null)
    }
  }

  /* ---- Aktif Oturumlar ---- */
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsLoaded, setSessionsLoaded] = useState(false)
  const [revokingSessionId, setRevokingSessionId] = useState(null)

  useEffect(() => {
    if (!sessionsOpen || sessionsLoaded || !token) return
    let mounted = true
    setSessionsLoading(true)
    listSessions(token)
      .then(res => { if (mounted) { setSessions(Array.isArray(res) ? res : []); setSessionsLoaded(true) } })
      .catch(err => showError(err.message || 'Aktif oturumlar alınamadı.'))
      .finally(() => { if (mounted) setSessionsLoading(false) })
    return () => { mounted = false }
  }, [sessionsOpen, sessionsLoaded, token, showError])

  const handleRevokeSession = async (sessionRowId) => {
    setRevokingSessionId(sessionRowId)
    try {
      await revokeSession(token, sessionRowId)
      setSessions(prev => prev.filter(s => s.id !== sessionRowId))
      showSuccess('Oturum sonlandırıldı.')
    } catch (err) {
      showError(err.message || 'Oturum sonlandırılamadı.')
    } finally {
      setRevokingSessionId(null)
    }
  }

  /* ---- Çıkış yap ---- */
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
      {/* X/IG ayarlar ekranı deseni: geri oku + başlık, alt sayfa gibi davranır. */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3, px: { xs: 0.5, md: 0 } }}>
        <IconButton onClick={() => navigate('/profile')} aria-label="Profile dön" edge="start">
          <ArrowBackRounded />
        </IconButton>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          Ayarlar
        </Typography>
      </Stack>

      <Stack spacing={4}>
        {/* Kişiselleştirme: yazı boyutu + yüksek kontrast */}
        <Section title="Erişilebilirlik">
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 2.5 }}>
            <Stack spacing={2.5}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <FormatSizeRounded sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Yazı Boyutu</Typography>
                </Stack>
                <ToggleButtonGroup
                  value={fontScale}
                  exclusive
                  size="small"
                  onChange={(_, v) => v && setFontScale(v)}
                  fullWidth
                >
                  {Object.entries(fontScaleOptions).map(([key, opt]) => (
                    <ToggleButton key={key} value={key}>{opt.label}</ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={highContrast}
                    onChange={e => setHighContrast(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Yüksek Kontrast</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Metin ve kenarlıkları daha belirgin hale getirir
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { ml: 1 } }}
              />
            </Stack>
          </Box>
        </Section>

        {/* Hesap ve gizlilik */}
        <Section title="Hesap">
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Stack divider={<Divider />}>
              <Box>
                <SettingsRow
                  icon={<LockOutlined sx={{ fontSize: 20 }} />}
                  label="Şifre Değiştir"
                  open={pwOpen}
                  onClick={() => setPwOpen(o => !o)}
                />
                <Collapse in={pwOpen} unmountOnExit>
                  <Box component="form" onSubmit={savePassword} sx={{ p: 2.5, pt: 0.5 }}>
                    <Stack spacing={2}>
                      <TextField
                        label="Mevcut Şifre" type="password" value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)} fullWidth required size="small"
                      />
                      <Box>
                        <TextField
                          label="Yeni Şifre" type="password" value={newPassword}
                          onChange={e => setNewPassword(e.target.value)} fullWidth required size="small"
                          helperText="En az 8 karakter"
                        />
                        <Box sx={{ mt: 1 }}>
                          <PasswordStrengthMeter password={newPassword} />
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button type="submit" variant="contained" size="small" disabled={savingPassword}>
                          {savingPassword ? <CircularProgress size={16} color="inherit" /> : 'Şifreyi Değiştir'}
                        </Button>
                        <Button size="small" onClick={() => setPwOpen(false)} disabled={savingPassword}>İptal</Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Collapse>
              </Box>

              <Box>
                <SettingsRow
                  icon={<BlockRounded sx={{ fontSize: 20 }} />}
                  label="Engellenen Kullanıcılar"
                  open={blockedOpen}
                  onClick={() => setBlockedOpen(o => !o)}
                />
                <Collapse in={blockedOpen} unmountOnExit>
                  <Box sx={{ px: 1.5, pb: 1.5 }}>
                    {blockedLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : blockedUsers.length === 0 ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                        Engellediğin kimse yok.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {blockedUsers.map(b => (
                          <Stack
                            key={b.id} direction="row" alignItems="center" spacing={1.5}
                            sx={{ py: 0.75 }}
                          >
                            <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }} noWrap>
                              {b.userName}
                            </Typography>
                            <Button
                              size="small" variant="outlined"
                              disabled={unblockingId === b.userId}
                              onClick={() => handleUnblock(b.userId)}
                            >
                              {unblockingId === b.userId ? <CircularProgress size={14} color="inherit" /> : 'Engeli Kaldır'}
                            </Button>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Collapse>
              </Box>

              <Box>
                <SettingsRow
                  icon={<DevicesOutlined sx={{ fontSize: 20 }} />}
                  label="Aktif Oturumlar"
                  open={sessionsOpen}
                  onClick={() => setSessionsOpen(o => !o)}
                />
                <Collapse in={sessionsOpen} unmountOnExit>
                  <Box sx={{ px: 1.5, pb: 1.5 }}>
                    {sessionsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : sessions.length === 0 ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                        Aktif oturum bulunamadı.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {sessions.map(s => (
                          <Stack
                            key={s.id} direction="row" alignItems="center" spacing={1.5}
                            sx={{ py: 0.75 }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                                  {s.deviceLabel}
                                </Typography>
                                {s.current && (
                                  <Chip label="Bu cihaz" size="small" color="primary" variant="outlined" sx={{ height: 20 }} />
                                )}
                              </Stack>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Son kullanım: {prettyDate(s.lastUsedAt) || 'Bilinmiyor'}
                              </Typography>
                            </Box>
                            {!s.current && (
                              <Button
                                size="small" variant="outlined" color="error"
                                disabled={revokingSessionId === s.id}
                                onClick={() => handleRevokeSession(s.id)}
                              >
                                {revokingSessionId === s.id ? <CircularProgress size={14} color="inherit" /> : 'Çıkış Yap'}
                              </Button>
                            )}
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Collapse>
              </Box>

              <SettingsRow
                icon={<FileDownloadOutlined sx={{ fontSize: 20 }} />}
                label="Verilerimi İndir"
                loading={exportingData}
                onClick={doExportData}
              />

              <SettingsRow
                icon={<LogoutRounded sx={{ fontSize: 20 }} />}
                label="Çıkış Yap"
                onClick={handleLogout}
              />
            </Stack>
          </Box>
        </Section>

        {/* Destek ve yasal */}
        <Section title="Destek ve Yasal">
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Stack divider={<Divider />}>
              <SettingsRow
                icon={<HelpOutlineRounded sx={{ fontSize: 20 }} />}
                label="Yardım ve Destek"
                onClick={() => navigate('/yardim')}
              />
              <SettingsRow
                icon={<InfoOutlined sx={{ fontSize: 20 }} />}
                label="Hakkımızda"
                onClick={() => navigate('/hakkimizda')}
              />
              <SettingsRow
                icon={<GroupsRounded sx={{ fontSize: 20 }} />}
                label="Topluluk Kuralları"
                onClick={() => navigate('/topluluk-kurallari')}
              />
              <SettingsRow
                icon={<DescriptionOutlined sx={{ fontSize: 20 }} />}
                label="Kullanım Şartları"
                onClick={() => navigate('/kullanim-sartlari')}
              />
              <SettingsRow
                icon={<PrivacyTipOutlined sx={{ fontSize: 20 }} />}
                label="Gizlilik Politikası"
                onClick={() => navigate('/gizlilik-politikasi')}
              />
            </Stack>
          </Box>
        </Section>

        {/* Tehlikeli bölge */}
        <Section title="Tehlikeli Bölge">
          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Stack divider={<Divider />}>
              <Box>
                <SettingsRow
                  icon={<WarningAmberRounded sx={{ fontSize: 20 }} />}
                  label="Hesabımı Deaktive Et"
                  danger
                  open={deactivateConfirm}
                  onClick={() => setDeactivateConfirm(o => !o)}
                />
                <Collapse in={deactivateConfirm} unmountOnExit>
                  <Box sx={{ p: 2.5, pt: 0.5 }}>
                    <Alert severity="warning" sx={{ mb: 0 }}>
                      <Stack spacing={1.5}>
                        <Typography variant="body2">
                          Hesabını deaktive edersen oturumun kapatılır ve tekrar giriş yapamazsın.
                          Bu işlem geri alınamaz.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Button
                            variant="contained" color="error" size="small"
                            onClick={doDeactivate} disabled={deactivating}
                          >
                            {deactivating ? <CircularProgress size={14} color="inherit" /> : 'Evet, Deaktive Et'}
                          </Button>
                          <Button size="small" onClick={() => setDeactivateConfirm(false)} disabled={deactivating}>
                            Vazgeç
                          </Button>
                        </Stack>
                      </Stack>
                    </Alert>
                  </Box>
                </Collapse>
              </Box>

              <Box>
                <SettingsRow
                  icon={<DeleteForeverRounded sx={{ fontSize: 20 }} />}
                  label="Hesabımı Sil"
                  danger
                  open={deleteAccountConfirm}
                  onClick={() => setDeleteAccountConfirm(o => !o)}
                />
                <Collapse in={deleteAccountConfirm} unmountOnExit>
                  <Box component="form" onSubmit={doDeleteAccount} sx={{ p: 2.5, pt: 0.5 }}>
                    <Alert severity="error" sx={{ mb: 0 }}>
                      <Stack spacing={1.5}>
                        <Typography variant="body2">
                          Hesabını silersen kimlik bilgilerin (ad, soyad, e-posta) kalıcı olarak
                          anonimleştirilir ve oturumun kapatılır. Bu işlem GERİ ALINAMAZ.
                          Gönderi/yorumların, topluluk tartışmaları bozulmasın diye kaldırılmadan
                          kalır ama artık sana ait görünmez.
                        </Typography>
                        <TextField
                          label="Şifreni gir" type="password" value={deleteAccountPassword}
                          onChange={e => setDeleteAccountPassword(e.target.value)}
                          fullWidth required size="small"
                          slotProps={{ htmlInput: { 'data-testid': 'delete-account-password' } }}
                        />
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Button
                            type="submit" variant="contained" color="error" size="small"
                            disabled={deletingAccount}
                          >
                            {deletingAccount ? <CircularProgress size={14} color="inherit" /> : 'Evet, Hesabımı Sil'}
                          </Button>
                          <Button
                            size="small"
                            onClick={() => { setDeleteAccountConfirm(false); setDeleteAccountPassword('') }}
                            disabled={deletingAccount}
                          >
                            Vazgeç
                          </Button>
                        </Stack>
                      </Stack>
                    </Alert>
                  </Box>
                </Collapse>
              </Box>
            </Stack>
          </Box>
        </Section>
      </Stack>
    </Box>
  )
}
