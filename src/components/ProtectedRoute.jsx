import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Box, CircularProgress } from '@mui/material'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  
  // Auth kontrolü yapılırken bekle
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#FBF7F1'
        }}
      >
        <CircularProgress sx={{ color: '#3F9C87' }} />
      </Box>
    )
  }
  
  // Loading bittikten sonra kontrol et
  if (!user) return <Navigate to="/" replace state={{ from: location }} />
  return children || <Outlet />
}
