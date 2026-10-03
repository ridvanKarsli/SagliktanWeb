import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { ChevronRightRounded } from '@mui/icons-material'

// Ayarlar listesindeki tek satırlık eylem (ör. "Şifre Değiştir", "Çıkış Yap").
// open verilirse altında açılan bir panelin başlığıdır (aria-expanded);
// loading sürerken tıklanamaz.
export default function SettingsRow({ icon, label, onClick, danger = false, open, loading = false }) {
  const expandable = open !== undefined
  return (
    <ButtonBase
      onClick={onClick}
      disabled={loading}
      aria-expanded={expandable ? !!open : undefined}
      className="tap-scale"
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', justifyContent: 'flex-start', textAlign: 'left',
        px: 1.5, py: 1.25, borderRadius: 1.5,
        color: danger ? 'error.main' : 'text.primary',
        '&.Mui-disabled': { opacity: 0.7, color: danger ? 'error.main' : 'text.primary' },
        '&:hover': { bgcolor: danger ? 'rgba(196,85,74,0.08)' : 'action.hover' },
        '&.Mui-focusVisible': { bgcolor: 'action.focus' }
      }}
    >
      <Box component="span" aria-hidden sx={{ display: 'flex', color: danger ? 'error.main' : 'text.secondary' }}>
        {icon}
      </Box>
      <Typography variant="body2" component="span" sx={{ flex: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      {loading ? (
        <CircularProgress size={16} sx={{ color: danger ? 'error.main' : 'text.secondary' }} aria-label="İşleniyor" />
      ) : (
        <ChevronRightRounded
          aria-hidden
          sx={{ fontSize: 20, color: 'text.secondary', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }}
        />
      )}
    </ButtonBase>
  )
}
