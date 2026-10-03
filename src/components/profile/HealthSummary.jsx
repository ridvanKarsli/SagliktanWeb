import { Chip, Stack } from '@mui/material'
import { healthSummaryParts } from '../../utils/communityProfile.js'

// Profilde ad altında kısa sağlık özeti: "Hasta yakını · Yakınına 2021'de tanı · İzmir".
export default function HealthSummary({ profile, sx }) {
  const parts = healthSummaryParts(profile || {})
  if (parts.length === 0) return null
  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={sx}>
      {parts.map(p => <Chip key={p} size="small" label={p} variant="outlined" sx={{ height: 26 }} />)}
    </Stack>
  )
}
