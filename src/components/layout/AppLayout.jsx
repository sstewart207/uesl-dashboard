import { useState } from 'react'
import { Box } from '@mui/material'
import { Outlet, Navigate } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import PendingApproval from '../../pages/PendingApproval'
import { useAuth } from '../../features/auth/AuthContext'

export default function AppLayout() {
  const { currentUser, isDemoMode, isApproved } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  if (!currentUser && !isDemoMode) return <Navigate to="/login" replace />

  // Members must be approved by an admin/coach before they can access club content.
  if (!isApproved) return <PendingApproval />

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flex: 1,
          mt: '64px',
          minWidth: 0,
          maxWidth: '100%',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
