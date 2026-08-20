import { Box, Button, Container, Typography } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

// Gizlilik Politikası, Kullanım Şartları, Hakkımızda, Topluluk Kuralları,
// Yardım - hepsi aynı "geri butonu + başlık + içerik" kabuğunu paylaşıyor
// (bkz. clean-code audit konvansiyonu: tekrarlanan sayfa iskeleti tek yerde).
export default function StaticPageShell({ title, subtitle, children, maxWidth = 'md' }) {
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
          Geri
        </Button>
      </Box>

      <Container maxWidth={maxWidth} sx={{ pb: 8 }}>
        <Typography variant="h2" component="h1" sx={{ color: 'primary.main', mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </Container>
    </Box>
  )
}
