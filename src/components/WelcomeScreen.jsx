import { Box, Button, Typography, Container, Grid, Stack, useMediaQuery, useTheme } from "@mui/material"
import { useNavigate } from "react-router-dom"
import {
  Forum,
  Groups2Rounded,
  MedicalServicesOutlined,
  Groups,
  ArrowForward,
  Security
} from "@mui/icons-material"

const features = [
  {
    icon: Groups2Rounded,
    title: "Hastalık Grupları",
    description: "İlgilendiğiniz hastalık grubuna katılın, sizinle aynı yolu yürüyen kişilerle tanışın."
  },
  {
    icon: Forum,
    title: "Topluluk Desteği",
    description: "Benzer deneyimleri yaşayan kişilerle bağlantı kurun, birbirinize destek olun."
  },
  {
    icon: MedicalServicesOutlined,
    title: "Gerçek Deneyimler",
    description: "Alt gruplarda paylaşılan gönderi ve yorumlarla gerçek deneyimlerden faydalanın."
  },
  {
    icon: Security,
    title: "Güvenli ve Gizli",
    description: "Verileriniz güvende, paylaşımlarınız yalnızca üyesi olduğunuz grupla sınırlı."
  }
]

const steps = [
  { number: "01", title: "Hesap Oluşturun", description: "Bir dakikadan kısa sürede, ücretsiz" },
  { number: "02", title: "Grubunuzu Bulun", description: "İlgilendiğiniz hastalık grubuna katılın" },
  { number: "03", title: "Paylaşın, Dinleyin", description: "Deneyiminizi anlatın, başkalarınınkinden öğrenin" }
]

export default function WelcomeScreen() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(30, 26, 22, 0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src="/sagliktanLogo.png"
                alt="Sağlıktan"
                sx={{ width: 40, height: 40, borderRadius: '10px' }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Sağlıktan
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="text"
                onClick={() => navigate("/login")}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Giriş Yap
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/register")}
                size={isMobile ? "small" : "medium"}
              >
                Başla
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 8, md: 12 },
          background: 'linear-gradient(180deg, #1E1A16 0%, #2A241F 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h1"
                  sx={{
                    color: 'primary.main',
                    mb: 3,
                    fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.25rem' }
                  }}
                >
                  Bu Yolda
                  <Box component="span" sx={{ color: 'secondary.main', display: 'block' }}>
                    Yalnız Değilsiniz
                  </Box>
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    mb: 4,
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    maxWidth: 480,
                    mx: { xs: 'auto', md: 0 }
                  }}
                >
                  Kronik ve nadir hastalıklarla yaşayan bireyleri ve yakınlarını, birbirini
                  gerçekten anlayan bir toplulukta bir araya getiriyoruz.
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/register")}
                    endIcon={<ArrowForward />}
                    sx={{ minWidth: 180 }}
                  >
                    Topluluğa Katıl
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/login")}
                    sx={{ minWidth: 180 }}
                  >
                    Giriş Yap
                  </Button>
                </Stack>

                {/* Trust indicators */}
                <Stack
                  direction="row"
                  spacing={3}
                  sx={{
                    mt: 5,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    flexWrap: 'wrap',
                    gap: 2
                  }}
                >
                  {[
                    { icon: Groups, text: "Hastalık Grupları" },
                    { icon: Security, text: "Gizlilik Odaklı" }
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <item.icon sx={{ color: 'secondary.main', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                {/* Logo illüstrasyon alanı */}
                <Box
                  sx={{
                    width: { xs: 280, md: 400 },
                    height: { xs: 280, md: 400 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(63, 156, 135, 0.14) 0%, rgba(217, 119, 87, 0.10) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <Box
                    component="img"
                    src="/sagliktanLogo.png"
                    alt="Sağlıktan"
                    sx={{
                      width: { xs: 120, md: 160 },
                      height: { xs: 120, md: 160 },
                      borderRadius: '24px',
                      boxShadow: '0 16px 48px rgba(44, 117, 98, 0.18)'
                    }}
                  />
                  {/* Yüzen ikon rozetleri */}
                  <Box sx={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: 60,
                    height: 60,
                    borderRadius: '16px',
                    bgcolor: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(217, 119, 87, 0.3)'
                  }}>
                    <Groups2Rounded sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box sx={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '5%',
                    width: 50,
                    height: 50,
                    borderRadius: '12px',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(63, 156, 135, 0.25)'
                  }}>
                    <Forum sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="h2" sx={{ color: 'primary.main', mb: 2 }}>
              Neden Sağlıktan?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Sağlık yolculuğunuzda yanınızda olmak için tasarlandı
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: 'background.default',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'background.paper',
                      borderColor: 'rgba(76, 184, 159, 0.35)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.32)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'rgba(63, 156, 135, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5
                    }}
                  >
                    <feature.icon sx={{ color: 'secondary.main', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How it Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="h2" sx={{ color: 'primary.main', mb: 2 }}>
              Nasıl Çalışır?
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Üç basit adımda topluluğa katılın
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {steps.map((step, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontSize: '3.5rem',
                      fontWeight: 800,
                      color: 'rgba(63, 156, 135, 0.22)',
                      lineHeight: 1,
                      mb: 2
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'primary.main', mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(135deg, #2C7562 0%, #3F9C87 100%)'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ color: 'white', mb: 2 }}>
              Sağlık Topluluğuna Katılın
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                mb: 4,
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              Sağlık yolculuğunuzda yalnız değilsiniz. Aramıza katılın, sizi anlayan
              bir topluluğun parçası olun.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/register")}
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'white',
                  minWidth: 200,
                  '&:hover': { bgcolor: '#B85C3D' }
                }}
              >
                Ücretsiz Kayıt Ol
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          bgcolor: '#2C7562',
          color: 'white',
          borderTop: '1px solid',
          borderColor: 'rgba(255,255,255,0.1)'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src="/sagliktanLogo.png"
                alt="Sağlıktan"
                sx={{ width: 32, height: 32, borderRadius: '8px' }}
              />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                © {new Date().getFullYear()} Sağlıktan. Tüm hakları saklıdır.
              </Typography>
            </Box>
            <Stack direction="row" spacing={3}>
              <Typography
                variant="body2"
                onClick={() => navigate('/gizlilik-politikasi')}
                sx={{
                  opacity: 0.85,
                  cursor: 'pointer',
                  '&:hover': { opacity: 1 }
                }}
              >
                Gizlilik Politikası
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
