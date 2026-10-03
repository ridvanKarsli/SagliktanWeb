import { Avatar, Box, ButtonBase, Typography } from '@mui/material'
import { AddPhotoAlternateOutlined } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext.jsx'
import { initialsFrom } from '../utils/format.js'

// "Ne paylaşmak istersin?" girişi - ana sayfa, grup ve alt grup
// sayfalarında aynı görünüm. Gerçek bir buton (klavye + ekran okuyucu).
export default function ComposerPrompt({ onClick, hint = 'Ne paylaşmak istersin?', sx }) {
  const { user } = useAuth()
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={hint}
      className="tap-scale"
      sx={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-start', textAlign: 'left',
        p: { xs: 1.25, md: 1.5 }, borderRadius: 3,
        bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
        '&.Mui-focusVisible': { borderColor: 'primary.main' },
        ...sx
      }}
    >
      <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
        {initialsFrom([user?.firstName, user?.lastName].filter(Boolean).join(' '))}
      </Avatar>
      <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1, minWidth: 0 }} noWrap>
        {hint}
      </Typography>
      <Box sx={{ display: 'flex', color: 'primary.main', pr: 0.5 }}>
        <AddPhotoAlternateOutlined sx={{ fontSize: 22 }} />
      </Box>
    </ButtonBase>
  )
}
