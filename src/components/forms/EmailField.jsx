import { useState } from 'react'
import { Link, TextField } from '@mui/material'
import { LIMITS, suggestEmail } from '../../utils/validation.js'

// Ortak e-posta alanı (kayıt, giriş, şifre sıfırlama): doğru mobil klavye,
// otomatik büyük harf/düzeltme kapalı, boşluklar yazarken atılır. Alandan
// çıkınca yaygın sağlayıcılardaki yazım hatası için öneri gösterir
// ("gmial.com" → "gmail.com"), tek dokunuşla düzeltilir.
export default function EmailField({
  value, onChange, errorText, helperText, testId, suggest = true, slotProps, onBlur, onFocus, ...props
}) {
  const [focused, setFocused] = useState(false)
  const suggestion = suggest && !focused && !errorText ? suggestEmail(value) : null

  const helper = errorText || (suggestion ? (
    <>
      Bunu mu demek istedin:{' '}
      <Link
        component="button"
        type="button"
        onClick={() => onChange(suggestion)}
        sx={{ fontSize: 'inherit', fontWeight: 700, verticalAlign: 'baseline' }}
      >
        {suggestion}
      </Link>
      ?
    </>
  ) : helperText)

  return (
    <TextField
      label="E-posta adresi"
      type="email"
      fullWidth
      placeholder="ornek@email.com"
      autoComplete="email"
      {...props}
      value={value}
      onChange={e => onChange(e.target.value.replace(/\s+/g, ''))}
      onFocus={(e) => { setFocused(true); onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); onBlur?.(e) }}
      helperText={helper || undefined}
      slotProps={{
        ...slotProps,
        htmlInput: {
          inputMode: 'email',
          autoCapitalize: 'none',
          autoCorrect: 'off',
          spellCheck: false,
          enterKeyHint: 'next',
          maxLength: LIMITS.EMAIL_MAX,
          ...(testId ? { 'data-testid': testId } : {}),
          ...slotProps?.htmlInput,
        }
      }}
    />
  )
}
