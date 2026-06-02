import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Stack, Divider, Link,
} from '@mui/material'
import { useAuth } from './AuthContext'
import { BrandMark } from '../../components/shared/Brand'

export default function Login() {
  const { login, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    setError('')
    setInfo('')
    if (!email.trim()) {
      setError('Enter your email above first, then click "Forgot password?"')
      return
    }
    try {
      await resetPassword(email)
      setInfo(`Password reset email sent to ${email}. Check your inbox.`)
    } catch {
      setError('Could not send reset email. Is that address registered?')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundImage: theme => theme.palette.mode === 'dark'
          ? 'radial-gradient(circle at 50% 0%, rgba(255,214,10,0.08) 0%, transparent 55%)'
          : 'radial-gradient(circle at 50% 0%, rgba(255,214,10,0.18) 0%, transparent 55%)',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400, p: 1, borderTop: theme => `3px solid ${theme.palette.primary.main}` }}>
        <CardContent>
          <Stack alignItems="center" spacing={1.5} mb={3}>
            <BrandMark size={52} />
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '0.04em' }}>
              UESL
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              United Esports League — sign in to your club
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {info && <Alert severity="success" sx={{ mb: 2 }}>{info}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required fullWidth autoFocus
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={handleReset}
                color="text.secondary"
                sx={{ alignSelf: 'center', textDecoration: 'none', '&:hover': { color: 'primary.light' } }}
              >
                Forgot password?
              </Link>
            </Stack>
          </Box>

          <Divider sx={{ my: 2.5 }} />
          <Typography variant="body2" align="center" color="text.secondary">
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/register" color="primary.main" fontWeight={600}>
              Register here
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
