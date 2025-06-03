import { Box } from '@mui/material';
import SignupForm from '../components/SignupForm';

const Signup = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <SignupForm />
    </Box>
  );
};

export default Signup; 