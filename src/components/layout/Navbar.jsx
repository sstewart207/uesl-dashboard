import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, IconButton, Badge, Avatar, Menu,
  MenuItem, Typography, Box, Divider, Stack, Tooltip,
} from '@mui/material'
import {
  Notifications, Logout, Person, Settings,
  LightMode, DarkMode,
} from '@mui/icons-material'
import { useAuth } from '../../features/auth/AuthContext'
import { subscribeNotifications } from '../../firebase/firestore'
import { Chip } from '@mui/material'
import { useColorMode } from '../../theme/ColorModeContext'
import { BrandWordmark } from '../shared/Brand'

export default function Navbar() {
  const { currentUser, userProfile, logout, isDemoMode } = useAuth()
  const { mode, toggle } = useColorMode()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!currentUser || isDemoMode) return
    const unsub = subscribeNotifications(currentUser.uid, notifs => {
      setUnreadCount(notifs.filter(n => !n.read).length)
    })
    return unsub
  }, [currentUser, isDemoMode])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ gap: 1 }}>
        {/* Mobile brand */}
        <Box sx={{ display: { md: 'none' }, mr: 'auto' }}>
          <BrandWordmark size="sm" showSub={false} />
        </Box>

        <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
        {isDemoMode && (
          <Chip
            label="Demo Mode — add Firebase credentials to go live"
            size="small"
            sx={{ fontSize: 11, bgcolor: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', display: { xs: 'none', sm: 'flex' } }}
          />
        )}

        {/* Theme toggle */}
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={toggle} color="inherit">
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton onClick={() => navigate('/notifications')} color="inherit">
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Avatar menu */}
        <Tooltip title="Account">
          <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar
              src={userProfile?.avatarUrl}
              sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: '#0B0B0F', fontSize: 15, fontWeight: 700, borderRadius: 1.5 }}
            >
              {userProfile?.displayName?.[0]}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
        >
          <Box px={2} py={1.5}>
            <Typography variant="subtitle2" fontWeight={600}>{userProfile?.displayName}</Typography>
            <Typography variant="caption" color="text.secondary">{userProfile?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { navigate(`/profile/${userProfile?.uid}`); setAnchorEl(null) }}>
            <Person fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            My Profile
          </MenuItem>
          <MenuItem onClick={() => { navigate('/settings'); setAnchorEl(null) }}>
            <Settings fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <Logout fontSize="small" sx={{ mr: 1.5 }} />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
