import { Box, Button, Typography } from '@mui/material'
import UserAvatar from './avatars/UserAvatar.jsx'

// Ortak boş durum: kısa başlık + ne olduğunu ve sıradaki adımı anlatan bir
// cümle + (varsa) tek net eylem. `companion` verilirse gri bir ikon yerine
// Sağlıktan'ın yol arkadaşlarından biri (avatarArt anahtarı) hafifçe
// süzülerek eşlik eder; yoksa ikon yumuşak bir yeşil dairede durur.
export default function EmptyState({
  icon: Icon, companion, title, description, actionLabel, onAction, actionIcon, dense = false, sx
}) {
  return (
    <Box sx={{ textAlign: 'center', py: dense ? 4 : 6, px: 2, ...sx }}>
      {companion ? (
        <Box className="sg-float" aria-hidden sx={{ display: 'inline-flex', mb: 2 }}>
          <UserAvatar
            avatarKey={companion}
            size={dense ? 64 : 84}
            sx={{ boxShadow: (t) => `0 10px 24px rgba(${t.palette.brand.shadowRgb}, 0.14)` }}
          />
        </Box>
      ) : Icon && (
        <Box
          aria-hidden
          sx={{
            width: dense ? 52 : 64, height: dense ? 52 : 64, mx: 'auto', mb: 1.75, borderRadius: '50%',
            display: 'grid', placeItems: 'center', bgcolor: 'brand.primarySoft', color: 'primary.main'
          }}
        >
          <Icon sx={{ fontSize: dense ? 26 : 30 }} />
        </Box>
      )}
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
