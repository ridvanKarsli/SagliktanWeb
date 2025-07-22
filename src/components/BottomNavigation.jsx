import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PostAddIcon from '@mui/icons-material/PostAdd';

const StyledBottomNavigation = styled(MuiBottomNavigation)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 65,
  borderTop: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'white',
  '& .MuiBottomNavigationAction-root': {
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
}));

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) return null;

  return (
    <StyledBottomNavigation
      value={location.pathname}
      onChange={(event, newValue) => {
        navigate(newValue);
      }}
      showLabels
    >
      <BottomNavigationAction
        label="Ana Sayfa"
        value="/home"
        icon={<HomeIcon />}
      />
      <BottomNavigationAction
        label="AI ile Konuş"
        value="/ai-chat"
        icon={<SmartToyIcon />}
      />
      <BottomNavigationAction
        label="Gönderiler"
        value="/posts"
        icon={<PostAddIcon />}
      />
    </StyledBottomNavigation>
  );
};

export default BottomNav; 