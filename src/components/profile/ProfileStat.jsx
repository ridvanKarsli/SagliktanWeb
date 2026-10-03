import { Box, ButtonBase, Skeleton, Typography } from '@mui/material'
import { fonts } from '../../design/tokens.js'
import { formatCount } from '../../utils/format.js'

// İstatistik hücresi: sayı + etiket. onClick verilirse ilgili bölüme götüren
// gerçek bir buton olur (ör. "Gönderi" sayısına dokunmak gönderilere iner).
// highlight: "Faydalı" gibi sıcak (kayısı) vurgu; loading: sayı gelene kadar iskelet.
export default function ProfileStat({ value, label, onClick, highlight = false, loading = false }) {
  const content = (
    <>
      {loading ? (
        <Skeleton variant="text" sx={{ fontSize: '1.45rem', width: 32, mx: { xs: 'auto', md: 0 } }} />
      ) : (
        <Typography
          component="span"
          sx={{
            display: 'block', fontFamily: fonts.display, fontWeight: 800, fontSize: '1.45rem', lineHeight: 1.2,
            color: highlight ? 'brand.apricotInk' : 'text.primary', fontVariantNumeric: 'tabular-nums'
          }}
        >
          {formatCount(value)}
        </Typography>
      )}
      <Typography variant="caption" component="span" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, fontSize: '0.8125rem' }}>
        {label}
      </Typography>
    </>
  )
  const cell = { flex: { xs: 1, md: '0 0 auto' }, minWidth: 64, px: { xs: 0.5, md: 2 }, py: 0.5, textAlign: { xs: 'center', md: 'left' } }
  if (!onClick) return <Box sx={cell}>{content}</Box>
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`${formatCount(value)} ${label} - göster`}
      sx={{
        ...cell, display: 'block', minHeight: 44,
        '&:first-of-type': { borderRadius: 0 },
        '&:hover .MuiTypography-root:first-of-type': { color: 'primary.main' },
        '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.light', borderRadius: '10px' },
      }}
    >
      {content}
    </ButtonBase>
  )
}
