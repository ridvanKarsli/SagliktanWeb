import { Box, Button, Typography } from '@mui/material'
import Companion from './Companion.jsx'

/**
 * Boş durum: bir yol arkadaşı, kısa sıcak bir başlık, ne yapılabileceğini
 * söyleyen bir cümle ve (varsa) tek bir sonraki adım. Profil, mesajlar ve
 * istekler ekranlarında kullanılır.
 */
export default function CompanionEmpty({ companion = 'filiz', title, description, actionLabel, onAction, dense = false }) {
  return (
    <Box sx={{ textAlign: 'center', py: dense ? 4 : 6, px: 2 }}>
      <Box className="sg-float" sx={{ display: 'inline-block', mb: 1.75 }}>
        <Companion name={companion} size={dense ? 72 : 88} />
      </Box>
      <Typography variant="h5" component="p" sx={{ mb: description ? 0.5 : 0 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 380, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 2.5 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
