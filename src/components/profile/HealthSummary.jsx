import { Chip, Stack } from '@mui/material'
import { PlaceOutlined } from '@mui/icons-material'
import { healthSummaryParts } from '../../utils/communityProfile.js'

// Profilde ad altında kısa özet: "Hasta yakını · Yakınına 2021'de tanı · 📍 İzmir".
export default function HealthSummary({ profile, sx }) {
  const health = healthSummaryParts({ ...(profile || {}), city: null })
  const city = profile?.city
  if (health.length === 0 && !city) return null
  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={sx}>
      {health.map(p => <Chip key={p} size="small" label={p} variant="outlined" sx={{ height: 26 }} />)}
      {city && (
        <Chip
          size="small"
          variant="outlined"
          icon={<PlaceOutlined sx={{ fontSize: '16px !important' }} />}
          label={city}
          aria-label={`Şehir: ${city}`}
          sx={{ height: 26 }}
        />
      )}
    </Stack>
  )
}
