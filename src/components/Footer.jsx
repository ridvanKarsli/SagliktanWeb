import { Box, Container, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 4,
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <img
            src="/sagliktanLogo.png"
            alt="Sağlıktan Logo"
            style={{ height: '32px' }}
          />
          <Typography variant="body2" color="text.secondary">
            © 2024 Sağlıktan
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 