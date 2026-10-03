import { Box } from '@mui/material'
import { ForumRounded, GroupsRounded } from '@mui/icons-material'

const VARIANTS = {
  group: { Icon: GroupsRounded, bgcolor: 'rgba(76,184,159,0.16)', color: 'primary.main' },
  forum: { Icon: ForumRounded, bgcolor: 'rgba(224,139,109,0.14)', color: 'secondary.main' },
}

// Grup (hastalık grubu) ya da forum (alt grup) satırlarının başındaki yuvarlak ikon.
export default function GroupIcon({ variant = 'group', size = 44, iconSize = 22 }) {
  const { Icon, bgcolor, color } = VARIANTS[variant]
  return (
    <Box sx={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor, color }}>
      <Icon sx={{ fontSize: iconSize }} />
    </Box>
  )
}
