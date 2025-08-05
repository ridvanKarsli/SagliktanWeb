import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Slide,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import { keyframes } from '@mui/system';
import PeopleIcon from '@mui/icons-material/People';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import { styled } from '@mui/material/styles';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const gradient = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(52, 195, 161, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(27, 122, 133, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(52, 195, 161, 0.2) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
}));

const FloatingCard = styled(Box)(({ theme, delay = 0 }) => ({
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  background: 'rgba(253, 253, 252, 0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  border: '1px solid rgba(52, 195, 161, 0.2)',
  padding: theme.spacing(4),
  textAlign: 'center',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    background: 'rgba(253, 253, 252, 0.15)',
    border: '1px solid rgba(52, 195, 161, 0.4)',
    boxShadow: '0px 20px 60px rgba(52, 195, 161, 0.2)',
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.light} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  backgroundSize: '200% 200%',
  animation: `${gradient} 4s ease infinite`,
}));

const ShimmerButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-200px',
    width: '200px',
    height: '100%',
    background: `linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    )`,
    animation: `${shimmer} 3s infinite`,
  },
}));

const StatsCard = styled(Box)(({ theme }) => ({
  background: 'rgba(253, 253, 252, 0.08)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(52, 195, 161, 0.15)',
  padding: theme.spacing(3),
  textAlign: 'center',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'rgba(253, 253, 252, 0.12)',
    transform: 'translateY(-4px)',
    boxShadow: '0px 12px 40px rgba(52, 195, 161, 0.15)',
  },
}));

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      title: 'Sağlık Profesyonelleri',
      description: 'Uzman doktorlar ve sağlık profesyonelleriyle doğrudan iletişim kurun ve güvenilir sağlık bilgisi alın.',
      icon: <MedicalServicesIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      delay: 0,
    },
    {
      title: 'Topluluk Desteği',
      description: 'Benzer sağlık deneyimlerine sahip kişilerle bağlantı kurun, deneyimlerinizi paylaşın ve destek alın.',
      icon: <PeopleIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      delay: 0.2,
    },
    {
      title: 'Akıllı Asistan',
      description: 'Yapay zeka destekli sağlık asistanı ile 7/24 soru sorabilir ve kişiselleştirilmiş öneriler alabilirsiniz.',
      icon: <PsychologyIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      delay: 0.4,
    },
    {
      title: 'Güvenli Platform',
      description: 'Tüm kişisel ve sağlık verileriniz en yüksek güvenlik standartlarıyla korunur.',
      icon: <SecurityIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      delay: 0.6,
    },
    {
      title: 'Hızlı Erişim',
      description: 'Mobil ve web uygulaması ile istediğiniz her yerden hızlıca platforma erişim sağlayın.',
      icon: <SpeedIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      delay: 0.8,
    },
    {
      title: '7/24 Destek',
      description: 'Teknik destek ekibimiz size her an yardımcı olmaya hazır. Sorunlarınızı hızla çözüyoruz.',
      icon: <SupportAgentIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      delay: 1.0,
    },
  ];

  const stats = [
    { number: '10K+', label: 'Aktif Kullanıcı' },
    { number: '500+', label: 'Uzman Doktor' },
    { number: '50K+', label: 'Başarılı Konsültasyon' },
    { number: '98%', label: 'Memnuniyet Oranı' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={isVisible} timeout={1000}>
                <Box>
                  <Chip
                    label="🚀 Yeni Nesil Sağlık Platformu"
                    sx={{
                      mb: 3,
                      backgroundColor: 'rgba(52, 195, 161, 0.15)',
                      color: 'secondary.main',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      border: '1px solid rgba(52, 195, 161, 0.3)',
                    }}
                  />
                  <GradientText
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                      lineHeight: 1.1,
                    }}
                  >
                    Sağlıktan
                  </GradientText>
            <Typography
                    variant="h4"
              sx={{
                      fontWeight: 300,
                      mb: 4,
                      color: 'text.light',
                      opacity: 0.9,
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                    }}
                  >
                    Sağlığınız için güvenilir rehberiniz
            </Typography>
            <Typography
              variant="body1"
              sx={{
                      mb: 5,
                      color: 'text.light',
                      opacity: 0.8,
                      fontSize: '1.125rem',
                      lineHeight: 1.7,
                      maxWidth: '500px',
              }}
            >
              Sağlık profesyonelleri ve kullanıcıları bir araya getiren, 
                    AI destekli akıllı sağlık platformu ile sağlığınızı kontrol altına alın.
            </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
                    <ShimmerButton
              variant="contained"
              size="large"
                      endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/signup')}
              sx={{
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 3,
                      }}
                    >
                      Hemen Başla
                    </ShimmerButton>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        borderRadius: 3,
                        borderColor: 'secondary.main',
                        color: 'secondary.main',
                '&:hover': {
                          borderColor: 'secondary.light',
                          backgroundColor: 'rgba(52, 195, 161, 0.08)',
                },
              }}
            >
                      Demo İzle
            </Button>
                  </Stack>
                  <Grid container spacing={2}>
                    {stats.map((stat, index) => (
                      <Grid item xs={6} sm={3} key={index}>
                        <Grow in={isVisible} timeout={1000 + index * 200}>
                          <StatsCard>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 800,
                                color: 'secondary.main',
                                mb: 1,
                              }}
                            >
                              {stat.number}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.light',
                                opacity: 0.8,
                                fontSize: '0.875rem',
                              }}
                            >
                              {stat.label}
                            </Typography>
                          </StatsCard>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slide direction="left" in={isVisible} timeout={1200}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Box
                    component="img"
                    src="/sagliktanLogo.png"
                    alt="Sağlıktan Logo"
                    sx={{
                      maxWidth: { xs: '200px', sm: '250px', md: '300px' },
                      height: 'auto',
                      borderRadius: '50%',
                      animation: `${pulse} 4s ease-in-out infinite`,
                      boxShadow: '0px 20px 60px rgba(52, 195, 161, 0.3)',
                      border: '4px solid rgba(52, 195, 161, 0.2)',
                    }}
                  />
                  {/* Floating elements around logo */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '10%',
                      right: '10%',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'rgba(52, 195, 161, 0.2)',
                      animation: `${float} 3s ease-in-out infinite`,
                      animationDelay: '0.5s',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '20%',
                      left: '5%',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'rgba(27, 122, 133, 0.2)',
                      animation: `${float} 4s ease-in-out infinite`,
                      animationDelay: '1s',
                    }}
                  />
          </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(180deg, rgba(11, 58, 78, 0.95) 0%, rgba(27, 122, 133, 0.95) 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 70% 30%, rgba(52, 195, 161, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 30% 70%, rgba(52, 195, 161, 0.1) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Fade in={isVisible} timeout={1500}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
                variant="overline"
            sx={{
                  display: 'block',
              mb: 2,
                  color: 'secondary.main',
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                }}
              >
                ÖZELLİKLER
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: 'text.light',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                }}
              >
                Neden Sağlıktan?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.light',
                  opacity: 0.8,
                  maxWidth: '600px',
                  mx: 'auto',
                  fontSize: '1.125rem',
                  lineHeight: 1.7,
                }}
              >
                Modern teknoloji ile sağlık hizmetlerini bir araya getiren 
                yenilikçi platformumuzun sunduğu avantajları keşfedin.
          </Typography>
        </Box>
          </Fade>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <Grow in={isVisible} timeout={1500 + index * 200}>
                  <FloatingCard delay={feature.delay}>
                    <Box sx={{ mb: 3 }}>
                {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: 'text.light',
                        fontSize: '1.25rem',
                      }}
                    >
                  {feature.title}
                </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.light',
                        opacity: 0.8,
                        lineHeight: 1.6,
                        fontSize: '0.9375rem',
                      }}
                    >
                  {feature.description}
                </Typography>
                  </FloatingCard>
                </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(52, 195, 161, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(52, 195, 161, 0.2) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md">
          <Fade in={isVisible} timeout={2000}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 4 }}>
                <StarIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              </Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: 'text.light',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                }}
              >
                Sağlığınızı Geleceğe Taşıyın
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 5,
                  color: 'text.light',
                  opacity: 0.8,
                  fontSize: '1.125rem',
                  lineHeight: 1.7,
                  maxWidth: '500px',
                  mx: 'auto',
                }}
              >
                Bugün kaydolun ve modern sağlık teknolojisinin avantajlarından 
                yararlanmaya başlayın. Ücretsiz deneme sürümünüzü hemen başlatın.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                justifyContent="center"
              >
                <ShimmerButton
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/signup')}
                  sx={{
                    px: 5,
                    py: 2.5,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                  }}
                >
                  Ücretsiz Başla
                </ShimmerButton>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 5,
                    py: 2.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    borderColor: 'secondary.main',
                    color: 'secondary.main',
                    '&:hover': {
                      borderColor: 'secondary.light',
                      backgroundColor: 'rgba(52, 195, 161, 0.08)',
                    },
                  }}
                >
                  Giriş Yap
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 