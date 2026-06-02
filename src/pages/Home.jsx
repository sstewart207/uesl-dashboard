import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Stack, Typography, Card, CardContent, Button, Avatar,
  AvatarGroup, Tooltip, Chip, Divider,
} from '@mui/material'
import {
  AddCircleOutline, CheckCircle, SportsEsports, Code, Palette,
  CalendarMonth, Campaign, ChatBubbleOutline, ThumbUp, ArrowForward,
} from '@mui/icons-material'
import { format, formatDistanceToNow } from 'date-fns'
import { LoadingState } from '../components/shared/States'
import {
  subscribePosts, subscribeEvents, subscribeMembers, subscribeBulletins,
} from '../firebase/firestore'
import { useAuth } from '../features/auth/AuthContext'
import { HUB_COLORS } from '../theme/theme'
import { cleanHtml } from '../utils/sanitize'

const HUB_META = {
  gaming: { label: 'Gaming', icon: <SportsEsports sx={{ fontSize: 16 }} />, path: '/gaming' },
  coding: { label: 'Coding', icon: <Code sx={{ fontSize: 16 }} />, path: '/coding' },
  design: { label: 'Design', icon: <Palette sx={{ fontSize: 16 }} />, path: '/design' },
}

function SectionLabel({ children, action }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.25}>
      <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: 2 }}>
        {children}
      </Typography>
      {action}
    </Stack>
  )
}

