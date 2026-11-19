import { Avatar } from '@mui/material'
import { initialsFrom } from '../../utils/format.js'

/** Bir kişinin profil görseli: baş harfleri. */
export default function UserAvatar({ name = '', size = 40, sx, ...rest }) {
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
