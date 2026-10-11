// Tohum (oyun parası) işareti: küçük filiz. Metinle birlikte kullanılır,
// tek başına anlam taşımaz (aria-hidden).
import { Box } from '@mui/material'

export function SeedGlyph({ size = 18, sx }) {
  return (
    <Box component="svg" viewBox="0 0 20 20" aria-hidden="true" focusable="false" sx={{ width: size, height: size, flexShrink: 0, display: 'block', ...sx }}>
      <ellipse cx="10" cy="17.2" rx="5.4" ry="1.8" fill="#B98E64" />
      <path d="M10 17 L10 9" stroke="#3F9469" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 10.5 C9.4 6.6 6.4 4.4 2.6 4.6 C2.8 8.4 5.6 10.8 10 10.5Z" fill="#62B784" />
      <path d="M10 9 C10.6 5 13.8 2.6 17.6 2.8 C17.4 6.8 14.4 9.2 10 9Z" fill="#8FD3A0" />
    </Box>
  )
}

// "40 tohum" gibi fiyat/bakiye etiketi
export function SeedAmount({ value, size = 16, strong = true, sx }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, fontWeight: strong ? 800 : 600, ...sx }}>
      <SeedGlyph size={size} />
      <span>{value}</span>
      <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}> tohum</Box>
    </Box>
  )
}
