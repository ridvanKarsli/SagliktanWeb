import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import {
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  WarningAmberRounded as WarningIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material'

// Apple'ın sistem toast'ları (ör. "Kopyalandı", "AirPods Bağlandı") gibi
// hafif, tarafsız bir kapsül - önceki tasarımdaki renkli sol şerit + sert
// gölge halkası + alt ilerleme çubuğu kaldırıldı. Anlam artık SADECE
// ikonun rengiyle taşınıyor, kutunun kendisi her bildirim türünde aynı
// nötr/koyu-camsı yüzeyde kalıyor - "hata kutusu" yerine "sistem bildirimi"
// hissi veriyor. Giriş animasyonu da sertçe aşağıdan kaymak yerine hafifçe
// yukarıdan süzülüp büyüyor (Apple'ın toast'larındaki yumuşak geliş gibi).
export default function LumoNotification({ message, type = 'info', onClose, duration = 4000 }) {
  const [phase, setPhase] = useState('enter')   // enter | visible | exit

  const triggerExit = useCallback(() => {
    setPhase('exit')
    setTimeout(() => { onClose?.() }, 260)
  }, [onClose])

  /* ---------- Auto-dismiss timer ---------- */
  useEffect(() => {
    if (duration <= 0) return
    const t = setTimeout(triggerExit, duration)
    return () => clearTimeout(t)
  }, [duration, triggerExit])

  /* ---------- Enter animation ---------- */
  useEffect(() => {
    const t = setTimeout(() => setPhase('visible'), 20)
    return () => clearTimeout(t)
  }, [])

  const accent = {
    success: '#4CB89F',
    error: '#E08078',
    warning: '#E0A85E',
    info: '#7FAEBD',
  }[type] || '#7FAEBD'

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
        borderRadius: '20px',
        pl: 2,
        pr: 1,
        py: 1.25,
        // Apple'ın camsı koyu toast yüzeyi - tür renginden bağımsız, tek
        // tip nötr zemin.
        bgcolor: 'rgba(26, 22, 18, 0.82)',
        backdropFilter: 'blur(22px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.38), 0 2px 10px rgba(0, 0, 0, 0.22)',
        cursor: 'pointer',
        opacity: entering || exiting ? 0 : 1,
        transform: entering
          ? 'translateY(-10px) scale(0.94)'
          : exiting
            ? 'translateY(-6px) scale(0.96)'
            : 'translateY(0) scale(1)',
        transition: 'opacity 0.32s cubic-bezier(.25,.9,.35,1), transform 0.32s cubic-bezier(.25,.9,.35,1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', color: accent, flexShrink: 0 }}>
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
          lineHeight: 1.45,
          letterSpacing: 0.1,
          color: '#F5F1EB',
          wordBreak: 'break-word',
        }}
      >
        {message}
      </Typography>

      {/* Apple'ın kendi toast'larında kapatma butonu yok (sadece otomatik
          kayboluyor/dokununca kapanıyor) - ama WCAG 2.2.1 gereği
          zaman-sınırlı içeriğin elle de kapatılabilmesi gerekiyor, bu
          yüzden çok düşük kontrastlı/göze batmayan küçük bir 'x' bırakıldı. */}
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); triggerExit() }}
        aria-label="Bildirimi kapat"
        sx={{
          color: 'rgba(245,241,235,0.4)',
          width: 24,
          height: 24,
          flexShrink: 0,
          '&:hover': { color: 'rgba(245,241,235,0.85)', bgcolor: 'rgba(245,241,235,0.08)' },
        }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  )
}
