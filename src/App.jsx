import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ColorModeProvider } from './theme/ColorModeContext'
import { AuthProvider } from './features/auth/AuthContext'
import AppLayout from './components/layout/AppLayout'
import { CircularProgress, Box } from '@mui/material'

// Static imports — lightweight pages on the critical path
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import Members from './pages/Members'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Bulletins from './pages/Bulletins'

// Lazy imports — heavy pages that shouldn't bloat the initial bundle.
// We also kick off the fetch immediately so chunks download in parallel
// with Firebase auth resolving, avoiding a blank→spinner→content waterfall.
const hubPagePromise = import('./pages/HubPage')              // ReactQuill
const eventsPromise = import('./pages/Events')                // FullCalendar
const tournamentsPromise = import('./pages/Tournaments')
const adminPromise = import('./pages/AdminApproval')

const HubPage = lazy(() => hubPagePromise)
const Events = lazy(() => eventsPromise)
const Tournaments = lazy(() => tournamentsPromise)
const AdminApproval = lazy(() => adminPromise)

const Spinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress />
  </Box>
)

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
              <Route path="gaming" element={<Suspense fallback={<Spinner />}><HubPage hub="gaming" /></Suspense>} />
              <Route path="coding" element={<Suspense fallback={<Spinner />}><HubPage hub="coding" /></Suspense>} />
              <Route path="design" element={<Suspense fallback={<Spinner />}><HubPage hub="design" /></Suspense>} />
              <Route path="post/:id" element={<PostDetail />} />
              <Route path="events" element={<Suspense fallback={<Spinner />}><Events /></Suspense>} />
              <Route path="tournaments" element={<Suspense fallback={<Spinner />}><Tournaments /></Suspense>} />
              <Route path="bulletins" element={<Bulletins />} />
              <Route path="members" element={<Members />} />
              <Route path="profile/:uid" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="admin" element={<Suspense fallback={<Spinner />}><AdminApproval /></Suspense>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ColorModeProvider>
  )
}
