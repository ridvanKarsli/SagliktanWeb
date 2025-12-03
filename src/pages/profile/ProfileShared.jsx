import { Box, Stack, Typography, Divider, Paper } from '@mui/material'

export function prettyDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR') : 'Belirtilmemiş'
}

export function SectionList({ items, renderItem, getKey, emptyText }) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          textAlign: 'center',
          py: { xs: 6, md: 8 },
          px: 3,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <Box
          component="img"
          src="/Lumo.png"
          alt="Lumo"
          sx={{ 
            width: { xs: 140, md: 180 }, 
            height: 'auto', 
            mb: 3, 
            mx: 'auto',
            display: 'block',
            maxWidth: '100%',
            filter: 'drop-shadow(0 6px 20px rgba(52,195,161,0.2))'
          }}
        />
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.9 }}>{emptyText}</Typography>
      </Paper>
    )
  }
  return (
    <Stack spacing={2}>
      {items.map((it, i) => (
        <Box key={getKey?.(it, i) ?? i}>
          {renderItem(it, i)}
        </Box>
      ))}
    </Stack>
  )
}

export function SubRow({ label, value, icon }) {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
      gap: { xs: 1, sm: 2 },
      alignItems: 'start',
      py: { xs: 0.5, sm: 0.75 }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-word', color: 'text.primary' }}>{value || '—'}</Typography>
    </Box>
  )
}

export function Section({ title, count, children, chipIcon }) {
  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          mb: { xs: 2, sm: 2.5 },
          fontSize: { xs: 18, sm: 20 },
          color: 'text.primary'
        }}
      >
        {title}{count != null ? ` (${count})` : ''}
      </Typography>
      <Box>{children}</Box>
    </Box>
  )
}
