import { useState, useEffect } from 'react'
import {
  Box, Grid, Card, CardContent, Stack, Typography, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Badge, Divider,
} from '@mui/material'
import { Add, CalendarMonth, LocationOn, SportsEsports, Code, Palette } from '@mui/icons-material'
import { format } from 'date-fns'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { LoadingState, EmptyState } from '../components/shared/States'
import { subscribeEvents, createEvent, setEventRsvp, subscribeMembers, createNotification } from '../firebase/firestore'
import { useAuth } from '../features/auth/AuthContext'
import { HUB_COLORS } from '../theme/theme'

const RSVP_COLORS = { Going: '#22C55E', Maybe: '#F59E0B', 'Not Going': '#FF4655' }
const HUB_ICONS = { gaming: <SportsEsports fontSize="small" />, coding: <Code fontSize="small" />, design: <Palette fontSize="small" /> }

function EventCard({ event, uid, members = [], isCoach = false, currentUserName }) {
  const color = HUB_COLORS[event.hub] || '#7C3AED'
  const eventDate = event.date?.toDate?.() || new Date(event.date)
  const myRsvp = event.rsvps?.[uid] || null

  // Roster from the rsvps map (ignore cleared/null entries)
  const entries = Object.entries(event.rsvps || {}).filter(([, s]) => s)
  const tally = { Going: 0, Maybe: 0, 'Not Going': 0 }
  entries.forEach(([, s]) => { if (tally[s] != null) tally[s]++ })
  const total = entries.length
  const nameFor = id => members.find(m => m.uid === id)?.displayName || 'Member'

  function handleRsvp(opt) {
    const newStatus = myRsvp === opt ? null : opt
    const hadRsvp = !!event.rsvps?.[uid]
    setEventRsvp(event.id, uid, newStatus)
    // Notify coaches in-app on a student's FIRST rsvp to this event
    // (naturally debounced — toggling Going<->Maybe later doesn't re-notify)
    if (!hadRsvp && newStatus) {
      members
        .filter(m => (m.role === 'coach' || m.role === 'admin') && m.uid !== uid)
        .forEach(c => createNotification(c.uid, {
          type: 'event',
          fromUid: uid,
          fromName: currentUserName || 'A member',
          text: `RSVP'd "${newStatus}" to "${event.title}"`,
        }))
    }
  }

  return (
    <Card
      sx={{
        border: `1px solid ${color}33`,
        '&:hover': { borderColor: `${color}66` },
        transition: 'border-color 0.2s',
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 52, height: 52, borderRadius: 2, flexShrink: 0,
              bgcolor: `${color}18`, border: `1px solid ${color}44`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color, lineHeight: 1, fontWeight: 700 }}>
              {format(eventDate, 'd')}
            </Typography>
            <Typography variant="caption" sx={{ color, fontSize: 10, lineHeight: 1 }}>
              {format(eventDate, 'MMM').toUpperCase()}
            </Typography>
          </Box>
          <Box flex={1} minWidth={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="subtitle1" fontWeight={600} noWrap>{event.title}</Typography>
              <Chip
                icon={HUB_ICONS[event.hub]}
                label={event.hub}
                size="small"
                sx={{ bgcolor: `${color}18`, color, border: `1px solid ${color}33`, '& .MuiChip-icon': { color }, ml: 1, flexShrink: 0 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.25}>
              <LocationOn sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{event.location}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={0.75} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {event.description}
            </Typography>
            <Stack direction="row" spacing={0.75} mt={1.5}>
              {['Going', 'Maybe', 'Not Going'].map(opt => (
                <Chip
                  key={opt}
                  label={opt}
                  size="small"
                  variant={myRsvp === opt ? 'filled' : 'outlined'}
                  onClick={() => handleRsvp(opt)}
                  sx={{
                    fontSize: 11,
                    cursor: 'pointer',
                    ...(myRsvp === opt && {
                      bgcolor: opt === 'Going' ? 'rgba(16,185,129,0.2)' : opt === 'Maybe' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                      color: opt === 'Going' ? 'secondary.main' : opt === 'Maybe' ? 'warning.main' : 'error.main',
                      borderColor: 'transparent',
                    }),
                  }}
                />
              ))}
            </Stack>

            {/* RSVP summary — counts for everyone */}
            {total > 0 && (
              <Stack direction="row" spacing={1.5} mt={1.25} flexWrap="wrap">
                <Typography variant="caption" sx={{ color: RSVP_COLORS.Going, fontWeight: 600 }}>
                  ✅ {tally.Going} Going
                </Typography>
                <Typography variant="caption" sx={{ color: RSVP_COLORS.Maybe, fontWeight: 600 }}>
                  🤔 {tally.Maybe} Maybe
                </Typography>
                <Typography variant="caption" sx={{ color: RSVP_COLORS['Not Going'], fontWeight: 600 }}>
                  ❌ {tally['Not Going']} No
                </Typography>
              </Stack>
            )}

            {/* Coach-only roster — actual names per status */}
            {isCoach && total > 0 && (
              <Box mt={1} sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                {['Going', 'Maybe', 'Not Going'].map(status => {
                  const names = entries.filter(([, s]) => s === status).map(([id]) => nameFor(id))
                  if (!names.length) return null
                  return (
                    <Typography key={status} variant="caption" color="text.secondary" display="block">
                      <Box component="span" sx={{ color: RSVP_COLORS[status], fontWeight: 700 }}>{status}:</Box>{' '}
                      {names.join(', ')}
                    </Typography>
                  )
                })}
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

function AddEventDialog({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', date: '', location: '', hub: 'gaming', description: '' })
  function change(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }
  async function handleSubmit(e) {
    e.preventDefault()
    await onAdd({ ...form, date: new Date(form.date) })
    setForm({ title: '', date: '', location: '', hub: 'gaming', description: '' })
    onClose()
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
      <DialogTitle>Add Event</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField label="Title" value={form.title} onChange={change('title')} required fullWidth />
            <TextField label="Date & Time" type="datetime-local" value={form.date} onChange={change('date')} required fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Location" value={form.location} onChange={change('location')} fullWidth />
            <TextField select label="Hub" value={form.hub} onChange={change('hub')} fullWidth>
              <MenuItem value="gaming">Gaming</MenuItem>
              <MenuItem value="coding">Coding</MenuItem>
              <MenuItem value="design">Design</MenuItem>
            </TextField>
            <TextField label="Description" value={form.description} onChange={change('description')} multiline rows={3} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Add Event</Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default function Events() {
  const { userProfile, currentUser } = useAuth()
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const isCoach = userProfile?.role === 'coach' || userProfile?.role === 'admin'

  useEffect(() => {
    const unsubEvents = subscribeEvents(data => { setEvents(data); setLoading(false) })
    const unsubMembers = subscribeMembers(setMembers)
    return () => { unsubEvents(); unsubMembers() }
  }, [])

  const calendarEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    date: e.date?.toDate?.() || new Date(e.date),
    backgroundColor: HUB_COLORS[e.hub] || '#7C3AED',
    borderColor: 'transparent',
  }))

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Events</Typography>
          <Typography variant="body2" color="text.secondary">Upcoming club activities and matches</Typography>
        </Box>
        {isCoach && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}>
            Add Event
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Typography variant="subtitle2" color="text.secondary" mb={1.5}>UPCOMING</Typography>
          {loading ? (
            <LoadingState label="Loading events…" />
          ) : events.length === 0 ? (
            <EmptyState
              icon={<CalendarMonth />}
              title="No events scheduled"
              subtitle={isCoach ? 'Click "Add Event" to create the first one.' : 'Check back soon for club activities.'}
            />
          ) : (
            <Stack spacing={2}>
              {events.map(ev => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  uid={currentUser?.uid}
                  members={members}
                  isCoach={isCoach}
                  currentUserName={userProfile?.displayName}
                />
              ))}
            </Stack>
          )}
        </Grid>
        <Grid item xs={12} lg={7}>
          <Card sx={{ overflow: 'hidden' }}>
            <CardContent sx={{ p: 0, '& .fc': theme => ({
              '--fc-border-color': theme.palette.divider,
              '--fc-today-bg-color': 'rgba(255,214,10,0.12)',
              '--fc-event-text-color': '#fff',
              '--fc-neutral-bg-color': 'transparent',
              '--fc-page-bg-color': 'transparent',
              color: theme.palette.text.primary,
            }) }}>
              <Box sx={{ p: 1 }}>
                <FullCalendar
                  plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={calendarEvents}
                  headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,listWeek' }}
                  height={420}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AddEventDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={ev => createEvent({ ...ev, createdBy: userProfile?.displayName })}
      />
    </Box>
  )
}
