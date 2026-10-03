import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import CenteredSpinner from './common/CenteredSpinner.jsx'

// ProtectedRoute zaten "giriş yapmış mı" kontrolünü yapıyor (bu route her
// zaman ProtectedLayout'un içinde kullanılmalı) - burada ayrıca "ADMIN mi"
// kontrolü var. Admin olmayan biri /admin'e girmeye çalışırsa sessizce
// /home'a yönlendirilir (401/403 sayfası göstermek yerine - içerik
// varlığını bile ima etmemek daha güvenli bir varsayılan).
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <CenteredSpinner page />

  if (!user || user.role !== 'ADMIN') return <Navigate to="/home" replace />
  return children || <Outlet />
}
