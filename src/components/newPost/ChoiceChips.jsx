import { Box, Chip } from '@mui/material'

// Tek seçimli chip grubu (radiogroup). Mobilde başparmakla rahat seçilsin
// diye 40px yükseklik; wrap=false iken yatay kaydırılır.
export default function ChoiceChips({ items, value, onChange, getLabel, ariaLabel, wrap = false }) {
  return (
    <Box
      role="radiogroup"
      aria-label={ariaLabel}
      sx={{
        display: 'flex', gap: 1, flexWrap: wrap ? 'wrap' : 'nowrap',
        overflowX: wrap ? 'visible' : 'auto', mx: wrap ? 0 : -0.5, px: wrap ? 0 : 0.5, pb: 0.5,
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }
      }}
    >
      {items.map(it => {
        const selected = String(it.id) === String(value)
        return (
          <Chip
            key={it.id}
            role="radio"
            aria-checked={selected}
            label={getLabel(it)}
            onClick={() => onChange(it.id)}
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            sx={{ height: 40, borderRadius: 999, flexShrink: 0, fontWeight: selected ? 700 : 500, px: 0.5 }}
          />
        )
      })}
    </Box>
  )
}
