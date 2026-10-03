import { IconButton, Stack, Typography } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

// Sayfa başındaki "← Üst sayfaya dön" satırı. İkon-yalnız buton kendi
// erişilebilir adını (ariaLabel) taşır; yanındaki metin görsel ipucudur.
// `to` verilmezse tarayıcı geçmişinde bir adım geri gider.
export default function BackLink({ to, label, ariaLabel, sx }) {
  const navigate = useNavigate()
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, ...sx }}>
      <IconButton onClick={() => (to ? navigate(to) : navigate(-1))} size="small" aria-label={ariaLabel || label}>
        <ArrowBack />
      </IconButton>
      {label && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }} aria-hidden>
          {label}
        </Typography>
      )}
    </Stack>
  )
}
