import { Box, LinearProgress, Typography } from '@mui/material'
import { getPasswordStrength } from '../utils/passwordStrength.js'

// Register.jsx ve Profile.jsx (şifre değiştir) arasında paylaşılan gösterge -
// bkz. utils/passwordStrength.js için sezgisel puanlama gerekçesi.
export default function PasswordStrengthMeter({ password }) {
  if (!password) return null
  const { score, label, color } = getPasswordStrength(password)

  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={(score / 4) * 100}
        sx={{
          height: 6, borderRadius: 999, bgcolor: 'action.selected',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 }
        }}
      />
      <Typography sx={{ fontSize: '0.75rem', color, fontWeight: 600, mt: 0.5 }}>
        Şifre gücü: {label}
      </Typography>
    </Box>
  )
}
