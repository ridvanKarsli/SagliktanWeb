// HUD'da gün dilimi + hava hapı ("Öğle · Yağmurlu"). Dokununca kısa açıklama.
import { useEffect, useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { AcUnitRounded, CloudRounded, DehazeRounded, FilterDramaRounded, NightsStayRounded, UmbrellaRounded, WbSunnyRounded, WbTwilightRounded } from '@mui/icons-material'
import { focusRingSx } from '../../design/focus.js'
import { pillSx, HUD_INK } from './hudStyle.js'
import { TIME_LABELS, WEATHER_LABELS } from '../hooks/useAtmosphere.js'

function iconFor(atmo) {
  switch (atmo.weather) {
    case 'rain': return <UmbrellaRounded />
    case 'snow': return <AcUnitRounded />
    case 'fog': return <DehazeRounded />
    case 'cloudy': return <CloudRounded />
    case 'partly': return atmo.timeOfDay === 'gece' ? <NightsStayRounded /> : <FilterDramaRounded />
    default:
      if (atmo.timeOfDay === 'gece') return <NightsStayRounded />
      if (atmo.timeOfDay === 'aksam') return <WbTwilightRounded />
      return <WbSunnyRounded />
  }
}

export function AtmoPill({ atmo }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return undefined
    const t = setTimeout(() => setOpen(false), 6000)
    return () => clearTimeout(t)
  }, [open])
  // gece "güneşli" denmez
  const w = atmo.weather === 'clear' && atmo.timeOfDay === 'gece' ? 'Açık' : (WEATHER_LABELS[atmo.weather] || '')
  const label = `${TIME_LABELS[atmo.timeOfDay] || ''} · ${w}`
  // dar ekranda hap kısa ("Sabah · Parçalı"); tam metin ekran okuyucuda ve açıklamada
  const short = `${TIME_LABELS[atmo.timeOfDay] || ''} · ${w.split(' ')[0]}`
  return (
    <Box sx={{ position: 'relative', pointerEvents: 'auto' }}>
      <ButtonBase
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Mahallede şimdi ${label}. Açıklama için dokun`}
        sx={{ ...pillSx, height: '2.4rem', minWidth: '2.4rem', px: 1.25, gap: 0.6, '@media (max-width: 379px)': { px: 0 }, '& svg': { fontSize: '1.2rem', color: '#2F8F78' }, '&.Mui-focusVisible': focusRingSx }}
      >
        {iconFor(atmo)}
        <Typography component="span" sx={{ fontWeight: 800, fontSize: '0.82rem', color: HUD_INK, whiteSpace: 'nowrap', '@media (max-width: 379px)': { display: 'none' } }}>{short}</Typography>
      </ButtonBase>
      {open && (
        <Box role="status" sx={{ ...pillSx, position: 'absolute', right: 0, top: 'calc(100% + 6px)', borderRadius: '14px', p: 1.25, width: 'min(78vw, 260px)', zIndex: 6 }}>
          <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, mb: 0.25 }}>{label}</Typography>
          <Typography sx={{ fontSize: '0.88rem', lineHeight: 1.4 }}>
            Mahallede hava ve gün, İstanbul saatine göre herkes için aynıdır.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
