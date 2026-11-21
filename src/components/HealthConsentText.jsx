import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@mui/material'

// Sağlık verisi açık rızasının onay cümlesi. Kayıt formu ve rıza penceresi
// aynı metni kullanır; metin değişirse tek yerden değişir (rıza metni sürümü
// için bkz. backend ConsentPolicy).
export default function HealthConsentText() {
  return (
    <>
      Katıldığım gruplar ve paylaşımlarım gibi sağlıkla ilgili bilgilerimin (kendimin ya da paylaştığım kadarıyla
      yakınımın),{' '}
      <Link component={RouterLink} to="/gizlilik-politikasi" target="_blank" rel="noopener">Açık Rıza Metni</Link>
      &apos;nde belirtilen amaçlarla ve yurt dışındaki hizmet sağlayıcılara aktarılarak işlenmesine açık rıza veriyorum.
    </>
  )
}
