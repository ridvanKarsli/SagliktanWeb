import { Box, Button, Stack, Typography } from '@mui/material'
import { ArrowBackRounded } from '@mui/icons-material'
import Companion from '../avatars/Companion.jsx'
import { radius } from '../../design/tokens.js'
import '../../styles/companions.css'

function CompanionCluster({ names, big = false }) {
  return (
    <Stack direction="row" justifyContent="inherit" aria-hidden>
      {names.map((n, i) => (
        <Box
          key={n}
          className="sg-arrive"
          sx={{ ml: i ? (big ? -2 : -1.25) : 0, animationDelay: `${120 + i * 90}ms`, borderRadius: '50%', border: '3px solid', borderColor: big ? 'brand.surfaceAlt' : 'background.default' }}
        >
          <Companion name={n} size={big ? (i === 1 ? 104 : 84) : (i === 1 ? 56 : 46)} />
        </Box>
      ))}
    </Stack>
  )
}

/**
 * Giriş, kayıt ve şifre sıfırlama ekranlarının ortak düzeni. Geniş ekranda
 * solda sakin bir karşılama paneli (yol arkadaşları + sıcak bir cümle),
 * sağda form; mobilde üstte küçük bir yol arkadaşı grubu ve başlık.
 */
export default function AuthLayout({
  title, lead, sideTitle, sideText, companions = ['damla', 'filiz', 'bulut'],
  backLabel = 'Ana Sayfa', onBack, children, footer, maxWidth = 440
}) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' }, flex: '0 0 44%', maxWidth: 620,
          bgcolor: 'brand.surfaceAlt', flexDirection: 'column', justifyContent: 'space-between', p: 5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box component="img" src="/sagliktanLogo.png" alt="" sx={{ width: 44, height: 44, borderRadius: `${radius.sm}px` }} />
          <Typography variant="h5" component="p" sx={{ color: 'primary.main', fontWeight: 800 }}>Sağlıktan</Typography>
        </Stack>
        <Box sx={{ maxWidth: 440 }}>
          <Box sx={{ mb: 4, justifyContent: 'flex-start', display: 'flex' }}>
            <CompanionCluster names={companions} big />
          </Box>
          <Typography variant="h2" component="p" sx={{ mb: 1.5, fontSize: '2.4rem' }}>{sideTitle}</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.125rem' }}>{sideText}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
              <CompanionCluster names={companions} />
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
