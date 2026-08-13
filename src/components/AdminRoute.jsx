import { Navigate, Outlet } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'

// ProtectedRoute zaten "giriş yapmış mı" kontrolünü yapıyor (bu route her
// zaman ProtectedLayout'un içinde kullanılmalı) - burada ayrıca "ADMIN mi"
// kontrolü var. Admin olmayan biri /admin'e girmeye çalışırsa sessizce
// /home'a yönlendirilir (401/403 sayfası göstermek yerine - içerik
// varlığını bile ima etmemek daha güvenli bir varsayılan).
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (!user || user.role !== 'ADMIN') return <Navigate to="/home" replace />
  return children || <Outlet />
}
