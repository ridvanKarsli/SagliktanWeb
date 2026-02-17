import { Box, Stack, Typography } from '@mui/material'

export function prettyDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR') : null
}

export function SectionList({ items, renderItem, getKey, emptyText }) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
        {emptyText}
      </Typography>
    )
  }
  return (
    <Stack spacing={1.5}>
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
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
      {icon && (
        <Box sx={{ color: 'text.secondary', display: 'flex' }}>
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1 }}>
        {label && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {label}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  )
}

export function Section({ title, children, actionIcon, onActionClick }) {
  return (
    <Box sx={{ px: { xs: 2, md: 0 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h3" sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
        {actionIcon && onActionClick && (
          <Box onClick={onActionClick} sx={{ cursor: 'pointer', color: 'text.secondary' }}>
            {actionIcon}
          </Box>
        )}
      </Stack>
      {children}
    </Box>
  )
}
