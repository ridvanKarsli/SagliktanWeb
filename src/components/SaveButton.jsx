import { useState } from 'react'
import { Box, Button, Tooltip } from '@mui/material'
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded'
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded'
import { visuallyHidden } from '../utils/visuallyHidden.js'
import { useServerSyncedState } from '../hooks/useServerSyncedState.js'

/**
 * Gönderi kaydetme (yer imi) butonu + kaydedilme sayısı. ReactionButtons ile
 * aynı iyimser güncelleme deseni: tıklanır tıklanmaz ikon ve sayaç değişir,
 * istek başarısız olursa eski haline geri alınır.
 */
export default function SaveButton({
  saved = false,
  count = 0,
  onSave,
  onUnsave,
  size = 'small',
  disabled = false
}) {
  const [pending, setPending] = useState(false)
  const [local, setLocal] = useServerSyncedState({ saved, count }, { paused: pending })
  const [tuck, setTuck] = useState(0) // kaydedince yer imi kısa bir "oturma" hareketi yapar

  const handleClick = async (e) => {
    e.stopPropagation()
    if (pending || disabled) return

    const { saved: wasSaved, count: wasCount } = local
    const nextSaved = !wasSaved
    const nextCount = Math.max(0, wasCount + (nextSaved ? 1 : -1))
    if (nextSaved) setTuck(n => n + 1)

    setLocal({ saved: nextSaved, count: nextCount })
    setPending(true)
    try {
      if (nextSaved) {
        await onSave()
      } else {
        await onUnsave()
      }
    } catch (err) {
      console.error('Kaydetme isteği başarısız:', err)
      setLocal({ saved: wasSaved, count: wasCount })
    } finally {
      setPending(false)
    }
  }

  const shownSaved = local.saved
  const shownCount = local.count

  // ReactionButtons ile aynı dil: ikon + sayı tek satırda, pill buton.
  const iconFs = size === 'medium' ? 21 : 19
  return (
    <Tooltip title={shownSaved ? 'Kaydı kaldır' : 'Kaydet'}>
      <span onClick={(e) => e.stopPropagation()}>
        <Button
          size={size}
          disabled={disabled}
          onClick={handleClick}
          aria-label={shownSaved ? 'Kaydı kaldır' : 'Kaydet'}
          aria-pressed={shownSaved}
          sx={{
            minWidth: 44, minHeight: 44, px: 1.25, py: 0.5, gap: 0.5, borderRadius: 999,
            color: shownSaved ? 'primary.main' : 'text.secondary',
            bgcolor: shownSaved ? 'brand.primarySoft' : 'transparent',
            fontWeight: 800, fontSize: size === 'medium' ? '0.9375rem' : '0.875rem',
            '&:hover': { bgcolor: shownSaved ? 'brand.primarySoft' : 'action.hover' }
          }}
        >
          <Box component="span" key={tuck} className={tuck > 0 && shownSaved ? 'sg-tuck' : undefined} sx={{ display: 'inline-flex' }}>
            {shownSaved ? <BookmarkRoundedIcon sx={{ fontSize: iconFs }} /> : <BookmarkBorderRoundedIcon sx={{ fontSize: iconFs }} />}
          </Box>
          <Box component="span" sx={shownCount > 0 ? { lineHeight: 1 } : visuallyHidden}>
            <Box component="span" data-testid="saved-count">{shownCount}</Box>
            <Box component="span" sx={visuallyHidden}>{' kaydedildi'}</Box>
          </Box>
        </Button>
      </span>
    </Tooltip>
  )
}
