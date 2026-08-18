import { Stack, Typography } from '@mui/material'
import { LockRounded, VerifiedUserOutlined } from '@mui/icons-material'

// E-devlet esintili "algısal güven" satırı - kayıt/giriş formları ve genel
// footer'da tekrarlanan iki sade rozet: bağlantı güvenliği + KVKK uyumu.
// Somut/abartısız ifadeler bilerek seçildi (bkz. görev #301: "e-devlet kadar
// güvenilir" hissi resmi ve ölçülü bir dil ister, pazarlama sloganı değil).
export default function TrustBadges({ align = 'center', size = 'small' }) {
  const iconSize = size === 'small' ? 15 : 17
  const fontSize = size === 'small' ? '0.75rem' : '0.8125rem'

  return (
    <Stack
      direction="row"
      spacing={2.5}
      justifyContent={align}
      flexWrap="wrap"
      useFlexGap
    >
      <Stack direction="row" spacing={0.5} alignItems="center">
        <LockRounded sx={{ fontSize: iconSize, color: 'text.secondary' }} />
        <Typography sx={{ fontSize, color: 'text.secondary', fontWeight: 500 }}>
          Şifreli Bağlantı
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <VerifiedUserOutlined sx={{ fontSize: iconSize, color: 'text.secondary' }} />
        <Typography sx={{ fontSize, color: 'text.secondary', fontWeight: 500 }}>
          KVKK Uyumlu
        </Typography>
      </Stack>
    </Stack>
  )
}
