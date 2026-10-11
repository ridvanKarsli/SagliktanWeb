import { Box, Typography, useTheme } from '@mui/material'
import { visuallyHidden } from '../../utils/visuallyHidden.js'

// Sağlıktan'a özel yükleme göstergesi (genel dönen halka yerine).
//
//   size: 'sm' (20px, buton içi) | 'md' (40px, bölüm) | 'lg' (72px, sayfa)
//         ya da piksel sayısı. 32px altı her boyut sade işareti kullanır:
//         sırayla kabaran üç yaprak tanesi. Daha büyükleri filizdir: iki
//         yaprak sapın ucunda açılıp kapanır, çevresinde üç tohum nefes
//         alarak döner (avatarlardaki "filiz" ile aynı dil).
//   color: 'primary' (marka renkleri) | 'inherit' (currentColor - dolu
//          butonların içinde metin rengini alır).
//   label: ekran okuyucuya söylenen metin. caption verilirse görünür metin
//          zaten o olduğu için gizli etiket eklenmez.
//   still: hareket yok (ör. çekerek yenilemede parmak çekerken).
//   appear: md/lg kısa bir gecikmeyle belirir (hızlı yüklemelerde hiç
//           görünmesin); zaten ekranda olan bir işaret için false.
//
// Animasyonlar index.css'te (sg-loader-*); azaltılmış harekette durgun,
// tam açık filiz görünür.
const SIZES = { sm: 20, md: 40, lg: 72 }

function colorsFor(color, brand) {
  if (color === 'inherit') {
    return { leafA: 'currentColor', leafB: 'currentColor', stem: 'currentColor', soil: 'currentColor', seedA: 'currentColor', seedB: 'currentColor', seedC: 'currentColor', dim: 0.7 }
  }
  return {
    leafA: brand.primaryBright, leafB: brand.primary, stem: brand.primaryDeep, soil: brand.primarySoft,
    seedA: brand.primary, seedB: brand.primaryBright, seedC: brand.apricot, dim: 1,
  }
}

// Buton içi sade işaret: çapraz duran üç küçük yaprak.
const BUD = 'M-4 4C-4-1.4-1.4-4 4-4C4 1.4 1.4 4-4 4Z'

function BudMark({ px, c }) {
  const fills = [c.seedA, c.seedB, c.seedC]
  return (
    <svg width={px} height={px} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {[5, 12, 19].map((x, i) => (
        <g key={x} transform={`translate(${x} 12)`}>
          <path className="sg-ld-bud" d={BUD} fill={fills[i]} opacity={c.dim < 1 && i === 1 ? c.dim : undefined} style={{ animationDelay: `${i * 0.16}s` }} />
        </g>
      ))}
    </svg>
  )
}

function SproutMark({ px, c }) {
  const inherit = c.dim < 1
  return (
    <svg width={px} height={px} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="21" fill="none" stroke={inherit ? 'currentColor' : c.soil} strokeOpacity={inherit ? 0.18 : 1} strokeWidth="1.2" />
      <ellipse cx="24" cy="38" rx="7" ry="1.8" fill={c.soil} opacity={inherit ? 0.3 : 1} />
      <g className="sg-ld-sprout">
        <rect x="22.9" y="24" width="2.2" height="14" rx="1.1" fill={c.stem} />
        <path className="sg-ld-leaf-l" d="M24 25.6C23.4 18.6 18.4 13.6 11 13.6C11 21 16.2 25.9 24 25.6Z" fill={c.leafA} />
        <path className="sg-ld-leaf-r" d="M24 25.6C24.6 17.4 30.2 12.2 37.6 12.6C37.4 20.6 31.8 25.9 24 25.6Z" fill={c.leafB} opacity={inherit ? c.dim : undefined} />
      </g>
      <g className="sg-ld-orbit">
        <circle className="sg-ld-seed" cx="24" cy="3" r="2.6" fill={c.seedC} />
        <circle className="sg-ld-seed" cx="42.19" cy="34.5" r="2.6" fill={c.seedA} />
        <circle className="sg-ld-seed" cx="5.81" cy="34.5" r="2.6" fill={c.seedB} />
      </g>
    </svg>
  )
}

export default function SaglikLoader({ size = 'md', color = 'primary', label = 'Yükleniyor', caption, still = false, appear = true, sx }) {
  const px = typeof size === 'number' ? size : (SIZES[size] ?? SIZES.md)
  const simple = px < 32
  const c = colorsFor(color, useTheme().palette.brand)
  return (
    <Box
      component="span"
      role="status"
      aria-live="polite"
      className={`sg-loader${!simple && appear ? ' sg-loader-enter' : ''}`}
      data-still={still || undefined}
      sx={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 1.25,
        verticalAlign: 'middle', lineHeight: 0,
        ...sx,
      }}
    >
      {simple ? <BudMark px={px} c={c} /> : <SproutMark px={px} c={c} />}
      {caption
        ? <Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.4 }}>{caption}</Typography>
        : <Box component="span" sx={visuallyHidden}>{label}</Box>}
    </Box>
  )
}
