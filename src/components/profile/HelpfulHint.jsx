import { Box, ButtonBase, Typography } from '@mui/material'
import { ChevronRightRounded } from '@mui/icons-material'
import Companion from '../avatars/Companion.jsx'
import { nextCompanion, useAvatarOptions } from '../avatars/avatarUnlocks.js'
import { radius } from '../../design/tokens.js'

/**
 * Profilde istatistiklerin altında küçük ipucu: yeni açılan yol arkadaşı
 * varsa onu, yoksa sıradakine kaç faydalı oy kaldığını söyler. Dokununca
 * seçici açılır. Seçenekler henüz gelmediyse yer kaplamaz.
 */
export default function HelpfulHint({ userId, onOpen }) {
  const { options, fresh } = useAvatarOptions(userId)
  if (!options) return null
  const next = nextCompanion(options)
  const freshOnes = (options.avatars || []).filter(a => a.unlocked && fresh.includes(a.key))

  let companion
  let text
  let ghost = false
  if (freshOnes.length) {
    companion = freshOnes[0].key
    text = freshOnes.length > 1
      ? `${freshOnes.length} yeni yol arkadaşın seni bekliyor`
      : `Yeni yol arkadaşın ${freshOnes[0].name} seni bekliyor`
  } else if (next) {
    companion = next.avatar.key
    ghost = true
    text = `Sıradaki yol arkadaşına ${next.remaining} faydalı oy kaldı`
  } else {
    return null
  }

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
      <Companion name={companion} size={36} sx={ghost ? { filter: 'grayscale(0.85)', opacity: 0.6 } : undefined} />
      <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="span" variant="body2" sx={{ display: 'block', fontWeight: 700, lineHeight: 1.35 }}>
          {text}
        </Typography>
        {ghost && (
          <Box component="span" aria-hidden sx={{ display: 'block', mt: 0.5, height: 5, borderRadius: `${radius.pill}px`, bgcolor: 'background.paper', overflow: 'hidden' }}>
            <Box component="span" className="sg-grow" sx={{ display: 'block', height: '100%', width: `${Math.max(6, next.progress)}%`, bgcolor: 'secondary.main' }} />
          </Box>
        )}
      </Box>
      <ChevronRightRounded sx={{ color: 'brand.apricotInk', flexShrink: 0 }} />
    </ButtonBase>
  )
}
