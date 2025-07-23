import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PsychologyAltRoundedIcon from '@mui/icons-material/PsychologyAltRounded';
import DynamicFeedRoundedIcon from '@mui/icons-material/DynamicFeedRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';

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
        icon={<HomeRoundedIcon />}
      />
      <BottomNavigationAction
        label="AI ile Konuş"
        value="/ai-chat"
        icon={<PsychologyAltRoundedIcon />}
      />
      <BottomNavigationAction
        label="Gönderiler"
        value="/posts"
        icon={<DynamicFeedRoundedIcon />}
      />
      <BottomNavigationAction
        label="Kişi Ara"
        value="/search-user"
        icon={<ManageSearchRoundedIcon />}
      />
    </StyledBottomNavigation>
  );
};

export default BottomNav; 