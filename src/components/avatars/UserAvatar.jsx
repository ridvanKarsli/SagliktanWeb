import { Avatar } from '@mui/material'
import { AVATAR_ART, hasAvatarArt } from './avatarArt.jsx'
import { initialsFrom } from '../../utils/format.js'

/**
 * Bir kişinin profil görseli: seçtiği avatar varsa onun çizimi, yoksa baş
 * harfleri. Uygulamada kişi gösterilen her yerde bu kullanılır ki avatar
 * seçimi her yerde aynı görünsün.
 */
export default function UserAvatar({ avatarKey, name = '', size = 40, sx, ...rest }) {
  if (hasAvatarArt(avatarKey)) {
    const { bg, art } = AVATAR_ART[avatarKey]
    return (
      <Avatar
        alt={name || undefined}
        sx={{ width: size, height: size, bgcolor: bg, p: 0, ...sx }}
        {...rest}
      >
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" focusable="false">
          {art}
        </svg>
      </Avatar>
    )
  }
  return (
    <Avatar
      alt={name || undefined}
      sx={{ width: size, height: size, fontSize: Math.round(size * 0.38), ...sx }}
      {...rest}
    >
      {initialsFrom(name)}
    </Avatar>
  )
}
