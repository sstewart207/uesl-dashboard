import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Box, Stack, Typography, Card, CardContent, Button, Chip,
  Avatar, Divider, Select, MenuItem, Tabs, Tab, IconButton, Tooltip,
} from '@mui/material'
import { VerifiedUser, CheckCircle, Block, HourglassTop, DeleteOutline } from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { LoadingState, EmptyState } from '../components/shared/States'
import { subscribeAllUsers, approveUser, setUserRole, revokeUser, deleteUserDoc } from '../firebase/firestore'
import { useAuth } from '../features/auth/AuthContext'

const ROLE_COLORS = {
  admin: { bg: 'rgba(255,70,85,0.15)', color: '#FF4655' },
  coach: { bg: 'rgba(255,214,10,0.18)', color: '#E6B800' },
  student: { bg: 'rgba(128,128,140,0.2)', color: 'text.secondary' },
  pending: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
}

function UserRow({ u, isPending, onDelete }) {
  const role = ROLE_COLORS[u.role] || ROLE_COLORS.student
  const joined = u.createdAt?.toDate?.()
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: '12px !important' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Avatar src={u.avatarUrl} sx={{ width: 42, height: 42, bgcolor: 'primary.main', color: '#0B0B0F', fontWeight: 700, borderRadius: 1.5 }}>
            {u.displayName?.[0]}
          </Avatar>

          <Box flex={1} minWidth={0}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography fontWeight={600}>{u.displayName}</Typography>
              <Chip label={u.role} size="small" sx={{ height: 18, fontSize: 10, textTransform: 'uppercase', fontWeight: 700, bgcolor: role.bg, color: role.color }} />
            </Stack>
            <Typography variant="caption" color="text.secondary">{u.email}</Typography>
            {joined && (
              <Typography variant="caption" color="text.secondary" display="block">
                joined {formatDistanceToNow(joined, { addSuffix: true })}
              </Typography>
            )}
          </Box>

          {isPending ? (
            <Stack direction="row" spacing={1} flexShrink={0} alignItems="center">
              <Button size="small" variant="outlined" startIcon={<CheckCircle />} onClick={() => approveUser(u.uid, 'student')}>
                As Student
              </Button>
              <Button size="small" variant="contained" startIcon={<CheckCircle />} onClick={() => approveUser(u.uid, 'coach')}>
                As Coach
              </Button>
              <Tooltip title="Delete signup">
                <IconButton size="small" onClick={onDelete} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
              <Select
                size="small"
                value={u.role === 'admin' ? 'admin' : u.role}
                onChange={e => setUserRole(u.uid, e.target.value)}
                disabled={u.role === 'admin'}
                sx={{ minWidth: 110, fontSize: 13 }}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="coach">Coach</MenuItem>
                {u.role === 'admin' && <MenuItem value="admin">Admin</MenuItem>}
              </Select>
              {u.role !== 'admin' && (
                <>
                  <Button size="small" color="error" startIcon={<Block />} onClick={() => revokeUser(u.uid)}>
                    Revoke
                  </Button>
                  <Tooltip title="Delete member">
                    <IconButton size="small" onClick={onDelete} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function AdminApproval() {
  const { canApprove } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)

  useEffect(() => {
    if (!canApprove) return
    const unsub = subscribeAllUsers(data => { setUsers(data); setLoading(false) })
    return unsub
  }, [canApprove])

  // Block non-admins/coaches
  if (!canApprove) return <Navigate to="/" replace />

  const pending = users.filter(u => !u.approved)
  const approved = users.filter(u => u.approved)
  const list = tab === 0 ? pending : approved

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 760, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
        <VerifiedUser sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h4" fontWeight={700}>Approvals</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Approve new club members and manage roles.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab label={`Pending${pending.length ? ` (${pending.length})` : ''}`} />
        <Tab label={`Members${approved.length ? ` (${approved.length})` : ''}`} />
      </Tabs>

      {loading ? (
        <LoadingState label="Loading members…" />
      ) : list.length === 0 ? (
        <EmptyState
          icon={tab === 0 ? <HourglassTop /> : <VerifiedUser />}
          title={tab === 0 ? 'No pending requests' : 'No approved members yet'}
          subtitle={tab === 0 ? 'New sign-ups will appear here for you to approve.' : 'Approve someone from the Pending tab.'}
        />
      ) : (
        <Stack spacing={1.5}>
          {list.map(u => (
            <UserRow
              key={u.uid}
              u={u}
              isPending={tab === 0}
              onDelete={() => {
                if (window.confirm(`Remove ${u.displayName}? They can re-register with the same email.`)) {
                  deleteUserDoc(u.uid)
                }
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}
