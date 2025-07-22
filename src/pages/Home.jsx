import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNavigation';
import Posts from '../components/Posts';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 4, bgcolor: 'background.default', pb: isMobile ? 8 : 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', textAlign: 'center' }}>
          Sağlıktan Platformuna Hoş Geldiniz!
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
          Uygulamamızın erken kayıt aşamasında olduğunu ve yakında çok daha gelişmiş özelliklerle aktif olacağını hatırlatmak isteriz. Sağlık alanında devrim yaratacak yeni özellikler için bizi takipte kalın!
        </Typography>
        {/* <Posts /> kaldırıldı */}
      </Box>

      <Footer />
      {isMobile && <BottomNav />}
    </Box>
  );
};

export default Home; 