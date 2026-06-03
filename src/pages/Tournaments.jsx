import { useState, useEffect } from 'react'
import {
  Box, Grid, Card, CardContent, Stack, Typography, Chip, Button,
  Avatar, LinearProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider, MenuItem,
} from '@mui/material'
import { EmojiEvents, Add, SportsEsports, Group, CheckCircle } from '@mui/icons-material'
import { format } from 'date-fns'
import { LoadingState, EmptyState } from '../components/shared/States'
import { subscribeTournaments, createTournament, joinTournament } from '../firebase/firestore'
import { useAuth } from '../features/auth/AuthContext'

const STATUS_META = {
  active: { label: 'Active', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  upcoming: { label: 'Sign-ups Open', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  completed: { label: 'Completed', color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
}

function TournamentCard({ tournament, onSignUp }) {
  const { userProfile } = useAuth()
  const status = STATUS_META[tournament.status]
  const participants = tournament.participants || []
  const isFull = participants.length >= tournament.maxParticipants
  const alreadyIn = participants.includes(userProfile?.displayName)
  const progress = (participants.length / tournament.maxParticipants) * 100
  const startDate = tournament.startDate?.toDate?.() || new Date(tournament.startDate)

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 1.5,
              bgcolor: 'rgba(255,214,10,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <EmojiEvents sx={{ color: 'primary.main' }} />
          </Box>
          <Chip
            label={status.label}
            size="small"
            sx={{ bgcolor: status.bg, color: status.color, fontWeight: 600, fontSize: 11 }}
          />
        </Stack>

        <Typography variant="h6" fontWeight={700} gutterBottom>{tournament.title}</Typography>

        <Stack spacing={0.5} mb={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SportsEsports sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">{tournament.game}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Group sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">{tournament.bracketType}</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Starts {format(startDate, 'MMM d, yyyy')}
          </Typography>
        </Stack>

        {tournament.prize && (
          <Box sx={{ bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 1.5, px: 1.5, py: 0.75, mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#F59E0B' }}>🏆 {tournament.prize}</Typography>
          </Box>
        )}

        <Box mb={1.5}>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">Participants</Typography>
            <Typography variant="caption" color="text.secondary">
              {participants.length}/{tournament.maxParticipants}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ borderRadius: 4, height: 6, bgcolor: 'rgba(255,255,255,0.08)', '& .MuiLinearProgress-bar': { bgcolor: isFull ? 'error.main' : 'primary.main' } }}
          />
        </Box>

        {participants.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {participants.slice(0, 4).map(p => (
              <Avatar key={p} sx={{ width: 26, height: 26, fontSize: 12, bgcolor: 'rgba(128,128,140,0.25)', color: 'text.primary', fontWeight: 600 }}>{p[0]}</Avatar>
            ))}
            {participants.length > 4 && (
              <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: 'rgba(255,255,255,0.1)' }}>
                +{participants.length - 4}
              </Avatar>
            )}
          </Stack>
        )}
      </CardContent>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      <Box p={2} pt={1.5}>
        {tournament.status === 'completed' ? (
          <Button fullWidth disabled size="small">Tournament Ended</Button>
        ) : alreadyIn ? (
          <Button fullWidth disabled size="small" startIcon={<CheckCircle />} color="success">
            You're registered
          </Button>
        ) : isFull ? (
          <Button fullWidth disabled size="small">Full</Button>
        ) : (
          <Button fullWidth variant="contained" size="small" onClick={() => onSignUp(tournament)}>
            Sign Up
          </Button>
        )}
      </Box>
    </Card>
  )
}

