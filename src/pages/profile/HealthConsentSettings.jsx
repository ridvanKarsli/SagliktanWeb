import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { updateHealthConsent } from '../../services/api.js'
import { invalidateMyGroups } from '../../services/myGroups.js'
import SettingsSection, { SettingsCard } from '../../components/settings/SettingsSection.jsx'

// KVKK: sağlık verisi açık rızasını görme ve geri alma. Geri alınınca
// grup üyelikleri ve sağlık özeti kaldırılır (bkz. UserService.updateHealthConsent).
export default function HealthConsentSettings() {
  const { token, user, applyServerUser } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const change = async (granted) => {
    setBusy(true)
    try {
      applyServerUser(await updateHealthConsent(token, granted))
      invalidateMyGroups()
      setConfirmOpen(false)
      showSuccess(granted ? 'Açık rızan kaydedildi.' : 'Açık rızan geri alındı. Grup üyeliklerin kaldırıldı.')
    } catch (err) {
      showError(err.message || 'İşlem yapılamadı.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SettingsSection
      title="Sağlık verisi rızası"
      description="Hastalık grupları ve paylaşımların sağlık durumuna ilişkin olabilir. Bu verileri açık rızanla işliyoruz."
    >
      <SettingsCard padded>
        <Stack spacing={1.5} alignItems="flex-start">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {user?.healthConsent
              ? 'Açık rızan var. İstediğin zaman geri alabilirsin; bu durumda grup üyeliklerin ve sağlık özetin kaldırılır, yeniden rıza verene kadar gönderi, yorum ve gruba katılma kapalı kalır.'
              : 'Şu an açık rızan yok. Gönderi paylaşmak, yorum yazmak ve gruplara katılmak için rıza vermen gerekiyor.'}
          </Typography>
          <Typography variant="body2">
            <RouterLink to="/gizlilik-politikasi">Aydınlatma ve Açık Rıza Metni</RouterLink>
          </Typography>
          {user?.healthConsent ? (
            <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)} sx={{ minHeight: 44 }}>
              Rızamı geri al
            </Button>
          ) : (
            <Button variant="contained" onClick={() => change(true)} disabled={busy} sx={{ minHeight: 44 }}>
              Açık rıza veriyorum
            </Button>
          )}
        </Stack>
      </SettingsCard>

      <Dialog open={confirmOpen} onClose={() => !busy && setConfirmOpen(false)} aria-labelledby="consent-withdraw-title">
        <DialogTitle id="consent-withdraw-title">Rızanı geri almak istiyor musun?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Üye olduğun tüm hastalık gruplarından çıkarılırsın, topluluk rolün silinir ve profilin diğer üyelere
            kapanır. Daha önce yazdığın gönderi ve yorumlar kalır; silmek istersen tek tek silebilir ya da hesabını
            kapatabilirsin.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={busy}>Vazgeç</Button>
          <Button color="error" onClick={() => change(false)} disabled={busy}>Rızamı geri al</Button>
        </DialogActions>
      </Dialog>
    </SettingsSection>
  )
}
