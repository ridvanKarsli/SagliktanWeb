import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  useMediaQuery,
  Stack,
  Button
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import GroupsIcon from '@mui/icons-material/Groups';
import PsychologyIcon from '@mui/icons-material/Psychology';
import './App.css';

// Custom theme with our color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#0B3A4E',
    },
    secondary: {
      main: '#34C3A1',
    },
    background: {
      default: '#0B3A4E',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
  },
});

function FeatureCard({ title, description, icon, delay }) {
  return (
    <Card 
      elevation={0}
      className="feature-card"
      sx={{ 
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        transition: 'all 0.4s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(52, 195, 161, 0.2)',
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 2,
          color: '#34C3A1'
        }}>
          {icon}
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#FFFFFF',
            mb: 2,
            fontWeight: 600,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #34C3A1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.7,
            textAlign: 'center'
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ThemeProvider theme={theme}>
      <Box 
        className="main-container"
        sx={{ 
          minHeight: '100vh',
          background: '#0B3A4E',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Animated Background Elements */}
        <Box className="animated-bg">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </Box>

        <Container 
          maxWidth="lg" 
          sx={{ 
            py: { xs: 3, sm: 4, md: 6 },
            px: { xs: 2, sm: 3, md: 4 },
            width: '100%'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Header Section */}
            <Box 
              className="header-section"
              sx={{ 
                textAlign: 'center',
                mb: { xs: 4, sm: 6, md: 8 },
                px: { xs: 1, sm: 2 }
              }}
            >
              <div className="logo-container">
                <img
                  src="/sagliktanLogo.png"
                  alt="Sağlıktan Logo"
                  className="main-logo"
                  style={{
                    maxWidth: isMobile ? '180px' : '250px',
                    height: 'auto',
                    marginBottom: isMobile ? '1.5rem' : '2rem'
                  }}
                />
              </div>
              <Typography 
                variant="h1" 
                className="main-title"
                sx={{
                  color: '#FFFFFF',
                  fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                  mb: { xs: 2, sm: 3 },
                  fontWeight: 800,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #34C3A1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2
                }}
              >
                SAĞLIKTAN
              </Typography>
              <Typography 
                variant="h2" 
                className="subtitle"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.8rem' },
                  mb: { xs: 3, sm: 4 },
                  fontWeight: 400,
                  lineHeight: 1.4,
                  px: { xs: 1, sm: 2 }
                }}
              >
                Kronik Hastalıklar İçin Sosyal ve Bilgilendirici Platform
              </Typography>
            </Box>

            {/* Main Content */}
            <Grid 
              container 
              spacing={{ xs: 2, sm: 3, md: 4 }} 
              sx={{ 
                mb: { xs: 4, sm: 6, md: 8 },
                px: { xs: 1, sm: 2 },
                justifyContent: 'center'
              }}
            >
              <Grid 
                item 
                xs={12} 
                md={6} 
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  maxWidth: { md: '600px' }
                }}
              >
                <Paper 
                  className="glass-card"
                  elevation={0}
                  sx={{ 
                    p: { xs: 2, sm: 3, md: 4 },
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      color: '#FFFFFF',
                      mb: { xs: 2, sm: 3 },
                      fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #34C3A1 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Proje Tanımı
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.8,
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                      textAlign: 'center'
                    }}
                  >
                    <strong>SAĞLIKTAN</strong>, kronik hastalıklara sahip bireylerin ve alanında uzman sağlık profesyonellerinin bir araya geldiği dijital bir sosyal platformdur.
                    Bu platform, bilgi paylaşımı, bilinçlendirme ve destek sağlama amacıyla geliştirilmiştir. Yapay zeka desteğiyle kişiselleştirilmiş içerikler sunarak kullanıcı
                    deneyimini zenginleştirir.
                  </Typography>
                </Paper>
              </Grid>

              <Grid 
                item 
                xs={12} 
                md={6} 
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  maxWidth: { md: '600px' }
                }}
              >
                <Stack 
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ width: '100%' }}
                >
                  <FeatureCard
                    title="Topluluk Etkileşimi"
                    description="Kullanıcılar benzer hastalıklara sahip bireylerle deneyimlerini paylaşabilir, moral desteği sağlayabilir."
                    icon={<GroupsIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />}
                  />
                  <FeatureCard
                    title="Uzman Bilgilendirmesi"
                    description="Alanında yetkin doktorlar platform üzerinden bilgilendirici içerikler yayınlayabilir, sorulara yanıt verebilir."
                    icon={<HealthAndSafetyIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />}
                  />
                  <FeatureCard
                    title="Yapay Zeka Desteği"
                    description="Kişiselleştirilmiş doktor ve tedavi önerileri sunar."
                    icon={<PsychologyIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />}
                  />
                </Stack>
              </Grid>
            </Grid>

            {/* Coming Soon Section */}
            <Box
              className="coming-soon-section"
              sx={{
                textAlign: 'center',
                py: { xs: 4, sm: 6, md: 8 },
                px: { xs: 1, sm: 2 }
              }}
            >
              <Typography 
                variant="h2" 
                className="coming-soon-title"
                sx={{ 
                  color: '#FFFFFF',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  mb: { xs: 3, sm: 4 },
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #34C3A1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Çok Yakında Yayındayız!
              </Typography>
              <Box
                className="heart-container"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <FavoriteIcon 
                  sx={{ 
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    color: '#34C3A1'
                  }} 
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
