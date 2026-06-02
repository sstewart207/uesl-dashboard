import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, Button, Stack, Divider, CircularProgress,
} from '@mui/material'
import { HourglassTop, Logout, Refresh } from '@mui/icons-material'
import { useAuth } from '../features/auth/AuthContext'
import { BrandMark } from '../components/shared/Brand'

export default function PendingApproval() {
  const { currentUser, userProfile, logout, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)

  async function handleRefresh() {
    setChecking(true)
    await fetchProfile(currentUser.uid)
    setChecking(false)
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 440, borderTop: theme => `3px solid ${theme.palette.primary.main}` }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={2}>
            <BrandMark size={48} />

            <Box
              sx={{
                width: 64, height: 64, borderRadius: '50%',
                bgcolor: 'rgba(255,214,10,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <HourglassTop sx={{ fontSize: 32, color: 'primary.main' }} />
            </Box>

            <Typography variant="h5" fontWeight={700} textAlign="center">
              Account Pending Approval
            </Typography>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Thanks for signing up, <strong>{userProfile?.displayName || 'member'}</strong>! Your
              account is waiting for a club admin to approve it. Once you're approved you'll get full
              access to the feed, hubs, events, and tournaments.
            </Typography>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              Signed in as {currentUser?.email}
            </Typography>

            <Divider flexItem sx={{ my: 1 }} />

            <Stack direction="row" spacing={1.5} width="100%">
              <Button
                variant="contained"
                fullWidth
                startIcon={checking ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
                onClick={handleRefresh}
                disabled={checking}
              >
                Check again
              </Button>
              <Button variant="outlined" fullWidth startIcon={<Logout />} onClick={handleLogout}>
                Sign out
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ opacity: 0.7 }}>
              Already approved? Hit "Check again" to refresh your status.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
