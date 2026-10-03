import { ButtonBase, Typography } from '@mui/material'
import { ArrowBackRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

// Sayfa başındaki "‹ Üst sayfaya dön" kapsülü. Görünen metin aynı zamanda
// erişilebilir addır (label-in-name); metin yoksa ariaLabel kullanılır.
// `to` verilmezse tarayıcı geçmişinde bir adım geri gider.
export default function BackLink({ to, label, ariaLabel, sx }) {
  const navigate = useNavigate()
  return (
    <ButtonBase
      onClick={() => (to ? navigate(to) : navigate(-1))}
      aria-label={label ? undefined : ariaLabel}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.75, minHeight: 44, pl: 1, pr: label ? 1.75 : 1, ml: -1, mb: 1.5,
        borderRadius: '999px', color: 'text.secondary',
        transition: 'background-color 160ms ease, color 160ms ease',
        '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
        '&:hover svg': { transform: 'translateX(-3px)' },
        '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 },
        ...sx
      }}
    >
      <ArrowBackRounded sx={{ fontSize: 22, transition: 'transform 200ms var(--ease-spring)' }} />
      {label && (
        <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>
          {label}
        </Typography>
      )}
    </ButtonBase>
  )
}
