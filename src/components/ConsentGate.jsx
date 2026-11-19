import { useState } from 'react'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { updateHealthConsent } from '../services/api.js'

// Sağlık verisi açık rızası olmayan (ya da eski metin sürümüne rıza vermiş)
// oturum açık kullanıcıdan rızayı yeniden ister. Verilmezse çıkış yapabilir.
export default function ConsentGate() {
  const { token, user, applyServerUser, logout } = useAuth()
  const { showError } = useNotification()
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!user || user.healthConsent) return null

  const accept = async () => {
    setBusy(true)
    try {
      applyServerUser(await updateHealthConsent(token, true))
    } catch (err) {
      showError(err.message || 'Rıza kaydedilemedi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open aria-labelledby="consent-gate-title" disableEscapeKeyDown>
      <DialogTitle id="consent-gate-title">Sağlık verisi açık rızası</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Kişisel verilerin korunması metinlerimizi güncelledik. Hastalık grupları ve paylaşımların sağlık
          durumuna ilişkin olabileceği için bu verileri ayrı bir açık rızayla işliyoruz. Rıza vermeden gönderi
          paylaşamaz, yorum yazamaz ve gruplara katılamazsın.
        </DialogContentText>
        <FormControlLabel
          sx={{ alignItems: 'flex-start' }}
          control={<Checkbox checked={checked} onChange={e => setChecked(e.target.checked)} sx={{ pt: 0.25 }} />}
          label={(
            <span>
              Sağlık durumuma ilişkin verilerimin, <RouterLink to="/gizlilik-politikasi" target="_blank" rel="noopener">Açık Rıza Metni</RouterLink>'nde
              belirtilen amaçlarla ve yurt dışındaki hizmet sağlayıcılara aktarılarak işlenmesine açık rıza veriyorum.
            </span>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={logout} disabled={busy}>Çıkış yap</Button>
        <Button variant="contained" onClick={accept} disabled={!checked || busy}>Onaylıyorum</Button>
      </DialogActions>
    </Dialog>
  )
}
