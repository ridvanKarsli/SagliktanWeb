import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Box, CircularProgress } from '@mui/material'

// ProtectedRoute'un tersi: zaten oturumu açık bir kullanıcı "/" (karşılama
// sayfası), "/login", "/register" ya da "/forgot-password" gibi sadece
// çıkış yapmış ziyaretçiler için anlamlı olan sayfalara girerse, onu
// doğrudan uygulamaya (/home) yönlendirir. Bu olmadan localStorage'da
// geçerli bir oturum olsa bile kullanıcı her ziyarette karşılama/giriş
// sayfasını görüp tekrar giriş yapması gerektiğini sanıyordu.
export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#1E1A16'
        }}
      >
        <CircularProgress sx={{ color: '#4CB89F' }} />
      </Box>
    )
  }

  if (isAuthenticated) return <Navigate to="/home" replace />
  return children
}
