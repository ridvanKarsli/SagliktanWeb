import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { ChevronRightRounded } from '@mui/icons-material'
import { radius } from '../../design/tokens.js'

// Ayarlar listesindeki tek satırlık eylem (ör. "Şifre Değiştir", "Çıkış Yap").
// open verilirse altında açılan bir panelin başlığıdır (aria-expanded);
// loading sürerken tıklanamaz. hint: etiketin altında kısa açıklama.
export default function SettingsRow({ icon, label, hint, onClick, danger = false, open, loading = false }) {
  const expandable = open !== undefined
  return (
    <ButtonBase
      onClick={onClick}
      disabled={loading}
      aria-expanded={expandable ? !!open : undefined}
      className="tap-scale"
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', justifyContent: 'flex-start', textAlign: 'left',
        px: 1.25, py: 1, minHeight: 56, borderRadius: `${radius.md}px`,
        color: danger ? 'error.main' : 'text.primary',
        '&.Mui-disabled': { opacity: 0.7, color: danger ? 'error.main' : 'text.primary' },
        '&:hover': { bgcolor: danger ? 'brand.roseSoft' : 'action.hover' },
        '&.Mui-focusVisible': { bgcolor: 'action.focus' }
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 38, height: 38, borderRadius: `${radius.sm}px`, flexShrink: 0, display: 'grid', placeItems: 'center',
          bgcolor: danger ? 'brand.roseSoft' : 'brand.primarySoft', color: danger ? 'error.main' : 'primary.main'
        }}
      >
        {icon}
      </Box>
      <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body1" component="span" sx={{ display: 'block', fontWeight: 700 }}>
          {label}
        </Typography>
        {hint && (
          <Typography variant="caption" component="span" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.4 }}>
            {hint}
          </Typography>
        )}
      </Box>
      {loading ? (
        <CircularProgress size={16} sx={{ color: danger ? 'error.main' : 'text.secondary' }} aria-label="İşleniyor" />
      ) : (
        <ChevronRightRounded
          aria-hidden
          sx={{ fontSize: 22, color: 'text.secondary', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease-flow)' }}
        />
      )}
    </ButtonBase>
  )
}
