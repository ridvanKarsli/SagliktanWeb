import { useState } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material'

// Faz8-4: Login/Register/AccountSettings'in her biri kendi şifre TextField'ını
// tekrar ediyordu ve hiçbirinde göster/gizle yoktu - mobil klavyede maskeli
// bir alana yazarken yapılan bir yazım hatası, alanı tamamen silip körlemesine
// yeniden yazmadan fark edilemiyordu. Tek yerde toggle mantığı - tüm şifre
// alanları buradan geçiyor.
export default function PasswordField({ slotProps, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVisible(v => !v)}
                edge="end"
                size="small"
                aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
                tabIndex={-1}
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
