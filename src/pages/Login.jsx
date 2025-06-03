import { Box } from '@mui/material';
import LoginForm from '../components/LoginForm';

const Login = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <LoginForm />
    </Box>
  );
};

export default Login; 