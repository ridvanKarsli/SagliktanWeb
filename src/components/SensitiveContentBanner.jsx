import { Alert, Link } from '@mui/material'
import { SupportAgentRounded } from '@mui/icons-material'
import { CRISIS_LINE } from '../config/site.js'

/**
 * Basit içerik moderasyonu - kriz sinyali (intihar/kendine zarar
 * verme vb. ifadeler) tespit edilen gönderi/yorumlarda gösterilir. Bu bir
 * UYARI DEĞİL, DESTEK bilgisidir: içerik hiçbir şekilde engellenmez/
 * gizlenmez, sadece yanında gösterilir (bkz. backend
 * ContentModerationService javadoc'u - zor bir deneyimini paylaşan kimse
 * asla susturulmaz). Yönlendirilen hat config/site.js içindeki CRISIS_LINE'dır.
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
      <Link href={CRISIS_LINE.tel} underline="hover" sx={{ fontWeight: 700 }} onClick={(e) => e.stopPropagation()}>
        {CRISIS_LINE.name}
      </Link>{' '}
      (7/24, ücretsiz) ile hemen görüşebilirsin.
    </Alert>
  )
}