function SignUpDialog({ tournament, open, onClose, onConfirm }) {
  const { userProfile } = useAuth()
  const [gamertag, setGamertag] = useState('')
  if (!tournament) return null
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
      <DialogTitle>Sign Up — {tournament.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Registering as <strong>{userProfile?.displayName}</strong>. Enter your in-game name below.
        </Typography>
        <TextField
          label="Gamertag / In-game name"
          value={gamertag}
          onChange={e => setGamertag(e.target.value)}
          fullWidth autoFocus
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => { onConfirm(tournament, gamertag); onClose() }} disabled={!gamertag.trim()}>
          Confirm Sign Up
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function CreateTournamentDialog({ open, onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', game: '', bracketType: 'Single Elimination', status: 'upcoming', startDate: '', maxParticipants: 8, prize: '' })
  const [loading, setLoading] = useState(false)
  function change(f) { return e => setForm(s => ({ ...s, [f]: e.target.value })) }
  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await onCreate({ ...form, maxParticipants: Number(form.maxParticipants), startDate: new Date(form.startDate) })
      setForm({ title: '', game: '', bracketType: 'Single Elimination', status: 'upcoming', startDate: '', maxParticipants: 8, prize: '' })
      onClose()
    } finally { setLoading(false) }
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
      <DialogTitle>Create Tournament</DialogTitle>
      <Box component="form" onSubmit={submit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField label="Title" value={form.title} onChange={change('title')} required fullWidth />
            <TextField label="Game" value={form.game} onChange={change('game')} required fullWidth />
            <TextField select label="Bracket Type" value={form.bracketType} onChange={change('bracketType')} fullWidth>
              <MenuItem value="Single Elimination">Single Elimination</MenuItem>
              <MenuItem value="Double Elimination">Double Elimination</MenuItem>
              <MenuItem value="Round Robin">Round Robin</MenuItem>
            </TextField>
            <TextField select label="Status" value={form.status} onChange={change('status')} fullWidth>
              <MenuItem value="upcoming">Upcoming (sign-ups open)</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
            <TextField label="Start Date" type="date" value={form.startDate} onChange={change('startDate')} required fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Max Participants" type="number" value={form.maxParticipants} onChange={change('maxParticipants')} fullWidth />
            <TextField label="Prize / Reward" value={form.prize} onChange={change('prize')} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || !form.title.trim()}>Create</Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default function Tournaments() {
  const { userProfile } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [signUpOpen, setSignUpOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const isCoach = userProfile?.role === 'coach' || userProfile?.role === 'admin'

  useEffect(() => {
    const unsub = subscribeTournaments(data => { setTournaments(data); setLoading(false) })
    return unsub
  }, [])

  function handleSignUp(t) { setSelected(t); setSignUpOpen(true) }

  function handleConfirm(tournament) {
    joinTournament(tournament.id, userProfile?.displayName).catch(e => console.error('Tournament sign-up failed:', e))
  }

  const active = tournaments.filter(t => t.status === 'active')
  const upcoming = tournaments.filter(t => t.status === 'upcoming')
  const completed = tournaments.filter(t => t.status === 'completed')

  function Section({ title, items }) {
    if (!items.length) return null
    return (
      <Box mb={4}>
        <Typography variant="subtitle2" color="text.secondary" mb={2} sx={{ letterSpacing: 1, fontSize: 11 }}>
          {title}
        </Typography>
        <Grid container spacing={2}>
          {items.map(t => (
            <Grid item xs={12} sm={6} md={4} key={t.id}>
              <TournamentCard tournament={t} onSignUp={handleSignUp} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <EmojiEvents sx={{ color: '#F59E0B', fontSize: 28 }} />
            <Typography variant="h4" fontWeight={700}>Tournaments</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Compete, climb the bracket, claim the trophy
          </Typography>
        </Box>
        {isCoach && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>Create Tournament</Button>
        )}
      </Stack>

      {loading ? (
        <LoadingState label="Loading tournaments…" />
      ) : tournaments.length === 0 ? (
        <EmptyState
          icon={<EmojiEvents />}
          title="No tournaments yet"
          subtitle={isCoach ? 'Create the first tournament to get the competition going.' : 'Check back soon — tournaments are coming.'}
        />
      ) : (
        <>
          <Section title="ACTIVE" items={active} />
          <Section title="UPCOMING — SIGN-UPS OPEN" items={upcoming} />
          <Section title="COMPLETED" items={completed} />
        </>
      )}

      <SignUpDialog
        tournament={selected}
        open={signUpOpen}
        onClose={() => setSignUpOpen(false)}
        onConfirm={handleConfirm}
      />
      <CreateTournamentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createTournament}
      />
    </Box>
  )
}
