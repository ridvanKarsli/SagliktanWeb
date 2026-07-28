import { Box } from '@mui/material'

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Arama sonuçlarında eşleşen kelimeleri vurgular. Backend artık prefix +
 * yazım hatası toleranslı (fuzzy) arama yaptığı için sonucun NEDEN
 * eşleştiğini göstermek önemli - kullanıcı "diyab" yazdığında "diyabet"
 * içindeki "diyab" kısmı vurgulanır.
 *
 * Sorgudaki her kelime ayrı ayrı aranır (case-insensitive). Regex split
 * tek bir yakalama grubuyla yapıldığı için sonuç dizisinde eşleşmeler her
 * zaman tek indekslerde (1, 3, 5, ...) olur - stateful regex.test() yerine
 * bu garantiye güveniyoruz.
 */
export default function HighlightText({ text = '', query = '', component = 'span', sx, ...rest }) {
  const clean = String(text ?? '')
  const words = String(query ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp)

  if (words.length === 0 || !clean) {
    return <Box component={component} sx={sx} {...rest}>{clean}</Box>
  }

  const pattern = new RegExp(`(${words.join('|')})`, 'gi')
  const parts = clean.split(pattern)

  return (
    <Box component={component} sx={sx} {...rest}>
      {parts.map((part, i) =>
        i % 2 === 1 && part ? (
          <Box
            key={i}
            component="mark"
            sx={{ bgcolor: 'transparent', color: 'primary.main', fontWeight: 700 }}
          >
            {part}
          </Box>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </Box>
  )
}
