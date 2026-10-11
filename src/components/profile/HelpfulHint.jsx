import { Box, ButtonBase, Typography } from '@mui/material'
import { ChevronRightRounded } from '@mui/icons-material'
import Companion from '../avatars/Companion.jsx'
import { useAvatarOptions } from '../avatars/avatarUnlocks.js'
import { radius } from '../../design/tokens.js'
import '../../styles/companions.css'

/**
 * Profilde istatistiklerin altında küçük ipucu: yalnızca yeni açılmış bir
 * yol arkadaşı varsa görünür ("seni bekliyor"). Puan ya da "kaç kaldı"
 * bilgisi profilde gösterilmez (kimseyi kırmasın); o ayrıntı yol arkadaşı
 * seçicisinin içinde. Dokununca seçici açılır.
 */
export default function HelpfulHint({ userId, onOpen }) {
  const { options, fresh } = useAvatarOptions(userId)
  if (!options) return null
  const freshOnes = (options.avatars || []).filter(a => a.unlocked && fresh.includes(a.key))

  if (freshOnes.length === 0) return null
  const companion = freshOnes[0].key
  const text = freshOnes.length > 1
    ? `${freshOnes.length} yeni yol arkadaşın seni bekliyor`
    : `Yeni yol arkadaşın ${freshOnes[0].name} seni bekliyor`

  return (
    <ButtonBase
      onClick={onOpen}
      className="tap-scale"
      sx={{
        mt: 2, mx: { xs: 'auto', md: 0 }, display: 'flex', width: { xs: '100%', sm: 'auto' }, maxWidth: 440,
        alignItems: 'center', gap: 1.25, pl: 0.75, pr: 1.25, py: 0.75, minHeight: 48, textAlign: 'left',
        borderRadius: `${radius.pill}px`, bgcolor: 'brand.apricotSoft', color: 'text.primary',
        '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'secondary.main' },
      }}
    >
      <Companion name={companion} size={36} />
      <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="span" variant="body2" sx={{ display: 'block', fontWeight: 700, lineHeight: 1.35 }}>
          {text}
        </Typography>
      </Box>
      <ChevronRightRounded sx={{ color: 'brand.apricotInk', flexShrink: 0 }} />
    </ButtonBase>
  )
}
