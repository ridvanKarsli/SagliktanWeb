import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import FullScreenLoader from './common/FullScreenLoader.jsx'

// ProtectedRoute'un tersi: oturumu açık bir kullanıcı karşılama/giriş/kayıt
// gibi yalnızca ziyaretçilere yönelik sayfalara gelirse doğrudan /home'a
// gider - geçerli oturumu varken tekrar giriş yapması gerektiğini sanmasın.
export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (isAuthenticated) return <Navigate to="/home" replace />
  return children
}
