import { Box, Stack } from '@mui/material'
import { CheckCircleRounded, HelpOutlineRounded, PollOutlined } from '@mui/icons-material'

// Gönderi türü rozetleri: Soru (gök mavisi), Çözüldü (şifa yeşili), Anket
// (leylak). Renk tek başına anlam taşımaz: her rozet ikon + metin.
// Paylaşım (DISCUSSION) türünde hiçbir şey göstermez.
const TONES = {
  question: { color: 'brand.sky', bgcolor: 'brand.skySoft', Icon: HelpOutlineRounded, label: 'Soru' },
  solved: { color: 'primary.main', bgcolor: 'brand.primarySoft', Icon: CheckCircleRounded, label: 'Çözüldü' },
  poll: { color: 'brand.lilac', bgcolor: 'brand.lilacSoft', Icon: PollOutlined, label: 'Anket' },
}

export function TypePill({ tone, label, sx }) {
  const t = TONES[tone]
  const Icon = t.Icon
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.5, height: 26, pl: 0.875, pr: 1.125,
        borderRadius: '999px', bgcolor: t.bgcolor, color: t.color,
        fontSize: '0.8125rem', fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap', ...sx
      }}
    >
      <Icon sx={{ fontSize: 16 }} aria-hidden />
      {label || t.label}
    </Box>
  )
}

export default function PostTypeBadges({ postType, solved, sx }) {
  if (postType !== 'QUESTION' && postType !== 'POLL') return null
  return (
    <Stack direction="row" spacing={0.75} sx={{ mb: 1, ...sx }}>
      {postType === 'QUESTION' && <TypePill tone="question" />}
      {postType === 'QUESTION' && solved && <TypePill tone="solved" />}
      {postType === 'POLL' && <TypePill tone="poll" />}
    </Stack>
  )
}
