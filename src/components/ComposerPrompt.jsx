import { Box, ButtonBase, Typography } from '@mui/material'
import { EditRounded } from '@mui/icons-material'
import UserAvatar from './avatars/UserAvatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export const DEFAULT_COMPOSER_HINT = 'Bugün nasılsın? Bir deneyim, bir soru ya da küçük bir sevinç…'

// Paylaşım girişi - ana sayfa, grup ve alt grup sayfalarında aynı görünüm.
// Avatarın, sıcak bir davet cümlesi ve sağda yazma ikonu. Gerçek bir buton
// (klavye + ekran okuyucu); erişilebilir adı görünen davet cümlesidir.
export default function ComposerPrompt({ onClick, hint = DEFAULT_COMPOSER_HINT, sx }) {
  const { user } = useAuth()
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={hint}
      className="tap-scale"
      sx={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-start', textAlign: 'left',
        p: 1.25, pl: 1.25, pr: 1.25, minHeight: 64, borderRadius: '22px',
        bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border', boxShadow: 1,
        transition: 'border-color 200ms ease, box-shadow 240ms ease, transform 160ms var(--ease-spring)',
        '@media (hover: hover)': { '&:hover': { borderColor: 'primary.light', boxShadow: 3 } },
        '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 },
        '&:hover .sg-composer-pen': { transform: 'rotate(-12deg)' },
        ...sx
      }}
    >
      <UserAvatar avatarKey={user?.avatarKey} name={name} size={42} sx={{ flexShrink: 0 }} />
      <Typography
        variant="body2"
        component="span"
        sx={{
          color: 'text.secondary', flex: 1, minWidth: 0, fontWeight: 600, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}
      >
        {hint}
      </Typography>
      <Box
        className="sg-composer-pen"
        aria-hidden
        sx={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
          bgcolor: 'primary.main', color: 'primary.contrastText', transition: 'transform 240ms var(--ease-spring)'
        }}
      >
        <EditRounded sx={{ fontSize: 20 }} />
      </Box>
    </ButtonBase>
  )
}
