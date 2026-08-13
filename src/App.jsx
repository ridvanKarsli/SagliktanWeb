import { Suspense, lazy } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import Login from './pages/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import ResponsiveShell from './components/ResponsiveShell.jsx'
import WelcomeScreen from './components/WelcomeScreen.jsx'

// Kontrol listesi "CSS/JS minify, kritik CSS inline" + rapor yol haritası
// "Route bazlı code splitting" maddesi: önceden tüm sayfalar tek bir 841KB
// JS paketinde baştan yükleniyordu. WelcomeScreen ve Login - HER oturumun
// girdiği ilk iki nokta (PublicOnlyRoute "/" yönlendirmesinden önce) -
// bilinçli olarak eager (statik import) bırakıldı ki ilk açılışta ekstra
// bir ağ round-trip'i + Suspense yanıp sönmesi olmasın. Girişten SONRA
// görülen her şey (feed, gruplar, mesajlaşma, admin...) lazy - kullanıcı bu
// sayfalara gelene kadar indirilmiyor, ilk yüklemeyi (LCP) doğrudan küçültür.
const Register = lazy(() => import('./pages/Register.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const DiseaseGroups = lazy(() => import('./pages/groups/DiseaseGroups.jsx'))
const SubGroups = lazy(() => import('./pages/groups/SubGroups.jsx'))
const Posts = lazy(() => import('./pages/Posts.jsx'))
const PostDetail = lazy(() => import('./pages/PostDetail.jsx'))
const Search = lazy(() => import('./pages/Search.jsx'))
const Profile = lazy(() => import('./pages/profile/Profile.jsx'))
const UserProfile = lazy(() => import('./pages/profile/UserProfile.jsx'))
const Conversations = lazy(() => import('./pages/messages/Conversations.jsx'))
const Chat = lazy(() => import('./pages/messages/Chat.jsx'))
const MessageRequests = lazy(() => import('./pages/messages/MessageRequests.jsx'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel.jsx'))

// Sayfa geçişlerinde kısa bir an görünebilecek yükleme göstergesi -
// uygulama genelinde zaten kullanılan "ortada küçük CircularProgress"
// deseniyle tutarlı (bkz. skeleton/loading kullanımları).
function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={28} />
    </Box>
  )
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <ResponsiveShell>
        <Outlet />
      </ResponsiveShell>
    </ProtectedRoute>
  )
}

// Backend'in gerçek kapsamı: hastalık grubu -> alt grup -> post -> yorum.
// Eski düz "/posts" akışı yerine bu hiyerarşiyi izliyoruz.
export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* "/" ve auth sayfaları: oturumu zaten açık bir kullanıcı buraya
            gelirse (örn. sekmeyi kapatıp siteyi tekrar açtığında) doğrudan
            /home'a yönlendirilir - PublicOnlyRoute bunu sağlıyor. Aksi
            halde geçerli bir oturum olsa bile her seferinde karşılama/giriş
            sayfası görünüp kullanıcı yeniden giriş yapması gerektiğini sanır. */}
        <Route path="/" element={<PublicOnlyRoute><WelcomeScreen /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/gizlilik-politikasi" element={<PrivacyPolicy />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/groups" element={<DiseaseGroups />} />
          <Route path="/groups/:groupId" element={<SubGroups />} />
          <Route path="/sub-groups/:subGroupId" element={<Posts />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/:userId" element={<UserProfile />} />
          <Route path="/messages" element={<Conversations />} />
          <Route path="/messages/requests" element={<MessageRequests />} />
          <Route path="/messages/:conversationId" element={<Chat />} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Route>
        <Route path="*" element={<WelcomeScreen />} />
      </Routes>
    </Suspense>
  )
}
