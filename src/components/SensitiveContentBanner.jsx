import { Alert, Link } from '@mui/material'
import { SupportAgentRounded } from '@mui/icons-material'

/**
 * Rapor: basit içerik moderasyonu - kriz sinyali (intihar/kendine zarar
 * verme vb. ifadeler) tespit edilen gönderi/yorumlarda gösterilir. Bu bir
 * UYARI DEĞİL, DESTEK bilgisidir: içerik hiçbir şekilde engellenmez/
 * gizlenmez, sadece yanında gösterilir (bkz. backend
 * ContentModerationService javadoc'u - zor bir deneyimini paylaşan kimse
 * asla susturulmaz). 182 ALO Yaşam Hattı, T.C. Sağlık Bakanlığı'nın 7/24
 * ücretsiz intihar önleme hattıdır.
 */
export default function SensitiveContentBanner({ sx }) {
  return (
    <Alert
      severity="info"
      icon={<SupportAgentRounded fontSize="small" />}
      sx={{
        mb: 1.5,
        py: 0.5,
        alignItems: 'center',
        '& .MuiAlert-message': { fontSize: 13, lineHeight: 1.5 },
        ...sx
      }}
    >
      Bu paylaşım zor bir deneyimden bahsediyor olabilir. Yalnız değilsin -{' '}
      <Link href="tel:182" underline="hover" sx={{ fontWeight: 700 }} onClick={(e) => e.stopPropagation()}>
        182 ALO Yaşam Hattı
      </Link>{' '}
      (Sağlık Bakanlığı, 7/24, ücretsiz) ile hemen görüşebilirsin.
    </Alert>
  )
}
