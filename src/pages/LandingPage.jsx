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
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'white',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
}));

const HeaderButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: 'rgba(11, 58, 78, 0.04)',
  },
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Header */}
      <StyledAppBar position="fixed">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img
              src="/sagliktanLogo.png"
              alt="Sağlıktan Logo"
              style={{ height: '40px', marginRight: '16px' }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HeaderButton
              startIcon={<SmartToyIcon />}
              onClick={() => navigate('/ai-chat')}
            >
              AI ile Konuş
            </HeaderButton>
            <IconButton
              sx={{
                width: 40,
                height: 40,
                border: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                }}
              >
                U
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>
      <Toolbar /> {/* Spacer for fixed header */}

      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 6, sm: 8, md: 10 },
          px: { xs: 2, sm: 3, md: 4 },
          bgcolor: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <img
              src="/sagliktanLogo.png"
              alt="Sağlıktan Logo"
              style={{
                maxWidth: isMobile ? '160px' : '180px',
                marginBottom: 24,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'primary.main',
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              }}
            >
              Sağlıktan Platformu
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 4,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Sağlık profesyonelleri ve kullanıcıları bir araya getiren, 
              bilgi paylaşımı ve destek sağlayan modern sağlık platformu.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{
                bgcolor: 'secondary.main',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
                px: 4,
                py: 1.5,
              }}
            >
              Ön Kayıt Ol
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: 'primary.main',
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            Platformumuzun Özellikleri
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {[
            {
              title: 'Sağlık Profesyonelleri',
              description:
                'Uzman doktorlar ve sağlık profesyonelleriyle doğrudan iletişim kurun.',
              icon: <MedicalServicesIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
            },
            {
              title: 'Topluluk Desteği',
              description:
                'Benzer sağlık deneyimlerine sahip kişilerle bağlantı kurun ve deneyimlerinizi paylaşın.',
              icon: <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
            },
            {
              title: 'Akıllı Özellikler',
              description:
                'Yapay zeka destekli sağlık takibi ve kişiselleştirilmiş öneriler.',
              icon: <PsychologyIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard>
                {feature.icon}
                <Typography
                  variant="h6"
                  sx={{ mt: 2, mb: 1, fontWeight: 600, color: 'primary.main' }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage; 