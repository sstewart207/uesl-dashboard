import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Stack, Divider, Link,
} from '@mui/material'
import { useAuth } from './AuthContext'
import { BrandMark } from '../../components/shared/Brand'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function change(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.displayName)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
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
      <Card sx={{ width: '100%', maxWidth: 440, p: 1, borderTop: theme => `3px solid ${theme.palette.primary.main}` }}>
        <CardContent>
          <Stack alignItems="center" spacing={1.5} mb={3}>
            <BrandMark size={52} />
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '0.04em' }}>
              Join UESL
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your club account
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Display Name"
                value={form.displayName}
                onChange={change('displayName')}
                required fullWidth autoFocus
              />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={change('email')}
                required fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={change('password')}
                required fullWidth
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={form.confirm}
                onChange={change('confirm')}
                required fullWidth
              />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                New accounts need approval from a club admin before you can post.
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ my: 2.5 }} />
          <Typography variant="body2" align="center" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" color="primary.main" fontWeight={600}>
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
