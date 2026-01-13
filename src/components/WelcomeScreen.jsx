import { Box, Button, Typography, Stack, useTheme, Container, Grid, Card, CardContent, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo.jsx';
import {
  LocalHospital,
  People,
  Security,
  ChatBubbleOutline,
  SmartToy,
  VerifiedUser
} from '@mui/icons-material';

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
      title: 'Uzman Doktor Desteği',
      description: 'Sertifikalı sağlık profesyonellerinden bilimsel ve güvenilir bilgi alın'
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Topluluk Deneyimi',
      description: 'Benzer durumdaki kişilerle deneyim paylaşın ve destek alın'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Gizlilik ve Güvenlik',
      description: 'Kişisel bilgileriniz korunur, güvenli bir ortamda paylaşım yapın'
    },
    {
      icon: <ChatBubbleOutline sx={{ fontSize: 40 }} />,
      title: 'Sosyal Etkileşim',
      description: 'Sorularınızı sorun, yorum yapın ve toplulukla etkileşime geçin'
    },
    {
      icon: <SmartToy sx={{ fontSize: 40 }} />,
      title: 'AI Destekli Sohbet',
      description: 'Yapay zeka asistanımız Lumo ile 7/24 sağlık sorularınıza yanıt alın'
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 40 }} />,
      title: 'Doğrulanmış İçerik',
      description: 'Bilimsel temelli, etik ilkelere uygun içerikler ve paylaşımlar'
    }
  ];

  const steps = [
    { number: '01', title: 'Hesap Oluştur', description: 'Ücretsiz kayıt olun ve profilinizi oluşturun' },
    { number: '02', title: 'Keşfet', description: 'Paylaşımları okuyun, sorular sorun ve topluluğu keşfedin' },
    { number: '03', title: 'Etkileşime Geç', description: 'Uzmanlardan ve topluluktan yanıtlar alın' },
    { number: '04', title: 'Katkıda Bulun', description: 'Deneyimlerinizi paylaşın ve topluluğa destek olun' }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
          pointerEvents: 'none',
          zIndex: 0
        }
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 } }}>
        <Stack spacing={4} alignItems="center" sx={{ textAlign: 'center' }}>
          {/* Logo */}
          <Box
            sx={{
              animation: 'fadeInDown 0.8s ease-out',
              '@keyframes fadeInDown': {
                '0%': { opacity: 0, transform: 'translateY(-30px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <AnimatedLogo size={140} mobileSize={100} showBorder />
          </Box>

          {/* Main Title */}
          <Box
            sx={{
              animation: 'fadeInUp 0.8s ease-out 0.2s both',
              '@keyframes fadeInUp': {
                '0%': { opacity: 0, transform: 'translateY(30px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: 32, sm: 42, md: 56 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                letterSpacing: '-0.02em'
              }}
            >
              Sağlıktan
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: { xs: 16, sm: 20, md: 24 },
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Kronik Hastalar ve Uzmanlar için Güvenilir Sosyal Platform
            </Typography>
          </Box>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              animation: 'fadeInUp 0.8s ease-out 0.4s both',
              '@keyframes fadeInUp': {
                '0%': { opacity: 0, transform: 'translateY(30px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              },
              mt: 2
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                minWidth: { xs: 200, sm: 220 },
                minHeight: { xs: 52, sm: 56 },
                fontSize: { xs: 16, sm: 18 },
                fontWeight: 700,
                px: { xs: 4, sm: 5 },
                py: { xs: 1.75, sm: 2 },
                borderRadius: 3,
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`
                },
                transition: 'all 0.3s ease'
              }}
            >
              Giriş Yap
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                minWidth: { xs: 200, sm: 220 },
                minHeight: { xs: 52, sm: 56 },
                fontSize: { xs: 16, sm: 18 },
                fontWeight: 700,
                px: { xs: 4, sm: 5 },
                py: { xs: 1.75, sm: 2 },
                borderRadius: 3,
                textTransform: 'none',
                borderWidth: 2,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderWidth: 2,
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Kayıt Ol
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontSize: { xs: 28, sm: 36, md: 42 },
            textAlign: 'center',
            mb: 1,
            color: 'text.primary'
          }}
        >
          Neden Sağlıktan?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            mb: 6,
            fontSize: { xs: 16, sm: 18 },
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Sağlık alanında güvenilir bilgiye ulaşmak, deneyim paylaşmak ve uzmanlardan destek almak için tasarlandı
        </Typography>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                  },
                  animation: `fadeInUp 0.6s ease-out ${0.1 * index}s both`,
                  '@keyframes fadeInUp': {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      color: theme.palette.primary.main,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      color: 'text.primary',
                      fontSize: { xs: 18, sm: 20 }
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.7,
                      fontSize: { xs: 14, sm: 15 }
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontSize: { xs: 28, sm: 36, md: 42 },
            textAlign: 'center',
            mb: 1,
            color: 'text.primary'
          }}
        >
          Nasıl Çalışır?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            mb: 6,
            fontSize: { xs: 16, sm: 18 },
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Birkaç basit adımda başlayın ve topluluğumuzun bir parçası olun
        </Typography>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  animation: `fadeInUp 0.6s ease-out ${0.1 * index}s both`,
                  '@keyframes fadeInUp': {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    border: `2px solid ${theme.palette.primary.main}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    position: 'relative',
                    '&::after': index < steps.length - 1 ? {
                      content: '""',
                      position: 'absolute',
                      right: -32,
                      top: '50%',
                      width: 64,
                      height: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.3),
                      display: { xs: 'none', md: 'block' }
                    } : {}
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.primary.main,
                      fontSize: { xs: 24, sm: 28 }
                    }}
                  >
                    {step.number}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    color: 'text.primary',
                    fontSize: { xs: 18, sm: 20 }
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.7,
                    fontSize: { xs: 14, sm: 15 }
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA Section */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 8, md: 12 },
          mt: { xs: 4, md: 8 }
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 4,
              p: { xs: 4, sm: 6, md: 8 },
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                filter: 'blur(60px)'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -50,
                left: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                filter: 'blur(60px)'
              }
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: 24, sm: 32, md: 36 },
                mb: 2,
                color: 'text.primary',
                position: 'relative',
                zIndex: 1
              }}
            >
              Hemen Başlayın
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 4,
                fontSize: { xs: 16, sm: 18 },
                position: 'relative',
                zIndex: 1
              }}
            >
              Ücretsiz hesap oluşturun ve sağlık topluluğumuzun bir parçası olun
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                minWidth: { xs: 200, sm: 240 },
                minHeight: { xs: 52, sm: 56 },
                fontSize: { xs: 16, sm: 18 },
                fontWeight: 700,
                px: { xs: 5, sm: 6 },
                py: { xs: 1.75, sm: 2 },
                borderRadius: 3,
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                position: 'relative',
                zIndex: 1,
                '&:hover': {
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`
                },
                transition: 'all 0.3s ease'
              }}
            >
              Ücretsiz Kayıt Ol
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