/* ---------- Today at Club ---------- */
function TodayWidget({ members }) {
  const [checkedIn, setCheckedIn] = useState(false)
  const today = format(new Date(), 'EEEE, MMMM d')
  const here = members.slice(0, checkedIn ? 4 : 3)

  return (
    <Card sx={{ borderLeft: theme => `3px solid ${theme.palette.primary.main}` }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 2, fontSize: 10 }}>
              TODAY AT CLUB
            </Typography>
            <Typography variant="h5" fontWeight={700}>{today}</Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={0.75}>
              {here.length > 0 && (
                <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: 11, border: 'none' } }}>
                  {here.map(m => (
                    <Tooltip key={m.uid} title={m.displayName}>
                      <Avatar src={m.avatarUrl} sx={{ bgcolor: 'primary.main', color: '#0B0B0F', fontWeight: 700 }}>
                        {m.displayName?.[0]}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
              )}
              <Typography variant="caption" color="text.secondary">
                {here.length > 0 ? `${here.length} checked in` : 'Be the first to check in'}
              </Typography>
            </Stack>
          </Box>
          <Button
            variant={checkedIn ? 'outlined' : 'contained'}
            startIcon={checkedIn ? <CheckCircle /> : <AddCircleOutline />}
            onClick={() => setCheckedIn(c => !c)}
            color={checkedIn ? 'success' : 'primary'}
          >
            {checkedIn ? 'Checked in!' : 'Check in'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

/* ---------- Stat tiles ---------- */
function StatTile({ value, label, color }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ py: '14px !important', textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  )
}

/* ---------- Recent activity across hubs ---------- */
function RecentActivity({ posts }) {
  const navigate = useNavigate()
  const recent = posts.slice(0, 6)

  return (
    <Card>
      <CardContent>
        <SectionLabel>LATEST</SectionLabel>

        {/* Hub quick-links */}
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={1}>
          {Object.entries(HUB_META).map(([key, h]) => (
            <Chip
              key={key}
              icon={h.icon}
              label={h.label}
              onClick={() => navigate(h.path)}
              sx={{
                cursor: 'pointer', fontWeight: 600,
                bgcolor: `${HUB_COLORS[key]}1A`,
                color: HUB_COLORS[key],
                '& .MuiChip-icon': { color: HUB_COLORS[key] },
                '&:hover': { bgcolor: `${HUB_COLORS[key]}33` },
              }}
            />
          ))}
        </Stack>

        {recent.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center', opacity: 0.7 }}>
            No posts yet. Jump into a hub above and start the conversation!
          </Typography>
        ) : (
          <Stack divider={<Divider sx={{ borderColor: 'divider' }} />}>
            {recent.map(p => {
              const color = HUB_COLORS[p.hub] || '#FFD60A'
              const ts = p.createdAt?.toDate?.() || new Date(p.createdAt || Date.now())
              return (
                <Box
                  key={p.id}
                  onClick={() => navigate(`/post/${p.id}`)}
                  sx={{
                    py: 1.25, px: 0.5, cursor: 'pointer', borderRadius: 1,
                    display: 'flex', gap: 1.5, alignItems: 'center',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{ width: 3, alignSelf: 'stretch', borderRadius: 2, bgcolor: color, flexShrink: 0 }} />
                  <Avatar src={p.authorAvatar} sx={{ width: 30, height: 30, fontSize: 13, bgcolor: 'rgba(128,128,140,0.25)', color: 'text.primary', fontWeight: 600 }}>
                    {p.authorName?.[0]}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={600} noWrap>{p.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.authorName} · {formatDistanceToNow(ts, { addSuffix: true })}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <ThumbUp sx={{ fontSize: 13 }} /><Typography variant="caption">{p.likeCount || 0}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <ChatBubbleOutline sx={{ fontSize: 13 }} /><Typography variant="caption">{p.commentCount || 0}</Typography>
                    </Stack>
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- Upcoming events ---------- */
function UpcomingEvents({ events }) {
  const navigate = useNavigate()
  const upcoming = events
    .filter(e => (e.date?.toDate?.() || new Date(e.date)) >= new Date(Date.now() - 864e5))
    .slice(0, 4)

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <SectionLabel action={<Button size="small" sx={{ fontSize: 11 }} onClick={() => navigate('/events')}>See all</Button>}>
          UPCOMING EVENTS
        </SectionLabel>
        {upcoming.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7, py: 1 }}>No upcoming events.</Typography>
        ) : (
          <Stack spacing={1}>
            {upcoming.map(ev => {
              const d = ev.date?.toDate?.() || new Date(ev.date)
              const color = HUB_COLORS[ev.hub] || '#FFD60A'
              return (
                <Box
                  key={ev.id}
                  onClick={() => navigate('/events')}
                  sx={{
                    display: 'flex', gap: 1.5, alignItems: 'center', p: 1, borderRadius: 1,
                    border: '1px solid', borderColor: 'divider', cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Box sx={{ width: 40, height: 40, borderRadius: 1, flexShrink: 0, bgcolor: `${color}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ color, lineHeight: 1, fontWeight: 700, fontSize: 15 }}>{format(d, 'd')}</Typography>
                    <Typography variant="caption" sx={{ color, fontSize: 9, lineHeight: 1 }}>{format(d, 'MMM').toUpperCase()}</Typography>
                  </Box>
                  <Box minWidth={0}>
                    <Typography variant="body2" fontWeight={500} noWrap>{ev.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{ev.location}</Typography>
                  </Box>
                </Box>
              )
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- Pinned / latest bulletin ---------- */
function BoardHighlight({ bulletins }) {
  const navigate = useNavigate()
  const sorted = [...bulletins].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
  const top = sorted[0]

  return (
    <Card>
      <CardContent sx={{ pb: '12px !important' }}>
        <SectionLabel action={<Button size="small" sx={{ fontSize: 11 }} onClick={() => navigate('/bulletins')}>Board</Button>}>
          ANNOUNCEMENTS
        </SectionLabel>
        {!top ? (
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7, py: 1 }}>No announcements yet.</Typography>
        ) : (
          <Box
            onClick={() => navigate('/bulletins')}
            sx={{ cursor: 'pointer', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: 'secondary.main' } }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Campaign sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={700} noWrap>{top.title}</Typography>
            </Stack>
            <Typography
              variant="caption" color="text.secondary"
              sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: cleanHtml(top.body) }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const { userProfile } = useAuth()
  const [posts, setPosts] = useState([])
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])
  const [bulletins, setBulletins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubPosts = subscribePosts(null, data => { setPosts(data); setLoading(false) })
    const unsubEvents = subscribeEvents(setEvents)
    const unsubMembers = subscribeMembers(setMembers)
    const unsubBulletins = subscribeBulletins(setBulletins)
    return () => { unsubPosts(); unsubEvents(); unsubMembers(); unsubBulletins() }
  }, [])

  const upcomingCount = events.filter(e => (e.date?.toDate?.() || new Date(e.date)) >= new Date()).length

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      {/* Greeting */}
      <Box mb={2.5}>
        <Typography variant="h4" fontWeight={700}>
          Welcome back{userProfile?.displayName ? `, ${userProfile.displayName.split(' ')[0]}` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">Here's what's happening in the club.</Typography>
      </Box>

      <Stack spacing={2.5}>
        <TodayWidget members={members} />

        {/* Stats */}
        <Grid container spacing={2}>
          <Grid item xs={4}><StatTile value={posts.length} label="Posts" color={HUB_COLORS.coding} /></Grid>
          <Grid item xs={4}><StatTile value={upcomingCount} label="Upcoming events" color={HUB_COLORS.gaming} /></Grid>
          <Grid item xs={4}><StatTile value={bulletins.length} label="Announcements" color={HUB_COLORS.design} /></Grid>
        </Grid>

        {loading ? (
          <LoadingState label="Loading the club…" />
        ) : (
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={7}>
              <RecentActivity posts={posts} />
            </Grid>
            <Grid item xs={12} md={5}>
              <UpcomingEvents events={events} />
              <BoardHighlight bulletins={bulletins} />
            </Grid>
          </Grid>
        )}
      </Stack>
    </Box>
  )
}
