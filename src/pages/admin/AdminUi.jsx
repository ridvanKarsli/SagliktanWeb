import { Box, Button, Chip, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { SearchRounded } from '@mui/icons-material'
import EmptyState from '../../components/EmptyState.jsx'

// Admin paneli için ortak, mobil-öncelikli yapı taşları. Her sekme aynı
// dili konuşsun diye: tek tip kart, tek tip filtre (segment), tek tip arama
// kutusu, tek tip "daha fazla" ve boş durum.

// Segment filtre: dar ekranda select açmak yerine tek dokunuşla seçilen,
// yatay kaydırılabilir chip dizisi. options: [{ value, label, count? }]
export function SegmentedFilter({ value, onChange, options, ariaLabel }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      role="radiogroup"
      aria-label={ariaLabel}
      sx={{
        overflowX: 'auto', pb: 0.5, mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 },
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }
      }}
    >
      {options.map(o => {
        const selected = o.value === value
        return (
          <Chip
            key={String(o.value)}
            role="radio"
            aria-checked={selected}
            label={o.count != null ? `${o.label} · ${o.count}` : o.label}
            onClick={() => onChange(o.value)}
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            sx={{ flexShrink: 0, minHeight: 36, fontWeight: 600, borderRadius: 999, px: 0.5 }}
          />
        )
      })}
    </Stack>
  )
}

export function AdminSearch({ value, onChange, placeholder, ...rest }) {
  return (
    <TextField
      size="small"
      fullWidth
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      type="search"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          )
        },
        htmlInput: { 'aria-label': placeholder, enterKeyHint: 'search' }
      }}
      {...rest}
    />
  )
}

// Liste kartı: her sekmedeki öğeler (şikayet, kullanıcı, içerik) aynı
// kabuğu kullanır. role="listitem" + üst sarmalayıcı role="list" (E2E
// bunu kullanıyor - bkz. e2e/admin.spec.js).
export function AdminCard({ children, sx, ...rest }) {
  return (
    <Box
      role="listitem"
      sx={{
        p: { xs: 1.75, sm: 2 }, borderRadius: 3, bgcolor: 'background.paper',
        border: '1px solid', borderColor: 'divider',
        width: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden',
        ...sx
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}

export function AdminList({ children, columns = { xs: 1, md: 2 } }) {
  return (
    <Box
      role="list"
      sx={{
        display: 'grid', gap: 1.5,
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, minmax(0, 1fr))`,
          md: `repeat(${columns.md || 2}, minmax(0, 1fr))`
        }
      }}
    >
      {children}
    </Box>
  )
}

// "Etiket: değer" satırı - kart içindeki küçük meta bilgiler için.
export function MetaRow({ label, children }) {
  return (
    <Stack direction="row" spacing={1} alignItems="baseline" sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0, minWidth: 72 }}>{label}</Typography>
      <Typography variant="body2" sx={{ minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{children}</Typography>
    </Stack>
  )
}

export function LoadMoreButton({ loading, shown, total, onClick, noun = 'kayıt' }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Button variant="outlined" onClick={onClick} disabled={loading} sx={{ minHeight: 44, minWidth: 200 }}>
        {loading ? <CircularProgress size={18} /> : `Daha fazla ${noun} (${shown}/${total})`}
      </Button>
    </Box>
  )
}

export function AdminLoading() {
  return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={22} /></Box>
}

export function AdminEmpty(props) {
  return <EmptyState dense {...props} />
}

export function SectionTitle({ children, action }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{children}</Typography>
      {action}
    </Stack>
  )
}
