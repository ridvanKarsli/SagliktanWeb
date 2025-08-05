import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Grow,
  Chip,
  Stack,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedIcon from '@mui/icons-material/Verified';
import { authService } from '../services/authService';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
  position: 'relative',
  padding: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(52, 195, 161, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(27, 122, 133, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(52, 195, 161, 0.2) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
}));

const FormCard = styled(Box)(({ theme }) => ({
  background: 'rgba(253, 253, 252, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  border: '1px solid rgba(52, 195, 161, 0.2)',
  boxShadow: '0px 24px 80px rgba(11, 58, 78, 0.25)',
  padding: theme.spacing(5),
  width: '100%',
  maxWidth: '480px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  position: 'relative',
}));

const LogoImage = styled('img')(({ theme }) => ({
  height: '100px',
  borderRadius: '50%',
  border: `4px solid ${theme.palette.secondary.main}`,
  animation: `${float} 3s ease-in-out infinite`,
  boxShadow: '0px 12px 40px rgba(52, 195, 161, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0px 16px 48px rgba(52, 195, 161, 0.4)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: 'rgba(253, 253, 252, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(52, 195, 161, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      border: '2px solid rgba(52, 195, 161, 0.4)',
      transform: 'translateY(-2px)',
      boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.15)',
    },
    '&.Mui-focused': {
      border: `2px solid ${theme.palette.secondary.main}`,
      boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.25)',
      transform: 'translateY(-2px)',
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.info.main,
    fontWeight: 500,
    '&.Mui-focused': {
      color: theme.palette.secondary.main,
    },
  },
  '& .MuiOutlinedInput-input': {
    color: theme.palette.primary.main,
    fontWeight: 500,
    padding: theme.spacing(2),
    '&::placeholder': {
      color: 'rgba(27, 122, 133, 0.6)',
      opacity: 1,
    },
  },
}));

const PremiumButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2, 4),
  fontSize: '1.1rem',
  fontWeight: 700,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
  color: theme.palette.primary.main,
  boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
      rgba(255, 255, 255, 0.3),
      transparent
    )`,
    transition: 'left 0.5s',
  },
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.info.light} 100%)`,
    boxShadow: '0px 12px 32px rgba(52, 195, 161, 0.4)',
    transform: 'translateY(-2px)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(0px)',
  },
  '&:disabled': {
    background: 'rgba(52, 195, 161, 0.3)',
    color: 'rgba(11, 58, 78, 0.5)',
    boxShadow: 'none',
    transform: 'none',
  },
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(52, 195, 161, 0.1)',
  color: theme.palette.info.main,
  border: '1px solid rgba(52, 195, 161, 0.2)',
  fontWeight: 500,
  '& .MuiChip-icon': {
    color: theme.palette.secondary.main,
  },
}));

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Giriş işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <LoginContainer>
      <Fade in={isVisible} timeout={800}>
        <FormCard component="form" onSubmit={handleSubmit}>
          {/* Logo Section */}
          <Slide direction="down" in={isVisible} timeout={1000}>
            <LogoContainer>
              <LogoImage
                src="/sagliktanLogo.png"
                alt="Sağlıktan Logo"
              />
            </LogoContainer>
          </Slide>

          {/* Header */}
          <Grow in={isVisible} timeout={1200}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  background: 'linear-gradient(135deg, #0B3A4E 0%, #1B7A85 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Hoş Geldiniz
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'primary.main',
                  opacity: 0.8,
                  mb: 3,
                }}
              >
                Hesabınıza giriş yapın ve sağlık yolculuğunuza devam edin
              </Typography>
              
              {/* Feature Chips */}
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" gap={1}>
                <FeatureChip
                  icon={<SecurityIcon />}
                  label="Güvenli"
                  size="small"
                />
                <FeatureChip
                  icon={<SpeedIcon />}
                  label="Hızlı"
                  size="small"
                />
                <FeatureChip
                  icon={<VerifiedIcon />}
                  label="Doğrulanmış"
                  size="small"
                />
              </Stack>
            </Box>
          </Grow>

          {/* Error Alert */}
          {error && (
            <Slide direction="up" in={Boolean(error)} timeout={500}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                }}
              >
                {error}
              </Alert>
            </Slide>
          )}

          {/* Form Fields */}
          <Fade in={isVisible} timeout={1400}>
            <Box>
              <StyledTextField
                fullWidth
                label="E-posta Adresi"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ornek@sagliktan.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'secondary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                fullWidth
                label="Şifre"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Güçlü şifrenizi girin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'secondary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        sx={{ color: 'info.main' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Fade>

          {/* Submit Button */}
          <Grow in={isVisible} timeout={1600}>
            <PremiumButton
              type="submit"
              fullWidth
              disabled={loading}
              startIcon={<LoginIcon />}
              sx={{ mb: 3 }}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </PremiumButton>
          </Grow>

          {/* Footer Links */}
          <Fade in={isVisible} timeout={1800}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 2, color: 'primary.main', opacity: 0.7 }}>
                Henüz hesabınız yok mu?
              </Typography>
              <Link
                component="button"
                type="button"
                variant="body1"
                onClick={() => navigate('/signup')}
                sx={{
                  textDecoration: 'none',
                  color: 'secondary.main',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: 'secondary.light',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Hemen Kayıt Olun →
              </Link>
            </Box>
          </Fade>
        </FormCard>
      </Fade>
    </LoginContainer>
  );
};

export default LoginForm;