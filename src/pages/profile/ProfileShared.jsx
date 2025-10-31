import { Box, Stack, Typography, Divider, Chip } from '@mui/material'
import { LocalHospital } from '@mui/icons-material'

export function prettyDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR') : 'Belirtilmemiş'
}

export function SectionList({ items, renderItem, getKey, emptyText }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>{emptyText}</Typography>
  }
  return (
    <Stack divider={<Divider sx={{ my: { xs: 0.75, sm: 1 }, opacity: 0.12 }}/> } spacing={{ xs: 0.75, sm: 1 }}>
      {items.map((it, i) => (
        <Box key={getKey?.(it, i) ?? i}>{renderItem(it, i)}</Box>
      ))}
    </Stack>
  )
}

export function SubRow({ label, value }) {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' },
      gap: { xs: 0.5, sm: 1 },
      alignItems: 'start',
      minHeight: 44
    }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{value || '—'}</Typography>
    </Box>
  )
}

export function GlassTile({ icon, label, value, inline = false }) {
  return (
    <Box
      role="group"
      aria-label={label}
      sx={{
        display: inline ? 'grid' : 'flex',
        gridTemplateColumns: inline ? { xs: '1fr', sm: '160px 1fr' } : undefined,
        alignItems: 'flex-start',
        gap: { xs: 0.75, sm: 1 },
        p: { xs: 0.75, sm: 1.25 },
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'linear-gradient(180deg, rgba(7,20,28,0.36), rgba(7,20,28,0.20))',
        backdropFilter: 'blur(8px)',
        wordBreak: 'break-word',
        minHeight: { xs: 40, sm: 44 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography variant="overline" sx={{ letterSpacing: 0.5, opacity: 0.85 }}>
          {label}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, color: '#FAF9F6', wordBreak: 'break-word' }}
      >
        {value || '—'}
      </Typography>
    </Box>
  )
}

export function Section({ title, count, children, chipIcon }) {
  return (
    <Stack spacing={{ xs: 1, sm: 1.25 }} sx={{ mb: { xs: 1.25, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          icon={chipIcon ?? <LocalHospital sx={{ fontSize: 18 }} />}
          label={count != null ? `${title} (${count})` : title}
          color="primary"
          variant="outlined"
          sx={{
            borderColor: 'rgba(52,195,161,0.45)',
            bgcolor: 'rgba(52,195,161,0.08)',
            '& .MuiChip-label': { fontWeight: 700 }
          }}
        />
      </Box>
      <Stack spacing={{ xs: 0.75, sm: 1 }}>{children}</Stack>
      <Divider sx={{ opacity: 0.16, mt: { xs: 0.5, sm: 0.5 } }} />
    </Stack>
  )
}
