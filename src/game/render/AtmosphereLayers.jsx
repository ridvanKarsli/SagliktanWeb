// Gökyüzü ve hava katmanları (ekran koordinatı). Arka: gök, yıldız, güneş/ay,
// bulut. Ön: sis, yağmur, kar. İkisi de pointer-events almaz ve yalnızca
// atmosfer ya da ekran boyutu değişince yeniden çizilir (dünya karolarına
// dokunmaz).
import { memo } from 'react'
import { Box } from '@mui/material'
import { SkyBackdrop, Stars, SkyBody, Clouds, Fog, Rain, Snow, WorldTint } from '../art/index.js'

const layerSx = { position: 'absolute', inset: 0, pointerEvents: 'none' }

export const SkyLayer = memo(function SkyLayer({ atmo, w, h }) {
  const tone = atmo.timeOfDay === 'gece' ? 'night' : atmo.rain || atmo.snow ? 'storm' : 'day'
  return (
    <Box sx={{ ...layerSx, zIndex: 0 }} aria-hidden="true">
      <svg width={w} height={h} style={{ display: 'block' }}>
        <SkyBackdrop timeOfDay={atmo.timeOfDay} weather={atmo.weather} width={w} height={h} />
        {atmo.stars && <Stars width={w} height={h} />}
        <SkyBody timeOfDay={atmo.timeOfDay} weather={atmo.weather} width={w} height={h} />
        <Clouds density={atmo.clouds} width={w} height={h} tone={tone} />
      </svg>
    </Box>
  )
})

// Ön katman: gün/hava tonu (tüm ekran, multiply) + sis/yağmur/kar.
// Ton tüm ekrana serilir: yalnızca dünyayı kırpmak evlerin yarısını ya da
// gökte bir bandı tonsuz bırakıyordu; gökyüzünün de hafif tonlanması doğal duruyor.
export const WeatherLayer = memo(function WeatherLayer({ atmo, w, h }) {
  const tinted = atmo.tintOpacity > 0 || atmo.weatherTintOpacity > 0
  if (!tinted && !atmo.fog && !atmo.rain && !atmo.snow) return null
  return (
    <Box sx={{ ...layerSx, zIndex: 3 }} aria-hidden="true">
      <svg width={w} height={h} style={{ display: 'block' }}>
        {tinted && <WorldTint timeOfDay={atmo.timeOfDay} weather={atmo.weather} width={w} height={h} />}
        {atmo.fog && <Fog width={w} height={h} />}
        {atmo.rain > 0 && <Rain intensity={atmo.rain} width={w} height={h} />}
        {atmo.snow && <Snow width={w} height={h} />}
      </svg>
    </Box>
  )
})
