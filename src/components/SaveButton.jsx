import { useState } from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded'
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded'

// ReactionButtons.jsx'teki "sayı 0 iken metin gösterilmez ama DOM'dan da
// çıkarılmaz" deseniyle aynı gerekçe - burada henüz bir E2E sözleşmesi yok
// ama tutarlılık ve ileride test edilebilirlik için aynı yaklaşım korundu.
const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap'
}

/**
 * Gönderi yıldızlama (kaydetme) butonu - Faz 2 adım 3 (+ adım 3b'de kaydedilme
 * sayısı eklendi). ReactionButtons ile aynı iyimser (optimistic) güncelleme
 * deseni: tıklanır tıklanmaz ikon VE sayaç değişir, istek başarısız olursa
 * eski haline geri alınır (bkz. ReactionButtons.jsx - burada da local state
 * prop'tan sadece ilk mount'ta türetiliyor, çünkü kullanım yerleri post
 * id'sine göre `key={...}` ile render ediyor).
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
  const [local, setLocal] = useState({ saved, count })

  const handleClick = async (e) => {
    e.stopPropagation()
    if (pending || disabled) return

    const { saved: wasSaved, count: wasCount } = local
    const nextSaved = !wasSaved
    const nextCount = Math.max(0, wasCount + (nextSaved ? 1 : -1))

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

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Tooltip title={shownSaved ? 'Kaydı kaldır' : 'Kaydet'}>
        <span>
          <IconButton
            size={size}
            disabled={disabled}
            onClick={handleClick}
            color={shownSaved ? 'primary' : 'default'}
            aria-label={shownSaved ? 'Kaydı kaldır' : 'Kaydet'}
          >
            {shownSaved ? <BookmarkRoundedIcon fontSize="inherit" /> : <BookmarkBorderRoundedIcon fontSize="inherit" />}
          </IconButton>
        </span>
      </Tooltip>
      <Typography
        variant="caption"
        component="div"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          px: 0.5,
          textAlign: 'center',
          ...(shownCount > 0 ? {} : { height: 0, overflow: 'hidden' })
        }}
      >
        <Box component="span" sx={shownCount > 0 ? null : visuallyHidden}>
          <Box component="span" data-testid="saved-count">{shownCount}</Box>
          {' kaydedildi'}
        </Box>
      </Typography>
    </Box>
  )
}
