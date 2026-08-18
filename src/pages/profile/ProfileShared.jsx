import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { ChevronRightRounded } from '@mui/icons-material'

// prettyDate artık burada değil - bkz. utils/format.js (clean-code audit,
// eskiden bu dosyada tanımlıydı ama profil dışı sayfalarda da inline
// kopyalanmıştı).
export { prettyDate } from '../../utils/format.js'

export function SectionList({ items, renderItem, getKey, emptyText }) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
        {emptyText}
      </Typography>
    )
  }
  return (
    <Stack spacing={1.5}>
      {items.map((it, i) => (
        <Box key={getKey?.(it, i) ?? i}>
          {renderItem(it, i)}
        </Box>
      ))}
    </Stack>
  )
}

export function SubRow({ label, value, icon }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
      {icon && (
        <Box sx={{ color: 'text.secondary', display: 'flex' }}>
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1 }}>
        {label && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {label}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  )
}

// Ayarlar sayfasındaki (AccountSettings.jsx) her satır (şifre, gizlilik,
// çıkış, hesap silme) için ortak tıklanabilir satır bileşeni - eskiden
// Profile.jsx içindeydi, Faz5'te Ayarlar kendi sayfasına taşınınca (X/IG'de
// hesap ayarları profil kaydırma alanında değil ayrı bir ekranda yaşar)
// buraya, iki dosyanın da erişebileceği ortak yere alındı.
export function SettingsRow({ icon, label, onClick, danger, open, loading }) {
  return (
    <Box
      onClick={loading ? undefined : onClick}
      className="tap-scale"
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1.25, borderRadius: 1.5, cursor: loading ? 'default' : 'pointer',
        color: danger ? 'error.main' : 'text.primary',
        opacity: loading ? 0.7 : 1,
        '&:hover': { bgcolor: loading ? 'transparent' : danger ? 'rgba(196,85,74,0.08)' : 'action.hover' }
      }}
    >
      <Box sx={{ display: 'flex', color: danger ? 'error.main' : 'text.secondary' }}>
        {icon}
      </Box>
      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      {loading ? (
        <CircularProgress size={16} sx={{ color: danger ? 'error.main' : 'text.secondary' }} />
      ) : (
        <ChevronRightRounded
          sx={{
            fontSize: 20, color: 'text.secondary',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.15s ease'
          }}
        />
      )}
    </Box>
  )
}

export function Section({ title, children, actionIcon, onActionClick }) {
  return (
    <Box sx={{ px: { xs: 2, md: 0 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h3" sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
        {actionIcon && onActionClick && (
          <Box onClick={onActionClick} sx={{ cursor: 'pointer', color: 'text.secondary' }}>
            {actionIcon}
          </Box>
        )}
      </Stack>
      {children}
    </Box>
  )
}
