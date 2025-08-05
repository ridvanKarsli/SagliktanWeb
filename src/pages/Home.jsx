import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  useMediaQuery, 
  useTheme, 
  Grid, 
  Paper, 
  Avatar,
  Card,
  CardContent,
  Button,
  Fade,
  Grow,
  Slide,
  Stack,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNavigation';
import SpaIcon from '@mui/icons-material/Spa';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import MedicalInformationRoundedIcon from '@mui/icons-material/MedicalInformationRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChatIcon from '@mui/icons-material/Chat';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const gradient = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
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
      radial-gradient(circle at 20% 80%, rgba(52, 195, 161, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(27, 122, 133, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(52, 195, 161, 0.2) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
}));

const FloatingLogo = styled(Avatar)(({ theme }) => ({
  width: 140,
  height: 140,
  margin: '0 auto 32px',
  border: `4px solid ${theme.palette.secondary.main}`,
  boxShadow: '0px 20px 60px rgba(52, 195, 161, 0.3)',
  animation: `${float} 4s ease-in-out infinite`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0px 24px 80px rgba(52, 195, 161, 0.4)',
  },
}));

const FeatureCard = styled(Card)(({ theme, delay = 0 }) => ({
  height: '100%',
  background: 'rgba(253, 253, 252, 0.98)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(52, 195, 161, 0.15)',
  borderRadius: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: '0px 20px 60px rgba(11, 58, 78, 0.2)',
    border: '1px solid rgba(52, 195, 161, 0.3)',
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2.5),
  background: 'rgba(253, 253, 252, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(52, 195, 161, 0.1)',
  textAlign: 'center',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0px 16px 48px rgba(52, 195, 161, 0.15)',
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

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
  color: theme.palette.primary.main,
  boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.info.light} 100%)`,
    boxShadow: '0px 12px 32px rgba(52, 195, 161, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      title: 'Topluluk Etkileşimi',
      description: 'Başlık aç, yorum yap, katkı sun. Şeffaf ve açık iletişimle bilgiyi paylaş.',
      icon: <Diversity3RoundedIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      delay: 0,
    },
    {
      title: 'Uzman Katılımı',
      description: 'Doktorlar, hemşireler ve diğer sağlık profesyonellerinden güvenilir bilgi alın.',
      icon: <MedicalInformationRoundedIcon sx={{ fontSize: 48, color: 'info.main' }} />,
      delay: 0.2,
    },
    {
      title: 'Yapay Zeka Desteği',
      description: 'Yapay zeka ile içerik önerisi ve sağlık görevlisi analizleri elinizin altında.',
      icon: <SmartToyRoundedIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      delay: 0.4,
    },
    {
      title: 'Huzurlu Deneyim',
      description: 'Yumuşak renkler ve sade tasarım ile gözünüz ve ruhunuz dinlensin.',
      icon: <SelfImprovementRoundedIcon sx={{ fontSize: 48, color: 'info.main' }} />,
      delay: 0.6,
    },
  ];

  const stats = [
    { icon: <GroupsIcon />, value: '10K+', label: 'Aktif Kullanıcı' },
    { icon: <LocalHospitalIcon />, value: '500+', label: 'Uzman Doktor' },
    { icon: <ChatIcon />, value: '50K+', label: 'Başarılı Konsültasyon' },
    { icon: <StarIcon />, value: '98%', label: 'Memnuniyet Oranı' },
  ];

  const quickActions = [
    { title: 'Gönderi Oluştur', icon: <PostAddIcon />, description: 'Yeni bir konu başlat' },
    { title: 'AI ile Konuş', icon: <SmartToyRoundedIcon />, description: 'Hızlı yanıt al' },
    { title: 'Profil Ara', icon: <PersonAddIcon />, description: 'Uzmanları keşfet' },
    { title: 'Topluluk', icon: <GroupsIcon />, description: 'Destek gruplarına katıl' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={isVisible} timeout={1000}>
                <Box>
                  <FloatingLogo
                    src="/sagliktanLogo.png"
                    alt="Sağlıktan Logo"
                  />
                  <GradientText
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                      textAlign: 'center',
                    }}
                  >
                    SAĞLIKTAN
                  </GradientText>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'text.light',
                      mb: 3,
                      fontWeight: 500,
                      textAlign: 'center',
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                    }}
                  >
                    Kronik Hastalıklar İçin Sosyal Platform
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.light',
                      mb: 4,
                      opacity: 0.9,
                      fontSize: '1.125rem',
                      lineHeight: 1.7,
                      textAlign: 'center',
                    }}
                  >
                    Kronik hastalığa sahip bireyleri, sağlık çalışanlarını ve bilgi arayanları 
                    bir araya getiren dijital sosyal platform. Yapay zeka destekli içerik 
                    önerileri ile donatıldı.
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" gap={2}>
                    <ActionButton startIcon={<PostAddIcon />}>
                      Gönderi Oluştur
                    </ActionButton>
                    <ActionButton startIcon={<SmartToyRoundedIcon />}>
                      AI ile Konuş
                    </ActionButton>
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slide direction="left" in={isVisible} timeout={1200}>
                <Grid container spacing={2}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} key={index}>
                      <Grow in={isVisible} timeout={1000 + index * 200}>
                        <StatsCard>
                          <Box sx={{ color: 'secondary.main', mb: 1 }}>
                            {stat.icon}
                          </Box>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 800,
                              color: 'primary.main',
                              mb: 1,
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 500,
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </StatsCard>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
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
                PLATFORM ÖZELLİKLERİ
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
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Grow in={isVisible} timeout={1500 + index * 200}>
                  <FeatureCard delay={feature.delay}>
                    <CardContent sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                      <Box sx={{ mb: 3 }}>
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: 'primary.main',
                          fontSize: '1.25rem',
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'primary.main',
                          opacity: 0.8,
                          lineHeight: 1.6,
                          fontSize: '0.9375rem',
                        }}
                      >
                        {feature.description}
              </Typography>
                    </CardContent>
                  </FeatureCard>
                </Grow>
          </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Quick Actions Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Fade in={isVisible} timeout={2000}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: 'primary.main',
                }}
              >
                Hızlı Başlangıç
          </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'primary.main',
                  opacity: 0.8,
                  fontSize: '1.125rem',
                  maxWidth: '600px',
                  mx: 'auto',
                }}
              >
                Platformumuzun temel özelliklerini keşfedin ve hemen kullanmaya başlayın
          </Typography>
          </Box>
          </Fade>

          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Grow in={isVisible} timeout={2000 + index * 150}>
                  <Card
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid rgba(52, 195, 161, 0.1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0px 16px 48px rgba(52, 195, 161, 0.15)',
                        border: '1px solid rgba(52, 195, 161, 0.3)',
                      },
                    }}
                  >
                    <IconButton
                      sx={{
                        mb: 2,
                        bgcolor: 'rgba(52, 195, 161, 0.1)',
                        color: 'secondary.main',
                        '&:hover': {
                          bgcolor: 'rgba(52, 195, 161, 0.2)',
                        },
                      }}
                    >
                      {action.icon}
                    </IconButton>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: 'primary.main',
                      }}
                    >
                      {action.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'primary.main',
                        opacity: 0.7,
                      }}
                    >
                      {action.description}
          </Typography>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
      {isMobile && <BottomNav />}
    </Box>
  );
};

export default Home;