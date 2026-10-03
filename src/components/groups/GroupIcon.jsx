import { Box } from '@mui/material'
import { ForumRounded, GroupsRounded } from '@mui/icons-material'

const VARIANTS = {
  group: { Icon: GroupsRounded, bgcolor: 'brand.primarySoft', color: 'primary.main' },
  forum: { Icon: ForumRounded, bgcolor: 'brand.apricotSoft', color: 'brand.apricotInk' },
}

// Grup (hastalık grubu) ya da forum (alt grup) satırlarının başındaki
// yumuşak köşeli ikon kutusu (kişiler daire, yerler yuvarlatılmış kare).
export default function GroupIcon({ variant = 'group', size = 44, iconSize = 22 }) {
  const { Icon, bgcolor, color } = VARIANTS[variant]
  return (
    <Box
      aria-hidden
      sx={{ width: size, height: size, borderRadius: `${Math.round(size * 0.32)}px`, flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor, color }}
    >
      <Icon sx={{ fontSize: iconSize }} />
    </Box>
  )
}
