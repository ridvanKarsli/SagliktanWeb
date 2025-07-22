import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNavigation';
import Posts from '../components/Posts';
import { Box, useMediaQuery, useTheme } from '@mui/material';

const PostsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ flexGrow: 1, p: 4, bgcolor: 'background.default', pb: isMobile ? 8 : 4 }}>
        <Posts />
      </Box>
      <Footer />
      {isMobile && <BottomNav />}
    </Box>
  );
};

export default PostsPage; 