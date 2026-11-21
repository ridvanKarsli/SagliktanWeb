import { useEffect, useState } from 'react'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel } from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import HealthConsentText from './HealthConsentText.jsx'
import { CONSENT_GATE_DISMISSED_KEY } from '../utils/afterAuth.js'
import { useNotification } from '../context/NotificationContext.jsx'
import { updateHealthConsent, HEALTH_CONSENT_REQUIRED_EVENT } from '../services/api.js'

// Sağlık verisi açık rızası olmayan (ya da eski metin sürümüne rıza vermiş)
// oturum açık kullanıcıya rızayı sorar. Rıza hizmet şartı değildir: "Şimdi
// değil" ile kapatılabilir, o zaman kişi içerikleri okumaya devam eder.
// Rıza gerektiren bir işlem (gruba katılma, gönderi, yorum, mesaj) sunucu
// tarafından reddedildiğinde pencere yeniden açılır.
const DISMISSED_KEY = CONSENT_GATE_DISMISSED_KEY
function readDismissed() {
  try { return sessionStorage.getItem(DISMISSED_KEY) === '1' } catch { return false }
}
function writeDismissed(value) {
  try {
    if (value) sessionStorage.setItem(DISMISSED_KEY, '1')
    else sessionStorage.removeItem(DISMISSED_KEY)
  } catch { /* depolama kapalıysa tercih yalnızca bu sayfada geçerli olur */ }
}

export default function ConsentGate() {
  const { token, user, applyServerUser } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [dismissed, setDismissed] = useState(readDismissed)

  useEffect(() => {
    const reopen = () => { writeDismissed(false); setDismissed(false) }
    window.addEventListener(HEALTH_CONSENT_REQUIRED_EVENT, reopen)
    return () => window.removeEventListener(HEALTH_CONSENT_REQUIRED_EVENT, reopen)
  }, [])

  // Kişi rızasını Ayarlar'dan az önce kendisi geri aldıysa pencere hemen
  // önüne çıkmaz; rıza gerektiren bir işlem denediğinde yeniden açılır.
  const hasConsent = !!user?.healthConsent
  const [lastConsent, setLastConsent] = useState(hasConsent)
  if (hasConsent !== lastConsent) {
    setLastConsent(hasConsent)
    if (!hasConsent) {
      writeDismissed(true)
      setDismissed(true)
    }
  }

  if (!user || user.healthConsent || dismissed) return null

  const later = () => { writeDismissed(true); setDismissed(true) }

  const accept = async () => {
    setBusy(true)
    try {
      applyServerUser(await updateHealthConsent(token, true))
      showSuccess?.('Rızan kaydedildi. Artık gruplara katılabilir ve paylaşım yapabilirsin.')
    } catch (err) {
      showError(err.message || 'Rıza kaydedilemedi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={later} aria-labelledby="consent-gate-title">
      <DialogTitle id="consent-gate-title">Sağlık bilgilerin için iznin</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Katıldığın hastalık grupları ve yazdıkların sağlıkla ilgili bilgi sayılır. Bu bilgileri yalnızca
          senin açık rızanla işleyebiliriz. Rıza vermeden de paylaşımları okuyabilirsin; gruba katılmak,
          gönderi ve yorum yazmak ya da mesaj göndermek için rızan gerekir.
        </DialogContentText>
        <FormControlLabel
          sx={{ alignItems: 'flex-start' }}
          control={<Checkbox checked={checked} onChange={e => setChecked(e.target.checked)} sx={{ pt: 0.25 }} />}
          label={(
            <span>
              <HealthConsentText /> Rızamı Ayarlar&apos;dan istediğim zaman geri alabilirim.
            </span>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={later} disabled={busy}>Şimdi değil</Button>
        <Button variant="contained" onClick={accept} disabled={!checked || busy}>Rıza veriyorum</Button>
      </DialogActions>
    </Dialog>
  )
}
