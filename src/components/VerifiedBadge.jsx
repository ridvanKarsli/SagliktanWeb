import { Chip, Tooltip } from '@mui/material'
import { VerifiedRounded } from '@mui/icons-material'

// E-devlet/X.com esintili güven sinyali: e-postası doğrulanmış hesaplarda
// küçük, nötr (mavi "resmi onay" değil, marka rengiyle uyumlu) bir rozet.
// UserResponse zaten emailVerified döndürüyor (bkz. UserResponse.java) -
// bu tamamen frontend-only bir gösterim, backend değişikliği gerekmedi.
export default function VerifiedBadge({ size = 'small' }) {
  return (
    <Tooltip title="E-posta adresi doğrulanmış hesap">
      <Chip
        icon={<VerifiedRounded sx={{ fontSize: size === 'small' ? 16 : 18, color: 'primary.main !important' }} />}
        label="Doğrulanmış"
        size="small"
        variant="outlined"
        sx={{
          height: 24,
          borderColor: 'primary.main',
          color: 'primary.main',
          fontWeight: 600,
          '& .MuiChip-label': { px: 0.75 },
        }}
      />
    </Tooltip>
  )
}
