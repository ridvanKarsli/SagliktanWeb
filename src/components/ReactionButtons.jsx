import { useState } from 'react'
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
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
    } catch (err) {
      // Sessizce yutmak yerine logla - aksi halde optimistic UI eski
      // haline dönüyor ama neden başarısız olduğu (401/403/500/network)
      // hiçbir yerde görünmüyor, teşhis imkansız hale geliyor.
      console.error('Reaksiyon isteği başarısız:', err)
      // Başarısızsa eski haline geri al.
      setLocal({ helpfulCount: wasHelpful, notHelpfulCount: wasNotHelpful, myReaction: current })
    } finally {
      setPending(false)
    }
  }

  const shownHelpful = local.helpfulCount
  const shownNotHelpful = local.notHelpfulCount
  const shownReaction = local.myReaction

  // Instagram tarzı: aksiyon ikonları üstte tek satır (numara ikonun
  // yanında değil - IG'de kalp/yorum/paylaş ikonları sade, sayı ayrı bir
  // özet satırında), altında kalın bir "N faydalı · N faydalı değil" özet
  // satırı. data-testid'ler ve buton aria-label'ları (E2E'nin dayandığı
  // sözleşme) birebir korundu - sadece görsel yerleşim değişti.
  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Stack direction="row" spacing={0.5} alignItems="center">
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
      </Stack>
      {/* İki testid de sayı 0 olsa bile HER ZAMAN DOM'da bulunmalı - E2E
          "0" değerini de bekliyor (bkz. reactions.spec.js). Bu yüzden
          koşullu render yerine, sayı 0 olan tarafı sadece görsel olarak
          soluklaştırıyoruz, DOM'dan çıkarmıyoruz. */}
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: 'text.primary', px: 0.5 }}>
        <Box
          component="span"
          data-testid="reaction-helpful-count"
          sx={{ display: 'inline', opacity: shownHelpful > 0 ? 1 : 0.55 }}
        >
          {shownHelpful}
        </Box>
        {' faydalı  ·  '}
        <Box
          component="span"
          data-testid="reaction-not-helpful-count"
          sx={{ display: 'inline', opacity: shownNotHelpful > 0 ? 1 : 0.55 }}
        >
          {shownNotHelpful}
        </Box>
        {' faydalı değil'}
      </Typography>
    </Box>
  )
}
