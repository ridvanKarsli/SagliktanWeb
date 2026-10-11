import { useState } from 'react'
import { Box, ButtonBase, IconButton, Typography } from '@mui/material'
import { CloseRounded, CottageRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { focusRingSx } from '../design/focus.js'

const DISMISS_KEY = 'sagliktan:mahalle-card-dismissed'

function isDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

/**
 * Anasayfadaki küçük, sıcak davet: Sağlıktan Mahalle (oyun). Kapatılabilir;
 * tercih tarayıcıda tutulur. Oyun kodunu içe aktarmaz (ana paket büyümesin) -
 * yalnızca /game'e gider.
 */
export default function MahalleCard({ sx }) {
  const navigate = useNavigate()
  const [hidden, setHidden] = useState(isDismissed)
  if (hidden) return null

  const dismiss = () => {
    setHidden(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* gizli sekme: yalnızca bu oturum */ }
  }

  return (
    <Box
      sx={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, pr: 6,
        borderRadius: '20px', bgcolor: 'brand.apricotSoft', border: '1px solid', borderColor: 'brand.border', ...sx,
      }}
    >
      <ButtonBase
        onClick={() => navigate('/game')}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, textAlign: 'left', borderRadius: '14px', flex: 1, minWidth: 0, '&.Mui-focusVisible': focusRingSx }}
      >
        <Box aria-hidden="true" sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: 'background.paper', display: 'grid', placeItems: 'center', color: 'brand.apricot', flexShrink: 0 }}>
          <CottageRounded sx={{ fontSize: 28 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.3 }}>Mahalleye uğra</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
            Evini kur, komşularına çay bırak.
          </Typography>
        </Box>
      </ButtonBase>
      <IconButton
        onClick={dismiss}
        aria-label="Mahalle kartını kapat"
        sx={{ position: 'absolute', top: '50%', right: 6, transform: 'translateY(-50%)', width: 44, height: 44 }}
      >
        <CloseRounded fontSize="small" />
      </IconButton>
    </Box>
  )
}
