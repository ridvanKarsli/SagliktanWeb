import { useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded'
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded'

/**
 * Gönderi yıldızlama (kaydetme) butonu - Faz 2 adım 3. ReactionButtons ile
 * aynı iyimser (optimistic) güncelleme deseni: tıklanır tıklanmaz ikon
 * değişir, istek başarısız olursa eski haline geri alınır (bkz.
 * ReactionButtons.jsx - burada da local state prop'tan sadece ilk mount'ta
 * türetiliyor, çünkü kullanım yerleri post id'sine göre `key={...}` ile
 * render ediyor).
 */
export default function SaveButton({ saved = false, onSave, onUnsave, size = 'small', disabled = false }) {
  const [pending, setPending] = useState(false)
  const [localSaved, setLocalSaved] = useState(saved)

  const handleClick = async (e) => {
    e.stopPropagation()
    if (pending || disabled) return

    const next = !localSaved
    setLocalSaved(next)
    setPending(true)
    try {
      if (next) {
        await onSave()
      } else {
        await onUnsave()
      }
    } catch (err) {
      console.error('Kaydetme isteği başarısız:', err)
      setLocalSaved(!next)
    } finally {
      setPending(false)
    }
  }

  return (
    <Tooltip title={localSaved ? 'Kaydı kaldır' : 'Kaydet'}>
      <span>
        <IconButton
          size={size}
          disabled={disabled}
          onClick={handleClick}
          color={localSaved ? 'primary' : 'default'}
          aria-label={localSaved ? 'Kaydı kaldır' : 'Kaydet'}
        >
          {localSaved ? <BookmarkRoundedIcon fontSize="inherit" /> : <BookmarkBorderRoundedIcon fontSize="inherit" />}
        </IconButton>
      </span>
    </Tooltip>
  )
}
