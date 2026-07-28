import { useState } from 'react'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined'
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'

/**
 * Beğeni yerine: "Faydalı" / "Faydalı Değil" reaksiyonu. Sağlık içerikli bir
 * toplulukta düz "beğeni" garip kaçabiliyor (ör. zor bir paylaşımı kimse
 * "beğenmek" istemez ama faydalı bulabilir) - bkz. PLAN_yeni_ozellikler.md.
 *
 * İyimser (optimistic) güncelleme yapar: tıklanır tıklanmaz sayaç/seçim
 * güncellenir, istek başarısız olursa eski haline geri alınır.
 *
 * Not: local state prop'lardan sadece ilk mount'ta türetilir - bu güvenli,
 * çünkü tüm kullanım yerleri PostCard/CommentItem'ı post/yorum id'sine göre
 * `key={...}` ile render ediyor (bkz. Posts.jsx, PostDetail.jsx), dolayısıyla
 * farklı bir içeriğe geçildiğinde React zaten sıfırdan yeni bir instance kurar.
 */
export default function ReactionButtons({
  helpfulCount = 0,
  notHelpfulCount = 0,
  myReaction = null,
  onReact,
  onRemove,
  size = 'small',
  disabled = false
}) {
  const [pending, setPending] = useState(false)
  const [local, setLocal] = useState({ helpfulCount, notHelpfulCount, myReaction })

  const handleClick = async (e, value) => {
    e.stopPropagation()
    if (pending || disabled) return

    const { helpfulCount: wasHelpful, notHelpfulCount: wasNotHelpful, myReaction: current } = local

    let nextHelpful = wasHelpful
    let nextNotHelpful = wasNotHelpful
    let nextReaction = value

    if (current === value) {
      // Aynı butona tekrar tıklamak reaksiyonu kaldırır.
      nextReaction = null
      if (value === 'HELPFUL') nextHelpful -= 1
      else nextNotHelpful -= 1
    } else {
      if (value === 'HELPFUL') nextHelpful += 1
      else nextNotHelpful += 1
      if (current === 'HELPFUL') nextHelpful -= 1
      if (current === 'NOT_HELPFUL') nextNotHelpful -= 1
    }

    setLocal({ helpfulCount: nextHelpful, notHelpfulCount: nextNotHelpful, myReaction: nextReaction })
    setPending(true)
    try {
      if (nextReaction === null) {
        await onRemove()
      } else {
        await onReact(value)
      }
    } catch {
      // Başarısızsa eski haline geri al.
      setLocal({ helpfulCount: wasHelpful, notHelpfulCount: wasNotHelpful, myReaction: current })
    } finally {
      setPending(false)
    }
  }

  const shownHelpful = local.helpfulCount
  const shownNotHelpful = local.notHelpfulCount
  const shownReaction = local.myReaction

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" onClick={(e) => e.stopPropagation()}>
      <Tooltip title="Faydalı">
        <span>
          <IconButton
            size={size}
            disabled={disabled}
            onClick={(e) => handleClick(e, 'HELPFUL')}
            color={shownReaction === 'HELPFUL' ? 'primary' : 'default'}
            aria-label="Faydalı"
          >
            {shownReaction === 'HELPFUL' ? <ThumbUpAltIcon fontSize="inherit" /> : <ThumbUpAltOutlinedIcon fontSize="inherit" />}
          </IconButton>
        </span>
      </Tooltip>
      <Typography
        data-testid="reaction-helpful-count"
        variant="caption"
        sx={{ minWidth: 14, textAlign: 'center', color: 'text.secondary' }}
      >
        {shownHelpful}
      </Typography>
      <Tooltip title="Faydalı Değil">
        <span>
          <IconButton
            size={size}
            disabled={disabled}
            onClick={(e) => handleClick(e, 'NOT_HELPFUL')}
            color={shownReaction === 'NOT_HELPFUL' ? 'error' : 'default'}
            aria-label="Faydalı Değil"
          >
            {shownReaction === 'NOT_HELPFUL' ? <ThumbDownAltIcon fontSize="inherit" /> : <ThumbDownAltOutlinedIcon fontSize="inherit" />}
          </IconButton>
        </span>
      </Tooltip>
      <Typography
        data-testid="reaction-not-helpful-count"
        variant="caption"
        sx={{ minWidth: 14, textAlign: 'center', color: 'text.secondary' }}
      >
        {shownNotHelpful}
      </Typography>
    </Stack>
  )
}
