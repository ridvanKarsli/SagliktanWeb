import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PsychologyIcon from '@mui/icons-material/Psychology';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // soft blue
    },
    secondary: {
      main: '#10B981', // emerald
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function FeatureCard({ title, description, icon }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid #E5E7EB',
        borderRadius: 3,
        backgroundColor: 'background.paper',
        px: 3,
        py: 4,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0px 10px 20px rgba(0,0,0,0.06)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 0 }}>
        <Box sx={{ mb: 3, color: 'primary.main' }}>{icon}</Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            py: { xs: 6, sm: 8, md: 10 },
            px: { xs: 2, sm: 3, md: 4 },
            bgcolor: 'white',
            overflowX: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <Grid 
              container 
              spacing={{ xs: 4, md: 6 }} 
              alignItems="center"
              justifyContent="center"
            >
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: { md: '600px' }
                }}>
                  <img
                    src="/sagliktanLogo.png"
                    alt="Sağlıktan Logo"
                    style={{ 
                      maxWidth: isMobile ? '160px' : '180px', 
                      marginBottom: 24,
                      marginLeft: isMobile ? 'auto' : 0,
                      marginRight: isMobile ? 'auto' : 0,
                    }}
                  />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 2,
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
                    }}
                  >
                    Sağlıktan Platformu
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ 
                      color: 'text.secondary', 
                      maxWidth: 500,
                      mx: { xs: 'auto', md: 0 },
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Kronik hastalıklara sahip bireyler için sosyal destek, yapay zeka desteği ve uzman bilgileri sunan yeni nesil sağlık platformu.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: { xs: 3, sm: 4, md: 5 },
                    borderRadius: 4,
                    textAlign: 'center',
                    boxShadow: '0px 10px 30px rgba(0,0,0,0.08)',
                    maxWidth: { md: '500px' },
                    mx: { xs: 'auto', md: 0 },
                    ml: { md: 'auto' }
                  }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    Ön Kayıt Yakında Başlıyor!
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.95,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Topluluğa katılarak kendinize ve başkalarına destek olun. Platformumuz çok yakında yayında!
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Features */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              Neler Sunuyoruz?
            </Typography>
            <Typography
              variant="body1"
              sx={{ 
                color: 'text.secondary', 
                maxWidth: 700, 
                mx: 'auto',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Platformumuz kronik hastalıkları olan bireyler için sosyal destek ve doğru bilgiyi bir araya getiriyor.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {[
              {
                title: 'Topluluk Desteği',
                description:
                  'Benzer sağlık durumuna sahip bireylerle güvenli ortamda deneyim paylaşımı.',
                icon: <PeopleIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />,
              },
              {
                title: 'Uzman Görüşleri',
                description:
                  'Güncel, bilimsel ve anlaşılır içeriklerle sağlık okuryazarlığı artırma.',
                icon: <MedicalServicesIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />,
              },
              {
                title: 'Yapay Zeka Desteği',
                description:
                  'Yapay zeka ile kişiye özel tavsiyeler, hatırlatıcılar ve sağlık analizi.',
                icon: <PsychologyIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />,
              },
            ].map((feature, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <FeatureCard {...feature} />
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            py: 4,
            textAlign: 'center',
            borderTop: '1px solid #E5E7EB',
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            © 2024 Sağlıktan. Tüm hakları saklıdır.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
