import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ColorModeProvider } from './theme/ColorModeContext'
import { AuthProvider } from './features/auth/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import Home from './pages/Home'
import HubPage from './pages/HubPage'
import PostDetail from './pages/PostDetail'
import Events from './pages/Events'
import Tournaments from './pages/Tournaments'
import Bulletins from './pages/Bulletins'
import Members from './pages/Members'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import AdminApproval from './pages/AdminApproval'

export default function App() {
  return (
    <ColorModeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="gaming" element={<HubPage hub="gaming" />} />
              <Route path="coding" element={<HubPage hub="coding" />} />
              <Route path="design" element={<HubPage hub="design" />} />
              <Route path="post/:id" element={<PostDetail />} />
              <Route path="events" element={<Events />} />
              <Route path="tournaments" element={<Tournaments />} />
              <Route path="bulletins" element={<Bulletins />} />
              <Route path="members" element={<Members />} />
              <Route path="profile/:uid" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="admin" element={<AdminApproval />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ColorModeProvider>
  )
}
