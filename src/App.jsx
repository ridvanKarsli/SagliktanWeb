import { Routes, Route, Outlet } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Posts from './pages/Posts.jsx'
import AIChat from './pages/AIChat.jsx'
import Search from './pages/Search.jsx'
import Profile from './pages/profile/Profile.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ResponsiveShell from './components/ResponsiveShell.jsx'

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <ResponsiveShell>
        <Outlet />
      </ResponsiveShell>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/posts" element={<Posts />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  )
}
