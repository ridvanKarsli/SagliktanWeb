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
      accent: '#3F9C87',
      border: 'rgba(63, 156, 135, 0.35)',
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: 22 }} />,
      accent: '#C4554A',
      border: 'rgba(196, 85, 74, 0.35)',
    },
    warning: {
      icon: <WarningIcon sx={{ fontSize: 22 }} />,
      accent: '#C98A3E',
      border: 'rgba(201, 138, 62, 0.35)',
    },
    info: {
      icon: <InfoIcon sx={{ fontSize: 22 }} />,
      accent: '#5B8FA3',
      border: 'rgba(91, 143, 163, 0.35)',
    },
  }[type] || {
    icon: <InfoIcon sx={{ fontSize: 22 }} />,
    accent: '#5B8FA3',
    border: 'rgba(91, 143, 163, 0.35)',
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
        bgcolor: '#FFFFFF',
        backdropFilter: 'blur(16px) saturate(1.2)',
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 8px 28px rgba(51, 47, 42, 0.16), 0 0 0 1px ${cfg.border}`,
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
            color: '#332F2A',
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
            color: 'rgba(51,47,42,0.4)',
            width: 28,
            height: 28,
            '&:hover': { color: 'rgba(51,47,42,0.8)', bgcolor: 'rgba(51,47,42,0.06)' },
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

