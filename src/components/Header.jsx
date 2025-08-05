import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  Fade,
  Slide,
  Backdrop,
} from '@mui/material';
import { keyframes } from '@mui/system';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import PostAddIcon from '@mui/icons-material/PostAdd';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { authService } from '../services/authService';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded';
import DynamicFeedRoundedIcon from '@mui/icons-material/DynamicFeedRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Face6RoundedIcon from '@mui/icons-material/Face6Rounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';

// Animation keyframes
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(52, 195, 161, 0.3); }
  50% { box-shadow: 0 0 30px rgba(52, 195, 161, 0.6); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled components
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'scrolled',
})(({ theme, scrolled }) => ({
  backgroundColor: scrolled 
    ? 'rgba(253, 253, 252, 0.95)' 
    : 'rgba(253, 253, 252, 0.9)',
  backdropFilter: 'blur(20px)',
  borderBottom: `1px solid ${scrolled 
    ? 'rgba(52, 195, 161, 0.2)' 
    : 'rgba(52, 195, 161, 0.1)'}`,
  boxShadow: scrolled 
    ? '0px 8px 32px rgba(11, 58, 78, 0.15)' 
    : '0px 4px 24px rgba(11, 58, 78, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const LogoImage = styled('img')(({ theme }) => ({
  height: '48px',
  borderRadius: '50%',
  marginRight: theme.spacing(2),
  border: '2px solid transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${float} 3s ease-in-out infinite`,
  '&:hover': {
    border: `2px solid ${theme.palette.secondary.main}`,
    animation: `${glow} 2s ease-in-out infinite`,
  },
}));

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
  borderRadius: theme.spacing(2),
  padding: '8px 20px',
  margin: '0 4px',
  fontWeight: 600,
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  color: active ? theme.palette.secondary.main : theme.palette.primary.main,
  backgroundColor: active 
    ? 'rgba(52, 195, 161, 0.15)' 
    : 'transparent',
  border: active 
    ? `1px solid ${theme.palette.secondary.main}` 
    : '1px solid transparent',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(
      90deg,
      transparent,
      rgba(52, 195, 161, 0.2),
      transparent
    )`,
    transition: 'left 0.5s',
  },
  '&:hover': {
    backgroundColor: 'rgba(52, 195, 161, 0.1)',
    transform: 'translateY(-2px)',
    boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.2)',
    '&::before': {
      left: '100%',
    },
  },
}));

const PremiumAvatar = styled(Avatar)(({ theme }) => ({
  width: 44,
  height: 44,
  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
  color: theme.palette.primary.main,
  fontWeight: 700,
  border: '3px solid rgba(52, 195, 161, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.1)',
    border: `3px solid ${theme.palette.secondary.main}`,
    boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.4)',
  },
}));

const GlowingIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(52, 195, 161, 0.1)',
    transform: 'scale(1.1)',
    boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.2)',
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: 'rgba(253, 253, 252, 0.98)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(52, 195, 161, 0.15)',
    boxShadow: '0px 16px 48px rgba(11, 58, 78, 0.2)',
    minWidth: '240px',
    marginTop: theme.spacing(1),
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  margin: '4px 12px',
  padding: '12px 16px',
  color: theme.palette.primary.main,
  fontWeight: 500,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(52, 195, 161, 0.1)',
    transform: 'translateX(8px)',
    color: theme.palette.secondary.main,
  },
  '& .MuiListItemIcon-root': {
    minWidth: '40px',
    color: 'inherit',
  },
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '280px',
    backgroundColor: 'rgba(253, 253, 252, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(52, 195, 161, 0.15)',
  },
}));

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
    handleMenuClose();
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Ana Sayfa', icon: <HomeRoundedIcon />, path: '/home' },
    { text: 'AI Asistan', icon: <PsychologyAltRoundedIcon />, path: '/ai-chat' },
    { text: 'Kişi Ara', icon: <ManageSearchRoundedIcon />, path: '/search-user' },
    { text: 'Gönderiler', icon: <DynamicFeedRoundedIcon />, path: '/posts' },
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <>
      <Slide direction="down" in={true} timeout={500}>
        <StyledAppBar position="fixed" elevation={0} scrolled={scrolled}>
          <Toolbar sx={{ px: { xs: 2, sm: 4 }, py: 1 }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <GlowingIconButton
                edge="start"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon sx={{ color: 'primary.main' }} />
              </GlowingIconButton>
            )}

            {/* Logo */}
            <LogoContainer onClick={() => handleNavigation('/home')}>
              <LogoImage
                src="/sagliktanLogo.png"
                alt="Sağlıktan Logo"
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Sağlıktan
              </Typography>
            </LogoContainer>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', ml: 4 }}>
                {menuItems.map((item) => (
                  <NavButton
                    key={item.text}
                    startIcon={item.icon}
                    onClick={() => handleNavigation(item.path)}
                    active={isActivePath(item.path)}
                  >
                    {item.text}
                  </NavButton>
                ))}
              </Box>
            )}

            {/* Right Side Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              {/* Search Button */}
              <Tooltip title="Ara" arrow>
                <GlowingIconButton>
                  <SearchIcon sx={{ color: 'primary.main' }} />
                </GlowingIconButton>
              </Tooltip>

              {/* Notifications */}
              <Tooltip title="Bildirimler" arrow>
                <GlowingIconButton>
                  <Badge 
                    badgeContent={notificationCount} 
                    color="secondary"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: theme.palette.secondary.main,
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      },
                    }}
                  >
                    <NotificationsIcon sx={{ color: 'primary.main' }} />
                  </Badge>
                </GlowingIconButton>
              </Tooltip>

              {/* Profile Avatar */}
              <Tooltip title="Profil" arrow>
                <PremiumAvatar onClick={handleMenuOpen}>
                  <Face6RoundedIcon sx={{ fontSize: 28 }} />
                </PremiumAvatar>
              </Tooltip>
            </Box>
          </Toolbar>
        </StyledAppBar>
      </Slide>

      {/* Spacer for fixed header */}
      <Toolbar />

      {/* Profile Menu */}
      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(52, 195, 161, 0.1)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Kullanıcı Adı
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.main', opacity: 0.7 }}>
            user@sagliktan.com
          </Typography>
        </Box>
        
        <StyledMenuItem onClick={() => handleNavigation('/profile')}>
          <AccountCircleRoundedIcon sx={{ mr: 2 }} />
          Profilim
        </StyledMenuItem>
        
        <StyledMenuItem onClick={() => {}}>
          <SettingsRoundedIcon sx={{ mr: 2 }} />
          Ayarlar
        </StyledMenuItem>
        
        <Divider sx={{ my: 1, borderColor: 'rgba(52, 195, 161, 0.1)' }} />
        
        <StyledMenuItem 
          onClick={handleLogout} 
          sx={{ 
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              color: 'error.main',
            },
          }}
        >
          <LogoutRoundedIcon sx={{ mr: 2 }} />
          Çıkış Yap
        </StyledMenuItem>
      </StyledMenu>

      {/* Mobile Drawer */}
      <MobileDrawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(52, 195, 161, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LogoImage
              src="/sagliktanLogo.png"
              alt="Sağlıktan Logo"
              style={{ height: '40px', marginRight: '12px' }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Sağlıktan
            </Typography>
          </Box>
          <IconButton
            onClick={toggleDrawer(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'primary.main',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ px: 2, py: 2 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 1,
                backgroundColor: isActivePath(item.path) 
                  ? 'rgba(52, 195, 161, 0.1)' 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(52, 195, 161, 0.1)',
                  transform: 'translateX(8px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActivePath(item.path) 
                    ? 'secondary.main' 
                    : 'primary.main',
                  minWidth: '40px',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: isActivePath(item.path) ? 600 : 500,
                    color: isActivePath(item.path) 
                      ? 'secondary.main' 
                      : 'primary.main',
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </MobileDrawer>

      {/* Backdrop for mobile drawer */}
      <Backdrop
        open={drawerOpen}
        onClick={toggleDrawer(false)}
        sx={{ 
          zIndex: theme.zIndex.drawer - 1,
          backgroundColor: 'rgba(11, 58, 78, 0.5)',
        }}
      />
    </>
  );
};

export default Header;