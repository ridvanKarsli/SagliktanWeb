import { useRef, useState } from 'react'
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined'
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'

// Öğeyi ekranda göstermeden DOM'da tutar. Burada amaç erişilebilirlik değil,
// E2E sözleşmesi: reactions.spec.js sayaçları 0 iken de okuyor, bu yüzden
// koşullu render (DOM'dan çıkarma) yapamıyoruz.
const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap'
}

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
  // Art arda hızlı tıklamalarda (bkz. reactions.spec.js - "Faydalı"ya basıp
  // hemen "Faydalı Değil"e geçme) hangi isteğin EN GÜNCEL olduğunu izlemek
  // için. `pending` tek başına ikinci tıklamayı tamamen ENGELLEMEK için
  // kullanılıyordu - ama optimistic güncelleme network beklemeden anında
  // DOM'a yansıdığı için (bkz. aşağıdaki setLocal), kullanıcı/test ikinci
  // tıklamayı ilk isteğin backend round-trip'i bitmeden yapabiliyordu ve o
  // tıklama sessizce hiçbir şey yapmadan yutuluyordu (CI'da Postgres+Spring
  // Boot round-trip'i yerelden daha yavaş olduğu için burada gerçek bir
  // race - bkz. 2026-08-07 reactions.spec.js CI başarısızlığı). Artık her
  // tıklama kendi request id'sini alıyor; hata durumunda sadece HÂLÂ en
  // güncel istek buysa eski haline dönülüyor - aksi halde daha yeni
  // (başarılı ya da hâlâ süren) bir optimistic güncellemeyi ezmiş oluruz.
  const requestIdRef = useRef(0)

  const handleClick = async (e, value) => {
    e.stopPropagation()
    if (disabled) return

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

    const myRequestId = ++requestIdRef.current
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
      // Başarısızsa eski haline geri al - ama sadece bu istek hâlâ en
      // güncelse (bkz. yukarıdaki requestIdRef notu).
      if (requestIdRef.current === myRequestId) {
        setLocal({ helpfulCount: wasHelpful, notHelpfulCount: wasNotHelpful, myReaction: current })
      }
    } finally {
      if (requestIdRef.current === myRequestId) setPending(false)
    }
  }

  const shownHelpful = local.helpfulCount
  const shownNotHelpful = local.notHelpfulCount
  const shownReaction = local.myReaction
  const hasAnyReaction = shownHelpful > 0 || shownNotHelpful > 0

  // Instagram tarzı: aksiyon ikonları üstte tek satır (numara ikonun
  // yanında değil - IG'de kalp/yorum/paylaş ikonları sade, sayı ayrı bir
  // özet satırında), altında kalın bir "N faydalı · N faydalı değil" özet
  // satırı. data-testid'ler ve buton aria-label'ları (E2E'nin dayandığı
  // sözleşme) birebir korundu - sadece görsel yerleşim değişti.
  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        // Tıklamayı ENGELLEMİYOR (bkz. handleClick - artık pending iken de
        // tıklamaya izin veriliyor), sadece isteğin sürdüğüne dair hafif bir
        // görsel ipucu. Bilerek `disabled` değil `opacity` - disabled olsaydı
        // hızlı ikinci tıklamayı yine engellerdik (aynı race'e geri dönerdik).
        sx={{ opacity: pending ? 0.7 : 1, transition: 'opacity 0.15s ease' }}
      >
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
      {/* Sayı 0 iken metin GÖSTERİLMEZ: akıştaki her gönderinin altında
          "0 faydalı · 0 faydalı değil" yazması, hiçbir bilgi vermeyen ama
          her kartı kalabalıklaştıran bir gürültüydü (Instagram da "0 beğeni"
          yazmaz). Ancak iki testid de sayı 0 olsa bile DOM'da KALMALI - E2E
          başlangıçta "0" değerini okuyor (bkz. reactions.spec.js) - bu yüzden
          gizlerken DOM'dan çıkarmıyor, görsel olarak saklıyoruz. */}
      <Typography
        variant="caption"
        component="div"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          px: 0.5,
          ...(hasAnyReaction ? {} : { height: 0, overflow: 'hidden' })
        }}
      >
        <Box component="span" sx={shownHelpful > 0 ? null : visuallyHidden}>
          <Box component="span" data-testid="reaction-helpful-count">{shownHelpful}</Box>
          {' faydalı'}
        </Box>
        {shownHelpful > 0 && shownNotHelpful > 0 ? '  ·  ' : ''}
        <Box component="span" sx={shownNotHelpful > 0 ? null : visuallyHidden}>
          <Box component="span" data-testid="reaction-not-helpful-count">{shownNotHelpful}</Box>
          {' faydalı değil'}
        </Box>
      </Typography>
    </Box>
  )
}
