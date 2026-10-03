import { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { paletteFor } from '../design/tokens.js'
import {
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  WarningAmberRounded as WarningIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material'

// Hafif bir kapsül bildirim: açık temada çam mürekkebi rengi koyu bir
// yüzey, koyu temada tersi (açık yüzey) - her iki temada da içerikten net
// ayrılır. Tür, renkli bir ikon dairesiyle (ikon + metin, renk tek başına
// değil) anlatılır. Yukarıdan yaylanarak süzülür, dokununca kapanır.
const EXIT_ANIMATION_MS = 260

export default function LumoNotification({ id, message, type = 'info', onClose, duration = 4000 }) {
  const [phase, setPhase] = useState('enter')   // enter | visible | exit
  // onClose'u ref'te tutuyoruz: sağlayıcı her yeni bildirimde yeniden render
  // olduğunda değişen bir callback, otomatik kapanma zamanlayıcısını sıfırdan
  // başlatıyordu (art arda bildirim gelirse eskiler hiç kapanmıyordu).
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  const triggerExit = useCallback(() => setPhase('exit'), [])

  useEffect(() => {
    if (phase !== 'exit') return undefined
    const t = setTimeout(() => onCloseRef.current?.(id), EXIT_ANIMATION_MS)
    return () => clearTimeout(t)
  }, [phase, id])

  /* ---------- Auto-dismiss timer ---------- */
  useEffect(() => {
    if (duration <= 0) return undefined
    const t = setTimeout(triggerExit, duration)
    return () => clearTimeout(t)
  }, [duration, triggerExit])

  /* ---------- Enter animation ---------- */
  useEffect(() => {
    const t = setTimeout(() => setPhase(p => (p === 'enter' ? 'visible' : p)), 20)
    return () => clearTimeout(t)
  }, [])

  const theme = useTheme()
  // Kapsül ters renkte olduğu için vurgu renkleri de karşı paletten gelir
  // (koyu zeminde açık tonlar, açık zeminde koyu tonlar) - kontrast korunur.
  const inverse = paletteFor(theme.palette.mode === 'light' ? 'dark' : 'light')
  const surface = theme.palette.brand.ink
  const textColor = theme.palette.background.default
  const accent = {
    success: inverse.primaryBright,
    error: inverse.rose,
    warning: inverse.apricot,
    info: inverse.sky,
  }[type] || inverse.sky

  const icon = {
    success: <SuccessIcon sx={{ fontSize: 20 }} />,
    error: <ErrorIcon sx={{ fontSize: 20 }} />,
    warning: <WarningIcon sx={{ fontSize: 20 }} />,
    info: <InfoIcon sx={{ fontSize: 20 }} />,
  }[type] || <InfoIcon sx={{ fontSize: 20 }} />

  const entering = phase === 'enter'
  const exiting = phase === 'exit'

  return (
    <Box
      role="alert"
      aria-live="assertive"
      onClick={triggerExit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        width: 'fit-content',
        maxWidth: { xs: '100%', sm: 400 },
        mx: 'auto',
        borderRadius: '999px',
        pl: 0.75,
        pr: 0.75,
        py: 0.75,
        bgcolor: alpha(surface, 0.96),
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        boxShadow: `0 14px 34px rgba(${theme.palette.brand.shadowRgb}, 0.28), 0 2px 8px rgba(${theme.palette.brand.shadowRgb}, 0.18)`,
        cursor: 'pointer',
        opacity: entering || exiting ? 0 : 1,
        transform: entering
          ? 'translateY(-14px) scale(0.92)'
          : exiting
            ? 'translateY(-6px) scale(0.96)'
            : 'translateY(0) scale(1)',
        transition: 'opacity 260ms var(--ease-flow), transform 420ms var(--ease-spring)',
      }}
    >
      <Box
        sx={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
          color: accent, bgcolor: alpha(accent, 0.18)
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: '0.9375rem',
          fontWeight: 700,
          lineHeight: 1.45,
          color: textColor,
          wordBreak: 'break-word',
          py: 0.5
        }}
      >
        {message}
      </Typography>

      {/* WCAG 2.2.1: zaman sınırlı içerik elle de kapatılabilmeli. */}
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); triggerExit() }}
        aria-label="Bildirimi kapat"
        sx={{
          color: alpha(textColor, 0.75),
          width: 34,
          height: 34,
          flexShrink: 0,
          '&:hover': { color: textColor, bgcolor: alpha(textColor, 0.1) },
        }}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  )
}
