import { Box, Button, Typography, Container, Grid, Stack, useMediaQuery, useTheme } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { 
  Forum, 
  VerifiedUser, 
  Psychology, 
  Groups, 
  ArrowForward,
  CheckCircleOutline,
  LocalHospital,
  Security
} from "@mui/icons-material"

const features = [
  {
    icon: Forum,
    title: "Topluluk Desteği",
    description: "Benzer deneyimleri yaşayan kişilerle bağlantı kurun ve deneyimlerinizi paylaşın."
  },
  {
    icon: VerifiedUser,
    title: "Uzman Doktorlar",
    description: "Alanında uzman doktorlardan güvenilir sağlık bilgilerine erişin."
  },
  {
    icon: Psychology,
    title: "Yapay Zeka Asistanı",
    description: "Lumo ile 7/24 sağlık sorularınıza anında yanıt alın."
  },
  {
    icon: Security,
    title: "Güvenli Platform",
    description: "Verileriniz güvende. Gizlilik önceliğimizdir."
  }
]

const steps = [
  { number: "01", title: "Hesap Oluşturun", description: "Hızlı ve kolay kayıt süreci" },
  { number: "02", title: "Profilinizi Tamamlayın", description: "Sağlık geçmişinizi ekleyin" },
  { number: "03", title: "Topluluğa Katılın", description: "Paylaşın ve öğrenin" }
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
          bgcolor: 'rgba(10, 15, 20, 0.95)',
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
          background: 'linear-gradient(180deg, #0A0F14 0%, #131A22 100%)'
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
                  Sağlığınız İçin
                  <Box component="span" sx={{ color: 'secondary.main', display: 'block' }}>
                    Güvenilir Topluluk
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
                  Kronik hastalıklarla mücadele eden bireyler ve sağlık profesyonellerini 
                  bir araya getiren Türkiye'nin en güvenilir sağlık platformu.
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
                    Hemen Başla
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
                    { icon: Groups, text: "10K+ Kullanıcı" },
                    { icon: LocalHospital, text: "500+ Doktor" }
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
                {/* Lumo Mascot Illustration Area */}
                <Box
                  sx={{
                    width: { xs: 280, md: 400 },
                    height: { xs: 280, md: 400 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(52, 195, 161, 0.1) 0%, rgba(27, 122, 133, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <Box 
                    component="img" 
                    src="/sagliktanLogo.png" 
                    alt="Lumo" 
                    sx={{ 
                      width: { xs: 120, md: 160 }, 
                      height: { xs: 120, md: 160 },
                      borderRadius: '24px',
                      boxShadow: '0 16px 48px rgba(11, 58, 78, 0.15)'
                    }} 
                  />
                  {/* Floating elements */}
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
                    boxShadow: '0 8px 24px rgba(52, 195, 161, 0.3)'
                  }}>
                    <Psychology sx={{ color: 'white', fontSize: 28 }} />
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
                    boxShadow: '0 8px 24px rgba(11, 58, 78, 0.2)'
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
                      borderColor: 'rgba(52, 195, 161, 0.3)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'rgba(52, 195, 161, 0.1)',
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
                      color: 'rgba(52, 195, 161, 0.2)',
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

      {/* Lumo AI Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
              <Typography variant="h2" sx={{ color: 'primary.main', mb: 3 }}>
                Lumo ile Tanışın
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.8 }}>
                Yapay zeka destekli sağlık asistanımız Lumo, sorularınıza 7/24 yanıt vermek 
                için burada. Semptomlarınızı anlatın, genel sağlık bilgisi alın veya doğru 
                uzmana yönlendirilmek için Lumo'ya danışın.
              </Typography>
              <Stack spacing={2}>
                {[
                  "Anlık sağlık sorularına cevap",
                  "Kişiselleştirilmiş öneriler",
                  "Doktor randevusu yönlendirmesi"
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckCircleOutline sx={{ color: 'secondary.main', fontSize: 22 }} />
                    <Typography variant="body1">{item}</Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
              <Box 
                sx={{ 
                  bgcolor: 'background.default',
                  borderRadius: 4,
                  p: { xs: 3, md: 5 },
                  textAlign: 'center'
                }}
              >
                <Box 
                  component="img" 
                  src="/sagliktanLogo.png" 
                  alt="Lumo AI Assistant" 
                  sx={{ 
                    width: { xs: 100, md: 140 }, 
                    height: { xs: 100, md: 140 },
                    borderRadius: '28px',
                    mb: 3,
                    boxShadow: '0 16px 48px rgba(11, 58, 78, 0.12)'
                  }} 
                />
                <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
                  Merhaba, ben Lumo! 👋
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Sağlık sorularınızda size yardımcı olmak için buradayım.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(135deg, #1B7A85 0%, #34C3A1 100%)'
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
                color: 'rgba(255,255,255,0.8)', 
                mb: 4,
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              Binlerce kişi sağlık yolculuklarında birbirlerine destek oluyor. 
              Siz de aramıza katılın.
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
                  '&:hover': { bgcolor: '#2A9E82' }
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
          bgcolor: '#0A0F14',
          color: 'text.primary',
          borderTop: '1px solid',
          borderColor: 'divider'
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
                © 2024 Sağlıktan. Tüm hakları saklıdır.
              </Typography>
            </Box>
            <Stack direction="row" spacing={3}>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  cursor: 'pointer',
                  '&:hover': { opacity: 1 }
                }}
              >
                Gizlilik Politikası
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  cursor: 'pointer',
                  '&:hover': { opacity: 1 }
                }}
              >
                Kullanım Koşulları
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
