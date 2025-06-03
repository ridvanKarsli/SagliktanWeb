import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'white',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
}));

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    navigate('/');
  };

  const menuItems = [
    { text: 'Ana Sayfa', icon: <HomeIcon />, path: '/home' },
    { text: 'AI ile Konuş', icon: <SmartToyIcon />, path: '/ai-chat' },
  ];

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img
              src="/sagliktanLogo.png"
              alt="Sağlıktan Logo"
              style={{ height: '40px', marginRight: '24px' }}
            />
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    startIcon={item.icon}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: 'primary.main',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(11, 58, 78, 0.04)',
                      },
                      ...(item.path === window.location.pathname && {
                        bgcolor: 'rgba(52, 195, 161, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(52, 195, 161, 0.2)',
                        },
                      }),
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                width: 40,
                height: 40,
                border: '2px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'secondary.main',
                },
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

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Kullanıcı Adı
          </Typography>
          <Typography variant="body2" color="text.secondary">
            user@example.com
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => navigate('/home')}>
          <HomeIcon sx={{ mr: 2, color: 'primary.main' }} />
          Ana Sayfa
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <AccountCircleIcon sx={{ mr: 2, color: 'primary.main' }} />
          Profil
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
          Ayarlar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2 }} />
          Çıkış Yap
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header; 