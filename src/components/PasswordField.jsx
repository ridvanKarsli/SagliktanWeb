import { useState } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material'
import { LIMITS } from '../utils/validation.js'

// Faz8-4: Login/Register/AccountSettings'in her biri kendi şifre TextField'ını
// tekrar ediyordu ve hiçbirinde göster/gizle yoktu - mobil klavyede maskeli
// bir alana yazarken yapılan bir yazım hatası, alanı tamamen silip körlemesine
// yeniden yazmadan fark edilemiyordu. Tek yerde toggle mantığı - tüm şifre
// alanları buradan geçiyor. Ayrıca: otomatik büyük harf/düzeltme kapalı,
// backend üst sınırı (100) kadar karakter, Caps Lock açıksa uyarı.
export default function PasswordField({ slotProps, helperText, error, onKeyDown, onKeyUp, onBlur, ...props }) {
  const [visible, setVisible] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  const trackCaps = (e) => {
    if (typeof e.getModifierState === 'function') setCapsLock(e.getModifierState('CapsLock'))
  }

  const capsHint = capsLock && !error ? 'Büyük harf kilidi (Caps Lock) açık.' : null

  return (
    <TextField
      {...props}
      error={error}
      helperText={capsHint || helperText}
      type={visible ? 'text' : 'password'}
      onKeyDown={(e) => { trackCaps(e); onKeyDown?.(e) }}
      onKeyUp={(e) => { trackCaps(e); onKeyUp?.(e) }}
      onBlur={(e) => { setCapsLock(false); onBlur?.(e) }}
      slotProps={{
        ...slotProps,
        htmlInput: {
          maxLength: LIMITS.PASSWORD_MAX,
          autoCapitalize: 'none',
          autoCorrect: 'off',
          spellCheck: false,
          ...slotProps?.htmlInput,
        },
        input: {
          ...slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVisible(v => !v)}
                edge="end"
                size="small"
                aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
                aria-pressed={visible}
              >
                {visible ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
              </IconButton>
            </InputAdornment>
          )
        }
      }}
    />
  )
}
