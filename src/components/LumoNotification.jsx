import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, IconButton, LinearProgress } from '@mui/material'
import {
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  WarningAmberRounded as WarningIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material'

export default function LumoNotification({ message, type = 'info', onClose, duration = 4000 }) {
  const [phase, setPhase] = useState('enter')   // enter | visible | exit
  const [progress, setProgress] = useState(100)

  const triggerExit = useCallback(() => {
    setPhase('exit')
    setTimeout(() => { onClose?.() }, 320)
  }, [onClose])

  /* ---------- Auto-dismiss timer + progress bar ---------- */
  useEffect(() => {
    if (duration <= 0) return
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(pct)
      if (pct <= 0) { clearInterval(tick); triggerExit() }
    }, 30)
    return () => clearInterval(tick)
  }, [duration, triggerExit])

  /* ---------- Enter animation ---------- */
  useEffect(() => {
    const t = setTimeout(() => setPhase('visible'), 20)
    return () => clearTimeout(t)
  }, [])

  const cfg = {
    success: {
      icon: <SuccessIcon sx={{ fontSize: 22 }} />,
      accent: '#34C3A1',
      bg: 'rgba(52, 195, 161, 0.12)',
      border: 'rgba(52, 195, 161, 0.30)',
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: 22 }} />,
      accent: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.30)',
    },
    warning: {
      icon: <WarningIcon sx={{ fontSize: 22 }} />,
      accent: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.30)',
    },
    info: {
      icon: <InfoIcon sx={{ fontSize: 22 }} />,
      accent: '#1B7A85',
      bg: 'rgba(27, 122, 133, 0.12)',
      border: 'rgba(27, 122, 133, 0.30)',
    },
  }[type] || {
    icon: <InfoIcon sx={{ fontSize: 22 }} />,
    accent: '#1B7A85',
    bg: 'rgba(27, 122, 133, 0.12)',
    border: 'rgba(27, 122, 133, 0.30)',
  }

  const entering = phase === 'enter'
  const exiting  = phase === 'exit'

  return (
    <Box
      role="alert"
      aria-live="assertive"
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: { xs: 'calc(100vw - 32px)', sm: 420 },
        mx: 'auto',
        borderRadius: 2.5,
        overflow: 'hidden',
        bgcolor: cfg.bg,
        backdropFilter: 'blur(16px) saturate(1.4)',
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px ${cfg.border}`,
        opacity: entering || exiting ? 0 : 1,
        transform: entering || exiting ? 'translateY(16px) scale(0.97)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
      }}
    >
      {/* Accent stripe */}
      <Box sx={{ width: 4, flexShrink: 0, bgcolor: cfg.accent, borderRadius: '8px 0 0 8px' }} />

      {/* Icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1.5,
          py: 1.5,
          color: cfg.accent,
          flexShrink: 0,
        }}
      >
        {cfg.icon}
      </Box>

      {/* Message */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 1.5, pr: 0.5, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: '0.82rem', sm: '0.88rem' },
            fontWeight: 500,
            lineHeight: 1.5,
            color: '#F5F7FA',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </Typography>
      </Box>

      {/* Close button */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', pt: 0.75, pr: 0.75, flexShrink: 0 }}>
        <IconButton
          size="small"
          onClick={triggerExit}
          aria-label="Bildirimi kapat"
          sx={{
            color: 'rgba(255,255,255,0.45)',
            width: 28,
            height: 28,
            '&:hover': { color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Progress bar */}
      {duration > 0 && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            bgcolor: 'transparent',
            '& .MuiLinearProgress-bar': {
              bgcolor: cfg.accent,
              transition: 'none',
            },
          }}
        />
      )}
    </Box>
  )
}

