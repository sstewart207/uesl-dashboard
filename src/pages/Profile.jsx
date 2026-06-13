import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Stack, Typography, Avatar, Chip, Button, Card, CardContent,
  Divider, Tab, Tabs, Grid,
} from '@mui/material'
import { Edit, SportsEsports } from '@mui/icons-material'
import PostCard from '../components/shared/PostCard'
import { LoadingState } from '../components/shared/States'
import EditProfileDialog, { SOCIALS } from '../components/shared/EditProfileDialog'
import { getUser, getPostsByAuthor, deletePost } from '../firebase/firestore'
import { useAuth } from '../features/auth/AuthContext'

// Normalize a handle/url into a clickable link
function toUrl(v) {
  if (!v) return null
  return v.startsWith('http') ? v : `https://${v.replace(/^@/, '')}`
}

const ROLE_COLORS = {
  coach: { bg: 'rgba(255,214,10,0.18)', color: '#E6B800' },
  admin: { bg: 'rgba(255,70,85,0.15)', color: '#FF4655' },
  student: { bg: 'rgba(128,128,140,0.2)', color: 'text.secondary' },
}

const AVATAR_BG = ['#FFD60A', '#FF4655', '#22D3EE', '#F472B6', '#22C55E']

export default function Profile() {
  const { uid } = useParams()
  const { userProfile, currentUser, canApprove } = useAuth()
  const [tab, setTab] = useState(0)
  const [member, setMember] = useState(null)
  const [memberPosts, setMemberPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  function load() {
    return Promise.all([getUser(uid), getPostsByAuthor(uid)]).then(([u, posts]) => {
      setMember(u)
      setMemberPosts(posts)
      setLoading(false)
    })
  }

  useEffect(() => {
    setLoading(true)
    load()
  }, [uid])

  async function handleSaved() {
    await load()
    if (uid === userProfile?.uid) await fetchProfile(uid) // refresh navbar/sidebar avatar
  }

  if (loading) return <LoadingState label="Loading profile…" />

  const resolved = member || {
    uid,
    displayName: userProfile?.uid === uid ? userProfile.displayName : 'Unknown Member',
    role: 'student',
    games: [],
    skills: [],
    avatarUrl: '',
    bio: '',
  }

  const isOwnProfile = uid === userProfile?.uid
  const role = ROLE_COLORS[resolved.role] || ROLE_COLORS.student
  const avatarBg = AVATAR_BG[(resolved.displayName?.charCodeAt(0) || 0) % AVATAR_BG.length]

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 860, mx: 'auto' }}>
      {/* Profile header card */}
      <Card sx={{ mb: 3, borderTop: theme => `3px solid ${theme.palette.primary.main}` }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={resolved.avatarUrl}
                sx={{ width: 96, height: 96, fontSize: 36, fontWeight: 700, color: '#0B0B0F', bgcolor: avatarBg, borderRadius: 2 }}
              >
                {resolved.displayName?.[0]}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute', bottom: 4, right: 4,
                  width: 16, height: 16, borderRadius: '50%',
                  bgcolor: '#22C55E', border: theme => `3px solid ${theme.palette.background.paper}`,
                }}
              />
            </Box>

            <Box flex={1} textAlign={{ xs: 'center', sm: 'left' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'center', sm: 'flex-start' }} spacing={1} mb={0.5}>
                <Typography variant="h5" fontWeight={700}>{resolved.displayName}</Typography>
                <Chip label={resolved.role} size="small" sx={{ bgcolor: role.bg, color: role.color, fontWeight: 600 }} />
              </Stack>

              <Typography variant="body2" color="text.secondary" mb={1.5}>
                {resolved.bio || 'UESL member'}
              </Typography>

              {/* Games */}
              {resolved.games?.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  {resolved.games.map(g => (
                    <Chip key={g} icon={<SportsEsports style={{ fontSize: 13 }} />} label={g} size="small"
                      sx={{ fontSize: 11, bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444', '& .MuiChip-icon': { color: '#EF4444' } }} />
                  ))}
                </Stack>
              )}

              {/* Skills */}
              {resolved.skills?.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={0.5} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  {resolved.skills.map(s => (
                    <Chip key={s} label={s} size="small" sx={{ fontSize: 11, bgcolor: 'rgba(255,255,255,0.06)' }} />
                  ))}
                </Stack>
              )}

              {/* Social links */}
              {SOCIALS.some(s => resolved[s.key]) && (
                <Stack direction="row" flexWrap="wrap" gap={1} mt={1.5} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  {SOCIALS.filter(s => resolved[s.key]).map(s => (
                    <Chip
                      key={s.key}
                      icon={<Box sx={{ display: 'flex', '& svg': { fontSize: 16 } }}>{s.icon}</Box>}
                      label={s.label}
                      size="small"
                      component="a"
                      href={toUrl(resolved[s.key])}
                      target="_blank"
                      rel="noopener noreferrer"
                      clickable
                      sx={{ fontSize: 11, bgcolor: `${s.color}22`, color: s.color, '& .MuiChip-icon': { color: s.color } }}
                    />
                  ))}
                </Stack>
              )}
            </Box>

            {isOwnProfile && (
              <Button variant="outlined" size="small" startIcon={<Edit />} sx={{ flexShrink: 0 }} onClick={() => setEditOpen(true)}>
                Edit Profile
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Stats row */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Posts', value: memberPosts.length },
          { label: 'Likes received', value: memberPosts.reduce((a, p) => a + (p.likeCount || 0), 0) },
          { label: 'Comments', value: memberPosts.reduce((a, p) => a + (p.commentCount || 0), 0) },
          { label: 'Member since', value: resolved.createdAt?.toDate ? resolved.createdAt.toDate().getFullYear() : '—' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card>
              <CardContent sx={{ py: '12px !important', textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Tab label="Posts" />
        <Tab label="About" />
      </Tabs>

      {tab === 0 && (
        memberPosts.length > 0 ? (
          <Grid container spacing={2}>
            {memberPosts.map(p => (
              <Grid item xs={12} sm={6} key={p.id}>
                <PostCard
                  post={p}
                  compact
                  onDelete={(canApprove || p.authorUid === currentUser?.uid) ? id => { if (window.confirm('Delete this post? This cannot be undone.')) deletePost(id) } : undefined}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>
            {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
          </Typography>
        )
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>About</Typography>
            <Typography variant="body2">{resolved.bio || 'No bio yet.'}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Role</Typography>
            <Chip label={resolved.role} size="small" sx={{ bgcolor: role.bg, color: role.color }} />
          </CardContent>
        </Card>
      )}

      {isOwnProfile && editOpen && (
        <EditProfileDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profile={resolved}
          onSaved={handleSaved}
        />
      )}
    </Box>
  )
}
