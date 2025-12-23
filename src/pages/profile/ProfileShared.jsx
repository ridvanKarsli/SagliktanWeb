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
  // Eğer icon varsa, label'ı göster (icon ile birlikte), yoksa sadece değeri göster
  if (icon && label) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: { xs: 0.75, sm: 1 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 1,
          bgcolor: 'rgba(255,255,255,0.05)',
          color: 'text.secondary',
          flexShrink: 0
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary', 
            fontWeight: 500,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'block',
            mb: 0.25
          }}>
            {label}
          </Typography>
          <Typography variant="body1" sx={{ 
            fontWeight: 600, 
            wordBreak: 'break-word', 
            color: 'text.primary',
            fontSize: { xs: '14px', md: '15px' }
          }}>
            {value || '—'}
          </Typography>
        </Box>
      </Box>
    )
  }
  
  // Icon yoksa, sadece değeri göster (label gereksiz)
  return (
    <Typography variant="body1" sx={{ 
      fontWeight: 500, 
      wordBreak: 'break-word', 
      color: 'text.primary',
      py: { xs: 0.5, sm: 0.75 },
      fontSize: { xs: '14px', md: '15px' }
    }}>
      {value || '—'}
    </Typography>
  )
}

export function Section({ title, count, children, chipIcon, actionIcon, onActionClick }) {
  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 2, sm: 2.5 } }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            fontSize: { xs: 18, sm: 20 },
            color: 'text.primary',
            flex: 1
          }}
        >
          {title}
        </Typography>
        {actionIcon && onActionClick && (
          <Box onClick={onActionClick} sx={{ cursor: 'pointer' }}>
            {actionIcon}
          </Box>
        )}
      </Stack>
      <Box>{children}</Box>
    </Box>
  )
}
