import { Box, Button, Stack, Typography } from '@mui/material'
import { ArrowBackRounded } from '@mui/icons-material'
import LeafMotif from './LeafMotif.jsx'
import { radius } from '../../design/tokens.js'

/**
 * Giriş, kayıt ve şifre sıfırlama ekranlarının ortak düzeni. Geniş ekranda
 * solda sakin bir karşılama paneli (soyut yaprak motifi + sıcak bir cümle),
 * sağda form; mobilde üstte logo ve başlık. Yol arkadaşları burada yok:
 * onlar avatar ve kutlama anlarına özel.
 */
export default function AuthLayout({
  title, lead, sideTitle, sideText,
  backLabel = 'Ana Sayfa', onBack, children, footer, maxWidth = 440
}) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' }, flex: '0 0 44%', maxWidth: 620,
          bgcolor: 'brand.surfaceAlt', flexDirection: 'column', justifyContent: 'space-between', p: 5,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Arka planda büyük, çok soluk bir yaprak: paneli boş bırakmadan derinlik verir. */}
        <LeafMotif size={420} sx={{ position: 'absolute', right: -90, bottom: -40, opacity: 0.12, transform: 'rotate(-18deg)', pointerEvents: 'none' }} />
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box component="img" src="/sagliktanLogo-96.png" alt="" sx={{ width: 44, height: 44, borderRadius: `${radius.sm}px` }} />
          <Typography variant="h5" component="p" sx={{ color: 'primary.main', fontWeight: 800 }}>Sağlıktan</Typography>
        </Stack>
        <Box sx={{ maxWidth: 440, position: 'relative' }}>
          <LeafMotif size={88} sx={{ mb: 3 }} />
          <Typography variant="h2" component="p" sx={{ mb: 1.5, fontSize: '2.4rem' }}>{sideTitle}</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.125rem' }}>{sideText}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', position: 'relative' }}>
          Burada paylaşılanlar kişisel deneyimdir, tıbbi tavsiyenin yerini tutmaz.
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box sx={{ px: { xs: 1, sm: 3 }, pt: 'calc(env(safe-area-inset-top) + 8px)', pb: 1 }}>
          <Button startIcon={<ArrowBackRounded />} onClick={onBack}>
            {backLabel}
          </Button>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'center', px: 2, pb: 6 }}>
          <Box className="page-transition" sx={{ width: '100%', maxWidth }}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 2, mt: 1 }}>
              <Box component="img" src="/sagliktanLogo-96.png" alt="" sx={{ width: 56, height: 56, borderRadius: `${radius.md}px` }} />
            </Box>
            <Box sx={{ mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h2" component="h1" sx={{ mb: 0.75 }}>{title}</Typography>
              {lead && <Typography variant="body1" sx={{ color: 'text.secondary' }}>{lead}</Typography>}
            </Box>
            <Box
              sx={{
                p: { xs: 2, sm: 3 }, borderRadius: `${radius.lg}px`,
                bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border',
              }}
            >
              {children}
            </Box>
            {footer && <Box sx={{ mt: 3, textAlign: 'center' }}>{footer}</Box>}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
