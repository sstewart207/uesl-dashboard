import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Avatar, Chip, Badge, Drawer,
} from '@mui/material'
import {
  Home, SportsEsports, Code, Palette, CalendarMonth,
  EmojiEvents, Campaign, People, VerifiedUser,
} from '@mui/icons-material'
import { useAuth } from '../../features/auth/AuthContext'
import { subscribeAllUsers } from '../../firebase/firestore'
import { BrandWordmark } from '../shared/Brand'
import { HUB_COLORS as HUB } from '../../theme/theme'

const navItems = [
  { label: 'Home', icon: <Home />, path: '/' },
  { label: 'Gaming Hub', icon: <SportsEsports />, path: '/gaming' },
  { label: 'Coding Hub', icon: <Code />, path: '/coding' },
  { label: 'Design Hub', icon: <Palette />, path: '/design' },
  null,
  { label: 'Events', icon: <CalendarMonth />, path: '/events' },
  { label: 'Tournaments', icon: <EmojiEvents />, path: '/tournaments' },
  { label: 'Bulletin Board', icon: <Campaign />, path: '/bulletins' },
  null,
  { label: 'Members', icon: <People />, path: '/members' },
]

const HUB_COLORS = {
  '/gaming': HUB.gaming,
  '/coding': HUB.coding,
  '/design': HUB.design,
}

const DRAWER_WIDTH = 240

export default function Sidebar({ mobileOpen = false, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { userProfile, canApprove } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!canApprove) return
    const unsub = subscribeAllUsers(users => {
      setPendingCount(users.filter(u => !u.approved).length)
    })
    return unsub
  }, [canApprove])

  // navigate + close the mobile drawer on tap
  const go = path => { navigate(path); onClose?.() }

  // The nav content, shared by the desktop sidebar and the mobile drawer
  const content = (
    <>
      <Box px={2.5} py={2}>
        <BrandWordmark size="md" />
      </Box>
      <Divider sx={{ mb: 1 }} />

      <List dense sx={{ flex: 1, px: 0.5 }}>
        {navItems.map((item, i) =>
          item === null ? (
            <Divider key={i} sx={{ my: 1 }} />
          ) : (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => go(item.path)}
              sx={{ '&.Mui-selected .MuiListItemIcon-root': { color: HUB_COLORS[item.path] || 'primary.light' } }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: location.pathname === item.path ? (HUB_COLORS[item.path] || 'primary.light') : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: location.pathname === item.path ? 600 : 400 }}
              />
              {item.path === '/gaming' && (
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: HUB.gaming }} />
              )}
            </ListItemButton>
          )
        )}

        {canApprove && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItemButton selected={location.pathname === '/admin'} onClick={() => go('/admin')}>
              <ListItemIcon sx={{ minWidth: 36, color: location.pathname === '/admin' ? 'primary.main' : 'text.secondary' }}>
                <VerifiedUser />
              </ListItemIcon>
              <ListItemText primary="Approvals" primaryTypographyProps={{ fontSize: 14, fontWeight: location.pathname === '/admin' ? 600 : 400 }} />
              {pendingCount > 0 && (
                <Badge badgeContent={pendingCount} color="primary" sx={{ mr: 1.5, '& .MuiBadge-badge': { color: '#0B0B0F', fontWeight: 700 } }} />
              )}
            </ListItemButton>
          </>
        )}
      </List>

      <Divider />

      {userProfile && (
        <ListItemButton onClick={() => go(`/profile/${userProfile.uid}`)} sx={{ m: 1, borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Avatar
              src={userProfile.avatarUrl}
              sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: '#0B0B0F', fontSize: 14, fontWeight: 700, borderRadius: 1.5 }}
            >
              {userProfile.displayName?.[0]}
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={userProfile.displayName}
            secondary={
              <Chip
                label={userProfile.role}
                size="small"
                sx={{ fontSize: 10, height: 16, mt: 0.25, textTransform: 'uppercase', fontWeight: 700, bgcolor: 'rgba(255,214,10,0.15)', color: 'primary.main' }}
              />
            }
            primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
          />
        </ListItemButton>
      )}
    </>
  )

  return (
    <>
      {/* Desktop — permanent sidebar (md and up) */}
      <Box
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          pt: '64px',
          overflowY: 'auto',
        }}
      >
        {content}
      </Box>

      {/* Mobile — temporary slide-out drawer (below md) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', pt: 1, display: 'flex', flexDirection: 'column' },
        }}
      >
        {content}
      </Drawer>
    </>
  )
}
