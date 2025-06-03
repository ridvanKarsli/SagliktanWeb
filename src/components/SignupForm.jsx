import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Link,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { authService } from '../services/authService';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    role: '',
    dateOfBirth: null,
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format date to YYYY-MM-DD
      const formattedData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : '',
      };
      
      await authService.signup(formattedData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Kayıt işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 4,
        p: 3,
        borderRadius: 2,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <img
          src="/sagliktanLogo.png"
          alt="Sağlıktan Logo"
          style={{ height: '80px', borderRadius: '50%' }}
        />
      </Box>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
        Kayıt Ol
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Ad"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Soyad"
        name="surname"
        value={formData.surname}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Rol</InputLabel>
        <Select
          name="role"
          value={formData.role}
          onChange={handleChange}
          label="Rol"
          required
        >
          <MenuItem value="doctor">Doktor</MenuItem>
          <MenuItem value="user">Kullanıcı</MenuItem>
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
        <DatePicker
          label="Doğum Tarihi"
          value={formData.dateOfBirth}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              sx: { mb: 2 }
            }
          }}
          maxDate={new Date()}
          format="dd/MM/yyyy"
        />
      </LocalizationProvider>

      <TextField
        fullWidth
        label="E-posta"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Şifre"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
        sx={{
          py: 1.5,
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/login')}
          sx={{
            textDecoration: 'none',
            color: 'primary.main',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Zaten hesabınız var mı? Giriş yapın
        </Link>
      </Box>
    </Box>
  );
};

export default SignupForm; 