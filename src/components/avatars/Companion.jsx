import { Box } from '@mui/material'
import { AVATAR_ART, hasAvatarArt } from './avatarArt.jsx'

/**
 * Süsleme amaçlı yol arkadaşı çizimi (karşılama, boş durumlar, karşılama
 * akışı). Bir kişiyi temsil etmez; varsayılan olarak ekran okuyucudan gizlidir.
 * Kişiyi gösterirken UserAvatar kullanılır.
 */
export default function Companion({ name, size = 56, label, className, sx, artClassName }) {
  if (!hasAvatarArt(name)) return null
  const { bg, art } = AVATAR_ART[name]
  return (
    <Box
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      sx={{ width: size, height: size, borderRadius: '50%', bgcolor: bg, flexShrink: 0, display: 'grid', placeItems: 'center', ...sx }}
    >
      <Box component="svg" viewBox="0 0 64 64" className={artClassName} sx={{ width: '100%', height: '100%', display: 'block' }} aria-hidden focusable="false">
        {art}
      </Box>
    </Box>
  )
}
