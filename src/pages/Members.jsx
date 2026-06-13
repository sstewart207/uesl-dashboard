import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Card, CardContent, Stack, Typography, Avatar,
  TextField, Chip, InputAdornment, ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import { Search, SportsEsports, Code, Palette, People } from '@mui/icons-material'
import { LoadingState, EmptyState } from '../components/shared/States'
import { subscribeMembers } from '../firebase/firestore'
import { subscribeOnline } from '../firebase/presence'

const ROLE_COLORS = {
  coach: { bg: 'rgba(255,214,10,0.18)', color: '#E6B800' },
  admin: { bg: 'rgba(255,70,85,0.15)', color: '#FF4655' },
  student: { bg: 'rgba(128,128,140,0.2)', color: 'text.secondary' },
}

const AVATAR_BG = ['#FFD60A', '#FF4655', '#22D3EE', '#F472B6', '#22C55E', '#F59E0B']

function MemberCard({ member, index, isOnline }) {
  const navigate = useNavigate()
  const role = ROLE_COLORS[member.role] || ROLE_COLORS.student
  return (
    <Card
      onClick={() => navigate(`/profile/${member.uid}`)}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.15s, border-color 0.2s',
        '&:hover': { transform: 'translateY(-3px)', borderColor: 'rgba(124,58,237,0.4)' },
      }}
    >
      <CardContent>
        <Stack alignItems="center" spacing={1.5}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={member.avatarUrl}
              sx={{
                width: 64, height: 64, fontSize: 24, fontWeight: 700, color: '#0B0B0F',
                bgcolor: AVATAR_BG[index % AVATAR_BG.length], borderRadius: 2,
              }}
            >
              {member.displayName[0]}
            </Avatar>
            {/* Online dot */}
            <Box
              sx={{
                position: 'absolute', bottom: 2, right: 2,
                width: 12, height: 12, borderRadius: '50%',
                bgcolor: isOnline ? '#22C55E' : 'transparent',
                border: theme => isOnline ? `2px solid ${theme.palette.background.paper}` : 'none',
              }}
            />
          </Box>

          <Box textAlign="center">
            <Typography variant="subtitle2" fontWeight={700}>{member.displayName}</Typography>
            <Chip
              label={member.role}
              size="small"
              sx={{ mt: 0.5, height: 18, fontSize: 10, bgcolor: role.bg, color: role.color }}
            />
          </Box>

          {member.games?.length > 0 && (
            <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={0.5}>
              {member.games.slice(0, 2).map(g => (
                <Chip key={g} label={g} size="small" icon={<SportsEsports style={{ fontSize: 11 }} />}
                  sx={{ fontSize: 10, height: 20, bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444', '& .MuiChip-icon': { color: '#EF4444' } }} />
              ))}
            </Stack>
          )}

          {member.skills?.length > 0 && (
            <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={0.5}>
              {member.skills.slice(0, 3).map(s => (
                <Chip key={s} label={s} size="small" sx={{ fontSize: 10, height: 20, bgcolor: 'rgba(255,255,255,0.05)' }} />
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function Members() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [onlineUids, setOnlineUids] = useState([])

  useEffect(() => {
    const unsub = subscribeMembers(data => { setMembers(data); setLoading(false) })
    const unsubPresence = subscribeOnline(setOnlineUids)
    return () => { unsub(); unsubPresence() }
  }, [])

  const filtered = members.filter(m => {
    const matchSearch = m.displayName.toLowerCase().includes(search.toLowerCase()) ||
      m.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      m.games?.some(g => g.toLowerCase().includes(search.toLowerCase()))
    const matchRole = roleFilter === 'all' || m.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Member Directory</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {members.length} member{members.length !== 1 ? 's' : ''} in the club
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems={{ sm: 'center' }}>
        <TextField
          placeholder="Search by name, skill, or game…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
          }}
        />
        <ToggleButtonGroup
          value={roleFilter}
          exclusive
          onChange={(_, v) => v && setRoleFilter(v)}
          size="small"
          sx={{ '& .MuiToggleButton-root': { px: 2, fontSize: 13, borderRadius: '8px !important', border: '1px solid rgba(255,255,255,0.1) !important', mr: 0.5 } }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="student">Students</ToggleButton>
          <ToggleButton value="coach">Coaches</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {loading ? (
        <LoadingState label="Loading members…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<People />}
          title={members.length === 0 ? 'No members yet' : 'No members match your search'}
          subtitle={members.length === 0 ? 'Members appear here as people register.' : 'Try a different search or filter.'}
        />
      ) : (
        <Grid container spacing={2}>
          {filtered.map((m, i) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={m.uid}>
              <MemberCard member={m} index={i} isOnline={onlineUids.includes(m.uid)} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
