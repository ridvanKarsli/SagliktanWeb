import { useEffect, useRef, useState } from 'react'
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControlLabel, Skeleton, Stack, Switch, Typography
} from '@mui/material'
import { MailOutlineRounded } from '@mui/icons-material'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { getDigestPreview, updateHealthProfile, updatePreferences } from '../../services/api.js'
import HealthProfileFields from '../../components/profile/HealthProfileFields.jsx'
import SettingsSection, { SettingsCard } from '../../components/settings/SettingsSection.jsx'
import { cleanHealthProfile } from '../../utils/validation.js'
import SaglikLoader from '../../components/common/SaglikLoader.jsx'

function sameProfile(a, b) {
  return (a.communityRole || null) === (b.communityRole || null)
    && !!a.discoverable === !!b.discoverable
    && (a.profilePublic !== false) === (b.profilePublic !== false)
}

/**
 * Ayarlar > "Profil ve eşleşme" (sağlık özeti + görünürlük) ve
 * "E-posta bildirimleri" (haftalık özet). #eslesme ile doğrudan açılabilir
 * (ana sayfadaki "Senin gibi üyeler" davet kartı buraya bağlanıyor).
 */
export default function CommunitySettings() {
  const { token, user, applyServerUser } = useAuth()
  const { showError, showSuccess } = useNotification()
  const location = useLocation()
  const sectionRef = useRef(null)

  // Kayıtlı değerler geçerli kümeye indirgenir (bilinmeyen rol boş görünür).
  const fromUser = () => cleanHealthProfile(user || {})
  const [profile, setProfile] = useState(fromUser)
  const [saving, setSaving] = useState(false)
  const [digestSaving, setDigestSaving] = useState(false)
  const [preview, setPreview] = useState({ open: false, html: '', loading: false })

  useEffect(() => {
    if (location.hash === '#eslesme') sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const dirty = user && !sameProfile(profile, fromUser())

  const saveProfile = async () => {
    if (saving) return
    setSaving(true)
    try {
      applyServerUser(await updateHealthProfile(token, cleanHealthProfile(profile)))
      showSuccess('Profil bilgilerin kaydedildi.')
    } catch (err) {
      showError(err.message || 'Kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  const toggleDigest = async (enabled) => {
    setDigestSaving(true)
    try {
      applyServerUser(await updatePreferences(token, { weeklyDigestEnabled: enabled }))
      showSuccess(enabled ? 'Haftalık özet açıldı.' : 'Haftalık özet kapatıldı.')
    } catch (err) {
      showError(err.message || 'Tercih kaydedilemedi.')
    } finally {
      setDigestSaving(false)
    }
  }

  const openPreview = async () => {
    setPreview({ open: true, html: '', loading: true })
    try {
      const html = await getDigestPreview(token)
      // Yükleme sürerken dialog kapatıldıysa yeniden açma.
      setPreview(p => ({ ...p, html: typeof html === 'string' ? html : '', loading: false }))
    } catch (err) {
      setPreview({ open: false, html: '', loading: false })
      showError(err.message || 'Önizleme alınamadı.')
    }
  }

  return (
    <>
      <Box ref={sectionRef} id="eslesme" sx={{ scrollMarginTop: 72 }}>
        <SettingsSection title="Profil ve eşleşme" description="Toplulukta kim olduğun ve kimlerin seni görebileceği. Şehrini &quot;Profili düzenle&quot;den değiştirebilirsin.">
          <SettingsCard padded>
            <HealthProfileFields value={profile} onChange={setProfile} showRole />
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
              {dirty && (
                <Button onClick={() => setProfile(fromUser())} disabled={saving} sx={{ minHeight: 44 }}>Vazgeç</Button>
              )}
              <Button variant="contained" onClick={saveProfile} disabled={!dirty || saving} sx={{ minHeight: 44, minWidth: 110 }}>
                {saving ? <SaglikLoader size="sm" color="inherit" /> : 'Kaydet'}
              </Button>
            </Stack>
          </SettingsCard>
        </SettingsSection>
      </Box>

      <SettingsSection title="E-posta bildirimleri" description="Gruplarında olanları kaçırma, ama gelen kutun da dolmasın.">
        <SettingsCard padded>
          <FormControlLabel
            control={
              <Switch
                checked={!!user?.weeklyDigestEnabled}
                disabled={digestSaving}
                onChange={e => toggleDigest(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Haftalık özet</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Her pazartesi: gruplarındaki yeni paylaşımlar, gönderilerine gelen yorumlar ve cevap bekleyen sorular.
                  Gruplarında hareket yoksa gönderilmez.
                </Typography>
              </Box>
            }
            sx={{ m: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { ml: 1 } }}
          />
          <Divider sx={{ my: 1.5 }} />
          <Button size="small" startIcon={<MailOutlineRounded />} onClick={openPreview} sx={{ minHeight: 40 }}>
            Bu haftaki özetimi göster
          </Button>
        </SettingsCard>
      </SettingsSection>

      <Dialog open={preview.open} onClose={() => setPreview(p => ({ ...p, open: false }))} fullWidth maxWidth="sm">
        <DialogTitle>Haftalık özet önizlemesi</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {preview.loading ? (
            <Box sx={{ p: 3 }} aria-busy="true" aria-label="Önizleme yükleniyor">
              <Skeleton variant="text" width="45%" sx={{ fontSize: '1.4rem' }} />
              <Skeleton variant="rounded" height={120} sx={{ my: 2 }} />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="85%" />
              <Skeleton variant="text" width="70%" />
            </Box>
          ) : (
            // sandbox: e-posta HTML'i betik çalıştıramaz; linkler yeni sekmede açılır.
            <Box
              component="iframe"
              title="Haftalık özet önizlemesi"
              srcDoc={preview.html}
              sandbox="allow-popups allow-popups-to-escape-sandbox"
              sx={{ display: 'block', width: '100%', height: '70vh', border: 0, bgcolor: 'background.paper' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreview(p => ({ ...p, open: false }))} sx={{ minHeight: 40 }}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
