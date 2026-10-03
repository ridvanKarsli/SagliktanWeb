import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { ArrowBackRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { radius } from '../design/tokens.js'

// Gizlilik Politikası, Kullanım Şartları, Hakkımızda, Topluluk Kuralları,
// Yardım - hepsi aynı "geri butonu + başlık + içerik" kabuğunu paylaşıyor
// (bkz. clean-code audit konvansiyonu: tekrarlanan sayfa iskeleti tek yerde).
export default function StaticPageShell({ title, subtitle, children, maxWidth = 'md' }) {
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Container maxWidth={maxWidth}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 'calc(env(safe-area-inset-top) + 12px)', pb: 1 }}>
          <Button startIcon={<ArrowBackRounded />} onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
            Geri
          </Button>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box component="img" src="/sagliktanLogo.png" alt="" sx={{ width: 32, height: 32, borderRadius: '8px' }} />
            <Typography variant="subtitle1" component="p" sx={{ color: 'primary.main', fontWeight: 800 }}>Sağlıktan</Typography>
          </Stack>
        </Stack>
      </Container>

      <Container component="main" maxWidth={maxWidth} sx={{ pb: 8, pt: { xs: 2, md: 4 } }} className="page-transition">
        <Typography variant="h1" sx={{ mb: 1, fontSize: { xs: '2rem', md: '2.6rem' } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ mt: subtitle ? 0 : 3, p: { xs: 2.5, sm: 4 }, borderRadius: `${radius.lg}px`, bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border' }}>
          {children}
        </Box>
      </Container>
    </Box>
  )
}
