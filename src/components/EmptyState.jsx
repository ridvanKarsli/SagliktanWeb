import { Box, Button, Typography } from '@mui/material'

// Ortak boş durum bileşeni - önceden her sayfa kendi "Henüz ... yok" düz
// metnini tekrarlıyordu (bkz. Home/Posts/DiseaseGroups/SubGroups/
// Conversations/Profile/UserProfile). X.com tarzı ürünlerde boş durumlar
// ikon + kısa açıklama + (varsa) net bir sonraki adım CTA'sıyla sunulur -
// düz "kayıt yok" metni kullanıcıyı ne yapması gerektiği konusunda
// bilgisizce bırakıyordu.
export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, dense = false }) {
  return (
    <Box sx={{ textAlign: 'center', py: dense ? 4 : 7, px: 2 }}>
      {Icon && (
        <Icon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.45, mb: 1.5 }} />
      )}
      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: description ? 0.5 : 0 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="outlined" size="small" onClick={onAction} sx={{ mt: 2.5, minHeight: 40 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
