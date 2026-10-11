import { Box, Button, Typography } from '@mui/material'
import IconBadge from './common/IconBadge.jsx'

// Ortak boş durum: kısa başlık + ne olduğunu ve sıradaki adımı anlatan bir
// cümle + (varsa) tek net eylem. İkon yumuşak bir marka dairesinde durur.
// Yol arkadaşları burada kullanılmaz; onlar avatar ve kutlama anlarına
// ayrıldı ki her boş ekranda tekrar edip sıradanlaşmasınlar.
export default function EmptyState({
  icon, title, description, actionLabel, onAction, actionIcon, dense = false, sx
}) {
  return (
    <Box sx={{ textAlign: 'center', py: dense ? 4 : 6, px: 2, ...sx }}>
      {icon && <IconBadge icon={icon} size={dense ? 52 : 64} sx={{ mx: 'auto', mb: 1.75 }} />}
      <Typography
        variant={dense ? 'h6' : 'h5'}
        component="p"
        sx={{ fontFamily: (t) => t.typography.h5.fontFamily, fontWeight: 700, color: 'text.primary', mb: description ? 0.75 : 0 }}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} startIcon={actionIcon} sx={{ mt: 2.5 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
