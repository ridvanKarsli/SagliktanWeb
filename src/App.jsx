import { Routes, Route, Outlet } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import DiseaseGroups from './pages/groups/DiseaseGroups.jsx'
import SubGroups from './pages/groups/SubGroups.jsx'
import Posts from './pages/Posts.jsx'
import PostDetail from './pages/PostDetail.jsx'
import Search from './pages/Search.jsx'
import Profile from './pages/profile/Profile.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ResponsiveShell from './components/ResponsiveShell.jsx'
import WelcomeScreen from './components/WelcomeScreen.jsx'

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
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/gizlilik-politikasi" element={<PrivacyPolicy />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/groups" element={<DiseaseGroups />} />
        <Route path="/groups/:groupId" element={<SubGroups />} />
        <Route path="/sub-groups/:subGroupId" element={<Posts />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<WelcomeScreen />} />
    </Routes>
  )
}
