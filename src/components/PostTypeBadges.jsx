import { Chip, Stack } from '@mui/material'
import { CheckCircleRounded, HelpOutlineRounded, PollOutlined } from '@mui/icons-material'

// Gönderi türü rozetleri: Soru (+ Çözüldü) / Anket. Paylaşımda hiçbir şey göstermez.
export default function PostTypeBadges({ postType, solved, sx }) {
  if (postType !== 'QUESTION' && postType !== 'POLL') return null
  return (
    <Stack direction="row" spacing={0.75} sx={{ mb: 0.75, ...sx }}>
      {postType === 'QUESTION' && (
        <Chip
          size="small"
          icon={<HelpOutlineRounded />}
          label="Soru"
          variant="outlined"
          color="info"
          sx={{ height: 24, fontWeight: 700 }}
        />
      )}
      {postType === 'QUESTION' && solved && (
        <Chip
          size="small"
          icon={<CheckCircleRounded />}
          label="Çözüldü"
          color="success"
          sx={{ height: 24, fontWeight: 700 }}
        />
      )}
      {postType === 'POLL' && (
        <Chip size="small" icon={<PollOutlined />} label="Anket" variant="outlined" color="warning" sx={{ height: 24, fontWeight: 700 }} />
      )}
    </Stack>
  )
}
