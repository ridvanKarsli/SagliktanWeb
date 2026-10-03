import { Box, ButtonBase, Typography } from '@mui/material'
import { formatCount } from '../../utils/format.js'

// İstatistik hücresi: sayı + etiket. onClick verilirse ilgili bölüme götüren
// gerçek bir buton olur (ör. "Gönderi" sayısına dokunmak gönderilere iner).
export default function ProfileStat({ value, label, onClick, highlight = false }) {
  const content = (
    <>
      <Typography
        variant="subtitle2"
        component="span"
        sx={{ display: 'block', fontWeight: 700, lineHeight: 1.3, color: highlight ? 'primary.main' : 'text.primary', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatCount(value)}
      </Typography>
      <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>{label}</Typography>
    </>
  )
  if (!onClick) return <Box sx={{ minWidth: 44, py: 0.25, display: 'flex', flexDirection: 'column' }}>{content}</Box>
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`${formatCount(value)} ${label} - göster`}
      sx={{ flexDirection: 'column', alignItems: 'flex-start', borderRadius: 1, px: 0.5, mx: -0.5, py: 0.25, minWidth: 44 }}
    >
      {content}
    </ButtonBase>
  )
}
