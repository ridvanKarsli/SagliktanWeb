import { useRef, useState } from 'react'
import { Box, Button, Stack, Tooltip } from '@mui/material'
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

  // Tek satır, kompakt: [👍 12] [👎 1]. Önceki iki katmanlı yerleşim
  // (ikonlar üstte, "N faydalı · N faydalı değil" altta) yorum satırlarında
  // "Yanıtla" ile hizasızlık ve fazladan bir satır yüksekliği üretiyordu;
  // sayı ikonun hemen yanında olunca hem daha az yer kaplıyor hem de hangi
  // sayının hangi butona ait olduğu tartışmasız. data-testid'ler ve
  // aria-label'lar (E2E sözleşmesi) korunuyor; sayı 0 iken görünmez ama
  // DOM'da kalır.
  const btnSx = (active, activeColor) => ({
    minWidth: 0, minHeight: size === 'medium' ? 40 : 36, px: 1, py: 0.5,
    borderRadius: 999, gap: 0.5,
    color: active ? activeColor : 'text.secondary',
    fontWeight: 700, fontSize: size === 'medium' ? '0.875rem' : '0.8125rem',
    '&:hover': { bgcolor: 'action.hover' }
  })
  const countSx = (n) => (n > 0 ? { lineHeight: 1 } : visuallyHidden)
  const iconFs = size === 'medium' ? 20 : 18

  return (
    <Stack
      direction="row"
      spacing={0}
      alignItems="center"
      onClick={(e) => e.stopPropagation()}
      sx={{ opacity: pending ? 0.7 : 1, transition: 'opacity 0.15s ease' }}
    >
      <Tooltip title="Faydalı">
        <span>
          <Button
            size={size}
            disabled={disabled}
            onClick={(e) => handleClick(e, 'HELPFUL')}
            aria-label="Faydalı"
            aria-pressed={shownReaction === 'HELPFUL'}
            sx={btnSx(shownReaction === 'HELPFUL', 'primary.main')}
          >
            {shownReaction === 'HELPFUL'
              ? <ThumbUpAltIcon sx={{ fontSize: iconFs }} />
              : <ThumbUpAltOutlinedIcon sx={{ fontSize: iconFs }} />}
            <Box component="span" sx={countSx(shownHelpful)}>
              <Box component="span" data-testid="reaction-helpful-count">{shownHelpful}</Box>
              <Box component="span" sx={visuallyHidden}>{' faydalı'}</Box>
            </Box>
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Faydalı değil">
        <span>
          <Button
            size={size}
            disabled={disabled}
            onClick={(e) => handleClick(e, 'NOT_HELPFUL')}
            aria-label="Faydalı Değil"
            aria-pressed={shownReaction === 'NOT_HELPFUL'}
            sx={btnSx(shownReaction === 'NOT_HELPFUL', 'error.main')}
          >
            {shownReaction === 'NOT_HELPFUL'
              ? <ThumbDownAltIcon sx={{ fontSize: iconFs }} />
              : <ThumbDownAltOutlinedIcon sx={{ fontSize: iconFs }} />}
            <Box component="span" sx={countSx(shownNotHelpful)}>
              <Box component="span" data-testid="reaction-not-helpful-count">{shownNotHelpful}</Box>
              <Box component="span" sx={visuallyHidden}>{' faydalı değil'}</Box>
            </Box>
          </Button>
        </span>
      </Tooltip>
    </Stack>
  )
}
