import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import FullScreenLoader from './common/FullScreenLoader.jsx'

// Oturum gerektiren sayfalar: oturum yoksa karşılama sayfasına, geri
// dönülecek adresi (state.from) taşıyarak yönlendirir.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/" replace state={{ from: location }} />
  return children || <Outlet />
}
